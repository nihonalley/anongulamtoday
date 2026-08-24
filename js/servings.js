/* =========================================================
   SERVING CONFIG
========================================================= */

export const SERVING_PRESETS = {
  one: {
    label: "One",
    people: 1,
    emoji: "👤"
  },

  couple: {
    label: "Couple",
    people: 2,
    emoji: "👥"
  },

  family: {
    label: "Family",
    people: 4,
    emoji: "👨‍👩‍👧‍👦"
  },

  party: {
    label: "Party",
    people: 8,
    emoji: "🎉"
  }
};


export const MIN_SERVINGS = 1;

export const MAX_SERVINGS = 20;


/* =========================================================
   NUMBER HELPERS
========================================================= */

function roundQuantity(
  value
) {
  if (
    !Number.isFinite(value)
  ) {
    return value;
  }

  if (
    Number.isInteger(value)
  ) {
    return value;
  }

  if (
    value < 1
  ) {
    return Math.round(
      value * 100
    ) / 100;
  }

  return Math.round(
    value * 10
  ) / 10;
}


/* =========================================================
   DISPLAY FRACTIONS
========================================================= */

const FRACTIONS = [
  {
    value: 0.25,
    text: "¼"
  },
  {
    value: 0.33,
    text: "⅓"
  },
  {
    value: 0.5,
    text: "½"
  },
  {
    value: 0.66,
    text: "⅔"
  },
  {
    value: 0.75,
    text: "¾"
  }
];


function findFraction(
  decimal
) {
  return FRACTIONS.find(
    (fraction) =>
      Math.abs(
        decimal
        - fraction.value
      ) < 0.04
  );
}


export function formatQuantity(
  quantity
) {
  if (
    quantity === null
    || quantity === undefined
  ) {
    return "";
  }

  const rounded =
    roundQuantity(
      quantity
    );

  if (
    Number.isInteger(
      rounded
    )
  ) {
    return String(
      rounded
    );
  }

  const whole =
    Math.floor(
      rounded
    );

  const decimal =
    rounded - whole;

  const fraction =
    findFraction(
      decimal
    );

  if (fraction) {
    if (
      whole === 0
    ) {
      return fraction.text;
    }

    return `${whole} ${fraction.text}`;
  }

  return String(
    rounded
  );
}


/* =========================================================
   UNIT NORMALIZATION
========================================================= */

const UNIT_LABELS = {
  g: "g",
  kg: "kg",

  ml: "ml",
  l: "L",

  tsp: "tsp",
  tbsp: "tbsp",

  cup: "cup",
  cups: "cups",

  piece: "piece",
  pieces: "pieces",

  clove: "clove",
  cloves: "cloves",

  slice: "slice",
  slices: "slices",

  pack: "pack",
  packs: "packs"
};


function getUnitLabel(
  unit,
  quantity
) {
  if (!unit) {
    return "";
  }

  /*
   * Simple singular/plural handling.
   */

  if (
    quantity === 1
  ) {
    if (
      unit === "pieces"
    ) {
      return "piece";
    }

    if (
      unit === "cloves"
    ) {
      return "clove";
    }

    if (
      unit === "slices"
    ) {
      return "slice";
    }

    if (
      unit === "cups"
    ) {
      return "cup";
    }

    if (
      unit === "packs"
    ) {
      return "pack";
    }
  }

  return (
    UNIT_LABELS[unit]
    ?? unit
  );
}


/* =========================================================
   CONVERSION
========================================================= */

function normalizeLargeMetric(
  quantity,
  unit
) {
  if (
    unit === "g"
    && quantity >= 1000
  ) {
    return {
      quantity:
        quantity / 1000,

      unit:
        "kg"
    };
  }

  if (
    unit === "ml"
    && quantity >= 1000
  ) {
    return {
      quantity:
        quantity / 1000,

      unit:
        "l"
    };
  }

  return {
    quantity,
    unit
  };
}


/* =========================================================
   SERVING SCALE
========================================================= */

export function getServingMultiplier(
  baseServings,
  targetServings
) {
  const base =
    Number(
      baseServings
    );

  const target =
    Number(
      targetServings
    );

  if (
    !Number.isFinite(base)
    || base <= 0
  ) {
    return 1;
  }

  if (
    !Number.isFinite(target)
    || target <= 0
  ) {
    return 1;
  }

  return (
    target / base
  );
}


/* =========================================================
   SCALE INGREDIENT
========================================================= */

export function scaleIngredient(
  ingredient,
  baseServings,
  targetServings
) {
  /*
   * Ingredients such as:
   *
   * Salt — To taste
   * Oil — As needed
   *
   * must stay unchanged.
   */

  if (
    ingredient.scalable
    === false
  ) {
    return {
      ...ingredient,

      displayAmount:
        ingredient.amountText
        || ""
    };
  }


  if (
    !Number.isFinite(
      ingredient.quantity
    )
  ) {
    return {
      ...ingredient,

      displayAmount:
        ingredient.amountText
        || ""
    };
  }


  const multiplier =
    getServingMultiplier(
      baseServings,
      targetServings
    );


  let quantity =
    ingredient.quantity
    * multiplier;


  let unit =
    ingredient.unit;


  const normalizedMetric =
    normalizeLargeMetric(
      quantity,
      unit
    );


  quantity =
    normalizedMetric.quantity;

  unit =
    normalizedMetric.unit;


  const quantityText =
    formatQuantity(
      quantity
    );


  const unitText =
    getUnitLabel(
      unit,
      quantity
    );


  return {
    ...ingredient,

    scaledQuantity:
      quantity,

    scaledUnit:
      unit,

    displayAmount:
      [
        quantityText,
        unitText
      ]
        .filter(Boolean)
        .join(" ")
  };
}


/* =========================================================
   SCALE FULL RECIPE
========================================================= */

export function scaleRecipeIngredients(
  recipe,
  targetServings
) {
  const baseServings =
    recipe.baseServings
    || 2;


  return (
    recipe.ingredients
    ?? []
  ).map(
    (ingredient) =>
      scaleIngredient(
        ingredient,
        baseServings,
        targetServings
      )
  );
}


/* =========================================================
   SERVING CATEGORY
========================================================= */

export function getServingCategory(
  servings
) {
  const count =
    Number(
      servings
    );


  if (
    count <= 1
  ) {
    return "one";
  }


  if (
    count <= 2
  ) {
    return "couple";
  }


  if (
    count <= 6
  ) {
    return "family";
  }


  return "party";
}


/* =========================================================
   CLAMP
========================================================= */

export function clampServings(
  servings
) {
  const value =
    Number(
      servings
    );


  if (
    !Number.isFinite(value)
  ) {
    return 2;
  }


  return Math.min(
    MAX_SERVINGS,

    Math.max(
      MIN_SERVINGS,
      Math.round(value)
    )
  );
}