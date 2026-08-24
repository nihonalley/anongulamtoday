import {
  STORAGE_KEYS,
  loadList,
  saveList,
  loadObject,
  saveObject
} from "./storage.js";


/* =========================
   CATEGORY DATA
========================= */

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

  custom: {
    label: "Other Items",
    icon: "🛍️"
  },

  other: {
    label: "Other",
    icon: "🛒"
  }
};


/* =========================
   APP STATE
========================= */

const state = {
  ingredients: [],
  shopping: new Set(),
  pantry: new Set(),

  customIngredients: {},
  shoppingMeta: {},

  search: "",

  history: [],
  future: []
};


/* =========================
   HELPERS
========================= */

function normalizeText(
  value = ""
) {
  return String(value)
    .trim()
    .toLowerCase();
}


function createSlug(
  value
) {
  return normalizeText(value)
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


function cloneSnapshot() {
  return {
    shopping:
      [...state.shopping],

    pantry:
      [...state.pantry],

    customIngredients:
      structuredClone(
        state.customIngredients
      ),

    shoppingMeta:
      structuredClone(
        state.shoppingMeta
      )
  };
}


function restoreSnapshot(
  snapshot
) {
  state.shopping =
    new Set(
      snapshot.shopping
    );

  state.pantry =
    new Set(
      snapshot.pantry
    );

  state.customIngredients =
    structuredClone(
      snapshot.customIngredients
    );

  state.shoppingMeta =
    structuredClone(
      snapshot.shoppingMeta
    );

  saveState();

  render();
}


function pushHistory() {
  state.history.push(
    cloneSnapshot()
  );

  if (
    state.history.length > 30
  ) {
    state.history.shift();
  }

  state.future = [];

  updateHistoryButtons();
}


/* =========================
   STORAGE
========================= */

function loadState() {
  state.shopping =
    new Set(
      loadList(
        STORAGE_KEYS.shopping
      )
    );

  state.pantry =
    new Set(
      loadList(
        STORAGE_KEYS.pantry
      )
    );

  state.customIngredients =
    loadObject(
      STORAGE_KEYS.customIngredients
    );

  state.shoppingMeta =
    loadObject(
      STORAGE_KEYS.shoppingMeta
    );
}


function saveState() {
  saveList(
    STORAGE_KEYS.shopping,
    state.shopping
  );

  saveList(
    STORAGE_KEYS.pantry,
    state.pantry
  );

  saveObject(
    STORAGE_KEYS.customIngredients,
    state.customIngredients
  );

  saveObject(
    STORAGE_KEYS.shoppingMeta,
    state.shoppingMeta
  );
}


/* =========================
   INGREDIENT LOOKUP
========================= */

function getIngredient(
  ingredientId
) {
  const standard =
    state.ingredients.find(
      (ingredient) =>
        ingredient.id === ingredientId
    );

  if (standard) {
    return standard;
  }

  return (
    state.customIngredients[
      ingredientId
    ]
    ?? null
  );
}


function getMeta(
  ingredientId
) {
  state.shoppingMeta[
    ingredientId
  ] ??= {
    quantity: "",
    note: ""
  };

  return state.shoppingMeta[
    ingredientId
  ];
}


/* =========================
   FILTERING
========================= */

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

  const meta =
    getMeta(
      ingredient.id
    );

  const searchableValues = [
    ingredient.name,
    ingredient.id,
    ingredient.category,
    meta.quantity,
    meta.note,
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
    .map(
      getIngredient
    )
    .filter(Boolean)
    .filter(
      ingredientMatchesSearch
    );
}


/* =========================
   GROUPING
========================= */

function groupItems(
  items
) {
  return items.reduce(
    (
      groups,
      ingredient
    ) => {

      const category =
        ingredient.category
        || "other";

      groups[
        category
      ] ??= [];

      groups[
        category
      ].push(
        ingredient
      );

      return groups;

    },
    {}
  );
}


/* =========================
   SHOPPING ROW
========================= */

function createShoppingRow(
  ingredient
) {
  const hasIngredient =
    state.pantry.has(
      ingredient.id
    );

  const meta =
    getMeta(
      ingredient.id
    );

  return `
    <article
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
        title="I have this"
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

        <div
          class="shopping-row__heading"
        >

          <strong
            class="shopping-row__name"
          >
            ${ingredient.name}
          </strong>

          <span
            class="
              shopping-row__status
              ${hasIngredient
                ? "is-owned"
                : ""}
            "
          >
            ${hasIngredient
              ? "Have"
              : "Need"}
          </span>

        </div>


        <div
          class="shopping-row__details"
        >

          <label
            class="shopping-detail-field"
          >

            <span>
              Qty
            </span>

            <input
              type="text"
              value="${escapeAttribute(
                meta.quantity
              )}"
              placeholder="1"
              maxlength="30"
              data-shopping-quantity="${ingredient.id}"
            >

          </label>


          <label
            class="
              shopping-detail-field
              shopping-detail-field--note
            "
          >

            <span>
              Note
            </span>

            <input
              type="text"
              value="${escapeAttribute(
                meta.note
              )}"
              placeholder="Optional"
              maxlength="100"
              data-shopping-note="${ingredient.id}"
            >

          </label>

        </div>

      </div>


      <button
        class="shopping-row__remove"
        type="button"
        data-remove-shopping="${ingredient.id}"
        aria-label="Remove ${ingredient.name}"
      >
        ×
      </button>

    </article>
  `;
}


/* =========================
   SAFE HTML ATTRIBUTE
========================= */

function escapeAttribute(
  value = ""
) {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    );
}


/* =========================
   CATEGORY UI
========================= */

function createCategory(
  category,
  ingredients
) {
  const meta =
    CATEGORY_META[
      category
    ]
    ?? CATEGORY_META.other;

  return `
    <section
      class="shopping-category"
    >

      <div
        class="shopping-category__header"
      >

        <span
          class="shopping-category__icon"
        >
          ${meta.icon}
        </span>

        <strong>
          ${meta.label}
        </strong>

        <span
          class="shopping-category__count"
        >
          ${ingredients.length}
        </span>

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


/* =========================
   RENDER
========================= */

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

    const hasShoppingItems =
      state.shopping.size > 0;

    container.innerHTML = `
      <div class="empty-state">

        <div
          class="empty-state__icon"
        >
          ${hasShoppingItems
            ? "🔎"
            : "🛒"}
        </div>

        <strong>
          ${hasShoppingItems
            ? "No matching items"
            : "Shopping list is empty"}
        </strong>

        <span>
          ${hasShoppingItems
            ? "Try another search."
            : "Add ingredients from Pantry or add something above."}
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
        (
          [
            category,
            ingredients
          ]
        ) =>
          createCategory(
            category,
            ingredients
          )
      )
      .join("");
}


function renderCount() {
  const counter =
    document.querySelector(
      "#shoppingCount"
    );

  if (!counter) {
    return;
  }

  const count =
    state.shopping.size;

  counter.textContent =
    `${count} ${
      count === 1
        ? "item"
        : "items"
    }`;
}


function render() {
  renderShopping();

  renderCount();

  updateHistoryButtons();
}


/* =========================
   CUSTOM ITEMS
========================= */

function findExistingByName(
  name
) {
  const normalized =
    normalizeText(name);

  const standard =
    state.ingredients.find(
      (ingredient) =>
        normalizeText(
          ingredient.name
        ) === normalized
        ||
        ingredient.aliases?.some(
          (alias) =>
            normalizeText(
              alias
            ) === normalized
        )
    );

  if (standard) {
    return standard;
  }

  return Object.values(
    state.customIngredients
  ).find(
    (ingredient) =>
      normalizeText(
        ingredient.name
      ) === normalized
  );
}


function createCustomIngredient(
  name
) {
  const baseSlug =
    createSlug(name)
    || "item";

  let ingredientId =
    `custom-${baseSlug}`;

  let number = 2;

  while (
    state.customIngredients[
      ingredientId
    ]
  ) {
    ingredientId =
      `custom-${baseSlug}-${number}`;

    number += 1;
  }

  const ingredient = {
    id: ingredientId,
    name:
      name.trim(),
    category:
      "custom",
    aliases:
      []
  };

  state.customIngredients[
    ingredientId
  ] = ingredient;

  return ingredient;
}


function addShoppingItem(
  name
) {
  const cleanName =
    name.trim();

  if (!cleanName) {
    return;
  }

  const existing =
    findExistingByName(
      cleanName
    );

  const ingredient =
    existing
    ?? createCustomIngredient(
      cleanName
    );

  if (
    state.shopping.has(
      ingredient.id
    )
  ) {
    return;
  }

  pushHistory();

  state.shopping.add(
    ingredient.id
  );

  getMeta(
    ingredient.id
  );

  saveState();

  render();
}


/* =========================
   HAVE STATUS
========================= */

function toggleHaveStatus(
  ingredientId,
  checked
) {
  pushHistory();

  if (checked) {

    state.pantry.add(
      ingredientId
    );

  } else {

    state.pantry.delete(
      ingredientId
    );

  }

  saveState();

  render();
}


/* =========================
   META
========================= */

function updateQuantity(
  ingredientId,
  value
) {
  const meta =
    getMeta(
      ingredientId
    );

  meta.quantity =
    value.trim();

  saveState();
}


function updateNote(
  ingredientId,
  value
) {
  const meta =
    getMeta(
      ingredientId
    );

  meta.note =
    value.trim();

  saveState();
}


/* =========================
   REMOVE
========================= */

function removeShoppingItem(
  ingredientId
) {
  pushHistory();

  state.shopping.delete(
    ingredientId
  );

  delete state.shoppingMeta[
    ingredientId
  ];


  if (
    ingredientId.startsWith(
      "custom-"
    )
  ) {
    delete state.customIngredients[
      ingredientId
    ];
  }

  saveState();

  render();
}


/* =========================
   CLEAR
========================= */

function clearShopping() {
  if (
    state.shopping.size === 0
  ) {
    return;
  }

  const confirmed =
    window.confirm(
      "Clear the entire shopping list?"
    );

  if (!confirmed) {
    return;
  }

  pushHistory();


  [...state.shopping]
    .filter(
      (ingredientId) =>
        ingredientId.startsWith(
          "custom-"
        )
    )
    .forEach(
      (ingredientId) => {

        delete state.customIngredients[
          ingredientId
        ];

      }
    );


  state.shopping.clear();

  state.shoppingMeta = {};

  saveState();

  render();
}


/* =========================
   UNDO / REDO
========================= */

function undo() {
  if (
    state.history.length === 0
  ) {
    return;
  }

  state.future.push(
    cloneSnapshot()
  );

  const previous =
    state.history.pop();

  restoreSnapshot(
    previous
  );
}


function redo() {
  if (
    state.future.length === 0
  ) {
    return;
  }

  state.history.push(
    cloneSnapshot()
  );

  const next =
    state.future.pop();

  restoreSnapshot(
    next
  );
}


function updateHistoryButtons() {
  const undoButton =
    document.querySelector(
      "#undoButton"
    );

  const redoButton =
    document.querySelector(
      "#redoButton"
    );

  if (undoButton) {
    undoButton.disabled =
      state.history.length === 0;
  }

  if (redoButton) {
    redoButton.disabled =
      state.future.length === 0;
  }
}


/* =========================
   EVENTS
========================= */

function setupAddForm() {
  const form =
    document.querySelector(
      "#shoppingAddForm"
    );

  const input =
    document.querySelector(
      "#shoppingItemName"
    );

  form?.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      if (!input) {
        return;
      }

      addShoppingItem(
        input.value
      );

      input.value = "";

      input.focus();

    }
  );
}


function setupSearch() {
  const search =
    document.querySelector(
      "#shoppingSearch"
    );

  search?.addEventListener(
    "input",
    (event) => {

      state.search =
        event.target.value;

      renderShopping();

    }
  );
}


function setupShoppingListEvents() {
  const list =
    document.querySelector(
      "#shoppingList"
    );


  list?.addEventListener(
    "change",
    (event) => {

      const haveCheckbox =
        event.target.closest(
          "[data-have-ingredient]"
        );

      if (haveCheckbox) {

        toggleHaveStatus(
          haveCheckbox
            .dataset
            .haveIngredient,

          haveCheckbox.checked
        );

      }

    }
  );


  list?.addEventListener(
    "input",
    (event) => {

      const quantityInput =
        event.target.closest(
          "[data-shopping-quantity]"
        );

      if (quantityInput) {

        updateQuantity(
          quantityInput
            .dataset
            .shoppingQuantity,

          quantityInput.value
        );

        return;
      }


      const noteInput =
        event.target.closest(
          "[data-shopping-note]"
        );

      if (noteInput) {

        updateNote(
          noteInput
            .dataset
            .shoppingNote,

          noteInput.value
        );

      }

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
        removeButton
          .dataset
          .removeShopping
      );

    }
  );
}


function setupToolbar() {
  document
    .querySelector(
      "#undoButton"
    )
    ?.addEventListener(
      "click",
      undo
    );


  document
    .querySelector(
      "#redoButton"
    )
    ?.addEventListener(
      "click",
      redo
    );


  document
    .querySelector(
      "#clearShoppingButton"
    )
    ?.addEventListener(
      "click",
      clearShopping
    );
}


function setupEvents() {
  setupAddForm();

  setupSearch();

  setupShoppingListEvents();

  setupToolbar();
}


/* =========================
   INGREDIENT DATA
========================= */

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


/* =========================
   INIT
========================= */

async function init() {
  loadState();

  setupEvents();

  try {

    await loadIngredients();

    render();

  } catch (error) {

    console.error(
      error
    );

    const container =
      document.querySelector(
        "#shoppingList"
      );

    if (container) {

      container.innerHTML = `
        <div class="empty-state">

          <div
            class="empty-state__icon"
          >
            ⚠️
          </div>

          <strong>
            Unable to load Shopping
          </strong>

          <span>
            Refresh the page and try again.
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