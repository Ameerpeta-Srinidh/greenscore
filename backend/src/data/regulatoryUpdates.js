/**
 * Curated ESG Regulatory Updates for Indian Companies
 * These would ideally come from an API or CMS; hardcoded for MVP.
 */

const REGULATORY_UPDATES = [
  {
    id: "ru-1",
    date: "2026-03-15",
    title: "SEBI Expands BRSR Core Assurance to Top 250 Companies",
    summary: "Starting FY 2025-26, BRSR Core reasonable assurance is mandatory for the top 250 listed companies by market capitalization. This includes key ESG KPIs such as GHG emissions, energy consumption, water usage, and waste management.",
    source: "SEBI Circular No. SEBI/HO/CFD/CMD-2/P/CIR/2023/122",
    category: "compliance",
    impact: "high",
    actionRequired: "Ensure Scope 1/2 emissions data is third-party verified before filing.",
  },
  {
    id: "ru-2",
    date: "2026-02-20",
    title: "Value Chain ESG Disclosures Now Mandatory from FY 2025-26",
    summary: "Listed companies must now report ESG disclosures for significant value chain partners (those contributing 2%+ of procurement or sales). This affects suppliers and vendors of top 250 companies.",
    source: "SEBI Master Circular SEBI/HO/CFD/CMD-2/P/CIR/2023/122",
    category: "compliance",
    impact: "high",
    actionRequired: "Identify top value chain partners and begin data collection. SMEs supplying to listed companies should prepare BRSR-compatible disclosures.",
  },
  {
    id: "ru-3",
    date: "2026-01-10",
    title: "CEA Updates Grid Emission Factors for FY 2025-26",
    summary: "The Central Electricity Authority has published updated CO₂ baseline emission factors for Indian power grid. National weighted average: 0.716 kg CO₂/kWh (down from 0.72). State-wise factors also updated.",
    source: "CEA CO₂ Baseline Database v19, January 2026",
    category: "data-update",
    impact: "medium",
    actionRequired: "GreenScore+ has automatically updated emission factors. No action needed.",
  },
  {
    id: "ru-4",
    date: "2025-12-05",
    title: "MCA Notifies Extended Producer Responsibility Rules Update",
    summary: "Ministry of Corporate Affairs updated EPR rules for plastic packaging, e-waste, and battery waste. Companies must register on EPR portal and submit quarterly returns.",
    source: "MCA Notification S.O. 4892(E)",
    category: "waste",
    impact: "medium",
    actionRequired: "Track waste generation data in GreenScore+ to prepare EPR returns.",
  },
  {
    id: "ru-5",
    date: "2025-11-18",
    title: "BEE Announces PAT Cycle VII Targets",
    summary: "Bureau of Energy Efficiency announced Perform, Achieve and Trade (PAT) Cycle VII targets for designated consumers in 13 industrial sectors. New baseline period: FY 2024-25.",
    source: "BEE Notification, November 2025",
    category: "energy",
    impact: "medium",
    actionRequired: "Track energy consumption by source to assess PAT compliance readiness.",
  },
  {
    id: "ru-6",
    date: "2025-10-01",
    title: "GreenCo Rating System Update — New Criteria for SMEs",
    summary: "CII-Sohrabji Godrej Green Business Centre released updated GreenCo rating criteria with simplified assessment for SMEs. Now includes digital carbon tracking as an accepted methodology.",
    source: "CII GreenCo Rating System v5.0",
    category: "certification",
    impact: "low",
    actionRequired: "GreenScore+ reports can be submitted as supporting evidence for GreenCo assessment.",
  },
  {
    id: "ru-7",
    date: "2025-09-12",
    title: "ISO 14064-1:2018 — Quantification of GHG Emissions",
    summary: "ISO has updated guidance on organizational-level GHG emission quantification. Emphasis on operational boundary approach and inclusion of Scope 3 categories.",
    source: "ISO 14064-1:2018 Amendment 2025",
    category: "standards",
    impact: "low",
    actionRequired: "GreenScore+ scope classification already follows GHG Protocol/ISO 14064 methodology.",
  },
];

function getRegulatoryUpdates(limit = 10) {
  return REGULATORY_UPDATES
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

function getUpdatesByCategory(category) {
  return REGULATORY_UPDATES.filter(u => u.category === category);
}

function getHighImpactUpdates() {
  return REGULATORY_UPDATES.filter(u => u.impact === "high");
}

module.exports = { REGULATORY_UPDATES, getRegulatoryUpdates, getUpdatesByCategory, getHighImpactUpdates };
