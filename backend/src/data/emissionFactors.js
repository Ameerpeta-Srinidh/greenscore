/**
 * Indian Emission Factor Library
 * Sources: CEA India CO₂ Baseline Database, IPCC AR6, GHG Protocol
 * All values in kg CO₂e unless noted
 */

// ─── State-wise Electricity Emission Factors (kg CO₂/kWh) ───
// Source: Central Electricity Authority (CEA) India - CO₂ Baseline Database v18
const ELECTRICITY_GRID_FACTORS = {
  // Regional grid averages
  _northern: 0.93,
  _southern: 0.82,
  _western: 0.84,
  _eastern: 0.97,
  _northeastern: 0.43,
  _national_avg: 0.82,

  // State-wise factors
  "andhra pradesh": 0.79,
  "arunachal pradesh": 0.43,
  "assam": 0.47,
  "bihar": 0.97,
  "chhattisgarh": 1.08,
  "delhi": 0.93,
  "goa": 0.79,
  "gujarat": 0.82,
  "haryana": 0.91,
  "himachal pradesh": 0.24,
  "jharkhand": 1.02,
  "karnataka": 0.72,
  "kerala": 0.51,
  "madhya pradesh": 0.96,
  "maharashtra": 0.84,
  "manipur": 0.43,
  "meghalaya": 0.43,
  "mizoram": 0.43,
  "nagaland": 0.43,
  "odisha": 0.98,
  "punjab": 0.85,
  "rajasthan": 0.93,
  "sikkim": 0.21,
  "tamil nadu": 0.78,
  "telangana": 0.79,
  "tripura": 0.58,
  "uttar pradesh": 0.95,
  "uttarakhand": 0.35,
  "west bengal": 0.94,
  "jammu and kashmir": 0.46,
  "ladakh": 0.46,
  "chandigarh": 0.93,
  "puducherry": 0.78,
};

// ─── Transport Emission Factors (kg CO₂/km) ───
const TRANSPORT_FACTORS = {
  // Indian-specific modes
  "auto-rickshaw": { factor: 0.06, scope: 1, label: "Auto-Rickshaw (CNG)" },
  "auto": { factor: 0.06, scope: 1, label: "Auto-Rickshaw (CNG)" },
  "two-wheeler": { factor: 0.05, scope: 1, label: "Two-Wheeler (Petrol)" },
  "motorcycle": { factor: 0.05, scope: 1, label: "Motorcycle" },
  "scooter": { factor: 0.04, scope: 1, label: "Scooter (Petrol)" },
  "ev-two-wheeler": { factor: 0.01, scope: 2, label: "Electric Two-Wheeler" },
  "e-rickshaw": { factor: 0.02, scope: 2, label: "E-Rickshaw" },
  "shared-auto": { factor: 0.03, scope: 3, label: "Shared Auto" },

  // Standard modes
  car: { factor: 0.21, scope: 1, label: "Car (Petrol)" },
  "car-diesel": { factor: 0.24, scope: 1, label: "Car (Diesel)" },
  "car-cng": { factor: 0.15, scope: 1, label: "Car (CNG)" },
  "car-ev": { factor: 0.03, scope: 2, label: "Electric Car" },
  taxi: { factor: 0.21, scope: 3, label: "Taxi/Cab" },
  uber: { factor: 0.21, scope: 3, label: "Ride-hailing" },
  ola: { factor: 0.21, scope: 3, label: "Ride-hailing" },
  bus: { factor: 0.08, scope: 3, label: "Bus" },
  "ac-bus": { factor: 0.10, scope: 3, label: "AC Bus" },
  train: { factor: 0.01, scope: 3, label: "Train (Indian Railways)" },
  metro: { factor: 0.03, scope: 2, label: "Metro" },
  bike: { factor: 0, scope: 1, label: "Bicycle" },
  cycle: { factor: 0, scope: 1, label: "Bicycle" },
  walk: { factor: 0, scope: 1, label: "Walking" },

  // Air travel
  "domestic-flight": { factor: 0.255, scope: 3, label: "Domestic Flight" },
  "international-flight": { factor: 0.195, scope: 3, label: "International Flight" },
  plane: { factor: 0.255, scope: 3, label: "Flight" },
  flight: { factor: 0.255, scope: 3, label: "Flight" },
};

// ─── Food Emission Factors (kg CO₂ per meal/serving) ───
const FOOD_FACTORS = {
  // Generic categories
  veg: { factor: 1.5, scope: 3, label: "Vegetarian Meal" },
  "non-veg": { factor: 3.3, scope: 3, label: "Non-Veg Meal" },
  packaged: { factor: 2.5, scope: 3, label: "Packaged Food" },

  // Indian-specific
  "veg-thali": { factor: 1.2, scope: 3, label: "Veg Thali" },
  "non-veg-thali": { factor: 3.5, scope: 3, label: "Non-Veg Thali" },
  "chicken-biryani": { factor: 4.2, scope: 3, label: "Chicken Biryani" },
  "mutton-biryani": { factor: 5.8, scope: 3, label: "Mutton Biryani" },
  "dal-rice": { factor: 0.8, scope: 3, label: "Dal Rice" },
  "dal": { factor: 0.6, scope: 3, label: "Dal" },
  "paneer": { factor: 2.1, scope: 3, label: "Paneer Dish" },
  "roti-sabzi": { factor: 0.9, scope: 3, label: "Roti Sabzi" },
  "dosa": { factor: 0.7, scope: 3, label: "Dosa" },
  "idli": { factor: 0.5, scope: 3, label: "Idli" },
  "paratha": { factor: 1.0, scope: 3, label: "Paratha" },
  "street-food": { factor: 0.5, scope: 3, label: "Street Food" },
  "pizza": { factor: 2.8, scope: 3, label: "Pizza" },
  "burger": { factor: 3.0, scope: 3, label: "Burger" },
  "chicken": { factor: 3.5, scope: 3, label: "Chicken Dish" },
  "mutton": { factor: 5.5, scope: 3, label: "Mutton Dish" },
  "fish": { factor: 2.8, scope: 3, label: "Fish Dish" },
  "egg": { factor: 1.8, scope: 3, label: "Egg Dish" },
  "beef": { factor: 6.8, scope: 3, label: "Beef" },
  "pork": { factor: 4.0, scope: 3, label: "Pork" },
  "salad": { factor: 0.4, scope: 3, label: "Salad" },
  "fruit": { factor: 0.3, scope: 3, label: "Fruits" },
};

// ─── Shopping / Goods Emission Factors (kg CO₂ per item) ───
const SHOPPING_FACTORS = {
  clothing: { factor: 15, scope: 3, label: "Clothing" },
  electronics: { factor: 150, scope: 3, label: "Electronics" },
  furniture: { factor: 50, scope: 3, label: "Furniture" },
  book: { factor: 2.5, scope: 3, label: "Book" },
  other: { factor: 10, scope: 3, label: "General Purchase" },
};

// ─── Helper Functions ───

/**
 * Get electricity emission factor for a given state
 * @param {string} state - Indian state name (case-insensitive)
 * @returns {number} kg CO₂/kWh
 */
function getElectricityFactor(state) {
  if (!state) return ELECTRICITY_GRID_FACTORS._national_avg;
  const key = state.toLowerCase().trim();
  return ELECTRICITY_GRID_FACTORS[key] || ELECTRICITY_GRID_FACTORS._national_avg;
}

/**
 * Get transport emission factor
 * @param {string} mode
 * @returns {{ factor: number, scope: number, label: string }}
 */
function getTransportFactor(mode) {
  if (!mode) return TRANSPORT_FACTORS.car;
  const key = mode.toLowerCase().trim();
  return TRANSPORT_FACTORS[key] || { factor: 0.1, scope: 3, label: mode };
}

/**
 * Get food emission factor
 * @param {string} foodType
 * @returns {{ factor: number, scope: number, label: string }}
 */
function getFoodFactor(foodType) {
  if (!foodType) return FOOD_FACTORS.veg;
  const key = foodType.toLowerCase().trim();
  return FOOD_FACTORS[key] || FOOD_FACTORS.veg;
}

/**
 * Get shopping emission factor
 * @param {string} itemType
 * @returns {{ factor: number, scope: number, label: string }}
 */
function getShoppingFactor(itemType) {
  if (!itemType) return SHOPPING_FACTORS.other;
  const key = itemType.toLowerCase().trim();
  // Fuzzy matching for common items
  if (key.includes("cloth") || key.includes("shirt") || key.includes("jeans") || key.includes("dress") || key.includes("shoes")) {
    return SHOPPING_FACTORS.clothing;
  }
  if (key.includes("laptop") || key.includes("phone") || key.includes("tablet") || key.includes("electronic") || key.includes("device")) {
    return SHOPPING_FACTORS.electronics;
  }
  if (key.includes("chair") || key.includes("table") || key.includes("sofa") || key.includes("furniture") || key.includes("desk")) {
    return SHOPPING_FACTORS.furniture;
  }
  if (key.includes("book")) {
    return SHOPPING_FACTORS.book;
  }
  return SHOPPING_FACTORS[key] || SHOPPING_FACTORS.other;
}

/**
 * Get all available states for dropdown
 */
function getAvailableStates() {
  return Object.keys(ELECTRICITY_GRID_FACTORS)
    .filter(k => !k.startsWith("_"))
    .map(k => ({
      value: k,
      label: k.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      factor: ELECTRICITY_GRID_FACTORS[k],
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get all transport modes for reference
 */
function getAvailableTransportModes() {
  const seen = new Set();
  return Object.entries(TRANSPORT_FACTORS)
    .filter(([, v]) => {
      if (seen.has(v.label)) return false;
      seen.add(v.label);
      return true;
    })
    .map(([key, v]) => ({ value: key, ...v }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get all food types for reference
 */
function getAvailableFoodTypes() {
  return Object.entries(FOOD_FACTORS)
    .map(([key, v]) => ({ value: key, ...v }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

module.exports = {
  ELECTRICITY_GRID_FACTORS,
  TRANSPORT_FACTORS,
  FOOD_FACTORS,
  SHOPPING_FACTORS,
  getElectricityFactor,
  getTransportFactor,
  getFoodFactor,
  getShoppingFactor,
  getAvailableStates,
  getAvailableTransportModes,
  getAvailableFoodTypes,
};
