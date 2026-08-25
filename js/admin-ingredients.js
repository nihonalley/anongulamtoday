/* =========================================================
   STATE
========================================================= */

const state = {
  token: "",

  ingredients:
    [],

  categories:
    [],

  editingId:
    null,

  deleteIngredient:
    null,

  deleteStage:
    0
};


/* =========================================================
   ELEMENTS
========================================================= */

const elements = {
  authCard:
    document.querySelector(
      "#authCard"
    ),

  authForm:
    document.querySelector(
      "#authForm"
    ),

  token:
    document.querySelector(
      "#adminToken"
    ),

  managerArea:
    document.querySelector(
      "#managerArea"
    ),

  list:
    document.querySelector(
      "#ingredientList"
    ),

  count:
    document.querySelector(
      "#ingredientCount"
    ),

  search:
    document.querySelector(
      "#ingredientSearch"
    ),

  addButton:
    document.querySelector(
      "#addIngredientButton"
    ),

  backdrop:
    document.querySelector(
      "#ingredientEditorBackdrop"
    ),

  form:
    document.querySelector(
      "#ingredientForm"
    ),

  id:
    document.querySelector(
      "#ingredientId"
    ),

  name:
    document.querySelector(
      "#ingredientName"
    ),

  category:
    document.querySelector(
      "#ingredientCategory"
    ),

  aliases:
    document.querySelector(
      "#ingredientAliases"
    ),

  title:
    document.querySelector(
      "#ingredientEditorTitle"
    ),

  eyebrow:
    document.querySelector(
      "#ingredientEditorEyebrow"
    ),

  message:
    document.querySelector(
      "#ingredientEditorMessage"
    ),

  closeButton:
    document.querySelector(
      "#closeIngredientEditor"
    ),

  cancelButton:
    document.querySelector(
      "#cancelIngredientEditor"
    ),

  saveButton:
    document.querySelector(
      "#saveIngredientButton"
    ),

  deleteButton:
    document.querySelector(
      "#deleteIngredientButton"
    ),

  deleteBackdrop:
    document.querySelector(
      "#deleteIngredientBackdrop"
    ),

  deleteTitle:
    document.querySelector(
      "#deleteIngredientTitle"
    ),

  deleteMessage:
    document.querySelector(
      "#deleteIngredientMessage"
    ),

  deleteUsage:
    document.querySelector(
      "#deleteIngredientUsage"
    ),

  deleteIcon:
    document.querySelector(
      "#deleteIngredientIcon"
    ),

  cancelDeleteButton:
    document.querySelector(
      "#cancelDeleteIngredient"
    ),

  confirmDeleteButton:
    document.querySelector(
      "#confirmDeleteIngredient"
    )
};


/* =========================================================
   API
========================================================= */

async function api(
  url,
  options = {}
) {
  const headers =
    new Headers(
      options.headers
      ?? {}
    );


  if (state.token) {
    headers.set(
      "authorization",
      `Bearer ${state.token}`
    );
  }


  if (
    options.body
    &&
    !headers.has(
      "content-type"
    )
  ) {
    headers.set(
      "content-type",
      "application/json"
    );
  }


  const response =
    await fetch(
      url,
      {
        ...options,
        headers
      }
    );


  let data;

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }


  if (!response.ok) {
    const error =
      new Error(
        data.error
        ?? "Request failed."
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }


  return data;
}


/* =========================================================
   TEXT HELPERS
========================================================= */

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


function createIdFromName(
  value
) {
  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


/* =========================================================
   CATEGORY OPTIONS
========================================================= */

function renderCategories(
  selected = ""
) {
  const known =
    [
      ...new Set([
        ...state.categories,

        "meat",
        "seafood",
        "dairy",
        "vegetables",
        "fruit",
        "condiments",
        "spices",
        "pantry",
        "grains",
        "other"
      ])
    ]
      .filter(Boolean)
      .sort();


  elements.category.innerHTML =
    known
      .map(
        (category) => `
          <option
            value="${escapeHtml(
              category
            )}"
            ${
              category === selected
                ? "selected"
                : ""
            }
          >
            ${escapeHtml(
              category
                .replaceAll(
                  "-",
                  " "
                )
            )}
          </option>
        `
      )
      .join("");
}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadIngredients() {
  const [
    ingredientData,
    categoryData
  ] =
    await Promise.all([
      api(
        "/api/ingredients"
      ),

      api(
        "/api/ingredients/categories"
      )
    ]);


  state.ingredients =
    ingredientData.ingredients
    ?? [];

  state.categories =
    categoryData.categories
    ?? [];


  renderCategories();

  renderIngredients();
}


/* =========================================================
   INGREDIENT LIST
========================================================= */

function getFilteredIngredients() {
  const search =
    elements.search.value
      .trim()
      .toLowerCase();


  if (!search) {
    return state.ingredients;
  }


  return state.ingredients
    .filter(
      (ingredient) => {
        const searchable = [
          ingredient.id,
          ingredient.name,
          ingredient.category,
          ...(
            ingredient.aliases
            ?? []
          )
        ]
          .join(" ")
          .toLowerCase();


        return searchable.includes(
          search
        );
      }
    );
}


function renderIngredients() {
  const ingredients =
    getFilteredIngredients();


  elements.count.textContent =
    `${state.ingredients.length} ingredient${
      state.ingredients.length === 1
        ? ""
        : "s"
    } in database`;


  if (
    ingredients.length === 0
  ) {
    elements.list.innerHTML = `
      <div class="ingredient-admin-empty">
        No ingredients found.
      </div>
    `;

    return;
  }


  elements.list.innerHTML =
    ingredients
      .map(
        (ingredient) => `
          <button
            class="ingredient-admin-item"
            type="button"

            data-edit-ingredient="${escapeHtml(
              ingredient.id
            )}"
          >

            <span class="ingredient-admin-item__main">

              <strong>
                ${escapeHtml(
                  ingredient.name
                )}
              </strong>

              <small>
                ${escapeHtml(
                  ingredient.id
                )}
              </small>

            </span>


            <span class="ingredient-admin-item__meta">

              <span>
                ${escapeHtml(
                  ingredient.category
                )}
              </span>

              ${
                ingredient.aliases
                  ?.length
                  ? `
                    <small>
                      ${escapeHtml(
                        ingredient.aliases
                          .join(", ")
                      )}
                    </small>
                  `
                  : ""
              }

            </span>


            <span>
              ›
            </span>

          </button>
        `
      )
      .join("");
}


/* =========================================================
   EDITOR
========================================================= */

function resetMessage() {
  elements.message.hidden =
    true;

  elements.message.textContent =
    "";
}


function resetIdManualState() {
  elements.id.dataset.manual =
    "false";
}


function openAddEditor(
  suggestedId = "",
  suggestedName = ""
) {
  state.editingId =
    null;


  resetIdManualState();


  elements.eyebrow.textContent =
    "NEW INGREDIENT";

  elements.title.textContent =
    "Add Ingredient";


  elements.id.disabled =
    false;

  elements.id.value =
    suggestedId;

  elements.name.value =
    suggestedName;

  elements.aliases.value =
    "";


  elements.deleteButton.hidden =
    true;


  renderCategories(
    "other"
  );


  resetMessage();


  elements.backdrop.hidden =
    false;


  setTimeout(
    () => {
      (
        suggestedName
          ? elements.category
          : elements.name
      ).focus();
    },
    0
  );
}


function openEditEditor(
  ingredientId
) {
  const ingredient =
    state.ingredients.find(
      (item) =>
        item.id
        === ingredientId
    );


  if (!ingredient) {
    return;
  }


  state.editingId =
    ingredient.id;


  elements.eyebrow.textContent =
    "EDIT INGREDIENT";

  elements.title.textContent =
    ingredient.name;


  elements.id.value =
    ingredient.id;

  elements.id.disabled =
    true;


  elements.name.value =
    ingredient.name;


  renderCategories(
    ingredient.category
  );


  elements.aliases.value =
    (
      ingredient.aliases
      ?? []
    ).join(", ");


  elements.deleteButton.hidden =
    false;


  resetMessage();


  elements.backdrop.hidden =
    false;
}


function closeEditor() {
  elements.backdrop.hidden =
    true;

  state.editingId =
    null;

  elements.form.reset();

  elements.id.disabled =
    false;

  elements.deleteButton.hidden =
    true;

  resetIdManualState();

  resetMessage();
}


/* =========================================================
   SAVE
========================================================= */

function getFormPayload() {
  const aliases =
    elements.aliases.value
      .split(",")
      .map(
        (alias) =>
          alias.trim()
      )
      .filter(Boolean);


  return {
    id:
      state.editingId
      ??
      elements.id.value,

    name:
      elements.name.value,

    category:
      elements.category.value,

    aliases
  };
}


function showEditorError(
  error
) {
  let message =
    error.message;


  if (
    error.data?.errors
      ?.length
  ) {
    message =
      error.data.errors
        .join(" ");
  }


  if (
    error.data?.conflict
      ?.ingredient
  ) {
    const conflict =
      error.data.conflict
        .ingredient;


    message +=
      ` Existing ingredient: ${conflict.name} (${conflict.id}).`;
  }


  elements.message.textContent =
    message;

  elements.message.hidden =
    false;
}


async function saveIngredient() {
  resetMessage();


  elements.saveButton.disabled =
    true;


  try {
    const payload =
      getFormPayload();


    if (state.editingId) {
      await api(
        `/api/admin/ingredients/${encodeURIComponent(
          state.editingId
        )}`,
        {
          method:
            "PUT",

          body:
            JSON.stringify(
              payload
            )
        }
      );
    } else {
      await api(
        "/api/admin/ingredients",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      );
    }


    await loadIngredients();

    closeEditor();

  } catch (error) {
    showEditorError(
      error
    );
  } finally {
    elements.saveButton.disabled =
      false;
  }
}


/* =========================================================
   DELETE MODAL
========================================================= */

function closeDeleteModal() {
  elements.deleteBackdrop.hidden =
    true;

  state.deleteIngredient =
    null;

  state.deleteStage =
    0;

  elements.confirmDeleteButton.disabled =
    false;
}


function openDeleteModal() {
  if (!state.editingId) {
    return;
  }


  const ingredient =
    state.ingredients.find(
      (item) =>
        item.id
        === state.editingId
    );


  if (!ingredient) {
    return;
  }


  state.deleteIngredient =
    ingredient;

  state.deleteStage =
    1;


  elements.deleteIcon.textContent =
    "🗑️";


  elements.deleteTitle.textContent =
    `Delete ${ingredient.name}?`;


  elements.deleteMessage.textContent =
    "This will permanently remove this ingredient if it is not being used by any recipe.";


  elements.deleteUsage.hidden =
    true;

  elements.deleteUsage.innerHTML =
    "";


  elements.confirmDeleteButton.textContent =
    "Yes, Delete";


  elements.cancelDeleteButton.textContent =
    "Nope, Keep It";


  elements.deleteBackdrop.hidden =
    false;
}


/* =========================================================
   DOUBLE CONFIRMATION
========================================================= */

function showSecondDeleteConfirmation() {
  const ingredient =
    state.deleteIngredient;


  if (!ingredient) {
    return;
  }


  state.deleteStage =
    2;


  elements.deleteIcon.textContent =
    "😳";


  elements.deleteTitle.textContent =
    "WAIT. ONE MORE TIME.";


  elements.deleteMessage.innerHTML =
    `
      ARE YOU <strong>REALLY SURE</strong>
      YOU WANT TO DELETE
      <strong>${escapeHtml(
        ingredient.name
      ).toUpperCase()}</strong>?
      😂
    `;


  elements.confirmDeleteButton.textContent =
    "YES, I'M REALLY SURE";


  elements.cancelDeleteButton.textContent =
    "HAHA NEVER MIND";
}


/* =========================================================
   ACTUAL DELETE
========================================================= */

async function performIngredientDelete() {
  const ingredient =
    state.deleteIngredient;


  if (!ingredient) {
    return;
  }


  elements.confirmDeleteButton.disabled =
    true;


  try {
    await api(
      `/api/admin/ingredients/${encodeURIComponent(
        ingredient.id
      )}`,
      {
        method:
          "DELETE"
      }
    );


    closeDeleteModal();

    closeEditor();

    await loadIngredients();

  } catch (error) {

    /*
     * Expected safe failure:
     * ingredient is referenced by recipes.
     */

    if (
      error.status === 409
      &&
      error.data?.usage
    ) {
      const usage =
        error.data.usage;


      elements.deleteIcon.textContent =
        "🛡️";


      elements.deleteTitle.textContent =
        "Database protected it.";


      elements.deleteMessage.textContent =
        error.message;


      const recipeList =
        (
          usage.recipes
          ?? []
        )
          .map(
            (recipe) => `
              <li>
                ${escapeHtml(
                  recipe.name
                )}
              </li>
            `
          )
          .join("");


      elements.deleteUsage.innerHTML = `
        <strong>
          ${usage.totalReferences}
          reference${
            usage.totalReferences === 1
              ? ""
              : "s"
          } found
        </strong>

        ${
          recipeList
            ? `
              <p>
                Used by:
              </p>

              <ul>
                ${recipeList}
              </ul>
            `
            : ""
        }

        <small>
          Remove or replace this ingredient
          from those recipes first.
        </small>
      `;


      elements.deleteUsage.hidden =
        false;


      elements.confirmDeleteButton.hidden =
        true;


      elements.cancelDeleteButton.textContent =
        "Okay 👍";


      return;
    }


    elements.deleteMessage.textContent =
      error.message;

  } finally {
    elements.confirmDeleteButton.disabled =
      false;
  }
}


/* =========================================================
   DELETE FLOW
========================================================= */

async function confirmDelete() {
  if (
    state.deleteStage === 1
  ) {
    showSecondDeleteConfirmation();

    return;
  }


  if (
    state.deleteStage === 2
  ) {
    await performIngredientDelete();
  }
}


/* =========================================================
   AUTH
========================================================= */

async function unlockManager() {
  state.token =
    elements.token.value
      .trim();

  if (!state.token) {
    return;
  }

  try {

    /*
     * Verify the token FIRST.
     */

    await api(
      "/api/admin/health"
    );


    await loadIngredients();


    elements.authCard.hidden =
      true;

    elements.managerArea.hidden =
      false;

  } catch (error) {

    sessionStorage.removeItem(
      "anongUlamAdminToken"
    );

    state.token =
      "";


    if (
      error.status === 401
    ) {
      alert(
        "Wrong admin token 😅"
      );

      elements.token.focus();

      return;
    }


    console.error(
      error
    );


    alert(
      "Unable to connect to the ingredient database."
    );
  }
}


/* =========================================================
   EVENTS
========================================================= */

elements.authForm
  .addEventListener(
    "submit",
    async (
      event
    ) => {
      event.preventDefault();

      await unlockManager();
    }
  );


elements.search
  .addEventListener(
    "input",
    renderIngredients
  );


elements.addButton
  .addEventListener(
    "click",
    () => {
      openAddEditor();
    }
  );


elements.list
  .addEventListener(
    "click",
    (
      event
    ) => {
      const button =
        event.target.closest(
          "[data-edit-ingredient]"
        );


      if (!button) {
        return;
      }


      openEditEditor(
        button.dataset
          .editIngredient
      );
    }
  );


elements.name
  .addEventListener(
    "input",
    () => {
      if (
        state.editingId
        ||
        elements.id.dataset
          .manual === "true"
      ) {
        return;
      }


      elements.id.value =
        createIdFromName(
          elements.name.value
        );
    }
  );


elements.id
  .addEventListener(
    "input",
    () => {
      elements.id.dataset.manual =
        "true";
    }
  );


elements.form
  .addEventListener(
    "submit",
    async (
      event
    ) => {
      event.preventDefault();

      await saveIngredient();
    }
  );


elements.closeButton
  .addEventListener(
    "click",
    closeEditor
  );


elements.cancelButton
  .addEventListener(
    "click",
    closeEditor
  );


elements.deleteButton
  .addEventListener(
    "click",
    openDeleteModal
  );


elements.cancelDeleteButton
  .addEventListener(
    "click",
    closeDeleteModal
  );


elements.confirmDeleteButton
  .addEventListener(
    "click",
    confirmDelete
  );


elements.backdrop
  .addEventListener(
    "click",
    (
      event
    ) => {
      if (
        event.target
        === elements.backdrop
      ) {
        closeEditor();
      }
    }
  );


elements.deleteBackdrop
  .addEventListener(
    "click",
    (
      event
    ) => {
      if (
        event.target
        === elements.deleteBackdrop
      ) {
        closeDeleteModal();
      }
    }
  );


/* =========================================================
   INIT
========================================================= */

async function init() {
  state.token = "";

  elements.token.value = "";

  elements.authCard.hidden =
    false;

  elements.managerArea.hidden =
    true;
}


init();