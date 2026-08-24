
const RECIPES_URL =
  "/data/recipes.json";


let recipeCache = null;


/* =========================
   LOAD
========================= */

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

  recipeCache =
    await response.json();

  return recipeCache;
}


/* =========================
   INGREDIENT REQUIREMENTS
========================= */

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


/* =========================
   SUBSTITUTE MATCHING
========================= */

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


/* =========================
   PANTRY MATCH
========================= */

export function calculateRecipeMatch(
  recipe,
  pantryIds
) {
  const pantry =
    pantryIds instanceof Set
      ? pantryIds
      : new Set(
          pantryIds
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


/* =========================
   RANK RECIPES
========================= */

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
      (a, b) => {

        if (
          a.match.canCook
          !== b.match.canCook
        ) {
          return Number(
            b.match.canCook
          )
          - Number(
            a.match.canCook
          );
        }


        if (
          a.match.percentage
          !== b.match.percentage
        ) {
          return (
            b.match.percentage
            - a.match.percentage
          );
        }


        return (
          a.match.missingCount
          - b.match.missingCount
        );

      }
    );
}


/* =========================
   FILTERS
========================= */

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
    ...(recipe.cookingStyles ?? [])
  ].some(
    (style) =>
      cookingStyles.has(style)
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


  return [...diets]
    .every(
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
    [...times]
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


/* =========================
   APPLY FILTERS
========================= */

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


/* =========================
   RANDOM RECIPE
========================= */

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