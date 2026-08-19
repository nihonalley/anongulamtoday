const STORAGE_KEYS = {
  pantry: "anongUlam.pantry"
};


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
  }
};


const state = {
  ingredients: [],
  pantry: new Set(),
  search: "",
  availableOnly: false
};


function loadStoredPantry() {
  try {
    const stored =
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEYS.pantry
        )
      );

    if (
      Array.isArray(stored)
    ) {
      state.pantry =
        new Set(stored);
    }

  } catch {
    state.pantry =
      new Set();
  }
}


function savePantry() {
  localStorage.setItem(
    STORAGE_KEYS.pantry,
    JSON.stringify(
      [...state.pantry]
    )
  );
}


function normalizeText(value = "") {
  return String(value)
    .trim()
    .toLowerCase();
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
          ingredient.category;

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

      <span class="ingredient-row__name">
        ${ingredient.name}
      </span>

      <button
        class="ingredient-row__shopping"
        type="button"
        data-add-shopping="${ingredient.id}"
      >
        + Shopping
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
    ?? {
      label: category,
      icon: "🍽️"
    };

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

        <span class="pantry-category__title">
          <span>
            ${meta.icon}
          </span>

          <strong>
            ${meta.label}
          </strong>
        </span>

        <span class="pantry-category__arrow">
          ▼
        </span>

      </button>


      <div class="pantry-category__items">

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
      <div class="empty-state">
        <div class="empty-state__icon">
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


function setupEvents() {
  const search =
    document.querySelector(
      "#pantrySearch"
    );

  const availableOnly =
    document.querySelector(
      "#showAvailableOnly"
    );

  const pantryList =
    document.querySelector(
      "#pantryList"
    );


  search?.addEventListener(
    "input",
    (event) => {

      state.search =
        event.target.value;

      renderPantry();

    }
  );


  availableOnly?.addEventListener(
    "change",
    (event) => {

      state.availableOnly =
        event.target.checked;

      renderPantry();

    }
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

        console.log(
          "Add to shopping:",
          shoppingButton.dataset.addShopping
        );
      }

    }
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
  loadStoredPantry();

  setupEvents();

  try {
    await loadIngredients();

    renderPantry();

  } catch (error) {

    console.error(error);

  }
}


document.addEventListener(
  "DOMContentLoaded",
  init
);