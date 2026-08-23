import {
  STORAGE_KEYS,
  loadList,
  saveList,
  addToList
} from "./storage.js";


const CATEGORY_META = {
  meat: {
    label: "Meat",
    icon: "🥩"
  },

  seafood: {
    label: "Seafood",
    icon: "🐟"
  },

  vegetables: {
    label: "Vegetables",
    icon: "🥬"
  },

  fruit: {
    label: "Fruit",
    icon: "🍋"
  },

  dairy: {
    label: "Dairy",
    icon: "🥛"
  },

  condiments: {
    label: "Condiments",
    icon: "🧂"
  },

  spices: {
    label: "Spices",
    icon: "🌶️"
  },

  pantry: {
    label: "Pantry",
    icon: "🥫"
  },

  frozen: {
    label: "Frozen",
    icon: "❄️"
  },

  other: {
    label: "Other",
    icon: "🍽️"
  }
};


const state = {
  ingredients: [],
  pantry: new Set(),
  shopping: new Set(),
  search: "",
  availableOnly: false
};


function normalizeText(value = "") {
  return String(value)
    .trim()
    .toLowerCase();
}


function loadStoredState() {
  state.pantry = new Set(
    loadList(
      STORAGE_KEYS.pantry
    )
  );

  state.shopping = new Set(
    loadList(
      STORAGE_KEYS.shopping
    )
  );
}


function savePantry() {
  saveList(
    STORAGE_KEYS.pantry,
    state.pantry
  );
}


function ingredientMatchesSearch(
  ingredient
) {
  const query =
    normalizeText(
      state.search
    );

  if (!query) {
    return true;
  }

  const searchableValues = [
    ingredient.name,
    ingredient.id,
    ...(ingredient.aliases ?? [])
  ];

  return searchableValues.some(
    (value) =>
      normalizeText(value)
        .includes(query)
  );
}


function shouldShowIngredient(
  ingredient
) {
  if (
    !ingredientMatchesSearch(
      ingredient
    )
  ) {
    return false;
  }

  if (
    state.availableOnly
    && !state.pantry.has(
      ingredient.id
    )
  ) {
    return false;
  }

  return true;
}


function groupIngredients() {
  const groups = {};

  state.ingredients
    .filter(
      shouldShowIngredient
    )
    .forEach(
      (ingredient) => {

        const category =
          ingredient.category
          || "other";

        groups[category] ??= [];

        groups[category]
          .push(ingredient);

      }
    );

  return groups;
}


function createIngredientRow(
  ingredient
) {
  const isAvailable =
    state.pantry.has(
      ingredient.id
    );

  const isShopping =
    state.shopping.has(
      ingredient.id
    );

  return `
    <label
      class="
        ingredient-row
        ${isAvailable
          ? "is-available"
          : "is-unavailable"}
      "
    >

      <input
        class="ingredient-row__checkbox"
        type="checkbox"
        data-ingredient-id="${ingredient.id}"
        ${isAvailable
          ? "checked"
          : ""}
      >

      <span
        class="ingredient-row__name"
      >
        ${ingredient.name}
      </span>

      <button
        class="ingredient-row__shopping"
        type="button"
        data-add-shopping="${ingredient.id}"
        ${isShopping
          ? "disabled"
          : ""}
      >
        ${isShopping
          ? "Added ✓"
          : "+ Shopping"}
      </button>

    </label>
  `;
}


function createCategorySection(
  category,
  ingredients
) {
  const meta =
    CATEGORY_META[category]
    ?? CATEGORY_META.other;

  return `
    <section
      class="pantry-category"
      data-category="${category}"
    >

      <button
        class="pantry-category__header"
        type="button"
        data-category-toggle
        aria-expanded="true"
      >

        <span
          class="pantry-category__title"
        >

          <span>
            ${meta.icon}
          </span>

          <strong>
            ${meta.label}
          </strong>

        </span>


        <span
          class="pantry-category__arrow"
        >
          ▼
        </span>

      </button>


      <div
        class="pantry-category__items"
      >

        ${ingredients
          .map(
            createIngredientRow
          )
          .join("")}

      </div>

    </section>
  `;
}


function renderPantry() {
  const container =
    document.querySelector(
      "#pantryList"
    );

  if (!container) {
    return;
  }


  const groups =
    groupIngredients();

  const entries =
    Object.entries(groups);


  if (
    entries.length === 0
  ) {
    container.innerHTML = `
      <div
        class="empty-state"
      >

        <div
          class="empty-state__icon"
        >
          🔎
        </div>

        <strong>
          No ingredients found
        </strong>

        <span>
          Try another search.
        </span>

      </div>
    `;

    return;
  }


  container.innerHTML =
    entries
      .map(
        ([category, ingredients]) =>
          createCategorySection(
            category,
            ingredients
          )
      )
      .join("");
}


function toggleIngredient(
  ingredientId,
  checked
) {
  if (checked) {

    state.pantry.add(
      ingredientId
    );

  } else {

    state.pantry.delete(
      ingredientId
    );

  }

  savePantry();

  renderPantry();
}


function addIngredientToShopping(
  ingredientId
) {
  if (
    state.shopping.has(
      ingredientId
    )
  ) {
    return;
  }

  state.shopping.add(
    ingredientId
  );

  addToList(
    STORAGE_KEYS.shopping,
    ingredientId
  );

  renderPantry();
}


function toggleCategory(
  button
) {
  const category =
    button.closest(
      ".pantry-category"
    );

  if (!category) {
    return;
  }

  const items =
    category.querySelector(
      ".pantry-category__items"
    );

  const isExpanded =
    button.getAttribute(
      "aria-expanded"
    ) === "true";

  button.setAttribute(
    "aria-expanded",
    String(!isExpanded)
  );

  items.hidden =
    isExpanded;
}


function setupSearch() {
  const search =
    document.querySelector(
      "#pantrySearch"
    );

  search?.addEventListener(
    "input",
    (event) => {

      state.search =
        event.target.value;

      renderPantry();

    }
  );
}


function setupAvailableOnly() {
  const availableOnly =
    document.querySelector(
      "#showAvailableOnly"
    );

  availableOnly?.addEventListener(
    "change",
    (event) => {

      state.availableOnly =
        event.target.checked;

      renderPantry();

    }
  );
}


function setupPantryEvents() {
  const pantryList =
    document.querySelector(
      "#pantryList"
    );


  pantryList?.addEventListener(
    "change",
    (event) => {

      const checkbox =
        event.target.closest(
          "[data-ingredient-id]"
        );

      if (!checkbox) {
        return;
      }

      toggleIngredient(
        checkbox.dataset.ingredientId,
        checkbox.checked
      );

    }
  );


  pantryList?.addEventListener(
    "click",
    (event) => {

      const categoryToggle =
        event.target.closest(
          "[data-category-toggle]"
        );

      if (
        categoryToggle
      ) {
        toggleCategory(
          categoryToggle
        );

        return;
      }


      const shoppingButton =
        event.target.closest(
          "[data-add-shopping]"
        );

      if (
        shoppingButton
      ) {
        event.preventDefault();

        addIngredientToShopping(
          shoppingButton.dataset.addShopping
        );
      }

    }
  );
}


function setupEvents() {
  setupSearch();

  setupAvailableOnly();

  setupPantryEvents();
}


async function loadIngredients() {
  const response =
    await fetch(
      "/data/ingredients.json"
    );

  if (!response.ok) {
    throw new Error(
      "Unable to load ingredients."
    );
  }

  state.ingredients =
    await response.json();
}


async function init() {
  loadStoredState();

  setupEvents();

  try {

    await loadIngredients();

    renderPantry();

  } catch (error) {

    console.error(error);

    const container =
      document.querySelector(
        "#pantryList"
      );

    if (container) {

      container.innerHTML = `
        <div
          class="empty-state"
        >

          <div
            class="empty-state__icon"
          >
            ⚠️
          </div>

          <strong>
            Unable to load ingredients
          </strong>

          <span>
            Please refresh the page.
          </span>

        </div>
      `;

    }

  }
}


document.addEventListener(
  "DOMContentLoaded",
  init
);