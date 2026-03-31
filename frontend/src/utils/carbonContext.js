/**
 * carbonContext.js
 * Maps raw CO₂ kg values to relatable real-world equivalents.
 */

const EQUIVALENTS = [
  { threshold: 0.1,  emoji: "🍵", text: (kg) => `${(kg / 0.06).toFixed(1)} cups of tea brewed` },
  { threshold: 0.5,  emoji: "🍔", text: (kg) => `${(kg / 0.3).toFixed(1)} beef burgers' worth` },
  { threshold: 2,    emoji: "🚗", text: (kg) => `${(kg / 0.21).toFixed(1)} km driven in a petrol car` },
  { threshold: 5,    emoji: "💡", text: (kg) => `${(kg / 0.5).toFixed(1)} hrs of a coal power plant` },
  { threshold: 10,   emoji: "✈️", text: (kg) => `${(kg / 8).toFixed(1)} km of short-haul flying` },
  { threshold: 50,   emoji: "🌳", text: (kg) => `${(kg / 21).toFixed(1)} trees' monthly absorption` },
  { threshold: 100,  emoji: "🛳️", text: (kg) => `${(kg / 60).toFixed(1)} hrs on a cruise ship` },
  { threshold: Infinity, emoji: "🌍", text: (kg) => `${(kg / 2300).toFixed(3)}× a person's annual budget` },
];

/**
 * Get the best real-world equivalent for a given kg CO₂ amount.
 * @param {number} kg
 * @returns {{ emoji: string, text: string }}
 */
export function getCarbonEquivalent(kg) {
  if (!kg || kg <= 0) return null;
  const abs = Math.abs(kg);
  const entry = EQUIVALENTS.find(e => abs < e.threshold) || EQUIVALENTS[EQUIVALENTS.length - 1];
  return { emoji: entry.emoji, text: entry.text(abs) };
}

/**
 * Returns a short "x like driving Y km" string.
 */
export function getCarbonEquivalentShort(kg) {
  const eq = getCarbonEquivalent(kg);
  if (!eq) return null;
  return `${eq.emoji} ${eq.text}`;
}

// Paris Agreement personal budget: 2.3 tonnes/year = ~192 kg/month
export const MONTHLY_BUDGET_KG = 192;
export const ANNUAL_BUDGET_KG = 2300;

/**
 * Budget status for a given monthly total.
 * @param {number} kg  - monthly CO₂ total
 * @returns {{ percent: number, label: string, color: string, message: string }}
 */
export function getBudgetStatus(kg) {
  const percent = Math.min((kg / MONTHLY_BUDGET_KG) * 100, 200);
  let label, color, message;

  if (percent <= 50) {
    label = "Excellent";
    color = "#10b981";
    message = "You're well within your climate budget. Keep it up! 🌱";
  } else if (percent <= 80) {
    label = "Good";
    color = "#34d399";
    message = "You're on track. A few small swaps could make this perfect.";
  } else if (percent <= 100) {
    label = "Caution";
    color = "#f59e0b";
    message = "You're approaching your monthly limit. Time to cut back!";
  } else if (percent <= 150) {
    label = "Over Budget";
    color = "#ef4444";
    message = `You're ${(kg - MONTHLY_BUDGET_KG).toFixed(0)} kg over your climate budget this month.`;
  } else {
    label = "Critical";
    color = "#dc2626";
    message = `Your footprint is ${(percent / 100).toFixed(1)}× the Paris Agreement target. Action needed!`;
  }

  return { percent, label, color, message };
}

/**
 * Collective impact — scale an individual saving to a community of N.
 */
export function getCollectiveImpact(savingsKg, community = 1000) {
  const total = savingsKg * community;
  const trees = (total / 21).toFixed(0);   // ~21 kg/tree/month
  const cars  = (total / 0.21 / 1000).toFixed(1); // km → distance → thousands
  return { total: total.toFixed(1), trees, cars };
}

/**
 * What-if calculator: compare two activity descriptions.
 * activityKg = current kg, alternativeKg = cleaner option
 */
export function getWhatIfSaving(activityKg, alternativeKg) {
  const saved = Math.max(0, activityKg - alternativeKg);
  const annualized = saved * 52; // weekly to annual (rough)
  return {
    savedKg: saved.toFixed(2),
    annualKg: annualized.toFixed(0),
    equiv: getCarbonEquivalent(saved),
  };
}

/** Activity type → emoji */
export const TYPE_ICONS = {
  travel:      "🚗",
  food:        "🍽️",
  electricity: "⚡",
  shopping:    "🛍️",
  water:       "💧",
  other:       "📦",
};

/** Activity type → CSS class suffix */
export const TYPE_CLASS = {
  travel:      "travel",
  food:        "food",
  electricity: "electricity",
  shopping:    "other",
  water:       "other",
  other:       "other",
};
