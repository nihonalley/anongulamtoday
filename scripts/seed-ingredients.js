import fs from "node:fs";
import path from "node:path";
import {
  fileURLToPath
} from "node:url";

import {
  spawnSync
} from "node:child_process";


/* =========================================================
   CONFIG
========================================================= */

const DATABASE_NAME =
  "anongulamdb";


const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

const ROOT =
  path.resolve(
    __dirname,
    ".."
  );


const INGREDIENTS_FILE =
  path.join(
    ROOT,
    "public",
    "data",
    "ingredients.json"
  );


const GENERATED_DIR =
  path.join(
    ROOT,
    "generated"
  );


const SQL_FILE =
  path.join(
    GENERATED_DIR,
    "seed-ingredients.sql"
  );


/* =========================================================
   HELPERS
========================================================= */

function readJson(
  filePath
) {
  return JSON.parse(
    fs.readFileSync(
      filePath,
      "utf8"
    )
  );
}


function sqlString(
  value
) {
  if (
    value === null
    ||
    value === undefined
  ) {
    return "NULL";
  }

  return `'${String(value)
    .replaceAll(
      "'",
      "''"
    )}'`;
}


function normalizeText(
  value
) {
  return String(
    value ?? ""
  ).trim();
}


function normalizeId(
  value
) {
  return normalizeText(
    value
  ).toLowerCase();
}


function normalizeAliases(
  aliases
) {
  if (
    !Array.isArray(
      aliases
    )
  ) {
    return [];
  }

  return [
    ...new Set(
      aliases
        .map(
          (alias) =>
            normalizeText(
              alias
            ).toLowerCase()
        )
        .filter(Boolean)
    )
  ];
}


/* =========================================================
   NORMALIZE INGREDIENT
========================================================= */

function normalizeIngredient(
  ingredient
) {
  return {
    id:
      normalizeId(
        ingredient.id
      ),

    name:
      normalizeText(
        ingredient.name
      ),

    category:
      normalizeText(
        ingredient.category
      ).toLowerCase(),

    aliases:
      normalizeAliases(
        ingredient.aliases
      )
  };
}


/* =========================================================
   VALIDATION
========================================================= */

function validateIngredients(
  ingredients
) {
  const errors = [];

  const ids =
    new Map();

  const names =
    new Map();

  const aliases =
    new Map();


  ingredients.forEach(
    (
      ingredient,
      index
    ) => {
      const position =
        `Ingredient ${index + 1}`;


      if (!ingredient.id) {
        errors.push(
          `${position}: missing id.`
        );
      }


      if (!ingredient.name) {
        errors.push(
          `${position}: missing name.`
        );
      }


      if (!ingredient.category) {
        errors.push(
          `${position}: missing category.`
        );
      }


      /* -------------------------
         DUPLICATE ID
      ------------------------- */

      if (
        ids.has(
          ingredient.id
        )
      ) {
        errors.push(
          `Duplicate ingredient ID "${ingredient.id}".`
        );
      } else {
        ids.set(
          ingredient.id,
          ingredient
        );
      }


      /* -------------------------
         DUPLICATE NAME
      ------------------------- */

      const nameKey =
        ingredient.name
          .toLowerCase();


      if (
        names.has(
          nameKey
        )
      ) {
        errors.push(
          `Duplicate ingredient name "${ingredient.name}".`
        );
      } else {
        names.set(
          nameKey,
          ingredient
        );
      }


      /* -------------------------
         ALIASES
      ------------------------- */

      ingredient.aliases
        .forEach(
          (alias) => {

            if (
              alias
              === ingredient.id
            ) {
              errors.push(
                `${ingredient.id}: alias "${alias}" is identical to its ingredient ID.`
              );
            }


            if (
              aliases.has(
                alias
              )
            ) {
              const existing =
                aliases.get(
                  alias
                );

              errors.push(
                `Alias "${alias}" is assigned to both "${existing.id}" and "${ingredient.id}".`
              );
            } else {
              aliases.set(
                alias,
                ingredient
              );
            }
          }
        );
    }
  );


  /*
   * Prevent aliases from matching
   * another canonical ingredient ID.
   */

  aliases.forEach(
    (
      ingredient,
      alias
    ) => {
      const canonical =
        ids.get(
          alias
        );


      if (
        canonical
        &&
        canonical.id
        !== ingredient.id
      ) {
        errors.push(
          `Alias "${alias}" for "${ingredient.id}" conflicts with canonical ingredient "${canonical.id}".`
        );
      }
    }
  );


  return errors;
}


/* =========================================================
   GENERATE SQL
========================================================= */

function generateSql(
  ingredients
) {
  const lines = [];


  lines.push(
    "-- AUTO-GENERATED"
  );

  lines.push(
    "-- Ingredient seed for Anong Ulam Today"
  );

  lines.push(
    "-- Existing D1-only ingredients are preserved."
  );

  lines.push(
    "-- Intentionally no BEGIN/COMMIT:"
  );

  lines.push(
    "-- Cloudflare D1 remote execution does not support explicit SQL transactions here."
  );

  lines.push("");

  lines.push(
    "PRAGMA foreign_keys = ON;"
  );

  lines.push("");


  ingredients.forEach(
    (ingredient) => {

      /* =====================================================
         INGREDIENT UPSERT
      ===================================================== */

      lines.push(`
INSERT INTO ingredients (
  id,
  name,
  category
)
VALUES (
  ${sqlString(
    ingredient.id
  )},
  ${sqlString(
    ingredient.name
  )},
  ${sqlString(
    ingredient.category
  )}
)
ON CONFLICT(id)
DO UPDATE SET
  name =
    excluded.name,

  category =
    excluded.category,

  updated_at =
    CURRENT_TIMESTAMP;
`.trim());

      lines.push("");


      /* =====================================================
         ALIAS SYNC
      ===================================================== */

      /*
       * Only aliases belonging to ingredients
       * represented in ingredients.json are synced.
       *
       * D1-only ingredients such as your manually
       * added Lamb are untouched.
       */

      lines.push(`
DELETE FROM ingredient_aliases
WHERE ingredient_id =
  ${sqlString(
    ingredient.id
  )};
`.trim());

      lines.push("");


      ingredient.aliases
        .forEach(
          (alias) => {

            lines.push(`
INSERT INTO ingredient_aliases (
  ingredient_id,
  alias
)
VALUES (
  ${sqlString(
    ingredient.id
  )},
  ${sqlString(
    alias
  )}
);
`.trim());

            lines.push("");
          }
        );
    }
  );


  return lines.join(
    "\n"
  );
}


/* =========================================================
   RUN WRANGLER
========================================================= */

function executeSeed() {
  console.log(
    "\nUploading ingredient seed to D1...\n"
  );


  const result =
    spawnSync(
      "npx",
      [
        "wrangler",
        "d1",
        "execute",
        DATABASE_NAME,
        "--remote",
        `--file=${SQL_FILE}`
      ],
      {
        cwd:
          ROOT,

        stdio:
          "inherit",

        shell:
          true
      }
    );


  if (
    result.status
    !== 0
  ) {
    throw new Error(
      "Wrangler failed to seed D1."
    );
  }
}


/* =========================================================
   MAIN
========================================================= */

function main() {

  console.log(
    "Reading ingredients.json..."
  );


  const rawIngredients =
    readJson(
      INGREDIENTS_FILE
    );


  if (
    !Array.isArray(
      rawIngredients
    )
  ) {
    throw new Error(
      "ingredients.json must contain an array."
    );
  }


  const ingredients =
    rawIngredients.map(
      normalizeIngredient
    );


  const errors =
    validateIngredients(
      ingredients
    );


  if (
    errors.length > 0
  ) {
    console.error(
      "\nIngredient validation failed:\n"
    );


    errors.forEach(
      (error) =>
        console.error(
          `• ${error}`
        )
    );


    process.exit(1);
  }


  fs.mkdirSync(
    GENERATED_DIR,
    {
      recursive:
        true
    }
  );


  const sql =
    generateSql(
      ingredients
    );


  fs.writeFileSync(
    SQL_FILE,
    sql,
    "utf8"
  );


  console.log(
    `✓ Validated ${ingredients.length} ingredients.`
  );


  console.log(
    `✓ Generated ${SQL_FILE}`
  );


  executeSeed();


  console.log(
    "\n✓ Ingredient seed completed."
  );


  console.log(
    "\nExisting D1-only ingredients were preserved."
  );
}


main();