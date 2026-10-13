/**
 * Carbon Calculation Service
 * Uses Indian emission factor library for accurate, scope-classified calculations.
 */

const {
  getElectricityFactor,
  getTransportFactor,
  getFoodFactor,
  getShoppingFactor,
} = require("../data/emissionFactors");

/**
 * Calculate carbon emissions for a parsed activity
 * @param {Object} data - Parsed activity data
 * @param {string} [state] - Indian state for electricity factor lookup
 * @returns {{ carbonKg: number, scope: number }}
 */
function calculateCarbon(data, state) {
  if (data.type === "travel") {
    const transport = getTransportFactor(data.mode);
    const distance = data.distance_km || 0;
    return {
      carbonKg: Math.round(distance * transport.factor * 100) / 100,
      scope: transport.scope,
    };
  }

  if (data.type === "electricity") {
    const factor = getElectricityFactor(state);
    const kwh = data.electricity_kwh || 0;
    return {
      carbonKg: Math.round(kwh * factor * 100) / 100,
      scope: 2,
    };
  }

  if (data.type === "food") {
    const food = getFoodFactor(data.food_type);
    return {
      carbonKg: food.factor,
      scope: food.scope,
    };
  }

  if (data.type === "shopping") {
    const item = getShoppingFactor(data.item_type);
    return {
      carbonKg: item.factor,
      scope: item.scope,
    };
  }

  return { carbonKg: 0, scope: 3 };
}

module.exports = { calculateCarbon };
