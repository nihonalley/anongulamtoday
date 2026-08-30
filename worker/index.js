/* =========================================================
   RESPONSE HELPERS
========================================================= */

function json(
    data,
    status = 200
) {
    return new Response(
        JSON.stringify(data),
        {
            status,

            headers: {
                "content-type":
                    "application/json; charset=utf-8",

                "cache-control":
                    "no-store"
            }
        }
    );
}


/* =========================================================
   TEXT HELPERS
========================================================= */

function normalizeText(
    value
) {
    return String(
        value ?? ""
    ).trim();
}


function normalizeId(
    value
) {
    return normalizeText(value)
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );
}


function normalizeAlias(
    value
) {
    return normalizeText(value)
        .toLowerCase();
}


/* =========================================================
   AUTH
========================================================= */

function getBearerToken(
    request
) {
    const header =
        request.headers.get(
            "authorization"
        );

    if (
        !header
        ||
        !header.startsWith(
            "Bearer "
        )
    ) {
        return null;
    }

    return header
        .slice(7)
        .trim();
}


function isAdminAuthorized(
    request,
    env
) {
    if (!env.ADMIN_TOKEN) {
        return false;
    }

    return (
        getBearerToken(request)
        === env.ADMIN_TOKEN
    );
}


function requireAdmin(
    request,
    env
) {
    if (
        isAdminAuthorized(
            request,
            env
        )
    ) {
        return null;
    }

    return json(
        {
            ok: false,
            error: "Unauthorized."
        },
        401
    );
}


/* =========================================================
   INGREDIENT QUERIES
========================================================= */

async function getIngredients(
    env
) {
    const {
        results
    } =
        await env.db
            .prepare(`
        SELECT
          i.id,
          i.name,
          i.category,

          GROUP_CONCAT(
            ia.alias,
            '|||'
          ) AS aliases

        FROM ingredients i

        LEFT JOIN ingredient_aliases ia
          ON ia.ingredient_id = i.id

        GROUP BY
          i.id,
          i.name,
          i.category

        ORDER BY
          i.category,
          i.name
      `)
            .all();

    return (
        results ?? []
    ).map(
        (row) => ({
            id:
                row.id,

            name:
                row.name,

            category:
                row.category,

            aliases:
                row.aliases
                    ? row.aliases
                        .split("|||")
                        .filter(Boolean)
                    : []
        })
    );
}


async function getIngredientCategories(
    env
) {
    const {
        results
    } =
        await env.db
            .prepare(`
        SELECT DISTINCT
          category

        FROM ingredients

        WHERE
          category IS NOT NULL
          AND TRIM(category) <> ''

        ORDER BY
          category
      `)
            .all();

    return (
        results ?? []
    )
        .map(
            (row) =>
                row.category
        )
        .filter(Boolean);
}


async function getIngredientById(
    env,
    ingredientId
) {
    const ingredient =
        await env.db
            .prepare(`
        SELECT
          id,
          name,
          category

        FROM ingredients

        WHERE id = ?1
      `)
            .bind(
                ingredientId
            )
            .first();

    if (!ingredient) {
        return null;
    }


    const {
        results: aliasRows
    } =
        await env.db
            .prepare(`
        SELECT
          alias

        FROM ingredient_aliases

        WHERE ingredient_id = ?1

        ORDER BY alias
      `)
            .bind(
                ingredientId
            )
            .all();


    return {
        ...ingredient,

        aliases:
            (
                aliasRows ?? []
            ).map(
                (row) =>
                    row.alias
            )
    };
}


/* =========================================================
   INGREDIENT USAGE
========================================================= */

async function getIngredientUsage(
    env,
    ingredientId
) {
    const direct =
        await env.db
            .prepare(`
        SELECT
          COUNT(*) AS count

        FROM recipe_ingredients

        WHERE ingredient_id = ?1
      `)
            .bind(
                ingredientId
            )
            .first();


    const substitutes =
        await env.db
            .prepare(`
        SELECT
          COUNT(*) AS count

        FROM recipe_ingredient_substitutes

        WHERE substitute_ingredient_id = ?1
      `)
            .bind(
                ingredientId
            )
            .first();


    const recipeRows =
        await env.db
            .prepare(`
        SELECT DISTINCT
          r.id,
          r.name

        FROM recipes r

        JOIN recipe_ingredients ri
          ON ri.recipe_id = r.id

        WHERE
          ri.ingredient_id = ?1

        UNION

        SELECT DISTINCT
          r.id,
          r.name

        FROM recipes r

        JOIN recipe_ingredients ri
          ON ri.recipe_id = r.id

        JOIN recipe_ingredient_substitutes ris
          ON ris.recipe_ingredient_id = ri.id

        WHERE
          ris.substitute_ingredient_id = ?1

        ORDER BY name

        LIMIT 20
      `)
            .bind(
                ingredientId
            )
            .all();


    const directCount =
        Number(
            direct?.count ?? 0
        );

    const substituteCount =
        Number(
            substitutes?.count ?? 0
        );


    return {
        directCount,

        substituteCount,

        totalReferences:
            directCount
            +
            substituteCount,

        recipes:
            recipeRows.results
            ?? []
    };
}


/* =========================================================
   INGREDIENT VALIDATION
========================================================= */

function normalizeIngredientPayload(
    body
) {
    const aliases =
        Array.isArray(
            body.aliases
        )
            ? [
                ...new Set(
                    body.aliases
                        .map(
                            normalizeAlias
                        )
                        .filter(Boolean)
                )
            ]
            : [];


    return {
        id:
            normalizeId(
                body.id
            ),

        name:
            normalizeText(
                body.name
            ),

        category:
            normalizeText(
                body.category
            ).toLowerCase(),

        aliases
    };
}


function validateIngredient(
    ingredient
) {
    const errors = [];

    if (!ingredient.id) {
        errors.push(
            "Ingredient ID is required."
        );
    }

    if (!ingredient.name) {
        errors.push(
            "Display name is required."
        );
    }

    if (!ingredient.category) {
        errors.push(
            "Category is required."
        );
    }

    if (
        ingredient.aliases
            .includes(
                ingredient.id
            )
    ) {
        errors.push(
            "An ingredient cannot use its own ID as an alias."
        );
    }

    return errors;
}


/* =========================================================
   DUPLICATE CHECK
========================================================= */

async function findIngredientConflict(
    env,
    ingredient,
    ignoreId = null
) {
    const direct =
        await env.db
            .prepare(`
        SELECT
          id,
          name

        FROM ingredients

        WHERE
          (
            id = ?1
            OR LOWER(name) = LOWER(?2)
          )

          AND id <> COALESCE(?3, '')

        LIMIT 1
      `)
            .bind(
                ingredient.id,
                ingredient.name,
                ignoreId
            )
            .first();


    if (direct) {
        return {
            type:
                "ingredient",

            ingredient:
                direct
        };
    }


    for (
        const alias
        of ingredient.aliases
    ) {
        const aliasConflict =
            await env.db
                .prepare(`
          SELECT
            i.id,
            i.name,
            ia.alias

          FROM ingredient_aliases ia

          JOIN ingredients i
            ON i.id = ia.ingredient_id

          WHERE
            LOWER(ia.alias)
              = LOWER(?1)

            AND i.id
              <> COALESCE(?2, '')

          LIMIT 1
        `)
                .bind(
                    alias,
                    ignoreId
                )
                .first();


        if (aliasConflict) {
            return {
                type:
                    "alias",

                ingredient:
                    aliasConflict
            };
        }
    }


    return null;
}


/* =========================================================
   CREATE INGREDIENT
========================================================= */

async function createIngredient(
    request,
    env
) {
    const authError =
        requireAdmin(
            request,
            env
        );

    if (authError) {
        return authError;
    }


    let body;

    try {
        body =
            await request.json();
    } catch {
        return json(
            {
                ok: false,
                error:
                    "Invalid JSON body."
            },
            400
        );
    }


    const ingredient =
        normalizeIngredientPayload(
            body
        );


    const errors =
        validateIngredient(
            ingredient
        );


    if (
        errors.length > 0
    ) {
        return json(
            {
                ok: false,
                errors
            },
            400
        );
    }


    const conflict =
        await findIngredientConflict(
            env,
            ingredient
        );


    if (conflict) {
        return json(
            {
                ok: false,

                error:
                    "A similar ingredient already exists.",

                conflict
            },
            409
        );
    }


    const statements = [
        env.db
            .prepare(`
        INSERT INTO ingredients (
          id,
          name,
          category
        )

        VALUES (
          ?1,
          ?2,
          ?3
        )
      `)
            .bind(
                ingredient.id,
                ingredient.name,
                ingredient.category
            )
    ];


    ingredient.aliases
        .forEach(
            (alias) => {
                statements.push(
                    env.db
                        .prepare(`
              INSERT INTO ingredient_aliases (
                ingredient_id,
                alias
              )

              VALUES (
                ?1,
                ?2
              )
            `)
                        .bind(
                            ingredient.id,
                            alias
                        )
                );
            }
        );


    await env.db.batch(
        statements
    );


    return json(
        {
            ok: true,
            ingredient
        },
        201
    );
}


/* =========================================================
   UPDATE INGREDIENT
========================================================= */

async function updateIngredient(
    request,
    env,
    existingId
) {
    const authError =
        requireAdmin(
            request,
            env
        );

    if (authError) {
        return authError;
    }


    const current =
        await getIngredientById(
            env,
            existingId
        );


    if (!current) {
        return json(
            {
                ok: false,
                error:
                    "Ingredient not found."
            },
            404
        );
    }


    let body;

    try {
        body =
            await request.json();
    } catch {
        return json(
            {
                ok: false,
                error:
                    "Invalid JSON body."
            },
            400
        );
    }


    /*
     * Ingredient IDs stay immutable.
     *
     * Changing a primary ID can break
     * recipe relationships.
     */

    const ingredient =
        normalizeIngredientPayload({
            ...body,

            id:
                existingId
        });


    const errors =
        validateIngredient(
            ingredient
        );


    if (
        errors.length > 0
    ) {
        return json(
            {
                ok: false,
                errors
            },
            400
        );
    }


    const conflict =
        await findIngredientConflict(
            env,
            ingredient,
            existingId
        );


    if (conflict) {
        return json(
            {
                ok: false,

                error:
                    "A similar ingredient already exists.",

                conflict
            },
            409
        );
    }


    const statements = [
        env.db
            .prepare(`
        UPDATE ingredients

        SET
          name = ?1,
          category = ?2,
          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = ?3
      `)
            .bind(
                ingredient.name,
                ingredient.category,
                existingId
            ),

        env.db
            .prepare(`
        DELETE FROM ingredient_aliases

        WHERE ingredient_id = ?1
      `)
            .bind(
                existingId
            )
    ];


    ingredient.aliases
        .forEach(
            (alias) => {
                statements.push(
                    env.db
                        .prepare(`
              INSERT INTO ingredient_aliases (
                ingredient_id,
                alias
              )

              VALUES (
                ?1,
                ?2
              )
            `)
                        .bind(
                            existingId,
                            alias
                        )
                );
            }
        );


    await env.db.batch(
        statements
    );


    return json({
        ok: true,
        ingredient
    });
}


/* =========================================================
   DELETE INGREDIENT
========================================================= */

async function deleteIngredient(
    request,
    env,
    ingredientId
) {
    const authError =
        requireAdmin(
            request,
            env
        );

    if (authError) {
        return authError;
    }


    const ingredient =
        await getIngredientById(
            env,
            ingredientId
        );


    if (!ingredient) {
        return json(
            {
                ok: false,

                error:
                    "Ingredient not found."
            },
            404
        );
    }


    /*
     * Never silently break recipe data.
     *
     * Ingredient deletion is blocked
     * while any recipe references it.
     */

    const usage =
        await getIngredientUsage(
            env,
            ingredientId
        );


    if (
        usage.totalReferences > 0
    ) {
        return json(
            {
                ok: false,

                error:
                    `${ingredient.name} cannot be deleted because it is still used by recipes.`,

                usage
            },
            409
        );
    }


    await env.db
        .prepare(`
      DELETE FROM ingredients
      WHERE id = ?1
    `)
        .bind(
            ingredientId
        )
        .run();


    /*
     * ingredient_aliases disappears
     * automatically through ON DELETE CASCADE.
     */

    return json({
        ok: true,

        deleted: {
            id:
                ingredient.id,

            name:
                ingredient.name
        }
    });
}

/* =========================================================
   RECIPE QUERIES
========================================================= */

async function getRecipes(
    env
) {
    const {
        results: recipeRows
    } =
        await env.db
            .prepare(`
        SELECT
          id,
          name,
          description,
          emoji,
          cuisine,
          origin,
          time_minutes,
          difficulty,
          base_servings,
          spicy,
          added_by,
          source_type,
          source_name,
          source_url,
          source_retrieved_at

        FROM recipes

        ORDER BY name
      `)
            .all();


    const recipes = [];


    for (
        const row
        of recipeRows ?? []
    ) {
        const [
            cookingStylesResult,
            dietResult,
            servingResult,
            ingredientsResult,
            flexibleResult,
            stepsResult,
            notesResult
        ] =
            await Promise.all([

                env.db
                    .prepare(`
              SELECT cooking_style
              FROM recipe_cooking_styles
              WHERE recipe_id = ?1
              ORDER BY cooking_style
            `)
                    .bind(row.id)
                    .all(),


                env.db
                    .prepare(`
              SELECT diet_tag
              FROM recipe_diet_tags
              WHERE recipe_id = ?1
              ORDER BY diet_tag
            `)
                    .bind(row.id)
                    .all(),


                env.db
                    .prepare(`
              SELECT serving_category
              FROM recipe_serving_categories
              WHERE recipe_id = ?1
              ORDER BY
                CASE serving_category
                  WHEN 'one' THEN 1
                  WHEN 'couple' THEN 2
                  WHEN 'family' THEN 3
                  WHEN 'party' THEN 4
                  ELSE 99
                END
            `)
                    .bind(row.id)
                    .all(),


                env.db
                    .prepare(`
              SELECT
                id,
                ingredient_id,
                quantity,
                unit,
                amount_text,
                scalable,
                required,
                sort_order

              FROM recipe_ingredients

              WHERE recipe_id = ?1

              ORDER BY
                sort_order,
                id
            `)
                    .bind(row.id)
                    .all(),


                env.db
                    .prepare(`
              SELECT
                label,
                note

              FROM recipe_flexible_ingredients

              WHERE recipe_id = ?1

              ORDER BY
                sort_order,
                id
            `)
                    .bind(row.id)
                    .all(),


                env.db
                    .prepare(`
              SELECT step_text

              FROM recipe_steps

              WHERE recipe_id = ?1

              ORDER BY
                sort_order,
                id
            `)
                    .bind(row.id)
                    .all(),


                env.db
                    .prepare(`
              SELECT note_text

              FROM recipe_notes

              WHERE recipe_id = ?1

              ORDER BY
                sort_order,
                id
            `)
                    .bind(row.id)
                    .all()
            ]);


        const ingredients = [];


        for (
            const ingredientRow
            of ingredientsResult.results ?? []
        ) {
            const {
                results: substituteRows
            } =
                await env.db
                    .prepare(`
              SELECT substitute_ingredient_id

              FROM recipe_ingredient_substitutes

              WHERE recipe_ingredient_id = ?1

              ORDER BY substitute_ingredient_id
            `)
                    .bind(
                        ingredientRow.id
                    )
                    .all();


            ingredients.push({
                id:
                    ingredientRow
                        .ingredient_id,

                quantity:
                    ingredientRow
                        .quantity,

                unit:
                    ingredientRow
                        .unit,

                amountText:
                    ingredientRow
                        .amount_text,

                scalable:
                    Boolean(
                        ingredientRow
                            .scalable
                    ),

                required:
                    Boolean(
                        ingredientRow
                            .required
                    ),

                substitutes:
                    (
                        substituteRows
                        ?? []
                    ).map(
                        (substitute) =>
                            substitute
                                .substitute_ingredient_id
                    )
            });
        }


        recipes.push({
            id:
                row.id,

            name:
                row.name,

            description:
                row.description,

            emoji:
                row.emoji,

            cuisine:
                row.cuisine,

            origin:
                row.origin,

            cookingStyles:
                (
                    cookingStylesResult
                        .results
                    ?? []
                ).map(
                    (item) =>
                        item.cooking_style
                ),

            diet:
                (
                    dietResult.results
                    ?? []
                ).map(
                    (item) =>
                        item.diet_tag
                ),

            timeMinutes:
                row.time_minutes,

            difficulty:
                row.difficulty,

            baseServings:
                row.base_servings,

            servingCategories:
                (
                    servingResult.results
                    ?? []
                ).map(
                    (item) =>
                        item.serving_category
                ),

            spicy:
                Boolean(
                    row.spicy
                ),

            ingredients,

            flexibleIngredients:
                (
                    flexibleResult.results
                    ?? []
                ).map(
                    (item) => ({
                        label:
                            item.label,

                        note:
                            item.note
                    })
                ),

            steps:
                (
                    stepsResult.results
                    ?? []
                ).map(
                    (item) =>
                        item.step_text
                ),

            notes:
                (
                    notesResult.results
                    ?? []
                ).map(
                    (item) =>
                        item.note_text
                ),

            source: {
                type:
                    row.source_type,

                name:
                    row.source_name,

                url:
                    row.source_url,

                retrievedAt:
                    row.source_retrieved_at
            },

            addedBy:
                row.added_by
        });
    }


    return recipes;
}

/* =========================================================
   API ROUTER
========================================================= */

async function handleApi(
    request,
    env,
    url
) {
    const method =
        request.method
            .toUpperCase();


    /* -------------------------
       HEALTH
    ------------------------- */

    if (
        url.pathname
        === "/api/health"
    ) {
        return json({
            ok: true
        });
    }

    /* -------------------------
     ADMIN AUTH CHECK
  ------------------------- */

    if (
        url.pathname
        === "/api/admin/health"
        &&
        method === "GET"
    ) {
        const authError =
            requireAdmin(
                request,
                env
            );

        if (authError) {
            return authError;
        }

        return json({
            ok: true,
            authenticated: true
        });
    }

    /* -------------------------
       INGREDIENT LIST
    ------------------------- */

    if (
        url.pathname
        === "/api/ingredients"
        &&
        method === "GET"
    ) {
        return json({
            ok: true,

            ingredients:
                await getIngredients(
                    env
                )
        });
    }


    /* -------------------------
       CATEGORIES
    ------------------------- */

    if (
        url.pathname
        === "/api/ingredients/categories"
        &&
        method === "GET"
    ) {
        return json({
            ok: true,

            categories:
                await getIngredientCategories(
                    env
                )
        });
    }

    /* -------------------------
   RECIPE LIST
------------------------- */

    if (
        url.pathname
        === "/api/recipes"
        &&
        method === "GET"
    ) {
        return json(
            await getRecipes(env)
        );
    }


    /* -------------------------
       CREATE
    ------------------------- */

    if (
        url.pathname
        === "/api/admin/ingredients"
        &&
        method === "POST"
    ) {
        return createIngredient(
            request,
            env
        );
    }


    /* -------------------------
       ONE INGREDIENT
    ------------------------- */

    const ingredientMatch =
        url.pathname.match(
            /^\/api\/admin\/ingredients\/([^/]+)$/
        );


    if (
        ingredientMatch
    ) {
        const ingredientId =
            decodeURIComponent(
                ingredientMatch[1]
            );


        if (
            method === "GET"
        ) {
            const authError =
                requireAdmin(
                    request,
                    env
                );

            if (authError) {
                return authError;
            }


            const ingredient =
                await getIngredientById(
                    env,
                    ingredientId
                );


            if (!ingredient) {
                return json(
                    {
                        ok: false,
                        error:
                            "Ingredient not found."
                    },
                    404
                );
            }


            return json({
                ok: true,
                ingredient
            });
        }


        if (
            method === "PUT"
        ) {
            return updateIngredient(
                request,
                env,
                ingredientId
            );
        }


        if (
            method === "DELETE"
        ) {
            return deleteIngredient(
                request,
                env,
                ingredientId
            );
        }
    }


    return json(
        {
            ok: false,
            error:
                "API route not found."
        },
        404
    );
}


/* =========================================================
   WORKER
========================================================= */

export default {
    async fetch(
        request,
        env
    ) {
        const url =
            new URL(
                request.url
            );


        if (
            url.pathname.startsWith(
                "/api/"
            )
        ) {
            try {
                return await handleApi(
                    request,
                    env,
                    url
                );
            } catch (error) {
                console.error(
                    error
                );

                return json(
                    {
                        ok: false,

                        error:
                            "Server error."
                    },
                    500
                );
            }
        }


        return env.ASSETS.fetch(
            request
        );
    }
};