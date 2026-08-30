import fs from "node:fs";
import path from "node:path";

import {
  fileURLToPath
} from "node:url";

import {
  spawnSync
} from "node:child_process";


/* =========================================================
   CONFIG
========================================================= */

const DATABASE_NAME =
  "anongulamdb";


const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

const ROOT =
  path.resolve(
    __dirname,
    ".."
  );


const RECIPES_FILE =
  path.join(
    ROOT,
    "public",
    "data",
    "recipes.json"
  );


const GENERATED_DIR =
  path.join(
    ROOT,
    "generated"
  );


const SQL_FILE =
  path.join(
    GENERATED_DIR,
    "seed-recipes.sql"
  );


/* =========================================================
   FILE HELPERS
========================================================= */

function readJson(
  filePath
) {
  return JSON.parse(
    fs.readFileSync(
      filePath,
      "utf8"
    )
  );
}


/* =========================================================
   SQL HELPERS
========================================================= */

function sqlString(
  value
) {
  if (
    value === null
    ||
    value === undefined
  ) {
    return "NULL";
  }

  return `'${String(value)
    .replaceAll(
      "'",
      "''"
    )}'`;
}


function sqlNumber(
  value
) {
  if (
    value === null
    ||
    value === undefined
    ||
    value === ""
  ) {
    return "NULL";
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "NULL";
  }

  return String(number);
}


function sqlBoolean(
  value
) {
  return value
    ? "1"
    : "0";
}


/* =========================================================
   NORMALIZATION
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
  return normalizeText(
    value
  ).toLowerCase();
}


function normalizeRecipe(
  recipe
) {
  return {
    id:
      normalizeId(
        recipe.id
      ),

    name:
      normalizeText(
        recipe.name
      ),

    description:
      normalizeText(
        recipe.description
      ),

    emoji:
      normalizeText(
        recipe.emoji
      ),

    cuisine:
      normalizeText(
        recipe.cuisine
      ).toLowerCase(),

    origin:
      normalizeText(
        recipe.origin
      ),

    cookingStyles:
      Array.isArray(
        recipe.cookingStyles
      )
        ? recipe.cookingStyles
            .map(
              (item) =>
                normalizeText(
                  item
                ).toLowerCase()
            )
            .filter(Boolean)
        : [],

    diet:
      Array.isArray(
        recipe.diet
      )
        ? recipe.diet
            .map(
              (item) =>
                normalizeText(
                  item
                ).toLowerCase()
            )
            .filter(Boolean)
        : [],

    timeMinutes:
      Number(
        recipe.timeMinutes
      ),

    difficulty:
      normalizeText(
        recipe.difficulty
      ),

    baseServings:
      Number(
        recipe.baseServings
      ),

    servingCategories:
      Array.isArray(
        recipe.servingCategories
      )
        ? recipe.servingCategories
            .map(
              (item) =>
                normalizeText(
                  item
                ).toLowerCase()
            )
            .filter(Boolean)
        : [],

    spicy:
      recipe.spicy === true,

    ingredients:
      Array.isArray(
        recipe.ingredients
      )
        ? recipe.ingredients.map(
            (ingredient) => ({
              id:
                normalizeId(
                  ingredient.id
                ),

              quantity:
                ingredient.quantity
                === null
                ||
                ingredient.quantity
                === undefined
                  ? null
                  : Number(
                      ingredient.quantity
                    ),

              unit:
                ingredient.unit
                === null
                ||
                ingredient.unit
                === undefined
                  ? null
                  : normalizeText(
                      ingredient.unit
                    ),

              amountText:
                ingredient.amountText
                === null
                ||
                ingredient.amountText
                === undefined
                  ? null
                  : normalizeText(
                      ingredient.amountText
                    ),

              scalable:
                ingredient.scalable
                !== false,

              required:
                ingredient.required
                !== false,

              substitutes:
                Array.isArray(
                  ingredient.substitutes
                )
                  ? ingredient.substitutes
                      .map(
                        normalizeId
                      )
                      .filter(Boolean)
                  : []
            })
          )
        : [],

    flexibleIngredients:
      Array.isArray(
        recipe.flexibleIngredients
      )
        ? recipe.flexibleIngredients
            .map(
              (item) => ({
                label:
                  normalizeText(
                    item.label
                  ),

                note:
                  normalizeText(
                    item.note
                  )
              })
            )
        : [],

    steps:
      Array.isArray(
        recipe.steps
      )
        ? recipe.steps
            .map(
              normalizeText
            )
            .filter(Boolean)
        : [],

    notes:
      Array.isArray(
        recipe.notes
      )
        ? recipe.notes
            .map(
              normalizeText
            )
            .filter(Boolean)
        : [],

    source: {
      type:
        normalizeText(
          recipe.source?.type
          ?? "original"
        ).toLowerCase(),

      name:
        normalizeText(
          recipe.source?.name
          ?? "Anong Ulam Today?"
        ),

      url:
        recipe.source?.url
        ?? null,

      retrievedAt:
        recipe.source
          ?.retrievedAt
        ?? null
    },

    addedBy:
      normalizeText(
        recipe.addedBy
        ?? "built-in"
      ).toLowerCase()
  };
}


/* =========================================================
   VALIDATE BASIC RECIPE DATA
========================================================= */

function validateRecipes(
  recipes
) {
  const errors = [];

  const ids =
    new Set();


  recipes.forEach(
    (
      recipe,
      index
    ) => {
      const prefix =
        `Recipe ${index + 1}`;


      if (!recipe.id) {
        errors.push(
          `${prefix}: missing id.`
        );
      }


      if (
        ids.has(
          recipe.id
        )
      ) {
        errors.push(
          `Duplicate recipe ID "${recipe.id}".`
        );
      }

      ids.add(
        recipe.id
      );


      if (!recipe.name) {
        errors.push(
          `${recipe.id}: missing name.`
        );
      }


      if (
        !Number.isFinite(
          recipe.timeMinutes
        )
        ||
        recipe.timeMinutes <= 0
      ) {
        errors.push(
          `${recipe.id}: invalid timeMinutes.`
        );
      }


      if (
        !Number.isFinite(
          recipe.baseServings
        )
        ||
        recipe.baseServings <= 0
      ) {
        errors.push(
          `${recipe.id}: invalid baseServings.`
        );
      }


      if (
        recipe.ingredients.length
        === 0
      ) {
        errors.push(
          `${recipe.id}: no ingredients.`
        );
      }


      if (
        recipe.steps.length
        === 0
      ) {
        errors.push(
          `${recipe.id}: no cooking steps.`
        );
      }
    }
  );


  return errors;
}


/* =========================================================
   LOAD CURRENT D1 INGREDIENT IDS
========================================================= */

async function getRemoteIngredientIds() {
  console.log(
    "\nChecking ingredient master in D1...\n"
  );

  const API_URL =
    "https://anongulamtoday.thenihonalley.workers.dev/api/ingredients";

  let response;

  try {
    response =
      await fetch(
        API_URL,
        {
          headers: {
            Accept: "application/json"
          }
        }
      );
  } catch (error) {
    console.error(error);

    throw new Error(
      "Unable to connect to the ingredient API."
    );
  }

  if (!response.ok) {
    const text =
      await response.text();

    console.error(text);

    throw new Error(
      `Ingredient API returned HTTP ${response.status}.`
    );
  }

  const payload =
    await response.json();

  /*
   * Support either:
   *
   * [
   *   { id: "chicken", ... }
   * ]
   *
   * OR:
   *
   * {
   *   ingredients: [
   *     { id: "chicken", ... }
   *   ]
   * }
   */

  const ingredients =
    Array.isArray(payload)
      ? payload
      : payload.ingredients ?? [];

  if (
    !Array.isArray(ingredients)
  ) {
    throw new Error(
      "Ingredient API returned an unexpected response."
    );
  }

  const ids =
    new Set(
      ingredients
        .map(
          (ingredient) =>
            ingredient.id
        )
        .filter(Boolean)
    );

  if (ids.size === 0) {
    throw new Error(
      "Ingredient API returned zero ingredients. Recipe seed stopped for safety."
    );
  }

  return ids;
}

/* =========================================================
   FIND UNKNOWN INGREDIENTS
========================================================= */

function findUnknownIngredients(
  recipes,
  knownIngredientIds
) {
  const missing =
    new Map();


  recipes.forEach(
    (recipe) => {

      recipe.ingredients
        .forEach(
          (ingredient) => {

            if (
              !knownIngredientIds
                .has(
                  ingredient.id
                )
            ) {
              if (
                !missing.has(
                  ingredient.id
                )
              ) {
                missing.set(
                  ingredient.id,
                  new Set()
                );
              }


              missing
                .get(
                  ingredient.id
                )
                .add(
                  recipe.name
                );
            }


            ingredient.substitutes
              .forEach(
                (substituteId) => {

                  if (
                    !knownIngredientIds
                      .has(
                        substituteId
                      )
                  ) {
                    if (
                      !missing.has(
                        substituteId
                      )
                    ) {
                      missing.set(
                        substituteId,
                        new Set()
                      );
                    }


                    missing
                      .get(
                        substituteId
                      )
                      .add(
                        `${recipe.name} (substitute)`
                      );
                  }
                }
              );
          }
        );
    }
  );


  return missing;
}


/* =========================================================
   PRINT UNKNOWN INGREDIENT REPORT
========================================================= */

function printUnknownIngredients(
  missing
) {
  console.error(
    "\n⚠ Unknown ingredients detected.\n"
  );


  for (
    const [
      ingredientId,
      recipes
    ]
    of missing.entries()
  ) {
    console.error(
      `• ${ingredientId}`
    );


    for (
      const recipeName
      of recipes
    ) {
      console.error(
        `    - ${recipeName}`
      );
    }
  }


  console.error(
    "\nAdd/review these ingredients in the Ingredient Manager first."
  );

  console.error(
    "The recipe database was NOT modified.\n"
  );
}


/* =========================================================
   GENERATE RECIPE SQL
========================================================= */

function generateRecipeSql(
  recipes
) {
  const lines = [];


  lines.push(
    "-- AUTO-GENERATED"
  );

  lines.push(
    "-- Recipe seed for Anong Ulam Today"
  );

  lines.push(
    "-- Existing recipes with matching IDs are updated."
  );

  lines.push(
    "-- Recipes existing only in D1 are preserved."
  );

  lines.push("");

  lines.push(
    "PRAGMA foreign_keys = ON;"
  );

  lines.push("");


  recipes.forEach(
    (recipe) => {

      /* =====================================================
         RECIPE UPSERT
      ===================================================== */

      lines.push(`
INSERT INTO recipes (
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
)
VALUES (
  ${sqlString(
    recipe.id
  )},
  ${sqlString(
    recipe.name
  )},
  ${sqlString(
    recipe.description
  )},
  ${sqlString(
    recipe.emoji
  )},
  ${sqlString(
    recipe.cuisine
  )},
  ${sqlString(
    recipe.origin
  )},
  ${sqlNumber(
    recipe.timeMinutes
  )},
  ${sqlString(
    recipe.difficulty
  )},
  ${sqlNumber(
    recipe.baseServings
  )},
  ${sqlBoolean(
    recipe.spicy
  )},
  ${sqlString(
    recipe.addedBy
  )},
  ${sqlString(
    recipe.source.type
  )},
  ${sqlString(
    recipe.source.name
  )},
  ${sqlString(
    recipe.source.url
  )},
  ${sqlString(
    recipe.source.retrievedAt
  )}
)
ON CONFLICT(id)
DO UPDATE SET
  name =
    excluded.name,

  description =
    excluded.description,

  emoji =
    excluded.emoji,

  cuisine =
    excluded.cuisine,

  origin =
    excluded.origin,

  time_minutes =
    excluded.time_minutes,

  difficulty =
    excluded.difficulty,

  base_servings =
    excluded.base_servings,

  spicy =
    excluded.spicy,

  added_by =
    excluded.added_by,

  source_type =
    excluded.source_type,

  source_name =
    excluded.source_name,

  source_url =
    excluded.source_url,

  source_retrieved_at =
    excluded.source_retrieved_at,

  updated_at =
    CURRENT_TIMESTAMP;
`.trim());

      lines.push("");


      /* =====================================================
         CLEAR CURRENT CHILD DATA
      ===================================================== */

      lines.push(`
DELETE FROM recipe_cooking_styles
WHERE recipe_id =
  ${sqlString(
    recipe.id
  )};
`.trim());

      lines.push("");


      lines.push(`
DELETE FROM recipe_diet_tags
WHERE recipe_id =
  ${sqlString(
    recipe.id
  )};
`.trim());

      lines.push("");


      lines.push(`
DELETE FROM recipe_serving_categories
WHERE recipe_id =
  ${sqlString(
    recipe.id
  )};
`.trim());

      lines.push("");


      /*
       * Substitute rows cascade automatically.
       */

      lines.push(`
DELETE FROM recipe_ingredients
WHERE recipe_id =
  ${sqlString(
    recipe.id
  )};
`.trim());

      lines.push("");


      lines.push(`
DELETE FROM recipe_flexible_ingredients
WHERE recipe_id =
  ${sqlString(
    recipe.id
  )};
`.trim());

      lines.push("");


      lines.push(`
DELETE FROM recipe_steps
WHERE recipe_id =
  ${sqlString(
    recipe.id
  )};
`.trim());

      lines.push("");


      lines.push(`
DELETE FROM recipe_notes
WHERE recipe_id =
  ${sqlString(
    recipe.id
  )};
`.trim());

      lines.push("");


      /* =====================================================
         COOKING STYLES
      ===================================================== */

      recipe.cookingStyles
        .forEach(
          (style) => {

            lines.push(`
INSERT INTO recipe_cooking_styles (
  recipe_id,
  cooking_style
)
VALUES (
  ${sqlString(
    recipe.id
  )},
  ${sqlString(
    style
  )}
);
`.trim());

            lines.push("");
          }
        );


      /* =====================================================
         DIET TAGS
      ===================================================== */

      recipe.diet
        .forEach(
          (dietTag) => {

            lines.push(`
INSERT INTO recipe_diet_tags (
  recipe_id,
  diet_tag
)
VALUES (
  ${sqlString(
    recipe.id
  )},
  ${sqlString(
    dietTag
  )}
);
`.trim());

            lines.push("");
          }
        );


      /* =====================================================
         SERVING CATEGORIES
      ===================================================== */

      recipe.servingCategories
        .forEach(
          (category) => {

            lines.push(`
INSERT INTO recipe_serving_categories (
  recipe_id,
  serving_category
)
VALUES (
  ${sqlString(
    recipe.id
  )},
  ${sqlString(
    category
  )}
);
`.trim());

            lines.push("");
          }
        );


      /* =====================================================
         INGREDIENTS
      ===================================================== */

      recipe.ingredients
        .forEach(
          (
            ingredient,
            index
          ) => {

            lines.push(`
INSERT INTO recipe_ingredients (
  recipe_id,
  ingredient_id,
  quantity,
  unit,
  amount_text,
  scalable,
  required,
  sort_order
)
VALUES (
  ${sqlString(
    recipe.id
  )},
  ${sqlString(
    ingredient.id
  )},
  ${sqlNumber(
    ingredient.quantity
  )},
  ${sqlString(
    ingredient.unit
  )},
  ${sqlString(
    ingredient.amountText
  )},
  ${sqlBoolean(
    ingredient.scalable
  )},
  ${sqlBoolean(
    ingredient.required
  )},
  ${index}
);
`.trim());

            lines.push("");


            ingredient.substitutes
              .forEach(
                (substituteId) => {

                  /*
                   * The immediately preceding INSERT
                   * creates the recipe_ingredients row.
                   * last_insert_rowid() therefore points
                   * to that row.
                   */

                  lines.push(`
INSERT INTO recipe_ingredient_substitutes (
  recipe_ingredient_id,
  substitute_ingredient_id
)
VALUES (
  last_insert_rowid(),
  ${sqlString(
    substituteId
  )}
);
`.trim());

                  lines.push("");
                }
              );
          }
        );


      /* =====================================================
         FLEXIBLE INGREDIENTS
      ===================================================== */

      recipe.flexibleIngredients
        .forEach(
          (
            item,
            index
          ) => {

            lines.push(`
INSERT INTO recipe_flexible_ingredients (
  recipe_id,
  label,
  note,
  sort_order
)
VALUES (
  ${sqlString(
    recipe.id
  )},
  ${sqlString(
    item.label
  )},
  ${sqlString(
    item.note
  )},
  ${index}
);
`.trim());

            lines.push("");
          }
        );


      /* =====================================================
         STEPS
      ===================================================== */

      recipe.steps
        .forEach(
          (
            step,
            index
          ) => {

            lines.push(`
INSERT INTO recipe_steps (
  recipe_id,
  step_text,
  sort_order
)
VALUES (
  ${sqlString(
    recipe.id
  )},
  ${sqlString(
    step
  )},
  ${index}
);
`.trim());

            lines.push("");
          }
        );


      /* =====================================================
         NOTES
      ===================================================== */

      recipe.notes
        .forEach(
          (
            note,
            index
          ) => {

            lines.push(`
INSERT INTO recipe_notes (
  recipe_id,
  note_text,
  sort_order
)
VALUES (
  ${sqlString(
    recipe.id
  )},
  ${sqlString(
    note
  )},
  ${index}
);
`.trim());

            lines.push("");
          }
        );
    }
  );


  return lines.join(
    "\n"
  );
}


/* =========================================================
   EXECUTE SQL
========================================================= */

function executeSeed() {
  console.log(
    "\nUploading recipe seed to D1...\n"
  );

  const result =
    spawnSync(
      "npx",
      [
        "wrangler",
        "d1",
        "execute",
        DATABASE_NAME,
        "--remote",
        "--file",
        SQL_FILE
      ],
      {
        cwd: ROOT,
        stdio: "inherit",
        shell: true
      }
    );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      "Wrangler failed to seed recipes into D1."
    );
  }
}


/* =========================================================
   MAIN
========================================================= */

async function main() {
  console.log(
    "Reading recipes.json..."
  );


  const rawRecipes =
    readJson(
      RECIPES_FILE
    );


  if (
    !Array.isArray(
      rawRecipes
    )
  ) {
    throw new Error(
      "recipes.json must contain an array."
    );
  }


  const recipes =
    rawRecipes.map(
      normalizeRecipe
    );


  const validationErrors =
    validateRecipes(
      recipes
    );


  if (
    validationErrors.length > 0
  ) {
    console.error(
      "\nRecipe validation failed:\n"
    );


    validationErrors
      .forEach(
        (error) =>
          console.error(
            `• ${error}`
          )
      );


    process.exit(1);
  }


  console.log(
    `✓ Validated ${recipes.length} recipes.`
  );


  const ingredientIds =
    await getRemoteIngredientIds();


  console.log(
    `✓ D1 ingredient master contains ${ingredientIds.size} ingredients.`
  );


  const missing =
    findUnknownIngredients(
      recipes,
      ingredientIds
    );


  if (
    missing.size > 0
  ) {
    printUnknownIngredients(
      missing
    );

    process.exit(2);
  }


  console.log(
    "✓ Every recipe ingredient exists in D1."
  );


  fs.mkdirSync(
    GENERATED_DIR,
    {
      recursive:
        true
    }
  );


  fs.writeFileSync(
    SQL_FILE,
    generateRecipeSql(
      recipes
    ),
    "utf8"
  );


  console.log(
    `✓ Generated ${SQL_FILE}`
  );


  executeSeed();


  console.log(
    "\n✓ Recipe seed completed."
  );


  console.log(
    `✓ ${recipes.length} recipes migrated to D1.`
  );
}


main();