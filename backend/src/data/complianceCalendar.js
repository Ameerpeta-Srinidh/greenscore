/**
 * Indian ESG Compliance Calendar
 * SEBI BRSR filing deadlines + related regulatory dates
 */

function getComplianceCalendar(financialYear) {
  const fy = financialYear || getCurrentFY();
  const [startYear, endYear] = fy.split("-").map(Number);

  return [
    {
      id: "brsr-filing",
      title: "BRSR Annual Filing",
      description: "Submit BRSR as part of Annual Report to stock exchange.",
      deadline: `${endYear}-05-30`,
      category: "filing",
      mandatory: true,
      applicableTo: "Top 1000 listed companies by market cap",
      sebiCircular: "SEBI/HO/CFD/CMD-2/P/CIR/2021/562",
      status: getDeadlineStatus(`${endYear}-05-30`),
    },
    {
      id: "brsr-core-assurance",
      title: "BRSR Core — Third-Party Assurance",
      description: "Mandatory reasonable assurance on BRSR Core KPIs.",
      deadline: `${endYear}-05-30`,
      category: "assurance",
      mandatory: true,
      applicableTo: getAssuranceApplicability(endYear),
      sebiCircular: "SEBI/HO/CFD/CMD-2/P/CIR/2023/122",
      status: getDeadlineStatus(`${endYear}-05-30`),
    },
    {
      id: "value-chain-disclosure",
      title: "Value Chain ESG Disclosure",
      description: "ESG disclosures for top value chain partners (2%+ procurement/sales).",
      deadline: `${endYear}-05-30`,
      category: "disclosure",
      mandatory: endYear >= 2026,
      applicableTo: "Top 250 listed companies and their value chain partners",
      sebiCircular: "SEBI/HO/CFD/CMD-2/P/CIR/2023/122",
      status: getDeadlineStatus(`${endYear}-05-30`),
    },
    {
      id: "board-esg-review",
      title: "Board ESG Review",
      description: "Annual board-level review of ESG policies and performance.",
      deadline: `${endYear}-03-31`,
      category: "governance",
      mandatory: true,
      applicableTo: "All listed companies",
      status: getDeadlineStatus(`${endYear}-03-31`),
    },
    {
      id: "quarterly-data-collection",
      title: `Q${getQuarter()} Data Collection Deadline`,
      description: "Internal deadline to collect and verify quarterly emission data.",
      deadline: getQuarterEndDate(),
      category: "internal",
      mandatory: false,
      applicableTo: "Recommended for all GreenScore+ users",
      status: getDeadlineStatus(getQuarterEndDate()),
    },
    {
      id: "cea-emission-factors",
      title: "CEA Emission Factor Update",
      description: "Central Electricity Authority publishes updated grid emission factors.",
      deadline: `${endYear}-01-31`,
      category: "data-update",
      mandatory: false,
      applicableTo: "All entities reporting Scope 2 emissions",
      status: getDeadlineStatus(`${endYear}-01-31`),
    },
  ];
}

function getCurrentFY() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 4) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

function getAssuranceApplicability(endYear) {
  if (endYear <= 2024) return "Top 150 listed companies";
  if (endYear <= 2025) return "Top 150 listed companies";
  if (endYear <= 2026) return "Top 250 listed companies";
  if (endYear <= 2027) return "Top 500 listed companies";
  return "Top 1000 listed companies";
}

function getDeadlineStatus(deadline) {
  const now = new Date();
  const dl = new Date(deadline);
  const daysLeft = Math.ceil((dl - now) / 86400000);
  
  if (daysLeft < 0) return { label: "Overdue", color: "#ef4444", daysLeft };
  if (daysLeft <= 30) return { label: "Urgent", color: "#f59e0b", daysLeft };
  if (daysLeft <= 90) return { label: "Upcoming", color: "#6366f1", daysLeft };
  return { label: "Planned", color: "#10b981", daysLeft };
}

function getQuarter() {
  const m = new Date().getMonth();
  if (m < 3) return 4;
  if (m < 6) return 1;
  if (m < 9) return 2;
  return 3;
}

function getQuarterEndDate() {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  if (m < 3) return `${y}-03-31`;
  if (m < 6) return `${y}-06-30`;
  if (m < 9) return `${y}-09-30`;
  return `${y}-12-31`;
}

module.exports = { getComplianceCalendar, getCurrentFY };
