import {
  STORAGE_KEYS,
  loadList
} from "./storage.js";

import {
  loadRecipes,
  calculateRecipeMatch,
  rankRecipesByPantry,
  filterRecipes,
  pickRandomRecipe
} from "./recipes.js";


/* =========================================================
   CONFIG
========================================================= */

const SURPRISE_HISTORY_LIMIT = 5;


/* =========================================================
   SELECTORS
========================================================= */

const SELECTORS = {
  advancedToggle: "#advancedToggle",
  advancedPanel: "#advancedPanel",

  filterButtons:
    "[data-filter-group][data-filter-value]",

  resetFiltersButton:
    "#resetFiltersButton",

  activeFilterList:
    "#activeFilterList",

  filterCount:
    "#filterCount",

  recipeContainer:
    ".recipe-scroll",

  surpriseButton:
    "#surpriseButton",

  usePantryCheckbox:
    "#usePantryCheckbox",

  pantryCard:
    ".quick-card--pantry",

  shoppingCard:
    ".quick-card--shopping"
};


/* =========================================================
   FILTER LABELS
========================================================= */

const FILTER_LABELS = {
  cuisine: {
    filipino: "Filipino",
    japanese: "Japanese",
    korean: "Korean",
    chinese: "Chinese",
    vietnamese: "Vietnamese",
    european: "European",
    american: "American",
    mediterranean: "Mediterranean"
  },

  cookingStyle: {
    fried: "Fried",
    stew: "Stew",
    soup: "Soup",
    grilled: "Grilled",
    baked: "Baked",
    "stir-fry": "Stir-fry",
    steamed: "Steamed",
    "air-fryer": "Air Fryer"
  },

  diet: {
    "kid-friendly": "Kid-friendly",
    healthy: "Healthy",
    "dairy-free": "Dairy-free",
    "gluten-free": "Gluten-free",
    vegetarian: "Vegetarian",
    spicy: "Spicy"
  },

  time: {
    15: "≤ 15 mins",
    30: "≤ 30 mins",
    45: "≤ 45 mins",
    60: "≤ 60 mins"
  },

  servings: {
    one: "One",
    couple: "Couple",
    family: "Family",
    party: "Party"
  }
};


/* =========================================================
   APP STATE
========================================================= */

const state = {
  recipes: [],

  pantry:
    new Set(),

  shopping:
    new Set(),

  filters: {
    cuisine:
      new Set(),

    cookingStyle:
      new Set(),

    diet:
      new Set(),

    time:
      new Set(),

    servings:
      new Set()
  },

  surpriseRecipeId:
    null,

  surpriseUsesPantry:
    false,

  recentSurpriseIds:
    [],

  expandedRecipeIds:
    new Set()
};


/* =========================================================
   DOM HELPERS
========================================================= */

function getElement(
  selector
) {
  return document.querySelector(
    selector
  );
}


function getElements(
  selector
) {
  return document.querySelectorAll(
    selector
  );
}


/* =========================================================
   TEXT HELPERS
========================================================= */

function capitalize(
  value = ""
) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0)
      .toUpperCase()
    +
    value.slice(1)
  );
}


function ingredientIdToLabel(
  ingredientId = ""
) {
  return ingredientId
    .split("-")
    .map(capitalize)
    .join(" ");
}


function escapeHtml(
  value = ""
) {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadLocalState() {
  state.pantry =
    new Set(
      loadList(
        STORAGE_KEYS.pantry
      )
    );

  state.shopping =
    new Set(
      loadList(
        STORAGE_KEYS.shopping
      )
    );
}


/* =========================================================
   FILTER HELPERS
========================================================= */

function getFilterLabel(
  group,
  value
) {
  return (
    FILTER_LABELS[group]?.[value]
    ?? value
  );
}


function updateFilterState(
  group,
  value
) {
  const groupState =
    state.filters[group];

  if (!groupState) {
    return;
  }

  if (
    groupState.has(value)
  ) {
    groupState.delete(value);
  } else {
    groupState.add(value);
  }

  clearCurrentSurprise();
}


function clearCurrentSurprise() {
  state.surpriseRecipeId =
    null;

  state.expandedRecipeIds
    .clear();
}


/* =========================================================
   FILTER BUTTON UI
========================================================= */

function updateFilterButtonStates() {
  getElements(
    SELECTORS.filterButtons
  ).forEach(
    (button) => {
      const group =
        button.dataset.filterGroup;

      const value =
        button.dataset.filterValue;

      const selected =
        state.filters[group]?.has(
          value
        );

      button.classList.toggle(
        "is-selected",
        Boolean(selected)
      );
    }
  );
}


/* =========================================================
   ACTIVE FILTERS
========================================================= */

function getActiveFilters() {
  const filters = [];

  Object.entries(
    state.filters
  ).forEach(
    ([
      group,
      values
    ]) => {
      values.forEach(
        (value) => {
          filters.push({
            group,
            value,

            label:
              getFilterLabel(
                group,
                value
              )
          });
        }
      );
    }
  );

  return filters;
}


function renderActiveFilters() {
  const container =
    getElement(
      SELECTORS.activeFilterList
    );

  const count =
    getElement(
      SELECTORS.filterCount
    );

  if (
    !container
    || !count
  ) {
    return;
  }

  const activeFilters =
    getActiveFilters();

  count.textContent =
    `${activeFilters.length} selected`;

  if (
    activeFilters.length === 0
  ) {
    container.innerHTML = `
      <span class="active-filter-empty">
        No filters selected.
      </span>
    `;

    return;
  }

  container.innerHTML =
    activeFilters
      .map(
        (filter) => `
          <span class="active-filter-chip">

            ${escapeHtml(
              filter.label
            )}

            <button
              type="button"
              data-remove-filter-group="${escapeHtml(
                filter.group
              )}"
              data-remove-filter-value="${escapeHtml(
                filter.value
              )}"
              aria-label="Remove ${escapeHtml(
                filter.label
              )}"
            >
              ×
            </button>

          </span>
        `
      )
      .join("");
}


/* =========================================================
   RESET FILTERS
========================================================= */

function resetFilters() {
  Object.values(
    state.filters
  ).forEach(
    (group) =>
      group.clear()
  );

  clearCurrentSurprise();

  refreshUI();
}


/* =========================================================
   REMOVE FILTER
========================================================= */

function removeFilter(
  group,
  value
) {
  state.filters[group]
    ?.delete(value);

  clearCurrentSurprise();

  refreshUI();
}


/* =========================================================
   FILTER RECIPES
========================================================= */

function getFilteredRecipes() {
  return filterRecipes(
    state.recipes,
    state.filters
  );
}


/* =========================================================
   PANTRY RANKING
========================================================= */

function getRankedRecipes() {
  return rankRecipesByPantry(
    getFilteredRecipes(),
    state.pantry
  );
}


/* =========================================================
   INGREDIENT MATCH HELPERS
========================================================= */

function pantryHasIngredient(
  ingredient
) {
  if (
    state.pantry.has(
      ingredient.id
    )
  ) {
    return true;
  }

  return (
    ingredient.substitutes
      ?.some(
        (substituteId) =>
          state.pantry.has(
            substituteId
          )
      )
    ?? false
  );
}


function getIngredientMatchType(
  ingredient
) {
  if (
    state.pantry.has(
      ingredient.id
    )
  ) {
    return {
      type: "available",
      substitute: null
    };
  }

  const substitute =
    ingredient.substitutes
      ?.find(
        (substituteId) =>
          state.pantry.has(
            substituteId
          )
      );

  if (substitute) {
    return {
      type: "substitute",
      substitute
    };
  }

  return {
    type: "missing",
    substitute: null
  };
}


/* =========================================================
   RECIPE STATUS
========================================================= */

function getRecipeStatus(
  match
) {
  if (
    match.total === 0
  ) {
    return {
      className:
        "is-ready",

      label:
        "✓ Ready to cook"
    };
  }

  if (
    match.canCook
  ) {
    return {
      className:
        "is-ready",

      label:
        "✓ Ready to cook"
    };
  }

  if (
    match.missingCount === 1
  ) {
    return {
      className:
        "is-almost",

      label:
        "Almost there · Missing 1"
    };
  }

  return {
    className:
      "is-missing",

    label:
      `Missing ${match.missingCount} ingredients`
  };
}


/* =========================================================
   INGREDIENT LIST
========================================================= */

function createIngredientList(
  recipe
) {
  if (
    !recipe.ingredients
    || recipe.ingredients.length === 0
  ) {
    return "";
  }

  return `
    <div class="recipe-detail-section">

      <h4>
        Ingredients
      </h4>

      <ul class="recipe-detail-list">

        ${recipe.ingredients
          .map(
            (ingredient) => {
              const substitutes =
                ingredient.substitutes
                ?? [];

              const matchInfo =
                getIngredientMatchType(
                  ingredient
                );

              let pantryStatus = "";

              if (
                state.pantry.size > 0
              ) {
                if (
                  matchInfo.type
                  === "available"
                ) {
                  pantryStatus = `
                    <small class="ingredient-status ingredient-status--available">
                      ✓ You have this
                    </small>
                  `;
                }

                if (
                  matchInfo.type
                  === "substitute"
                ) {
                  pantryStatus = `
                    <small class="ingredient-status ingredient-status--available">
                      ✓ You have ${escapeHtml(
                        ingredientIdToLabel(
                          matchInfo.substitute
                        )
                      )} as an alternative
                    </small>
                  `;
                }

                if (
                  matchInfo.type
                  === "missing"
                ) {
                  pantryStatus = `
                    <small class="ingredient-status ingredient-status--missing">
                      Missing
                    </small>
                  `;
                }
              }

              const substituteText =
                substitutes.length > 0
                  ? `
                    <small>
                      Alternative:
                      ${substitutes
                        .map(
                          ingredientIdToLabel
                        )
                        .join(", ")}
                    </small>
                  `
                  : "";

              return `
                <li>

                  <span>
                    <strong>
                      ${escapeHtml(
                        ingredientIdToLabel(
                          ingredient.id
                        )
                      )}
                    </strong>

                    ${
                      ingredient.amount
                        ? ` — ${escapeHtml(
                            ingredient.amount
                          )}`
                        : ""
                    }
                  </span>

                  ${pantryStatus}

                  ${substituteText}

                </li>
              `;
            }
          )
          .join("")}

      </ul>

    </div>
  `;
}


/* =========================================================
   FLEXIBLE INGREDIENTS
========================================================= */

function createFlexibleIngredients(
  recipe
) {
  if (
    !recipe.flexibleIngredients
    || recipe.flexibleIngredients
      .length === 0
  ) {
    return "";
  }

  return `
    <div class="recipe-flexible-note">

      ${recipe.flexibleIngredients
        .map(
          (item) => `
            <p>

              <strong>
                ${escapeHtml(
                  item.label
                )}:
              </strong>

              ${escapeHtml(
                item.note
              )}

            </p>
          `
        )
        .join("")}

    </div>
  `;
}


/* =========================================================
   STEPS
========================================================= */

function createSteps(
  recipe
) {
  if (
    !recipe.steps
    || recipe.steps.length === 0
  ) {
    return "";
  }

  return `
    <div class="recipe-detail-section">

      <h4>
        Steps
      </h4>

      <ol class="recipe-step-list">

        ${recipe.steps
          .map(
            (step) => `
              <li>
                ${escapeHtml(
                  step
                )}
              </li>
            `
          )
          .join("")}

      </ol>

    </div>
  `;
}


/* =========================================================
   NOTES
========================================================= */

function createNotes(
  recipe
) {
  if (
    !recipe.notes
    || recipe.notes.length === 0
  ) {
    return "";
  }

  return `
    <div class="recipe-notes">

      ${recipe.notes
        .map(
          (note) => `
            <p>
              💡 ${escapeHtml(
                note
              )}
            </p>
          `
        )
        .join("")}

    </div>
  `;
}


/* =========================================================
   RECIPE DETAILS
========================================================= */

function createRecipeDetails(
  recipe
) {
  const expanded =
    state.expandedRecipeIds
      .has(
        recipe.id
      );

  if (!expanded) {
    return "";
  }

  return `
    <div class="recipe-card__details">

      <p class="recipe-card__description">
        ${escapeHtml(
          recipe.description
          ?? ""
        )}
      </p>

      ${createIngredientList(
        recipe
      )}

      ${createFlexibleIngredients(
        recipe
      )}

      ${createSteps(
        recipe
      )}

      ${createNotes(
        recipe
      )}

    </div>
  `;
}


/* =========================================================
   SURPRISE MODE LABEL
========================================================= */

function createSurpriseModeLabel(
  match
) {
  if (
    !state.surpriseRecipeId
  ) {
    return "";
  }

  if (
    !state.surpriseUsesPantry
  ) {
    return `
      <div
        class="
          recipe-surprise-mode
          recipe-surprise-mode--full
        "
      >
        🎲 Full Surprise
      </div>
    `;
  }

  if (
    state.pantry.size === 0
  ) {
    return `
      <div
        class="
          recipe-surprise-mode
          recipe-surprise-mode--full
        "
      >
        🎲 Pantry empty · Full Surprise used
      </div>
    `;
  }

  if (
    match.canCook
  ) {
    return `
      <div
        class="
          recipe-surprise-mode
          recipe-surprise-mode--pantry
        "
      >
        🧺 Ready with what you have
      </div>
    `;
  }

  return `
    <div
      class="
        recipe-surprise-mode
        recipe-surprise-mode--pantry
      "
    >
      🧺 Closest Pantry Match
    </div>
  `;
}


/* =========================================================
   RECIPE CARD
========================================================= */

function createRecipeCard(
  recipe,
  match,
  options = {}
) {
  const {
    surprise = false
  } = options;

  const expanded =
    state.expandedRecipeIds
      .has(
        recipe.id
      );

  const cuisine =
    capitalize(
      recipe.cuisine
    );

  const status =
    getRecipeStatus(
      match
    );

  const ingredientCountText =
    match.total > 0
      ? `${match.availableCount}/${match.total} ingredients`
      : "No required ingredients";

  return `
    <article
      class="
        recipe-card
        recipe-card--dynamic
        ${
          surprise
            ? "recipe-card--surprise"
            : ""
        }
      "
      data-recipe-id="${escapeHtml(
        recipe.id
      )}"
    >

      <div class="recipe-card__image">

        <span
          class="recipe-card__emoji"
          aria-hidden="true"
        >
          ${recipe.emoji ?? "🍽️"}
        </span>

        ${
          surprise
            ? `
              <span class="recipe-surprise-badge">
                🎲 Surprise Pick
              </span>
            `
            : ""
        }

        <button
          class="recipe-card__favorite"
          type="button"
          aria-label="Add ${escapeHtml(
            recipe.name
          )} to favorites"
        >
          ♡
        </button>

      </div>

      <div class="recipe-card__body">

        <h3 class="recipe-card__title">
          ${escapeHtml(
            recipe.name
          )}
        </h3>

        <div class="recipe-card__meta">

          <span>
            ⏱ ${recipe.timeMinutes} mins
          </span>

          <span>
            ${escapeHtml(
              recipe.difficulty
              ?? "Easy"
            )}
          </span>

        </div>

        ${createSurpriseModeLabel(
          match
        )}

        <div class="recipe-match-row">

          <span
            class="
              recipe-match-badge
              ${status.className}
            "
          >
            ${escapeHtml(
              status.label
            )}
          </span>

          <span class="recipe-match-count">
            ${ingredientCountText}
          </span>

        </div>

        ${
          match.missingCount > 0
            ? `
              <div class="recipe-missing-summary">
                Missing:
                ${match.missing
                  .map(
                    (ingredient) =>
                      escapeHtml(
                        ingredientIdToLabel(
                          ingredient.id
                        )
                      )
                  )
                  .join(", ")}
              </div>
            `
            : ""
        }

        <div class="recipe-card__tags">

          <span class="recipe-card__tag">
            ${escapeHtml(
              cuisine
            )}
          </span>

          ${
            recipe.cookingStyles
              ?.map(
                (style) => `
                  <span
                    class="
                      recipe-card__tag
                      recipe-card__tag--soft
                    "
                  >
                    ${escapeHtml(
                      getFilterLabel(
                        "cookingStyle",
                        style
                      )
                    )}
                  </span>
                `
              )
              .join("")
            ?? ""
          }

        </div>

        <div class="recipe-card__actions">

          <button
            class="
              recipe-card__action
              recipe-card__action--primary
            "
            type="button"
            data-view-recipe="${escapeHtml(
              recipe.id
            )}"
          >
            ${
              expanded
                ? "Hide Recipe"
                : "View Recipe"
            }
          </button>

          ${
            surprise
              ? `
                <button
                  class="recipe-card__action"
                  type="button"
                  data-pick-again
                >
                  🎲 Pick Again
                </button>
              `
              : ""
          }

        </div>

        ${createRecipeDetails(
          recipe
        )}

      </div>

    </article>
  `;
}


/* =========================================================
   EMPTY STATE
========================================================= */

function createEmptyRecipeState() {
  return `
    <div class="recipe-empty-state">

      <div class="recipe-empty-state__icon">
        🍳
      </div>

      <strong>
        No recipes match
      </strong>

      <p>
        Try removing one or more filters.
      </p>

    </div>
  `;
}


/* =========================================================
   NORMAL BEST MATCHES
========================================================= */

function renderBestMatches() {
  const container =
    getElement(
      SELECTORS.recipeContainer
    );

  if (!container) {
    return;
  }

  const ranked =
    getRankedRecipes();

  if (
    ranked.length === 0
  ) {
    container.innerHTML =
      createEmptyRecipeState();

    return;
  }

  /*
   * Normal browsing should still
   * show recipes even with an empty Pantry.
   *
   * Pantry simply controls their match status.
   */

  container.innerHTML =
    ranked
      .map(
        ({
          recipe,
          match
        }) =>
          createRecipeCard(
            recipe,
            match
          )
      )
      .join("");
}


/* =========================================================
   SURPRISE HISTORY
========================================================= */

function rememberSurpriseRecipe(
  recipeId
) {
  if (!recipeId) {
    return;
  }

  state.recentSurpriseIds =
    state.recentSurpriseIds
      .filter(
        (id) =>
          id !== recipeId
      );

  state.recentSurpriseIds
    .unshift(
      recipeId
    );

  state.recentSurpriseIds =
    state.recentSurpriseIds
      .slice(
        0,
        SURPRISE_HISTORY_LIMIT
      );
}


function removeRecentRecipes(
  recipes
) {
  if (
    recipes.length <= 1
  ) {
    return recipes;
  }

  const recent =
    new Set(
      state.recentSurpriseIds
    );

  const fresh =
    recipes.filter(
      (recipe) =>
        !recent.has(
          recipe.id
        )
    );

  return (
    fresh.length > 0
      ? fresh
      : recipes
  );
}


/* =========================================================
   FULL SURPRISE POOL
========================================================= */

function getFullSurprisePool() {
  /*
   * Full Surprise ignores Pantry.
   * User-selected filters still apply.
   */

  return getFilteredRecipes();
}


/* =========================================================
   USE WHAT I HAVE POOL
========================================================= */

function getPantrySurprisePool() {
  const filtered =
    getFilteredRecipes();

  if (
    filtered.length === 0
  ) {
    return [];
  }

  /*
   * Empty Pantry must NEVER stop
   * the generator.
   */

  if (
    state.pantry.size === 0
  ) {
    return filtered;
  }

  const ranked =
    rankRecipesByPantry(
      filtered,
      state.pantry
    );

  if (
    ranked.length === 0
  ) {
    return [];
  }

  /*
   * First priority:
   * recipes completely cookable.
   */

  const ready =
    ranked.filter(
      (item) =>
        item.match.canCook
    );

  if (
    ready.length > 0
  ) {
    return ready.map(
      (item) =>
        item.recipe
    );
  }

  /*
   * Otherwise find recipes with
   * the fewest missing ingredients.
   */

  const minimumMissing =
    Math.min(
      ...ranked.map(
        (item) =>
          item.match.missingCount
      )
    );

  return ranked
    .filter(
      (item) =>
        item.match.missingCount
        === minimumMissing
    )
    .map(
      (item) =>
        item.recipe
    );
}


/* =========================================================
   SURPRISE POOL
========================================================= */

function getSurprisePool() {
  if (
    state.surpriseUsesPantry
  ) {
    return getPantrySurprisePool();
  }

  return getFullSurprisePool();
}


/* =========================================================
   GENERATE SURPRISE
========================================================= */

function generateSurpriseRecipe() {
  /*
   * Refresh Pantry first in case
   * user changed it on another page.
   */

  loadLocalState();

  const checkbox =
    getElement(
      SELECTORS.usePantryCheckbox
    );

  state.surpriseUsesPantry =
    Boolean(
      checkbox?.checked
    );

  let pool =
    getSurprisePool();

  if (
    pool.length === 0
  ) {
    const container =
      getElement(
        SELECTORS.recipeContainer
      );

    if (container) {
      container.innerHTML =
        createEmptyRecipeState();

      container.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }

    return;
  }

  pool =
    removeRecentRecipes(
      pool
    );

  const recipe =
    pickRandomRecipe(
      pool
    );

  if (!recipe) {
    return;
  }

  state.surpriseRecipeId =
    recipe.id;

  rememberSurpriseRecipe(
    recipe.id
  );

  state.expandedRecipeIds
    .clear();

  renderRecipes();

  getElement(
    SELECTORS.recipeContainer
  )?.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}


/* =========================================================
   SURPRISE RESULT
========================================================= */

function renderSurpriseRecipe() {
  const container =
    getElement(
      SELECTORS.recipeContainer
    );

  if (!container) {
    return;
  }

  const recipe =
    state.recipes.find(
      (item) =>
        item.id
        === state.surpriseRecipeId
    );

  if (!recipe) {
    state.surpriseRecipeId =
      null;

    renderBestMatches();

    return;
  }

  const match =
    calculateRecipeMatch(
      recipe,
      state.pantry
    );

  container.innerHTML =
    createRecipeCard(
      recipe,
      match,
      {
        surprise: true
      }
    );
}


/* =========================================================
   MAIN RECIPE RENDERER
========================================================= */

function renderRecipes() {
  if (
    state.surpriseRecipeId
  ) {
    renderSurpriseRecipe();

    return;
  }

  renderBestMatches();
}


/* =========================================================
   VIEW / HIDE RECIPE
========================================================= */

function toggleRecipeDetails(
  recipeId
) {
  if (
    state.expandedRecipeIds
      .has(
        recipeId
      )
  ) {
    state.expandedRecipeIds
      .delete(
        recipeId
      );
  } else {
    state.expandedRecipeIds
      .add(
        recipeId
      );
  }

  renderRecipes();

  document.querySelector(
    `[data-recipe-id="${recipeId}"]`
  )?.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}


/* =========================================================
   QUICK CARD COUNTS
========================================================= */

function updateQuickCards() {
  const pantryCard =
    getElement(
      SELECTORS.pantryCard
    );

  const pantryText =
    pantryCard?.querySelector(
      "small"
    );

  if (pantryText) {
    const count =
      state.pantry.size;

    pantryText.textContent =
      count === 1
        ? "1 ingredient available"
        : `${count} ingredients available`;
  }

  const shoppingCard =
    getElement(
      SELECTORS.shoppingCard
    );

  const shoppingText =
    shoppingCard?.querySelector(
      "small"
    );

  if (shoppingText) {
    const count =
      state.shopping.size;

    shoppingText.textContent =
      count === 1
        ? "1 item to buy"
        : `${count} items to buy`;
  }
}


/* =========================================================
   REFRESH
========================================================= */

function refreshUI() {
  updateFilterButtonStates();

  renderActiveFilters();

  updateQuickCards();

  renderRecipes();
}


/* =========================================================
   ADVANCED SEARCH
========================================================= */

function setupAdvancedSearch() {
  const trigger =
    getElement(
      SELECTORS.advancedToggle
    );

  const panel =
    getElement(
      SELECTORS.advancedPanel
    );

  trigger?.addEventListener(
    "click",
    () => {
      if (!panel) {
        return;
      }

      const expanded =
        trigger.getAttribute(
          "aria-expanded"
        ) === "true";

      trigger.setAttribute(
        "aria-expanded",
        String(
          !expanded
        )
      );

      panel.hidden =
        expanded;
    }
  );
}


/* =========================================================
   FILTER EVENTS
========================================================= */

function setupFilterButtons() {
  getElements(
    SELECTORS.filterButtons
  ).forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          updateFilterState(
            button.dataset.filterGroup,
            button.dataset.filterValue
          );

          refreshUI();
        }
      );
    }
  );
}


function setupResetFilters() {
  getElement(
    SELECTORS.resetFiltersButton
  )?.addEventListener(
    "click",
    resetFilters
  );
}


function setupActiveFilterRemoval() {
  getElement(
    SELECTORS.activeFilterList
  )?.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-remove-filter-group]"
        );

      if (!button) {
        return;
      }

      removeFilter(
        button.dataset
          .removeFilterGroup,

        button.dataset
          .removeFilterValue
      );
    }
  );
}


/* =========================================================
   SURPRISE EVENTS
========================================================= */

function setupSurpriseGenerator() {
  getElement(
    SELECTORS.surpriseButton
  )?.addEventListener(
    "click",
    generateSurpriseRecipe
  );

  getElement(
    SELECTORS.usePantryCheckbox
  )?.addEventListener(
    "change",
    () => {
      /*
       * Do not generate automatically.
       *
       * Changing this checkbox only
       * changes what the next Surprise
       * click will do.
       */

      state.recentSurpriseIds = [];
    }
  );
}


/* =========================================================
   RECIPE EVENTS
========================================================= */

function setupRecipeEvents() {
  getElement(
    SELECTORS.recipeContainer
  )?.addEventListener(
    "click",
    (event) => {
      const viewButton =
        event.target.closest(
          "[data-view-recipe]"
        );

      if (viewButton) {
        toggleRecipeDetails(
          viewButton.dataset
            .viewRecipe
        );

        return;
      }

      const pickAgain =
        event.target.closest(
          "[data-pick-again]"
        );

      if (pickAgain) {
        generateSurpriseRecipe();
      }
    }
  );
}


/* =========================================================
   STORAGE SYNC
========================================================= */

function setupStorageSync() {
  window.addEventListener(
    "storage",
    () => {
      loadLocalState();

      /*
       * Keep a currently generated
       * recipe on screen, but update
       * its Pantry status.
       */

      refreshUI();
    }
  );
}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {
  setupAdvancedSearch();

  setupFilterButtons();

  setupResetFilters();

  setupActiveFilterRemoval();

  setupSurpriseGenerator();

  setupRecipeEvents();

  setupStorageSync();
}


/* =========================================================
   DATA
========================================================= */

async function loadData() {
  state.recipes =
    await loadRecipes();
}


/* =========================================================
   LOAD ERROR
========================================================= */

function renderLoadError() {
  const container =
    getElement(
      SELECTORS.recipeContainer
    );

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="recipe-empty-state">

      <div class="recipe-empty-state__icon">
        ⚠️
      </div>

      <strong>
        Unable to load recipes
      </strong>

      <p>
        Refresh the page and try again.
      </p>

    </div>
  `;
}


/* =========================================================
   INIT
========================================================= */

async function init() {
  loadLocalState();

  setupEvents();

  try {
    await loadData();

    refreshUI();
  } catch (error) {
    console.error(
      error
    );

    renderLoadError();
  }
}


document.addEventListener(
  "DOMContentLoaded",
  init
);