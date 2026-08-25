PRAGMA foreign_keys = ON;


/* =========================================================
   CLEAN EMPTY DEVELOPMENT SCHEMA
   Safe now because we have NOT seeded recipes yet.
========================================================= */

DROP TABLE IF EXISTS recipe_ingredient_substitutes;
DROP TABLE IF EXISTS recipe_flexible_ingredients;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS ingredient_aliases;

DROP TABLE IF EXISTS recipe_notes;
DROP TABLE IF EXISTS recipe_steps;
DROP TABLE IF EXISTS recipe_serving_categories;
DROP TABLE IF EXISTS recipe_diet_tags;
DROP TABLE IF EXISTS recipe_cooking_styles;

DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recipes;


/* =========================================================
   INGREDIENT MASTER
========================================================= */

CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,

  category TEXT NOT NULL,

  created_at TEXT NOT NULL
    DEFAULT CURRENT_TIMESTAMP,

  updated_at TEXT NOT NULL
    DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_ingredients_category
ON ingredients(category);


/* =========================================================
   INGREDIENT ALIASES
========================================================= */

CREATE TABLE ingredient_aliases (
  ingredient_id TEXT NOT NULL,

  alias TEXT NOT NULL,

  PRIMARY KEY (
    ingredient_id,
    alias
  ),

  FOREIGN KEY (
    ingredient_id
  )
  REFERENCES ingredients(id)
  ON DELETE CASCADE
);


CREATE INDEX idx_ingredient_aliases_alias
ON ingredient_aliases(alias);


/* =========================================================
   RECIPES
========================================================= */

CREATE TABLE recipes (
  id TEXT PRIMARY KEY,

  name TEXT NOT NULL,

  description TEXT NOT NULL,

  emoji TEXT,

  cuisine TEXT NOT NULL,

  origin TEXT NOT NULL,

  time_minutes INTEGER NOT NULL,

  difficulty TEXT NOT NULL,

  base_servings INTEGER NOT NULL
    DEFAULT 2,

  spicy INTEGER NOT NULL
    DEFAULT 0,

  added_by TEXT NOT NULL
    DEFAULT 'built-in',

  source_type TEXT NOT NULL
    DEFAULT 'original',

  source_name TEXT NOT NULL,

  source_url TEXT,

  source_retrieved_at TEXT,

  created_at TEXT NOT NULL
    DEFAULT CURRENT_TIMESTAMP,

  updated_at TEXT NOT NULL
    DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_recipes_cuisine
ON recipes(cuisine);


CREATE INDEX idx_recipes_time
ON recipes(time_minutes);


/* =========================================================
   COOKING STYLES
========================================================= */

CREATE TABLE recipe_cooking_styles (
  recipe_id TEXT NOT NULL,

  cooking_style TEXT NOT NULL,

  PRIMARY KEY (
    recipe_id,
    cooking_style
  ),

  FOREIGN KEY (
    recipe_id
  )
  REFERENCES recipes(id)
  ON DELETE CASCADE
);


CREATE INDEX idx_recipe_cooking_styles_style
ON recipe_cooking_styles(cooking_style);


/* =========================================================
   DIET TAGS
========================================================= */

CREATE TABLE recipe_diet_tags (
  recipe_id TEXT NOT NULL,

  diet_tag TEXT NOT NULL,

  PRIMARY KEY (
    recipe_id,
    diet_tag
  ),

  FOREIGN KEY (
    recipe_id
  )
  REFERENCES recipes(id)
  ON DELETE CASCADE
);


CREATE INDEX idx_recipe_diet_tags_tag
ON recipe_diet_tags(diet_tag);


/* =========================================================
   SERVING CATEGORIES
========================================================= */

CREATE TABLE recipe_serving_categories (
  recipe_id TEXT NOT NULL,

  serving_category TEXT NOT NULL,

  PRIMARY KEY (
    recipe_id,
    serving_category
  ),

  FOREIGN KEY (
    recipe_id
  )
  REFERENCES recipes(id)
  ON DELETE CASCADE
);


CREATE INDEX idx_recipe_serving_categories_category
ON recipe_serving_categories(serving_category);


/* =========================================================
   RECIPE INGREDIENTS
========================================================= */

CREATE TABLE recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  recipe_id TEXT NOT NULL,

  ingredient_id TEXT NOT NULL,

  quantity REAL,

  unit TEXT,

  amount_text TEXT,

  scalable INTEGER NOT NULL
    DEFAULT 1,

  required INTEGER NOT NULL
    DEFAULT 1,

  sort_order INTEGER NOT NULL
    DEFAULT 0,

  FOREIGN KEY (
    recipe_id
  )
  REFERENCES recipes(id)
  ON DELETE CASCADE,

  FOREIGN KEY (
    ingredient_id
  )
  REFERENCES ingredients(id)
);


CREATE INDEX idx_recipe_ingredients_recipe
ON recipe_ingredients(recipe_id);


CREATE INDEX idx_recipe_ingredients_ingredient
ON recipe_ingredients(ingredient_id);


/* =========================================================
   INGREDIENT SUBSTITUTES
========================================================= */

CREATE TABLE recipe_ingredient_substitutes (
  recipe_ingredient_id INTEGER NOT NULL,

  substitute_ingredient_id TEXT NOT NULL,

  PRIMARY KEY (
    recipe_ingredient_id,
    substitute_ingredient_id
  ),

  FOREIGN KEY (
    recipe_ingredient_id
  )
  REFERENCES recipe_ingredients(id)
  ON DELETE CASCADE,

  FOREIGN KEY (
    substitute_ingredient_id
  )
  REFERENCES ingredients(id)
);


/* =========================================================
   FLEXIBLE INGREDIENTS
========================================================= */

CREATE TABLE recipe_flexible_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  recipe_id TEXT NOT NULL,

  label TEXT NOT NULL,

  note TEXT NOT NULL,

  sort_order INTEGER NOT NULL
    DEFAULT 0,

  FOREIGN KEY (
    recipe_id
  )
  REFERENCES recipes(id)
  ON DELETE CASCADE
);


/* =========================================================
   RECIPE STEPS
========================================================= */

CREATE TABLE recipe_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  recipe_id TEXT NOT NULL,

  step_text TEXT NOT NULL,

  sort_order INTEGER NOT NULL,

  FOREIGN KEY (
    recipe_id
  )
  REFERENCES recipes(id)
  ON DELETE CASCADE
);


/* =========================================================
   RECIPE NOTES
========================================================= */

CREATE TABLE recipe_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  recipe_id TEXT NOT NULL,

  note_text TEXT NOT NULL,

  sort_order INTEGER NOT NULL
    DEFAULT 0,

  FOREIGN KEY (
    recipe_id
  )
  REFERENCES recipes(id)
  ON DELETE CASCADE
);