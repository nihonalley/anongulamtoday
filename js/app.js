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
    "#filterCount"
};


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


const filterState = {
  cuisine: new Set(),
  cookingStyle: new Set(),
  diet: new Set(),
  time: new Set(),
  servings: new Set()
};


function getElement(selector) {
  return document.querySelector(selector);
}


function getElements(selector) {
  return document.querySelectorAll(selector);
}


function toggleExpanded({
  trigger,
  target
}) {
  if (!trigger || !target) {
    return;
  }

  const isExpanded =
    trigger.getAttribute("aria-expanded") === "true";

  trigger.setAttribute(
    "aria-expanded",
    String(!isExpanded)
  );

  target.hidden = isExpanded;
}


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
    filterState[group];

  if (!groupState) {
    return;
  }

  if (
    groupState.has(value)
  ) {
    groupState.delete(value);
    return;
  }

  groupState.add(value);
}


function updateFilterButtonStates() {
  const buttons =
    getElements(
      SELECTORS.filterButtons
    );

  buttons.forEach(
    (button) => {

      const group =
        button.dataset.filterGroup;

      const value =
        button.dataset.filterValue;

      const isSelected =
        filterState[group]?.has(value);

      button.classList.toggle(
        "is-selected",
        Boolean(isSelected)
      );

    }
  );
}


function getActiveFilters() {
  const activeFilters = [];

  Object.entries(
    filterState
  ).forEach(
    ([group, values]) => {

      values.forEach(
        (value) => {

          activeFilters.push({
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

  return activeFilters;
}


function renderActiveFilters() {
  const container =
    getElement(
      SELECTORS.activeFilterList
    );

  const countElement =
    getElement(
      SELECTORS.filterCount
    );

  if (
    !container
    || !countElement
  ) {
    return;
  }

  const activeFilters =
    getActiveFilters();

  countElement.textContent =
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

            ${filter.label}

            <button
              type="button"
              data-remove-filter-group="${filter.group}"
              data-remove-filter-value="${filter.value}"
              aria-label="Remove ${filter.label}"
            >
              ×
            </button>

          </span>
        `
      )
      .join("");
}


function refreshFilterUI() {
  updateFilterButtonStates();
  renderActiveFilters();
}


function resetFilters() {
  Object.values(
    filterState
  ).forEach(
    (groupState) => {
      groupState.clear();
    }
  );

  refreshFilterUI();
}


function removeFilter(
  group,
  value
) {
  filterState[group]?.delete(value);

  refreshFilterUI();
}


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

      toggleExpanded({
        trigger,
        target: panel
      });

    }
  );
}


function setupFilterButtons() {
  const buttons =
    getElements(
      SELECTORS.filterButtons
    );

  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const group =
            button.dataset.filterGroup;

          const value =
            button.dataset.filterValue;

          updateFilterState(
            group,
            value
          );

          refreshFilterUI();

        }
      );

    }
  );
}


function setupResetFilters() {
  const button =
    getElement(
      SELECTORS.resetFiltersButton
    );

  button?.addEventListener(
    "click",
    resetFilters
  );
}


function setupActiveFilterRemoval() {
  const container =
    getElement(
      SELECTORS.activeFilterList
    );

  container?.addEventListener(
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
        button.dataset.removeFilterGroup,
        button.dataset.removeFilterValue
      );

    }
  );
}


function init() {
  setupAdvancedSearch();

  setupFilterButtons();

  setupResetFilters();

  setupActiveFilterRemoval();

  refreshFilterUI();
}


document.addEventListener(
  "DOMContentLoaded",
  init
);