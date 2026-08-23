const STORAGE_PREFIX = "anongUlam";

export const STORAGE_KEYS = {
  pantry: `${STORAGE_PREFIX}.pantry`,
  shopping: `${STORAGE_PREFIX}.shopping`,
  favorites: `${STORAGE_PREFIX}.favorites`
};

export function loadList(key) {
  try {
    const stored = JSON.parse(
      localStorage.getItem(key)
    );

    return Array.isArray(stored)
      ? stored
      : [];
  } catch {
    return [];
  }
}

export function saveList(key, values) {
  localStorage.setItem(
    key,
    JSON.stringify([...values])
  );
}

export function addToList(key, id) {
  const items = new Set(loadList(key));

  items.add(id);

  saveList(key, items);

  return [...items];
}

export function removeFromList(key, id) {
  const items = new Set(loadList(key));

  items.delete(id);

  saveList(key, items);

  return [...items];
}

export function hasInList(key, id) {
  return loadList(key).includes(id);
}