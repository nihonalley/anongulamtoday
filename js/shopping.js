import {
  STORAGE_KEYS,
  loadList,
  saveList
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
    icon: "🛍️"
  }
};


const state = {
  ingredients: [],
  shopping: new Set(),
  pantry: new Set(),
  search: ""
};


function normalizeText(value = "") {
  return String(value)
    .trim()
    .toLowerCase();
}


function loadState() {
  state.shopping = new Set(
    loadList(STORAGE_KEYS.shopping)
  );

  state.pantry = new Set(
    loadList(STORAGE_KEYS.pantry)
  );
}


function saveShopping() {
  saveList(
    STORAGE_KEYS.shopping,
    state.shopping
  );
}


function savePantry() {
  saveList(
    STORAGE_KEYS.pantry,
    state.pantry
  );
}


function getIngredient(id) {
  return state.ingredients.find(
    (ingredient) =>
      ingredient.id === id
  );
}


function ingredientMatchesSearch(
  ingredient
) {
  const query =
    normalizeText(state.search);

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


function getVisibleItems() {
  return [...state.shopping]
    .map(getIngredient)
    .filter(Boolean)
    .filter(
      ingredientMatchesSearch
    );
}


function groupItems(items) {
  return items.reduce(
    (groups, ingredient) => {

      const category =
        ingredient.category
        || "other";

      groups[category] ??= [];

      groups[category]
        .push(ingredient);

      return groups;

    },
    {}
  );
}


function createShoppingRow(
  ingredient
) {
  const hasIngredient =
    state.pantry.has(
      ingredient.id
    );

  return `
    <div
      class="
        shopping-row
        ${hasIngredient
          ? "is-owned"
          : ""}
      "
      data-shopping-id="${ingredient.id}"
    >

      <label
        class="shopping-row__have"
      >

        <input
          type="checkbox"
          data-have-ingredient="${ingredient.id}"
          ${hasIngredient
            ? "checked"
            : ""}
        >

        <span
          class="shopping-row__checkbox"
        >
          ✓
        </span>

      </label>


      <div
        class="shopping-row__content"
      >

        <strong
          class="shopping-row__name"
        >
          ${ingredient.name}
        </strong>

        <span
          class="shopping-row__status"
        >
          ${hasIngredient
            ? "You have this"
            : "Need to buy"}
        </span>

      </div>


      <button
        class="shopping-row__remove"
        type="button"
        data-remove-shopping="${ingredient.id}"
        aria-label="Remove ${ingredient.name} from shopping list"
      >
        ×
      </button>

    </div>
  `;
}


function createCategory(
  category,
  ingredients
) {
  const meta =
    CATEGORY_META[category]
    ?? CATEGORY_META.other;

  return `
    <section
      class="shopping-category"
    >

      <div
        class="shopping-category__header"
      >

        <span>
          ${meta.icon}
        </span>

        <strong>
          ${meta.label}
        </strong>

      </div>


      <div
        class="shopping-category__items"
      >

        ${ingredients
          .map(
            createShoppingRow
          )
          .join("")}

      </div>

    </section>
  `;
}


function renderShopping() {
  const container =
    document.querySelector(
      "#shoppingList"
    );

  if (!container) {
    return;
  }


  const items =
    getVisibleItems();


  if (
    items.length === 0
  ) {
    container.innerHTML = `
      <div
        class="empty-state"
      >

        <div
          class="empty-state__icon"
        >
          🛒
        </div>

        <strong>
          Shopping list is empty
        </strong>

        <span>
          Add ingredients from your Pantry.
        </span>

      </div>
    `;

    return;
  }


  const groups =
    groupItems(items);


  container.innerHTML =
    Object.entries(groups)
      .map(
        ([category, ingredients]) =>
          createCategory(
            category,
            ingredients
          )
      )
      .join("");
}


function toggleHaveStatus(
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

  renderShopping();
}


function removeShoppingItem(
  ingredientId
) {
  state.shopping.delete(
    ingredientId
  );

  saveShopping();

  renderShopping();
}


function clearShopping() {
  state.shopping.clear();

  saveShopping();

  renderShopping();
}


function setupEvents() {
  const search =
    document.querySelector(
      "#shoppingSearch"
    );

  const list =
    document.querySelector(
      "#shoppingList"
    );

  const clearButton =
    document.querySelector(
      "#clearShoppingButton"
    );


  search?.addEventListener(
    "input",
    (event) => {

      state.search =
        event.target.value;

      renderShopping();

    }
  );


  list?.addEventListener(
    "change",
    (event) => {

      const checkbox =
        event.target.closest(
          "[data-have-ingredient]"
        );

      if (!checkbox) {
        return;
      }

      toggleHaveStatus(
        checkbox.dataset.haveIngredient,
        checkbox.checked
      );

    }
  );


  list?.addEventListener(
    "click",
    (event) => {

      const removeButton =
        event.target.closest(
          "[data-remove-shopping]"
        );

      if (!removeButton) {
        return;
      }

      removeShoppingItem(
        removeButton.dataset.removeShopping
      );

    }
  );


  clearButton?.addEventListener(
    "click",
    clearShopping
  );
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
  loadState();

  setupEvents();

  try {
    await loadIngredients();

    renderShopping();

  } catch (error) {
    console.error(error);
  }
}


document.addEventListener(
  "DOMContentLoaded",
  init
);