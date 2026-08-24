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

  servings: [
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
    && typeof value === "object"
    && !Array.isArray(value)
  );
}


function isNonEmptyString(
  value
) {
  return (
    typeof value === "string"
    && value.trim().length > 0
  );
}


function isValidUrl(
  value
) {
  if (
    value === null
    || value === undefined
    || value === ""
  ) {
    return true;
  }

  try {
    const url =
      new URL(value);

    return (
      url.protocol === "http:"
      || url.protocol === "https:"
    );
  } catch {
    return false;
  }
}


function normalizeStringArray(
  value
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .filter(isNonEmptyString)
        .map(
          (item) =>
            item.trim()
        )
    )
  ];
}


/* =========================================================
   SOURCE NORMALIZATION
========================================================= */

function normalizeSource(
  source
) {
  if (!isObject(source)) {
    return {
      type: "original",
      name: "Anong Ulam Today?",
      url: null,
      retrievedAt: null
    };
  }

  return {
    type:
      isNonEmptyString(source.type)
        ? source.type.trim()
        : "original",

    name:
      isNonEmptyString(source.name)
        ? source.name.trim()
        : "Anong Ulam Today?",

    url:
      isNonEmptyString(source.url)
        ? source.url.trim()
        : null,

    retrievedAt:
      isNonEmptyString(
        source.retrievedAt
      )
        ? source.retrievedAt.trim()
        : null
  };
}


/* =========================================================
   INGREDIENT NORMALIZATION
========================================================= */

function normalizeIngredient(
  ingredient
) {
  if (!isObject(ingredient)) {
    return null;
  }

  return {
    id:
      isNonEmptyString(
        ingredient.id
      )
        ? ingredient.id
            .trim()
            .toLowerCase()
        : "",

    amount:
      isNonEmptyString(
        ingredient.amount
      )
        ? ingredient.amount.trim()
        : "",

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
  if (!isObject(item)) {
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
  if (!isObject(recipe)) {
    return null;
  }

  return {
    id:
      isNonEmptyString(recipe.id)
        ? recipe.id
            .trim()
            .toLowerCase()
        : "",

    name:
      isNonEmptyString(recipe.name)
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

    servings:
      isNonEmptyString(
        recipe.servings
      )
        ? recipe.servings
            .trim()
            .toLowerCase()
        : "family",

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
    !isNonEmptyString(
      ingredient.amount
    )
  ) {
    errors.push(
      `${prefix}: amount is required.`
    );
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

  if (!isObject(source)) {
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
   * AI/web-added recipes must retain
   * the original source URL.
   */

  if (
    source.type === "web"
    && !isNonEmptyString(
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

  if (!isObject(recipe)) {
    return [
      "Recipe must be an object."
    ];
  }

  const recipeId =
    recipe.id
    || "unknown-recipe";

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
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/
      .test(
        recipe.id
      )
  ) {
    errors.push(
      `${recipeId}: id must use lowercase kebab-case.`
    );
  }

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

  if (
    !Array.isArray(
      recipe.cookingStyles
    )
    || recipe.cookingStyles
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
              .includes(style)
          ) {
            errors.push(
              `${recipeId}: invalid cooking style "${style}".`
            );
          }
        }
      );
  }

  if (
    !Number.isFinite(
      recipe.timeMinutes
    )
    || recipe.timeMinutes <= 0
  ) {
    errors.push(
      `${recipeId}: timeMinutes must be greater than 0.`
    );
  }

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

  if (
    !RECIPE_SCHEMA
      .servings
      .includes(
        recipe.servings
      )
  ) {
    errors.push(
      `${recipeId}: invalid servings value "${recipe.servings}".`
    );
  }

  if (
    !Array.isArray(
      recipe.ingredients
    )
    || recipe.ingredients
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

  if (
    !Array.isArray(
      recipe.steps
    )
    || recipe.steps.length === 0
  ) {
    errors.push(
      `${recipeId}: at least one cooking step is required.`
    );
  }

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

  errors.push(
    ...validateSource(
      recipe.source,
      recipeId
    )
  );

  return errors;
}


/* =========================================================
   LIBRARY VALIDATION
========================================================= */

export function validateRecipeLibrary(
  recipes
) {
  if (!Array.isArray(recipes)) {
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
   LOAD
========================================================= */

export async function loadRecipes() {
  if (recipeCache) {
    return recipeCache;
  }

  const response =
    await fetch(
      RECIPES_URL
    );

  if (!response.ok) {
    throw new Error(
      "Unable to load recipes."
    );
  }

  const rawRecipes =
    await response.json();

  const normalized =
    Array.isArray(rawRecipes)
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

  if (!validation.valid) {
    console.error(
      "Recipe library validation failed:",
      validation.errors
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
    ?? []
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
    ?? false
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
    pantryIds instanceof Set
      ? pantryIds
      : new Set(
          pantryIds
          ?? []
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
            / total
          )
          * 100
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
   RANK RECIPES
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
        if (
          a.match.canCook
          !== b.match.canCook
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

        if (
          a.match.percentage
          !== b.match.percentage
        ) {
          return (
            b.match.percentage
            -
            a.match.percentage
          );
        }

        return (
          a.match.missingCount
          -
          b.match.missingCount
        );
      }
    );
}


/* =========================================================
   FILTERS
========================================================= */

function matchesCuisine(
  recipe,
  cuisines
) {
  if (
    !cuisines
    || cuisines.size === 0
  ) {
    return true;
  }

  return cuisines.has(
    recipe.cuisine
  );
}


function matchesCookingStyle(
  recipe,
  cookingStyles
) {
  if (
    !cookingStyles
    || cookingStyles.size === 0
  ) {
    return true;
  }

  return [
    ...(
      recipe.cookingStyles
      ?? []
    )
  ].some(
    (style) =>
      cookingStyles.has(
        style
      )
  );
}


function matchesDiet(
  recipe,
  diets
) {
  if (
    !diets
    || diets.size === 0
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
        ?? false
      );
    }
  );
}


function matchesTime(
  recipe,
  times
) {
  if (
    !times
    || times.size === 0
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

  const largestLimit =
    Math.max(
      ...limits
    );

  return (
    recipe.timeMinutes
    <= largestLimit
  );
}


function matchesServings(
  recipe,
  servings
) {
  if (
    !servings
    || servings.size === 0
  ) {
    return true;
  }

  return servings.has(
    recipe.servings
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
    !recipes
    || recipes.length === 0
  ) {
    return null;
  }

  const index =
    Math.floor(
      Math.random()
      * recipes.length
    );

  return recipes[index];
}