const EMISSION_FACTORS = {
  travel: {
    bike: 0,
    bus: 0.08,
    car: 0.21
  },
  electricity: 0.82, // kg CO2 per kWh (India avg)
  food: {
    veg: 1.5,
    "non-veg": 3.3,
    packaged: 2.5
  },
  shopping: {
    clothing: 15,
    electronics: 150,
    furniture: 50,
    other: 10
  }
};

function calculateCarbon(data) {
  if (data.type === "travel") {
    return (data.distance_km || 0) *
      (EMISSION_FACTORS.travel[data.mode] || 0.1);
  }

  if (data.type === "electricity") {
    return (data.electricity_kwh || 0) *
      EMISSION_FACTORS.electricity;
  }

  if (data.type === "food") {
    return EMISSION_FACTORS.food[data.food_type] || 2;
  }

  if (data.type === "shopping") {
    // Basic heuristics based on item type
    const item = data.item_type || "other";
    if (item.includes("cloth") || item.includes("shirt") || item.includes("jeans")) return EMISSION_FACTORS.shopping.clothing;
    if (item.includes("laptop") || item.includes("phone") || item.includes("electronic")) return EMISSION_FACTORS.shopping.electronics;
    if (item.includes("chair") || item.includes("table") || item.includes("sofa")) return EMISSION_FACTORS.shopping.furniture;
    return EMISSION_FACTORS.shopping.other;
  }

  return 0;
}

module.exports = { calculateCarbon };
