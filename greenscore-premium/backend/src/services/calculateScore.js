const factors = {
  transport: 0.21,
  electricity: 0.82,
  food: 2.5,
};

function toNumber(value) {
  return Math.max(0, Number(value) || 0);
}

function pickRecommendation(breakdown) {
  const entries = Object.entries(breakdown);
  const [largestKey] = entries.sort((left, right) => right[1] - left[1])[0] || [];

  if (largestKey === "transport") {
    return "Transport is leading your footprint. Fewer solo car trips will improve the score fastest.";
  }

  if (largestKey === "electricity") {
    return "Electricity is the main driver. Focus on appliances, cooling, and standby usage.";
  }

  if (largestKey === "food") {
    return "Food is your biggest contributor. A few lower-carbon meals each week can move the score.";
  }

  return "Add your first activity to unlock personalized suggestions.";
}

function buildMetrics(values) {
  const inputs = {
    transport: toNumber(values.transport),
    electricity: toNumber(values.electricity),
    food: toNumber(values.food),
  };

  const breakdown = {
    transport: Number((inputs.transport * factors.transport).toFixed(1)),
    electricity: Number((inputs.electricity * factors.electricity).toFixed(1)),
    food: Number((inputs.food * factors.food).toFixed(1)),
  };

  const total = Number(
    Object.values(breakdown)
      .reduce((sum, value) => sum + value, 0)
      .toFixed(1)
  );
  const score = Math.max(0, 100 - Math.round(total * 4));

  return {
    inputs,
    breakdown,
    total,
    score,
    recommendation: pickRecommendation(breakdown),
  };
}

function buildDashboard(entries) {
  const list = Array.isArray(entries) ? entries : [];

  const breakdownTotals = list.reduce(
    (totals, entry) => ({
      transport: Number((totals.transport + (entry.breakdown?.transport || 0)).toFixed(1)),
      electricity: Number((totals.electricity + (entry.breakdown?.electricity || 0)).toFixed(1)),
      food: Number((totals.food + (entry.breakdown?.food || 0)).toFixed(1)),
    }),
    { transport: 0, electricity: 0, food: 0 }
  );

  const totalEmissions = Number(
    list.reduce((sum, entry) => sum + (entry.total || 0), 0).toFixed(1)
  );
  const averageScore = list.length
    ? Math.round(list.reduce((sum, entry) => sum + (entry.score || 0), 0) / list.length)
    : 0;
  const latestTotal = list[0]?.total || 0;

  const weeklyTrend = list
    .slice(0, 7)
    .reverse()
    .map((entry) => ({
      label: new Date(entry.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      total: entry.total,
      score: entry.score,
    }));

  return {
    totalEntries: list.length,
    averageScore,
    latestTotal,
    totalEmissions,
    breakdownTotals,
    weeklyTrend,
    recommendation: pickRecommendation(breakdownTotals),
  };
}

module.exports = {
  buildDashboard,
  buildMetrics,
};
