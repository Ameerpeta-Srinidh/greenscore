/**
 * Industry Benchmarks
 * Average kg CO₂ per employee per month by industry and company size
 * Sources: CDP India, GHG Protocol, BRSR filings of listed companies
 */

const INDUSTRY_BENCHMARKS = {
  "IT/Software": {
    small: 45,    // 1-50 employees
    medium: 55,   // 51-250 employees
    large: 65,    // 250+ employees
  },
  "Manufacturing": {
    small: 120,
    medium: 180,
    large: 250,
  },
  "Retail/E-commerce": {
    small: 60,
    medium: 80,
    large: 100,
  },
  "Healthcare": {
    small: 70,
    medium: 90,
    large: 110,
  },
  "Education": {
    small: 35,
    medium: 45,
    large: 55,
  },
  "Finance/Banking": {
    small: 40,
    medium: 50,
    large: 60,
  },
  "Logistics/Transport": {
    small: 150,
    medium: 200,
    large: 280,
  },
  "Hospitality/Food Service": {
    small: 80,
    medium: 110,
    large: 140,
  },
  "Construction/Real Estate": {
    small: 100,
    medium: 150,
    large: 200,
  },
  "Agriculture": {
    small: 90,
    medium: 130,
    large: 170,
  },
  "Media/Entertainment": {
    small: 38,
    medium: 48,
    large: 58,
  },
  "Consulting/Professional Services": {
    small: 42,
    medium: 52,
    large: 62,
  },
  "Pharma/Biotech": {
    small: 85,
    medium: 120,
    large: 160,
  },
  "Textiles/Apparel": {
    small: 95,
    medium: 140,
    large: 190,
  },
  "Other": {
    small: 60,
    medium: 80,
    large: 100,
  },
};

/**
 * Determine company size tier
 * @param {number} employeeCount
 * @returns {'small'|'medium'|'large'}
 */
function getSizeTier(employeeCount) {
  if (!employeeCount || employeeCount <= 50) return "small";
  if (employeeCount <= 250) return "medium";
  return "large";
}

/**
 * Get benchmark for an industry + company size
 * @param {string} industry
 * @param {number} employeeCount
 * @returns {{ benchmarkKg: number, sizeTier: string, industry: string }}
 */
function getBenchmark(industry, employeeCount) {
  const sizeTier = getSizeTier(employeeCount);
  const industryData = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS["Other"];
  const actualIndustry = INDUSTRY_BENCHMARKS[industry] ? industry : "Other";

  return {
    benchmarkKg: industryData[sizeTier],
    sizeTier,
    industry: actualIndustry,
  };
}

/**
 * Compare company emissions against benchmark
 * @param {number} totalKg - Total org emissions for the month
 * @param {number} employeeCount
 * @param {string} industry
 * @returns {{ benchmarkKg, perEmployeeKg, diffPercent, diffKg, label, color }}
 */
function compareToBenchmark(totalKg, employeeCount, industry) {
  const { benchmarkKg, sizeTier, industry: resolvedIndustry } = getBenchmark(industry, employeeCount);
  const count = Math.max(1, employeeCount || 1);
  const perEmployeeKg = totalKg / count;
  const diffKg = perEmployeeKg - benchmarkKg;
  const diffPercent = ((diffKg / benchmarkKg) * 100).toFixed(1);

  let label, color;
  if (diffPercent <= -20) {
    label = "Excellent";
    color = "#10b981";
  } else if (diffPercent <= -5) {
    label = "Below Average";
    color = "#34d399";
  } else if (diffPercent <= 5) {
    label = "Average";
    color = "#f59e0b";
  } else if (diffPercent <= 20) {
    label = "Above Average";
    color = "#ef4444";
  } else {
    label = "High";
    color = "#dc2626";
  }

  return {
    benchmarkKg,
    perEmployeeKg: Math.round(perEmployeeKg * 10) / 10,
    diffPercent: parseFloat(diffPercent),
    diffKg: Math.round(diffKg * 10) / 10,
    label,
    color,
    sizeTier,
    industry: resolvedIndustry,
  };
}

/**
 * Get all available industries for dropdown
 */
function getAvailableIndustries() {
  return Object.keys(INDUSTRY_BENCHMARKS).sort();
}

module.exports = {
  INDUSTRY_BENCHMARKS,
  getSizeTier,
  getBenchmark,
  compareToBenchmark,
  getAvailableIndustries,
};
