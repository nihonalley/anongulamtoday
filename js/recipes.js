const RECIPES_URL =
  "/data/recipes.json";


let recipeCache = null;


/* =========================================================
   RECIPE SCHEMA
========================================================= */

export const RECIPE_SCHEMA = {
  cuisines: [
    "filipino",
    "japanese",
    "korean",
    "chinese",
    "vietnamese",
    "european",
    "american",
    "mediterranean"
  ],

  cookingStyles: [
    "fried",
    "stew",
    "soup",
    "grilled",
    "baked",
    "stir-fry",
    "steamed",
    "air-fryer"
  ],

  servingCategories: [
    "one",
    "couple",
    "family",
    "party"
  ],

  difficulties: [
    "Easy",
    "Medium",
    "Hard"
  ],

  sourceTypes: [
    "original",
    "web",
    "user"
  ],

  addedBy: [
    "built-in",
    "ai",
    "user"
  ]
};


/* =========================================================
   BASIC HELPERS
========================================================= */

function isObject(
  value
) {
  return (
    value !== null
    &&
    typeof value === "object"
    &&
    !Array.isArray(value)
  );
}


function isNonEmptyString(
  value
) {
  return (
    typeof value === "string"
    &&
    value.trim().length > 0
  );
}


function normalizeNullableString(
  value
) {
  return (
    isNonEmptyString(value)
      ? value.trim()
      : null
  );
}


function normalizeStringArray(
  value
) {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return [
    ...new Set(
      value
        .filter(
          isNonEmptyString
        )
        .map(
          (item) =>
            item.trim()
        )
    )
  ];
}


function isValidUrl(
  value
) {
  if (
    value === null
    ||
    value === undefined
    ||
    value === ""
  ) {
    return true;
  }

  try {
    const url =
      new URL(value);

    return (
      url.protocol === "http:"
      ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}


/* =========================================================
   SOURCE NORMALIZATION
========================================================= */

function normalizeSource(
  source
) {
  if (
    !isObject(source)
  ) {
    return {
      type: "original",
      name: "Anong Ulam Today?",
      url: null,
      retrievedAt: null
    };
  }

  return {
    type:
      isNonEmptyString(
        source.type
      )
        ? source.type
            .trim()
            .toLowerCase()
        : "original",

    name:
      isNonEmptyString(
        source.name
      )
        ? source.name.trim()
        : "Anong Ulam Today?",

    url:
      normalizeNullableString(
        source.url
      ),

    retrievedAt:
      normalizeNullableString(
        source.retrievedAt
      )
  };
}


/* =========================================================
   INGREDIENT NORMALIZATION
========================================================= */

function normalizeIngredient(
  ingredient
) {
  if (
    !isObject(ingredient)
  ) {
    return null;
  }

  const rawQuantity =
    ingredient.quantity;

  const quantity =
    rawQuantity === null
    ||
    rawQuantity === undefined
    ||
    rawQuantity === ""
      ? null
      : Number(rawQuantity);

  return {
    id:
      isNonEmptyString(
        ingredient.id
      )
        ? ingredient.id
            .trim()
            .toLowerCase()
        : "",

    quantity:
      Number.isFinite(
        quantity
      )
        ? quantity
        : null,

    unit:
      normalizeNullableString(
        ingredient.unit
      ),

    amountText:
      normalizeNullableString(
        ingredient.amountText
      ),

    scalable:
      ingredient.scalable
      !== false,

    required:
      ingredient.required
      !== false,

    substitutes:
      normalizeStringArray(
        ingredient.substitutes
      ).map(
        (item) =>
          item.toLowerCase()
      )
  };
}


/* =========================================================
   FLEXIBLE INGREDIENT NORMALIZATION
========================================================= */

function normalizeFlexibleIngredient(
  item
) {
  if (
    !isObject(item)
  ) {
    return null;
  }

  return {
    label:
      isNonEmptyString(
        item.label
      )
        ? item.label.trim()
        : "",

    note:
      isNonEmptyString(
        item.note
      )
        ? item.note.trim()
        : ""
  };
}


/* =========================================================
   RECIPE NORMALIZATION
========================================================= */

export function normalizeRecipe(
  recipe
) {
  if (
    !isObject(recipe)
  ) {
    return null;
  }

  const rawBaseServings =
    Number(
      recipe.baseServings
    );

  return {
    id:
      isNonEmptyString(
        recipe.id
      )
        ? recipe.id
            .trim()
            .toLowerCase()
        : "",

    name:
      isNonEmptyString(
        recipe.name
      )
        ? recipe.name.trim()
        : "",

    description:
      isNonEmptyString(
        recipe.description
      )
        ? recipe.description.trim()
        : "",

    emoji:
      isNonEmptyString(
        recipe.emoji
      )
        ? recipe.emoji.trim()
        : "🍽️",

    cuisine:
      isNonEmptyString(
        recipe.cuisine
      )
        ? recipe.cuisine
            .trim()
            .toLowerCase()
        : "",

    origin:
      isNonEmptyString(
        recipe.origin
      )
        ? recipe.origin.trim()
        : "",

    cookingStyles:
      normalizeStringArray(
        recipe.cookingStyles
      ).map(
        (item) =>
          item.toLowerCase()
      ),

    diet:
      normalizeStringArray(
        recipe.diet
      ).map(
        (item) =>
          item.toLowerCase()
      ),

    timeMinutes:
      Number(
        recipe.timeMinutes
      ),

    difficulty:
      isNonEmptyString(
        recipe.difficulty
      )
        ? recipe.difficulty.trim()
        : "Easy",

    baseServings:
      Number.isFinite(
        rawBaseServings
      )
        ? rawBaseServings
        : 2,

    servingCategories:
      normalizeStringArray(
        recipe.servingCategories
      ).map(
        (item) =>
          item.toLowerCase()
      ),

    spicy:
      recipe.spicy === true,

    ingredients:
      Array.isArray(
        recipe.ingredients
      )
        ? recipe.ingredients
            .map(
              normalizeIngredient
            )
            .filter(Boolean)
        : [],

    flexibleIngredients:
      Array.isArray(
        recipe.flexibleIngredients
      )
        ? recipe
            .flexibleIngredients
            .map(
              normalizeFlexibleIngredient
            )
            .filter(Boolean)
        : [],

    steps:
      normalizeStringArray(
        recipe.steps
      ),

    notes:
      normalizeStringArray(
        recipe.notes
      ),

    source:
      normalizeSource(
        recipe.source
      ),

    addedBy:
      isNonEmptyString(
        recipe.addedBy
      )
        ? recipe.addedBy
            .trim()
            .toLowerCase()
        : "built-in"
  };
}


/* =========================================================
   INGREDIENT VALIDATION
========================================================= */

function validateIngredient(
  ingredient,
  recipeId,
  index
) {
  const errors = [];

  const prefix =
    `${recipeId}.ingredients[${index}]`;

  if (
    !isNonEmptyString(
      ingredient.id
    )
  ) {
    errors.push(
      `${prefix}: ingredient id is required.`
    );
  }

  if (
    ingredient.scalable
    === true
  ) {
    if (
      !Number.isFinite(
        ingredient.quantity
      )
      ||
      ingredient.quantity <= 0
    ) {
      errors.push(
        `${prefix}: scalable ingredients require a positive quantity.`
      );
    }

    if (
      !isNonEmptyString(
        ingredient.unit
      )
    ) {
      errors.push(
        `${prefix}: scalable ingredients require a unit.`
      );
    }
  }

  if (
    ingredient.scalable
    === false
  ) {
    if (
      !isNonEmptyString(
        ingredient.amountText
      )
    ) {
      errors.push(
        `${prefix}: non-scalable ingredients require amountText.`
      );
    }
  }

  if (
    !Array.isArray(
      ingredient.substitutes
    )
  ) {
    errors.push(
      `${prefix}: substitutes must be an array.`
    );
  }

  if (
    ingredient.substitutes
      ?.includes(
        ingredient.id
      )
  ) {
    errors.push(
      `${prefix}: ingredient cannot substitute itself.`
    );
  }

  return errors;
}


/* =========================================================
   FLEXIBLE INGREDIENT VALIDATION
========================================================= */

function validateFlexibleIngredient(
  item,
  recipeId,
  index
) {
  const errors = [];

  const prefix =
    `${recipeId}.flexibleIngredients[${index}]`;

  if (
    !isNonEmptyString(
      item.label
    )
  ) {
    errors.push(
      `${prefix}: label is required.`
    );
  }

  if (
    !isNonEmptyString(
      item.note
    )
  ) {
    errors.push(
      `${prefix}: note is required.`
    );
  }

  return errors;
}


/* =========================================================
   SOURCE VALIDATION
========================================================= */

function validateSource(
  source,
  recipeId
) {
  const errors = [];

  if (
    !isObject(source)
  ) {
    return [
      `${recipeId}: source is required.`
    ];
  }

  if (
    !RECIPE_SCHEMA
      .sourceTypes
      .includes(
        source.type
      )
  ) {
    errors.push(
      `${recipeId}: invalid source type "${source.type}".`
    );
  }

  if (
    !isNonEmptyString(
      source.name
    )
  ) {
    errors.push(
      `${recipeId}: source name is required.`
    );
  }

  if (
    !isValidUrl(
      source.url
    )
  ) {
    errors.push(
      `${recipeId}: source URL is invalid.`
    );
  }

  /*
   * Web recipes must always retain
   * the original source URL.
   */

  if (
    source.type === "web"
    &&
    !isNonEmptyString(
      source.url
    )
  ) {
    errors.push(
      `${recipeId}: web recipes require a source URL.`
    );
  }

  return errors;
}


/* =========================================================
   RECIPE VALIDATION
========================================================= */

export function validateRecipe(
  recipe
) {
  const errors = [];

  if (
    !isObject(recipe)
  ) {
    return [
      "Recipe must be an object."
    ];
  }

  const recipeId =
    recipe.id
    ||
    "unknown-recipe";


  /* -------------------------
     ID
  ------------------------- */

  if (
    !isNonEmptyString(
      recipe.id
    )
  ) {
    errors.push(
      "Recipe id is required."
    );
  }

  if (
    isNonEmptyString(
      recipe.id
    )
    &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/
      .test(
        recipe.id
      )
  ) {
    errors.push(
      `${recipeId}: id must use lowercase kebab-case.`
    );
  }


  /* -------------------------
     BASIC INFO
  ------------------------- */

  if (
    !isNonEmptyString(
      recipe.name
    )
  ) {
    errors.push(
      `${recipeId}: name is required.`
    );
  }

  if (
    !isNonEmptyString(
      recipe.description
    )
  ) {
    errors.push(
      `${recipeId}: description is required.`
    );
  }

  if (
    !RECIPE_SCHEMA
      .cuisines
      .includes(
        recipe.cuisine
      )
  ) {
    errors.push(
      `${recipeId}: invalid cuisine "${recipe.cuisine}".`
    );
  }

  if (
    !isNonEmptyString(
      recipe.origin
    )
  ) {
    errors.push(
      `${recipeId}: origin is required.`
    );
  }


  /* -------------------------
     COOKING STYLE
  ------------------------- */

  if (
    !Array.isArray(
      recipe.cookingStyles
    )
    ||
    recipe.cookingStyles
      .length === 0
  ) {
    errors.push(
      `${recipeId}: at least one cooking style is required.`
    );
  } else {
    recipe.cookingStyles
      .forEach(
        (style) => {
          if (
            !RECIPE_SCHEMA
              .cookingStyles
              .includes(
                style
              )
          ) {
            errors.push(
              `${recipeId}: invalid cooking style "${style}".`
            );
          }
        }
      );
  }


  /* -------------------------
     TIME
  ------------------------- */

  if (
    !Number.isFinite(
      recipe.timeMinutes
    )
    ||
    recipe.timeMinutes <= 0
  ) {
    errors.push(
      `${recipeId}: timeMinutes must be greater than 0.`
    );
  }


  /* -------------------------
     DIFFICULTY
  ------------------------- */

  if (
    !RECIPE_SCHEMA
      .difficulties
      .includes(
        recipe.difficulty
      )
  ) {
    errors.push(
      `${recipeId}: invalid difficulty "${recipe.difficulty}".`
    );
  }


  /* -------------------------
     BASE SERVINGS
  ------------------------- */

  if (
    !Number.isFinite(
      recipe.baseServings
    )
    ||
    recipe.baseServings <= 0
  ) {
    errors.push(
      `${recipeId}: baseServings must be greater than 0.`
    );
  }


  /* -------------------------
     SERVING CATEGORIES
  ------------------------- */

  if (
    !Array.isArray(
      recipe.servingCategories
    )
    ||
    recipe.servingCategories
      .length === 0
  ) {
    errors.push(
      `${recipeId}: at least one serving category is required.`
    );
  } else {
    recipe.servingCategories
      .forEach(
        (category) => {
          if (
            !RECIPE_SCHEMA
              .servingCategories
              .includes(
                category
              )
          ) {
            errors.push(
              `${recipeId}: invalid serving category "${category}".`
            );
          }
        }
      );
  }


  /* -------------------------
     INGREDIENTS
  ------------------------- */

  if (
    !Array.isArray(
      recipe.ingredients
    )
    ||
    recipe.ingredients
      .length === 0
  ) {
    errors.push(
      `${recipeId}: at least one ingredient is required.`
    );
  } else {
    recipe.ingredients
      .forEach(
        (
          ingredient,
          index
        ) => {
          errors.push(
            ...validateIngredient(
              ingredient,
              recipeId,
              index
            )
          );
        }
      );

    const ingredientIds =
      recipe.ingredients
        .map(
          (ingredient) =>
            ingredient.id
        );

    const uniqueIds =
      new Set(
        ingredientIds
      );

    if (
      uniqueIds.size
      !== ingredientIds.length
    ) {
      errors.push(
        `${recipeId}: duplicate ingredient ids found.`
      );
    }
  }


  /* -------------------------
     FLEXIBLE INGREDIENTS
  ------------------------- */

  if (
    !Array.isArray(
      recipe.flexibleIngredients
    )
  ) {
    errors.push(
      `${recipeId}: flexibleIngredients must be an array.`
    );
  } else {
    recipe.flexibleIngredients
      .forEach(
        (
          item,
          index
        ) => {
          errors.push(
            ...validateFlexibleIngredient(
              item,
              recipeId,
              index
            )
          );
        }
      );
  }


  /* -------------------------
     STEPS
  ------------------------- */

  if (
    !Array.isArray(
      recipe.steps
    )
    ||
    recipe.steps.length === 0
  ) {
    errors.push(
      `${recipeId}: at least one cooking step is required.`
    );
  }


  /* -------------------------
     ADDED BY
  ------------------------- */

  if (
    !RECIPE_SCHEMA
      .addedBy
      .includes(
        recipe.addedBy
      )
  ) {
    errors.push(
      `${recipeId}: invalid addedBy value "${recipe.addedBy}".`
    );
  }


  /* -------------------------
     SOURCE
  ------------------------- */

  errors.push(
    ...validateSource(
      recipe.source,
      recipeId
    )
  );


  return errors;
}


/* =========================================================
   RECIPE LIBRARY VALIDATION
========================================================= */

export function validateRecipeLibrary(
  recipes
) {
  if (
    !Array.isArray(
      recipes
    )
  ) {
    return {
      valid: false,

      errors: [
        "Recipe library must be an array."
      ]
    };
  }

  const errors = [];

  const ids = [];

  recipes.forEach(
    (
      recipe,
      index
    ) => {
      const recipeErrors =
        validateRecipe(
          recipe
        );

      recipeErrors
        .forEach(
          (error) => {
            errors.push(
              `Recipe ${index + 1}: ${error}`
            );
          }
        );

      if (
        isNonEmptyString(
          recipe.id
        )
      ) {
        ids.push(
          recipe.id
        );
      }
    }
  );

  const seen =
    new Set();

  ids.forEach(
    (id) => {
      if (
        seen.has(id)
      ) {
        errors.push(
          `Duplicate recipe id: "${id}".`
        );
      }

      seen.add(id);
    }
  );

  return {
    valid:
      errors.length === 0,

    errors
  };
}


/* =========================================================
   LOAD RECIPES
========================================================= */

export async function loadRecipes() {
  if (
    recipeCache
  ) {
    return recipeCache;
  }

  const response =
    await fetch(
      RECIPES_URL
    );

  if (
    !response.ok
  ) {
    throw new Error(
      "Unable to load recipes."
    );
  }

  const rawRecipes =
    await response.json();

  const normalized =
    Array.isArray(
      rawRecipes
    )
      ? rawRecipes
          .map(
            normalizeRecipe
          )
          .filter(Boolean)
      : rawRecipes;

  const validation =
    validateRecipeLibrary(
      normalized
    );

  if (
    !validation.valid
  ) {
    console.error(
      "Recipe library validation failed:"
    );

    validation.errors
      .forEach(
        (error) => {
          console.error(
            `• ${error}`
          );
        }
      );

    throw new Error(
      `Recipe library contains ${validation.errors.length} validation error(s). Check the browser console.`
    );
  }

  recipeCache =
    normalized;

  return recipeCache;
}


/* =========================================================
   CACHE RESET
========================================================= */

export function clearRecipeCache() {
  recipeCache =
    null;
}


/* =========================================================
   INGREDIENT REQUIREMENTS
========================================================= */

export function getRequiredIngredients(
  recipe
) {
  return (
    recipe.ingredients
      ?.filter(
        (ingredient) =>
          ingredient.required
          !== false
      )
    ??
    []
  );
}


/* =========================================================
   SUBSTITUTE MATCHING
========================================================= */

function hasIngredientOrSubstitute(
  ingredient,
  pantry
) {
  if (
    pantry.has(
      ingredient.id
    )
  ) {
    return true;
  }

  return (
    ingredient.substitutes
      ?.some(
        (substituteId) =>
          pantry.has(
            substituteId
          )
      )
    ??
    false
  );
}


/* =========================================================
   PANTRY MATCH
========================================================= */

export function calculateRecipeMatch(
  recipe,
  pantryIds
) {
  const pantry =
    pantryIds
    instanceof Set
      ? pantryIds
      : new Set(
          pantryIds
          ??
          []
        );

  const required =
    getRequiredIngredients(
      recipe
    );

  const available = [];

  const missing = [];

  required.forEach(
    (ingredient) => {
      if (
        hasIngredientOrSubstitute(
          ingredient,
          pantry
        )
      ) {
        available.push(
          ingredient
        );
      } else {
        missing.push(
          ingredient
        );
      }
    }
  );

  const total =
    required.length;

  const percentage =
    total === 0
      ? 100
      : Math.round(
          (
            available.length
            /
            total
          )
          *
          100
        );

  return {
    total,

    available,

    missing,

    availableCount:
      available.length,

    missingCount:
      missing.length,

    percentage,

    canCook:
      missing.length === 0
  };
}


/* =========================================================
   RANK RECIPES BY PANTRY
========================================================= */

export function rankRecipesByPantry(
  recipes,
  pantryIds
) {
  return recipes
    .map(
      (recipe) => ({
        recipe,

        match:
          calculateRecipeMatch(
            recipe,
            pantryIds
          )
      })
    )
    .sort(
      (
        a,
        b
      ) => {
        /*
         * Fully cookable recipes first.
         */

        if (
          a.match.canCook
          !==
          b.match.canCook
        ) {
          return (
            Number(
              b.match.canCook
            )
            -
            Number(
              a.match.canCook
            )
          );
        }

        /*
         * Then strongest percentage match.
         */

        if (
          a.match.percentage
          !==
          b.match.percentage
        ) {
          return (
            b.match.percentage
            -
            a.match.percentage
          );
        }

        /*
         * Then fewest missing ingredients.
         */

        if (
          a.match.missingCount
          !==
          b.match.missingCount
        ) {
          return (
            a.match.missingCount
            -
            b.match.missingCount
          );
        }

        /*
         * Stable alphabetical fallback.
         */

        return (
          a.recipe.name
            .localeCompare(
              b.recipe.name
            )
        );
      }
    );
}


/* =========================================================
   CUISINE FILTER
========================================================= */

function matchesCuisine(
  recipe,
  cuisines
) {
  if (
    !cuisines
    ||
    cuisines.size === 0
  ) {
    return true;
  }

  return cuisines.has(
    recipe.cuisine
  );
}


/* =========================================================
   COOKING STYLE FILTER
========================================================= */

function matchesCookingStyle(
  recipe,
  cookingStyles
) {
  if (
    !cookingStyles
    ||
    cookingStyles.size === 0
  ) {
    return true;
  }

  return (
    recipe.cookingStyles
    ??
    []
  ).some(
    (style) =>
      cookingStyles.has(
        style
      )
  );
}


/* =========================================================
   DIET FILTER
========================================================= */

function matchesDiet(
  recipe,
  diets
) {
  if (
    !diets
    ||
    diets.size === 0
  ) {
    return true;
  }

  return [
    ...diets
  ].every(
    (diet) => {
      if (
        diet === "spicy"
      ) {
        return (
          recipe.spicy
          === true
        );
      }

      return (
        recipe.diet
          ?.includes(
            diet
          )
        ??
        false
      );
    }
  );
}


/* =========================================================
   TIME FILTER
========================================================= */

function matchesTime(
  recipe,
  times
) {
  if (
    !times
    ||
    times.size === 0
  ) {
    return true;
  }

  const limits =
    [
      ...times
    ]
      .map(Number)
      .filter(
        Number.isFinite
      );

  if (
    limits.length === 0
  ) {
    return true;
  }

  /*
   * If multiple time filters are selected,
   * the broadest selected limit wins.
   *
   * Example:
   * <= 15 and <= 30 means <= 30.
   */

  const largestLimit =
    Math.max(
      ...limits
    );

  return (
    recipe.timeMinutes
    <=
    largestLimit
  );
}


/* =========================================================
   SERVINGS FILTER
========================================================= */

function matchesServings(
  recipe,
  servings
) {
  if (
    !servings
    ||
    servings.size === 0
  ) {
    return true;
  }

  const categories =
    recipe.servingCategories
    ??
    [];

  return [
    ...servings
  ].some(
    (selectedCategory) =>
      categories.includes(
        selectedCategory
      )
  );
}


/* =========================================================
   APPLY FILTERS
========================================================= */

export function filterRecipes(
  recipes,
  filters
) {
  return recipes.filter(
    (recipe) =>
      matchesCuisine(
        recipe,
        filters.cuisine
      )
      &&
      matchesCookingStyle(
        recipe,
        filters.cookingStyle
      )
      &&
      matchesDiet(
        recipe,
        filters.diet
      )
      &&
      matchesTime(
        recipe,
        filters.time
      )
      &&
      matchesServings(
        recipe,
        filters.servings
      )
  );
}


/* =========================================================
   RANDOM RECIPE
========================================================= */

export function pickRandomRecipe(
  recipes
) {
  if (
    !Array.isArray(
      recipes
    )
    ||
    recipes.length === 0
  ) {
    return null;
  }

  const index =
    Math.floor(
      Math.random()
      *
      recipes.length
    );

  return recipes[index];
}