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


/* =========================
   SELECTORS
========================= */

const SELECTORS = {
  advancedToggle:
    "#advancedToggle",

  advancedPanel:
    "#advancedPanel",

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

  recipeSectionTitle:
    ".section .section-title",

  surpriseButton:
    "#surpriseButton",

  pantryCard:
    ".quick-card--pantry",

  shoppingCard:
    ".quick-card--shopping"
};


/* =========================
   FILTER LABELS
========================= */

const FILTER_LABELS = {
  cuisine: {
    filipino:
      "Filipino",

    japanese:
      "Japanese",

    korean:
      "Korean",

    chinese:
      "Chinese",

    vietnamese:
      "Vietnamese",

    european:
      "European",

    american:
      "American",

    mediterranean:
      "Mediterranean"
  },

  cookingStyle: {
    fried:
      "Fried",

    stew:
      "Stew",

    soup:
      "Soup",

    grilled:
      "Grilled",

    baked:
      "Baked",

    "stir-fry":
      "Stir-fry",

    steamed:
      "Steamed",

    "air-fryer":
      "Air Fryer"
  },

  diet: {
    "kid-friendly":
      "Kid-friendly",

    healthy:
      "Healthy",

    "dairy-free":
      "Dairy-free",

    "gluten-free":
      "Gluten-free",

    vegetarian:
      "Vegetarian",

    spicy:
      "Spicy"
  },

  time: {
    15:
      "≤ 15 mins",

    30:
      "≤ 30 mins",

    45:
      "≤ 45 mins",

    60:
      "≤ 60 mins"
  },

  servings: {
    one:
      "One",

    couple:
      "Couple",

    family:
      "Family",

    party:
      "Party"
  }
};


/* =========================
   APP STATE
========================= */

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

  expandedRecipeIds:
    new Set()
};


/* =========================
   DOM HELPERS
========================= */

function getElement(
  selector
) {
  return document
    .querySelector(
      selector
    );
}


function getElements(
  selector
) {
  return document
    .querySelectorAll(
      selector
    );
}


/* =========================
   TEXT HELPERS
========================= */

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
    .map(
      capitalize
    )
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


/* =========================
   LOCAL STORAGE STATE
========================= */

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


/* =========================
   FILTER HELPERS
========================= */

function getFilterLabel(
  group,
  value
) {
  return (
    FILTER_LABELS[
      group
    ]?.[
      value
    ]
    ?? value
  );
}


function updateFilterState(
  group,
  value
) {
  const groupState =
    state.filters[
      group
    ];

  if (!groupState) {
    return;
  }


  if (
    groupState.has(
      value
    )
  ) {

    groupState.delete(
      value
    );

  } else {

    groupState.add(
      value
    );

  }


  state.surpriseRecipeId =
    null;

  state.expandedRecipeIds
    .clear();
}


/* =========================
   FILTER BUTTON UI
========================= */

function updateFilterButtonStates() {
  getElements(
    SELECTORS.filterButtons
  ).forEach(
    (button) => {

      const group =
        button.dataset
          .filterGroup;

      const value =
        button.dataset
          .filterValue;

      const selected =
        state.filters[
          group
        ]?.has(
          value
        );

      button.classList.toggle(
        "is-selected",
        Boolean(selected)
      );

    }
  );
}


/* =========================
   ACTIVE FILTERS
========================= */

function getActiveFilters() {
  const filters = [];


  Object.entries(
    state.filters
  ).forEach(
    (
      [
        group,
        values
      ]
    ) => {

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
    activeFilters.length
    === 0
  ) {

    container.innerHTML = `
      <span
        class="active-filter-empty"
      >
        No filters selected.
      </span>
    `;

    return;
  }


  container.innerHTML =
    activeFilters
      .map(
        (filter) => `
          <span
            class="active-filter-chip"
          >

            ${escapeHtml(
              filter.label
            )}

            <button
              type="button"

              data-remove-filter-group="${
                escapeHtml(
                  filter.group
                )
              }"

              data-remove-filter-value="${
                escapeHtml(
                  filter.value
                )
              }"

              aria-label="Remove ${
                escapeHtml(
                  filter.label
                )
              }"
            >
              ×
            </button>

          </span>
        `
      )
      .join("");
}


/* =========================
   RESET FILTERS
========================= */

function resetFilters() {
  Object.values(
    state.filters
  ).forEach(
    (group) =>
      group.clear()
  );


  state.surpriseRecipeId =
    null;

  state.expandedRecipeIds
    .clear();


  refreshUI();
}


/* =========================
   REMOVE FILTER
========================= */

function removeFilter(
  group,
  value
) {
  state.filters[
    group
  ]?.delete(
    value
  );


  state.surpriseRecipeId =
    null;

  state.expandedRecipeIds
    .clear();


  refreshUI();
}


/* =========================
   FILTER RECIPES
========================= */

function getFilteredRecipes() {
  return filterRecipes(
    state.recipes,
    state.filters
  );
}


/* =========================
   COOKABLE RECIPES
========================= */

function getCookableRankedRecipes() {
  const filtered =
    getFilteredRecipes();


  return rankRecipesByPantry(
    filtered,
    state.pantry
  ).filter(
    (item) =>
      item.match.canCook
  );
}


/* =========================
   RECIPE INGREDIENT UI
========================= */

function createIngredientList(
  recipe
) {
  if (
    !recipe.ingredients
    || recipe.ingredients.length
      === 0
  ) {
    return "";
  }


  return `
    <div
      class="recipe-detail-section"
    >

      <h4>
        Ingredients
      </h4>

      <ul
        class="recipe-detail-list"
      >

        ${recipe.ingredients
          .map(
            (ingredient) => {

              const substitutes =
                ingredient.substitutes
                ?? [];


              const substituteText =
                substitutes.length
                  > 0
                  ? `
                    <small>
                      Alternative:
                      ${
                        substitutes
                          .map(
                            ingredientIdToLabel
                          )
                          .join(", ")
                      }
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
                        ? `
                          — ${escapeHtml(
                            ingredient.amount
                          )}
                        `
                        : ""
                    }
                  </span>

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


/* =========================
   FLEXIBLE INGREDIENTS
========================= */

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
    <div
      class="
        recipe-flexible-note
      "
    >

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


/* =========================
   RECIPE STEPS
========================= */

function createSteps(
  recipe
) {
  if (
    !recipe.steps
    || recipe.steps.length
      === 0
  ) {
    return "";
  }


  return `
    <div
      class="recipe-detail-section"
    >

      <h4>
        Steps
      </h4>

      <ol
        class="recipe-step-list"
      >

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


/* =========================
   RECIPE NOTES
========================= */

function createNotes(
  recipe
) {
  if (
    !recipe.notes
    || recipe.notes.length
      === 0
  ) {
    return "";
  }


  return `
    <div
      class="recipe-notes"
    >

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


/* =========================
   EXPANDED RECIPE
========================= */

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
    <div
      class="recipe-card__details"
    >

      <p
        class="recipe-card__description"
      >
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


/* =========================
   RECIPE CARD
========================= */

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


  const readyText =
    match.total > 0
      ? `${match.availableCount}/${match.total} ingredients`
      : "Ready";


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

      data-recipe-id="${
        escapeHtml(
          recipe.id
        )
      }"
    >


      <div
        class="recipe-card__image"
      >

        <span
          class="recipe-card__emoji"
          aria-hidden="true"
        >
          ${recipe.emoji ?? "🍽️"}
        </span>


        ${
          surprise
            ? `
              <span
                class="recipe-surprise-badge"
              >
                🎲 Surprise Pick
              </span>
            `
            : ""
        }


        <button
          class="recipe-card__favorite"
          type="button"

          aria-label="Add ${
            escapeHtml(
              recipe.name
            )
          } to favorites"
        >
          ♡
        </button>

      </div>


      <div
        class="recipe-card__body"
      >

        <h3
          class="recipe-card__title"
        >
          ${escapeHtml(
            recipe.name
          )}
        </h3>


        <div
          class="recipe-card__meta"
        >

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


        <div
          class="recipe-match-row"
        >

          <span
            class="
              recipe-match-badge
              is-ready
            "
          >
            ✓ Ready to cook
          </span>

          <span
            class="recipe-match-count"
          >
            ${readyText}
          </span>

        </div>


        <div
          class="recipe-card__tags"
        >

          <span
            class="recipe-card__tag"
          >
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


        <div
          class="recipe-card__actions"
        >

          <button
            class="
              recipe-card__action
              recipe-card__action--primary
            "
            type="button"

            data-view-recipe="${
              escapeHtml(
                recipe.id
              )
            }"
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


/* =========================
   EMPTY STATE
========================= */

function createEmptyRecipeState() {
  const hasPantry =
    state.pantry.size > 0;


  return `
    <div
      class="recipe-empty-state"
    >

      <div
        class="recipe-empty-state__icon"
      >
        ${
          hasPantry
            ? "🥘"
            : "🧺"
        }
      </div>


      <strong>

        ${
          hasPantry
            ? "No cookable recipes found"
            : "Your Pantry is empty"
        }

      </strong>


      <p>

        ${
          hasPantry
            ? "Try removing a filter or update what you have in your Pantry."
            : "Check the ingredients you have first so we can find something you can actually cook."
        }

      </p>


      <a
        class="
          btn
          recipe-empty-state__button
        "
        href="/pantry.html"
      >
        🧺 Open Pantry
      </a>

    </div>
  `;
}


/* =========================
   NORMAL RESULTS
========================= */

function renderBestMatches() {
  const container =
    getElement(
      SELECTORS.recipeContainer
    );


  if (!container) {
    return;
  }


  const ranked =
    getCookableRankedRecipes();


  if (
    ranked.length === 0
  ) {

    container.innerHTML =
      createEmptyRecipeState();

    return;
  }


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


/* =========================
   SURPRISE RESULT
========================= */

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
        surprise:
          true
      }
    );
}


/* =========================
   RESULTS RENDERER
========================= */

function renderRecipes() {
  if (
    state.surpriseRecipeId
  ) {

    renderSurpriseRecipe();

  } else {

    renderBestMatches();

  }
}


/* =========================
   SURPRISE PICK
========================= */

function pickSurpriseRecipe() {
  const cookable =
    getCookableRankedRecipes()
      .map(
        (item) =>
          item.recipe
      );


  const picked =
    pickRandomRecipe(
      cookable
    );


  if (!picked) {

    state.surpriseRecipeId =
      null;

    renderBestMatches();


    const container =
      getElement(
        SELECTORS.recipeContainer
      );


    container?.scrollIntoView({
      behavior:
        "smooth",

      block:
        "center"
    });


    return;
  }


  state.surpriseRecipeId =
    picked.id;


  state.expandedRecipeIds
    .clear();


  renderRecipes();


  getElement(
    SELECTORS.recipeContainer
  )?.scrollIntoView({
    behavior:
      "smooth",

    block:
      "center"
  });
}


/* =========================
   VIEW RECIPE
========================= */

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


  const card =
    document.querySelector(
      `[data-recipe-id="${recipeId}"]`
    );


  card?.scrollIntoView({
    behavior:
      "smooth",

    block:
      "nearest"
  });
}


/* =========================
   QUICK CARD COUNTS
========================= */

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


/* =========================
   REFRESH UI
========================= */

function refreshUI() {
  updateFilterButtonStates();

  renderActiveFilters();

  updateQuickCards();

  renderRecipes();
}


/* =========================
   ADVANCED SEARCH
========================= */

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


/* =========================
   FILTER BUTTON EVENTS
========================= */

function setupFilterButtons() {
  getElements(
    SELECTORS.filterButtons
  ).forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          updateFilterState(
            button.dataset
              .filterGroup,

            button.dataset
              .filterValue
          );


          refreshUI();

        }
      );

    }
  );
}


/* =========================
   RESET EVENT
========================= */

function setupResetFilters() {
  getElement(
    SELECTORS.resetFiltersButton
  )?.addEventListener(
    "click",
    resetFilters
  );
}


/* =========================
   ACTIVE FILTER REMOVAL
========================= */

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


/* =========================
   SURPRISE EVENT
========================= */

function setupSurpriseButton() {
  getElement(
    SELECTORS.surpriseButton
  )?.addEventListener(
    "click",
    pickSurpriseRecipe
  );
}


/* =========================
   RECIPE EVENTS
========================= */

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


      const pickAgainButton =
        event.target.closest(
          "[data-pick-again]"
        );


      if (
        pickAgainButton
      ) {

        pickSurpriseRecipe();

      }

    }
  );
}


/* =========================
   STORAGE CHANGE SYNC
========================= */

function setupStorageSync() {
  window.addEventListener(
    "storage",
    () => {

      loadLocalState();

      state.surpriseRecipeId =
        null;

      refreshUI();

    }
  );
}


/* =========================
   EVENTS
========================= */

function setupEvents() {
  setupAdvancedSearch();

  setupFilterButtons();

  setupResetFilters();

  setupActiveFilterRemoval();

  setupSurpriseButton();

  setupRecipeEvents();

  setupStorageSync();
}


/* =========================
   LOAD DATA
========================= */

async function loadData() {
  state.recipes =
    await loadRecipes();
}


/* =========================
   ERROR UI
========================= */

function renderLoadError() {
  const container =
    getElement(
      SELECTORS.recipeContainer
    );


  if (!container) {
    return;
  }


  container.innerHTML = `
    <div
      class="recipe-empty-state"
    >

      <div
        class="recipe-empty-state__icon"
      >
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


/* =========================
   INIT
========================= */

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