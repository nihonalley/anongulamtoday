const STORAGE_PREFIX = "anongUlam";


export const STORAGE_KEYS = {
  pantry: `${STORAGE_PREFIX}.pantry`,
  shopping: `${STORAGE_PREFIX}.shopping`,
  shoppingMeta: `${STORAGE_PREFIX}.shoppingMeta`,
  customIngredients: `${STORAGE_PREFIX}.customIngredients`,
  favorites: `${STORAGE_PREFIX}.favorites`
};


/* =========================
   GENERIC STORAGE
========================= */

export function loadValue(
  key,
  fallback = null
) {
  try {
    const raw =
      localStorage.getItem(key);

    if (raw === null) {
      return fallback;
    }

    return JSON.parse(raw);

  } catch {
    return fallback;
  }
}


export function saveValue(
  key,
  value
) {
  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
}


/* =========================
   LIST STORAGE
========================= */

export function loadList(key) {
  const stored =
    loadValue(
      key,
      []
    );

  return Array.isArray(stored)
    ? stored
    : [];
}


export function saveList(
  key,
  values
) {
  saveValue(
    key,
    [...values]
  );
}


export function addToList(
  key,
  id
) {
  const items =
    new Set(
      loadList(key)
    );

  items.add(id);

  saveList(
    key,
    items
  );

  return [...items];
}


export function removeFromList(
  key,
  id
) {
  const items =
    new Set(
      loadList(key)
    );

  items.delete(id);

  saveList(
    key,
    items
  );

  return [...items];
}


export function hasInList(
  key,
  id
) {
  return loadList(key)
    .includes(id);
}


/* =========================
   OBJECT STORAGE
========================= */

export function loadObject(key) {
  const stored =
    loadValue(
      key,
      {}
    );

  if (
    stored
    && typeof stored === "object"
    && !Array.isArray(stored)
  ) {
    return stored;
  }

  return {};
}


export function saveObject(
  key,
  value
) {
  saveValue(
    key,
    value
  );
}