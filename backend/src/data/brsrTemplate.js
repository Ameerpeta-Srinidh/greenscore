/**
 * BRSR Template — Full Section C, Principle 6 (Environment)
 * 
 * Based on SEBI BRSR Format (Annexure II, SEBI/HO/CFD/CMD-2/P/CIR/2021/562)
 * Each indicator maps to calculations from Activity data.
 */

const BRSR_PRINCIPLE_6 = {
  title: "Principle 6: Businesses should respect and make efforts to protect and restore the environment.",
  
  essential: [
    {
      id: "P6-E1",
      indicator: "Total electricity consumption (MWh)",
      description: "Total electricity consumed from grid, DG sets, and other sources.",
      dataField: "electricityMwh",
      unit: "MWh",
      scope: 2,
      autoCalc: true,
    },
    {
      id: "P6-E2",
      indicator: "Total fuel consumption (MT)",
      description: "Total fuel consumption from diesel, petrol, CNG, LPG, etc.",
      dataField: "fuelMt",
      unit: "MT",
      scope: 1,
      autoCalc: true,
    },
    {
      id: "P6-E3",
      indicator: "Energy consumption through other sources",
      description: "Any renewable or non-grid energy sources.",
      dataField: "otherEnergyMwh",
      unit: "MWh",
      scope: 2,
      autoCalc: false,
    },
    {
      id: "P6-E4",
      indicator: "Total energy consumed (GJ)",
      description: "Sum of all energy consumption converted to GJ.",
      dataField: "totalEnergyGj",
      unit: "GJ",
      scope: null,
      autoCalc: true,
    },
    {
      id: "P6-E5",
      indicator: "Energy intensity per rupee of turnover",
      description: "Total energy consumed / Turnover in ₹.",
      dataField: "energyIntensity",
      unit: "GJ / ₹ Cr",
      scope: null,
      autoCalc: false,
      requiresManual: ["annualTurnover"],
    },
    {
      id: "P6-E6",
      indicator: "Scope 1 GHG Emissions (tCO₂e)",
      description: "Direct emissions from company-owned/controlled sources.",
      dataField: "scope1Tonnes",
      unit: "tCO₂e",
      scope: 1,
      autoCalc: true,
    },
    {
      id: "P6-E7",
      indicator: "Scope 2 GHG Emissions (tCO₂e)",
      description: "Indirect emissions from purchased electricity, heating, cooling.",
      dataField: "scope2Tonnes",
      unit: "tCO₂e",
      scope: 2,
      autoCalc: true,
    },
    {
      id: "P6-E8",
      indicator: "Total Scope 1 and 2 emissions (tCO₂e)",
      description: "Sum of Scope 1 and Scope 2 emissions.",
      dataField: "scope12Total",
      unit: "tCO₂e",
      scope: null,
      autoCalc: true,
    },
    {
      id: "P6-E9",
      indicator: "Total Scope 1 and 2 intensity (tCO₂e per ₹ Cr turnover)",
      description: "GHG emission intensity per unit of turnover.",
      dataField: "ghgIntensity",
      unit: "tCO₂e / ₹ Cr",
      scope: null,
      autoCalc: false,
      requiresManual: ["annualTurnover"],
    },
    {
      id: "P6-E10",
      indicator: "Does the entity have any project related to reducing GHG emissions?",
      description: "Y/N + details of reduction initiatives and targets.",
      dataField: "reductionProjects",
      unit: "text",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-E11",
      indicator: "Waste generated — Hazardous (MT)",
      description: "Total hazardous waste generated as per Hazardous Waste Rules.",
      dataField: "hazardousWaste",
      unit: "MT",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-E12",
      indicator: "Waste generated — Non-Hazardous (MT)",
      description: "Total non-hazardous waste generated.",
      dataField: "nonHazardousWaste",
      unit: "MT",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-E13",
      indicator: "Total waste recovered through recycling, re-use (MT)",
      description: "Waste diverted from disposal through recycling.",
      dataField: "wasteRecovered",
      unit: "MT",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-E14",
      indicator: "Total water withdrawal (KL)",
      description: "Volume of water withdrawn from all sources.",
      dataField: "waterWithdrawal",
      unit: "KL",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-E15",
      indicator: "Total water consumption (KL)",
      description: "Total water consumed = withdrawal - discharge.",
      dataField: "waterConsumption",
      unit: "KL",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-E16",
      indicator: "Water intensity per rupee of turnover",
      description: "Total water consumption / Turnover.",
      dataField: "waterIntensity",
      unit: "KL / ₹ Cr",
      scope: null,
      autoCalc: false,
      requiresManual: ["annualTurnover"],
    },
    {
      id: "P6-E17",
      indicator: "Details of environmental impact assessments",
      description: "EIA notifications and compliance details.",
      dataField: "eiaDetails",
      unit: "text",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-E18",
      indicator: "Compliance with environmental laws and regulations",
      description: "Any fines, penalties, or non-compliances during the year.",
      dataField: "environmentalCompliance",
      unit: "text",
      scope: null,
      autoCalc: false,
    },
  ],

  leadership: [
    {
      id: "P6-L1",
      indicator: "Scope 3 GHG Emissions (tCO₂e)",
      description: "Emissions from value chain: business travel, employee commuting, purchased goods.",
      dataField: "scope3Tonnes",
      unit: "tCO₂e",
      scope: 3,
      autoCalc: true,
    },
    {
      id: "P6-L2",
      indicator: "Total Scope 3 intensity",
      description: "Scope 3 emissions per unit of turnover.",
      dataField: "scope3Intensity",
      unit: "tCO₂e / ₹ Cr",
      scope: 3,
      autoCalc: false,
      requiresManual: ["annualTurnover"],
    },
    {
      id: "P6-L3",
      indicator: "Life Cycle Assessments (LCA) conducted",
      description: "% of value of products/services with completed LCA.",
      dataField: "lcaPercent",
      unit: "%",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-L4",
      indicator: "Significant direct and indirect environmental impacts",
      description: "Details of significant impacts including biodiversity.",
      dataField: "environmentalImpacts",
      unit: "text",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-L5",
      indicator: "Environmental Management System certification",
      description: "ISO 14001 or equivalent certifications held.",
      dataField: "emsCertification",
      unit: "text",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-L6",
      indicator: "Transition to circular economy",
      description: "Details of waste-to-value or circular economy initiatives.",
      dataField: "circularEconomy",
      unit: "text",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-L7",
      indicator: "Water discharge and Zero Liquid Discharge (ZLD)",
      description: "Details of water treatment, recycling, and ZLD adoption.",
      dataField: "waterDischarge",
      unit: "KL",
      scope: null,
      autoCalc: false,
    },
    {
      id: "P6-L8",
      indicator: "Air emissions other than GHG",
      description: "NOx, SOx, PM, VOC, and other non-GHG air emissions.",
      dataField: "airEmissions",
      unit: "MT",
      scope: null,
      autoCalc: false,
    },
  ],
};

/**
 * Calculate auto-fillable BRSR indicator values from activity data.
 * @param {Array} activities - All activities for the reporting period
 * @returns {Object} - Filled indicator values
 */
function calculateBrsrValues(activities) {
  let scope1Kg = 0, scope2Kg = 0, scope3Kg = 0;
  let electricityKwh = 0;
  let travelKm = 0;

  activities.forEach(a => {
    const kg = a.carbonKg || 0;
    const scope = a.scope || 3;
    
    if (scope === 1) scope1Kg += kg;
    else if (scope === 2) scope2Kg += kg;
    else scope3Kg += kg;

    if (a.type === "electricity") {
      electricityKwh += a.parsedData?.electricity_kwh || 0;
    }
    if (a.type === "travel") {
      travelKm += a.parsedData?.distance_km || 0;
    }
  });

  // Convert
  const scope1Tonnes = scope1Kg / 1000;
  const scope2Tonnes = scope2Kg / 1000;
  const scope3Tonnes = scope3Kg / 1000;
  const electricityMwh = electricityKwh / 1000;
  // Approximate fuel from Scope 1: assuming avg 2.68 kg CO2/litre diesel → ~0.00085 MT/kg CO2
  const fuelMt = (scope1Kg * 0.00085);
  // Energy in GJ: electricity (1 kWh = 0.0036 GJ) + fuel estimated
  const totalEnergyGj = (electricityKwh * 0.0036) + (fuelMt * 45.5); // diesel ~45.5 GJ/MT

  return {
    electricityMwh: Math.round(electricityMwh * 100) / 100,
    fuelMt: Math.round(fuelMt * 100) / 100,
    totalEnergyGj: Math.round(totalEnergyGj * 100) / 100,
    scope1Tonnes: Math.round(scope1Tonnes * 100) / 100,
    scope2Tonnes: Math.round(scope2Tonnes * 100) / 100,
    scope12Total: Math.round((scope1Tonnes + scope2Tonnes) * 100) / 100,
    scope3Tonnes: Math.round(scope3Tonnes * 100) / 100,
    totalKg: scope1Kg + scope2Kg + scope3Kg,
    totalTonnes: Math.round((scope1Tonnes + scope2Tonnes + scope3Tonnes) * 100) / 100,
    totalActivities: activities.length,
    travelKm: Math.round(travelKm),
    electricityKwh: Math.round(electricityKwh),
  };
}

/**
 * Get readiness score — how many auto-calculable indicators have data.
 */
function getReadinessScore(values) {
  const allIndicators = [...BRSR_PRINCIPLE_6.essential, ...BRSR_PRINCIPLE_6.leadership];
  const autoIndicators = allIndicators.filter(i => i.autoCalc);
  const manualIndicators = allIndicators.filter(i => !i.autoCalc);
  
  let autoFilled = 0;
  autoIndicators.forEach(ind => {
    const val = values[ind.dataField];
    if (val !== undefined && val !== null && val !== 0 && val !== "") autoFilled++;
  });

  return {
    totalIndicators: allIndicators.length,
    essentialCount: BRSR_PRINCIPLE_6.essential.length,
    leadershipCount: BRSR_PRINCIPLE_6.leadership.length,
    autoCalcCount: autoIndicators.length,
    manualCount: manualIndicators.length,
    autoFilled,
    readinessPercent: Math.round((autoFilled / autoIndicators.length) * 100),
    missingManual: manualIndicators.map(i => ({
      id: i.id,
      indicator: i.indicator,
      description: i.description,
    })),
  };
}

module.exports = {
  BRSR_PRINCIPLE_6,
  calculateBrsrValues,
  getReadinessScore,
};
