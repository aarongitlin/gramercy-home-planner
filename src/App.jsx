import { useState, useMemo, useEffect, useCallback } from "react";

const PRESETS = {
  conservative: {
    label: "Conservative",
    emoji: "🛡️",
    ids: ["foundation", "bedroom", "fixtures"],
    description: "Must-dos only. Foundation, bedroom expansion, fixtures.",
    tier: 0,
  },
  balanced: {
    label: "Balanced",
    emoji: "⚖️",
    ids: ["foundation", "bedroom", "backyard", "kitchen", "fixtures"],
    description: "All essentials + quality-of-life upgrades. No new construction.",
    tier: 0,
  },
  gobig: {
    label: "Go Big",
    emoji: "🚀",
    ids: ["foundation", "bedroom", "adu", "backyard", "kitchen", "fixtures"],
    description: "Everything including the ADU. Transforms the property.",
    tier: 1,
  },
};

const PROJECTS = [
  {
    id: "foundation",
    name: "Foundation + New Floors",
    category: "Structural",
    priority: "Required",
    description: "Interior foundation piers + rip up existing floors + install new quality flooring. This is non-negotiable structural work.",
    costLow: 28000,
    costHigh: 42000,
    costBreakdown: "Foundation piers: $15-20k | New flooring (~1,000sqft): $10-18k | Subfloor repair: $3-4k",
    timelineMonths: 2,
    disruptionLevel: 3,
    disruptionNote: "Must vacate for 2-4 weeks during foundation work. Floors done after.",
    housingCostEstimate: 3500,
    valueAdd: 0.9,
    qualityOfLife: 4,
    urgency: "high",
    recommendedYear: 2026,
    dependencies: [],
    babyRelevant: true,
    babyNote: "Must be done BEFORE baby arrives. Cracking floors + construction dust are not baby-compatible.",
  },
  {
    id: "bedroom",
    name: "Bedroom Expansion + Master Closet",
    category: "Interior",
    priority: "High",
    description: "Reconfigure the shared bathroom to carve out a proper master closet and expand bedroom square footage.",
    costLow: 18000,
    costHigh: 35000,
    costBreakdown: "Demo + framing: $5-8k | Plumbing relocation: $3-6k | New closet build: $5-10k | Bathroom reconfig: $5-11k",
    timelineMonths: 1.5,
    disruptionLevel: 2,
    disruptionNote: "Can likely stay in home (use other bathroom). Noisy for 3-6 weeks.",
    housingCostEstimate: 0,
    valueAdd: 0.7,
    qualityOfLife: 4,
    urgency: "medium",
    recommendedYear: 2026,
    dependencies: ["foundation"],
    babyRelevant: true,
    babyNote: "More closet/storage space is critical with a child. Best done before baby.",
  },
  {
    id: "adu",
    name: "Backyard ADU (Detached)",
    category: "New Construction",
    priority: "Optional",
    description: "Build a detached ADU in the backyard based on the existing architectural plans (~400-450sqft with loft). Personal use: office, guest suite, future flex space.",
    costLow: 180000,
    costHigh: 280000,
    costBreakdown: "Design/permits: $15-25k | Site prep/utilities: $20-35k | Construction ($350-500/sqft): $140-200k | Contingency: $5-20k",
    timelineMonths: 8,
    disruptionLevel: 2,
    disruptionNote: "Construction is in backyard — you can stay in the house. Noise and access disruption for months.",
    housingCostEstimate: 0,
    valueAdd: 1.3,
    qualityOfLife: 5,
    urgency: "low",
    recommendedYear: 2028,
    dependencies: [],
    babyRelevant: true,
    babyNote: "Huge quality of life upgrade with a child — dedicated office lets you WFH without losing a bedroom.",
    mutuallyExclusive: "extension",
  },
  {
    id: "extension",
    name: "House Extension (~250sqft)",
    category: "New Construction",
    priority: "Optional",
    description: "Extend the main house toward the backyard by ~250sqft. Could add a third bedroom or expand kitchen/living area.",
    costLow: 90000,
    costHigh: 165000,
    costBreakdown: "Design/engineering/permits: $10-20k | Foundation + framing: $30-50k | Interior finish: $30-55k | Roof tie-in: $10-20k | Contingency: $10-20k",
    timelineMonths: 5,
    disruptionLevel: 3,
    disruptionNote: "Major disruption — back of house is open during construction. Likely need to vacate for 2-4 weeks.",
    housingCostEstimate: 3000,
    valueAdd: 1.1,
    qualityOfLife: 4,
    urgency: "low",
    recommendedYear: 2028,
    dependencies: ["foundation"],
    babyRelevant: true,
    babyNote: "Extra bedroom directly solves the space problem, but less flexible than an ADU long-term.",
    mutuallyExclusive: "adu",
  },
  {
    id: "backyard",
    name: "Backyard Privacy + Coziness",
    category: "Exterior",
    priority: "Medium",
    description: "Taller fencing, strategic plantings, pergola or shade structure, string lights, possibly a fire pit area. Make the outdoor space feel like a room.",
    costLow: 8000,
    costHigh: 20000,
    costBreakdown: "Privacy plantings/screening: $2-5k | Pergola or shade structure: $3-8k | Lighting + fire pit: $2-5k | Misc: $1-2k",
    timelineMonths: 1,
    disruptionLevel: 1,
    disruptionNote: "Minimal disruption. Outdoor work only.",
    housingCostEstimate: 0,
    valueAdd: 0.5,
    qualityOfLife: 3,
    urgency: "low",
    recommendedYear: 2027,
    dependencies: [],
    babyRelevant: false,
    babyNote: "",
  },
  {
    id: "kitchen",
    name: "Kitchen/Living Room Refresh",
    category: "Interior",
    priority: "Medium",
    description: "Add storage (built-ins, pantry optimization), improve layout flow, create cozier entertaining zones. Not a full gut — more of a strategic redesign.",
    costLow: 12000,
    costHigh: 35000,
    costBreakdown: "Built-in storage/shelving: $5-12k | Layout tweaks: $3-8k | Lighting + fixtures: $2-5k | Paint/finishes: $2-5k | Island mods: $0-5k",
    timelineMonths: 1.5,
    disruptionLevel: 2,
    disruptionNote: "Kitchen may be partially unusable for 1-2 weeks. Lots of takeout.",
    housingCostEstimate: 500,
    valueAdd: 0.7,
    qualityOfLife: 3,
    urgency: "low",
    recommendedYear: 2027,
    dependencies: ["foundation"],
    babyRelevant: true,
    babyNote: "Better storage = less clutter = saner home with a baby. But not urgent pre-baby.",
  },
  {
    id: "fixtures",
    name: "Fixtures, Windows & Lighting",
    category: "Interior",
    priority: "Low",
    description: "Update bathroom fixtures, replace older windows for efficiency and aesthetics, improve lighting throughout the house.",
    costLow: 6000,
    costHigh: 18000,
    costBreakdown: "Bathroom fixtures: $2-5k | Window replacements (select): $2-6k | Lighting upgrades: $2-5k | Electrical work: $0-2k",
    timelineMonths: 1,
    disruptionLevel: 1,
    disruptionNote: "Low disruption. Can be done room by room while living in the house.",
    housingCostEstimate: 0,
    valueAdd: 0.5,
    qualityOfLife: 2,
    urgency: "low",
    recommendedYear: 2029,
    dependencies: [],
    babyRelevant: false,
    babyNote: "",
  },
];

const MOVE_SCENARIO = {
  currentValueLow: 975000,
  currentValueHigh: 1050000,
  mortgageRemaining: 720000,
  sellingCosts: 0.07,
  targetHomeCost: 1200000,
  newMortgageRate: 0.065,
  newDownPaymentPct: 0.20,
};

function formatCurrency(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

function formatRange(low, high) {
  return `${formatCurrency(low)} – ${formatCurrency(high)}`;
}

const DisruptionDots = ({ level }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className={`w-2.5 h-2.5 rounded-full ${
          i <= level ? "bg-amber-500" : "bg-gray-200"
        }`}
      />
    ))}
  </div>
);

const ValueDots = ({ level }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className={`w-2.5 h-2.5 rounded-full ${
          i <= level ? "bg-emerald-500" : "bg-gray-200"
        }`}
      />
    ))}
  </div>
);

const PriorityBadge = ({ priority }) => {
  const colors = {
    Required: "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Medium: "bg-blue-100 text-blue-800",
    Low: "bg-gray-100 text-gray-600",
    Optional: "bg-purple-100 text-purple-800",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[priority] || colors.Low}`}>
      {priority}
    </span>
  );
};

const YearBadge = ({ year }) => (
  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
    {year}
  </span>
);

function ProjectCard({ project, selected, onToggle, disabled, disabledReason }) {
  const [expanded, setExpanded] = useState(false);
  const midCost = (project.costLow + project.costHigh) / 2;

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        selected
          ? "border-blue-400 bg-blue-50 shadow-sm"
          : disabled
          ? "border-gray-200 bg-gray-50 opacity-60"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => !disabled && onToggle(project.id)}
          disabled={disabled && !selected}
          className={`mt-1 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            selected
              ? "bg-blue-500 border-blue-500 text-white"
              : disabled
              ? "border-gray-300 bg-gray-100 cursor-not-allowed"
              : "border-gray-300 hover:border-blue-400 cursor-pointer"
          }`}
        >
          {selected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
            <PriorityBadge priority={project.priority} />
            <YearBadge year={project.recommendedYear} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{project.description}</p>
          {disabled && disabledReason && (
            <p className="text-xs text-red-500 mt-1 italic">{disabledReason}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
            <span className="font-medium text-gray-900">{formatRange(project.costLow, project.costHigh)}</span>
            <span>{project.timelineMonths} mo</span>
            <span className="flex items-center gap-1">
              Disruption: <DisruptionDots level={project.disruptionLevel} />
            </span>
            <span className="flex items-center gap-1">
              QoL: <ValueDots level={project.qualityOfLife} />
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-2"
          >
            {expanded ? "Less detail ▲" : "More detail ▼"}
          </button>
          {expanded && (
            <div className="mt-2 text-xs space-y-1.5 bg-white rounded p-3 border border-gray-100">
              <div>
                <span className="font-medium text-gray-700">Cost breakdown:</span>{" "}
                <span className="text-gray-600">{project.costBreakdown}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Disruption:</span>{" "}
                <span className="text-gray-600">{project.disruptionNote}</span>
              </div>
              {project.housingCostEstimate > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Est. temp housing cost:</span>{" "}
                  <span className="text-gray-600">~{formatCurrency(project.housingCostEstimate)}</span>
                </div>
              )}
              {project.dependencies.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Should be done after:</span>{" "}
                  <span className="text-gray-600">
                    {project.dependencies.map((d) => PROJECTS.find((p) => p.id === d)?.name).join(", ")}
                  </span>
                </div>
              )}
              {project.babyRelevant && (
                <div className="bg-pink-50 rounded p-2 mt-1">
                  <span className="font-medium text-pink-800">👶 Baby planning note:</span>{" "}
                  <span className="text-pink-700">{project.babyNote}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Value recovery:</span>{" "}
                <span className="text-gray-600">
                  ~{Math.round(project.valueAdd * 100)}% of cost adds to home value
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineView({ selectedProjects }) {
  const years = [2026, 2027, 2028, 2029, 2030];
  const projectsByYear = {};
  years.forEach((y) => {
    projectsByYear[y] = selectedProjects.filter((p) => p.recommendedYear === y);
  });

  return (
    <div className="space-y-2">
      {years.map((year) => {
        const projs = projectsByYear[year];
        const yearCostLow = projs.reduce((s, p) => s + p.costLow, 0);
        const yearCostHigh = projs.reduce((s, p) => s + p.costHigh, 0);
        return (
          <div key={year} className="flex items-start gap-3">
            <div className="w-12 font-bold text-sm text-gray-700 pt-1 flex-shrink-0">{year}</div>
            <div className="flex-1">
              {projs.length === 0 ? (
                <div className="text-xs text-gray-400 py-1">No projects planned</div>
              ) : (
                <div className="space-y-1">
                  {projs.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 bg-blue-50 rounded px-2 py-1">
                      <div
                        className="h-2 rounded-full bg-blue-400"
                        style={{ width: `${Math.min(100, (p.timelineMonths / 12) * 100)}%`, minWidth: 20 }}
                      />
                      <span className="text-xs text-gray-800 whitespace-nowrap">{p.name}</span>
                      <span className="text-xs text-gray-500 ml-auto whitespace-nowrap">
                        {formatRange(p.costLow, p.costHigh)}
                      </span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500 text-right">
                    Year total: {formatRange(yearCostLow, yearCostHigh)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MoveComparison({ selectedProjects, costEstimate }) {
  const mv = MOVE_SCENARIO;
  const currentValueMid = (mv.currentValueLow + mv.currentValueHigh) / 2;
  const equityNow = currentValueMid - mv.mortgageRemaining;
  const sellingNet = currentValueMid * (1 - mv.sellingCosts) - mv.mortgageRemaining;
  const downPayment = mv.targetHomeCost * mv.newDownPaymentPct;
  const cashNeeded = downPayment - sellingNet;
  const newLoanAmt = mv.targetHomeCost - downPayment;
  const monthlyNew = (newLoanAmt * (mv.newMortgageRate / 12)) / (1 - Math.pow(1 + mv.newMortgageRate / 12, -360));
  const monthlyIncrease = monthlyNew - 3900;
  const improveTotalMid = costEstimate;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border rounded-lg p-4 bg-emerald-50 border-emerald-200">
        <h4 className="font-semibold text-emerald-900 text-sm mb-2">Stay + Improve</h4>
        <div className="space-y-1.5 text-xs text-emerald-800">
          <div className="flex justify-between">
            <span>Selected projects cost (mid)</span>
            <span className="font-medium">{formatCurrency(improveTotalMid)}</span>
          </div>
          <div className="flex justify-between">
            <span>Monthly mortgage (unchanged)</span>
            <span className="font-medium">$3,900</span>
          </div>
          <div className="flex justify-between">
            <span>Current equity</span>
            <span className="font-medium">~{formatCurrency(equityNow)}</span>
          </div>
          <div className="flex justify-between">
            <span>Keep 2.9% rate</span>
            <span className="font-medium text-emerald-600">Yes ✓</span>
          </div>
          <div className="flex justify-between">
            <span>Est. value after improvements</span>
            <span className="font-medium">~{formatCurrency(currentValueMid + improveTotalMid * 0.7)}</span>
          </div>
        </div>
      </div>
      <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
        <h4 className="font-semibold text-orange-900 text-sm mb-2">Move to ~$1.2M Home</h4>
        <div className="space-y-1.5 text-xs text-orange-800">
          <div className="flex justify-between">
            <span>Sale proceeds (after costs)</span>
            <span className="font-medium">~{formatCurrency(sellingNet)}</span>
          </div>
          <div className="flex justify-between">
            <span>Down payment needed (20%)</span>
            <span className="font-medium">{formatCurrency(downPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span>Additional cash needed</span>
            <span className="font-medium text-orange-600">{cashNeeded > 0 ? formatCurrency(cashNeeded) : "$0"}</span>
          </div>
          <div className="flex justify-between">
            <span>New monthly payment (est.)</span>
            <span className="font-medium">~{formatCurrency(monthlyNew)}/mo</span>
          </div>
          <div className="flex justify-between">
            <span>Monthly increase</span>
            <span className="font-medium text-red-600">+{formatCurrency(monthlyIncrease)}/mo</span>
          </div>
          <div className="flex justify-between">
            <span>New mortgage rate</span>
            <span className="font-medium text-orange-600">~6.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const FINANCIAL_PROFILE = {
  ages: { aaron: 41, edina: 42 },
  retirement401k: 700000,
  savings: 60000,
  moneyMarket: 20000,
  etfBonds: 40000,
  googleVested: 450000,
  googleUnvested: 800000,
  unvestedYears: 4,
  homeEquity: 280000,
  hhi: 450000,
  monthlyMortgage: 3900,
  homeValue: 1012500,
};

const TIERS = [
  {
    label: "$200k",
    amount: 200000,
    color: "emerald",
    projects: "Foundation + floors, bedroom expansion, backyard privacy, kitchen refresh, fixtures",
    description: "Covers all the essentials plus meaningful quality-of-life upgrades. No new construction.",
    resaleValueAdd: 140000,
    resaleNote: "~70% cost recovery. Foundation work prevents value loss; the rest adds modest value.",
    feasibility: "Easily affordable from savings + 1 year of RSU vesting. No need to touch 401k or sell Google stock.",
    fundingSource: "Cash savings ($60k) + money market ($20k) + partial RSU vest (~$120k over 1-2 years)",
  },
  {
    label: "$350k",
    amount: 350000,
    color: "blue",
    projects: "Everything in $200k tier PLUS the ADU (~$230k mid-range). This is the 'go big on space' option.",
    description: "Transforms the property: fixes structural issues, expands the main house, AND adds a detached ADU for office/guest/flex use.",
    resaleValueAdd: 350000,
    resaleNote: "ADUs in LA add $200-400k to property value. At this tier you could roughly break even or come out ahead on resale.",
    feasibility: "Requires selling some Google stock or using RSU vests over 2-3 years. Still very doable without touching retirement.",
    fundingSource: "Cash + money market ($80k) + Google stock sales or RSU vests (~$270k over 2-3 years)",
  },
  {
    label: "$500k",
    amount: 500000,
    color: "purple",
    projects: "Full ADU build (high-end spec) + all interior improvements + premium finishes + possible house extension too.",
    description: "The 'dream scenario' — max out the property's potential. High-end ADU, premium floors, full kitchen remodel, everything.",
    resaleValueAdd: 425000,
    resaleNote: "Diminishing returns at this level. You'd over-improve relative to neighborhood comps. ROI drops to ~85%.",
    feasibility: "Requires significant stock sales. Possible but starts competing with retirement savings goals and diversification.",
    fundingSource: "Cash ($80k) + substantial Google stock sales (~$420k). Concentrates risk — you'd be very Google-heavy.",
  },
];

function InvestmentAnalysis({ initialTier = 1, onTierChange }) {
  const [selectedTier, setSelectedTier] = useState(initialTier);
  const handleTierChange = (i) => {
    setSelectedTier(i);
    if (onTierChange) onTierChange(i);
  };
  const fp = FINANCIAL_PROFILE;
  const tier = TIERS[selectedTier];

  const totalLiquid = fp.savings + fp.moneyMarket + fp.etfBonds + fp.googleVested;
  const totalNetWorth = totalLiquid + fp.retirement401k + fp.homeEquity;
  const totalWithUnvested = totalNetWorth + fp.googleUnvested;

  const retirementTarget65 = 3500000;
  const yearsToRetirement = 65 - fp.ages.aaron;
  const annual401kGrowth = 0.07;
  const annual401kContrib = 46000;
  const projected401k = Array.from({ length: yearsToRetirement }, (_, i) => i).reduce(
    (bal) => (bal + annual401kContrib) * (1 + annual401kGrowth),
    fp.retirement401k
  );

  const stockReturn7yr = 0.07;
  const stockReturn10yr = 0.03;
  const hysa = 0.045;

  const opportunityCost5yr = (amt) => {
    const stockGrowth = amt * Math.pow(1 + stockReturn7yr, 5) - amt;
    const hysaGrowth = amt * Math.pow(1 + hysa, 5) - amt;
    return { stockGrowth: Math.round(stockGrowth), hysaGrowth: Math.round(hysaGrowth) };
  };

  const opp = opportunityCost5yr(tier.amount);
  const laAppreciation5yr = 0.15;
  const homeValueAfterAppreciation = Math.round(fp.homeValue * (1 + laAppreciation5yr));
  const homeValueWithImprovements = Math.round(homeValueAfterAppreciation + tier.resaleValueAdd);
  const homeOnlyGain = homeValueAfterAppreciation - fp.homeValue;
  const homeImprovementGain = tier.resaleValueAdd;
  const totalHomeGain = homeOnlyGain + homeImprovementGain;

  const spendPctNetWorth = ((tier.amount / totalNetWorth) * 100).toFixed(0);
  const spendPctLiquid = ((tier.amount / totalLiquid) * 100).toFixed(0);
  const postSpendLiquid = totalLiquid - tier.amount;

  const emergencyMonths = Math.round(postSpendLiquid / ((fp.hhi / 12) * 0.6));

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-sm text-gray-900 mb-1">Investment Spending Analysis</h3>
        <p className="text-xs text-gray-500 mb-4">
          Compare three spending levels across resale ROI, opportunity cost, and financial health. Personalized to your household.
        </p>

        <div className="flex gap-2 mb-4">
          {TIERS.map((t, i) => (
            <button
              key={i}
              onClick={() => handleTierChange(i)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all border-2 ${
                selectedTier === i
                  ? "border-gray-800 bg-gray-800 text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="text-xs font-semibold text-gray-700 mb-1">What {tier.label} buys you</div>
          <p className="text-xs text-gray-600">{tier.projects}</p>
          <p className="text-xs text-gray-500 mt-1 italic">{tier.description}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h4 className="font-semibold text-sm text-gray-900 mb-3">Resale Value Impact</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Current home value</span>
            <span className="font-medium">{formatCurrency(fp.homeValue)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Est. value in 5yr (market only, ~3%/yr)</span>
            <span className="font-medium">{formatCurrency(homeValueAfterAppreciation)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Value added by improvements</span>
            <span className="font-medium text-emerald-700">+{formatCurrency(tier.resaleValueAdd)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-xs">
            <span className="font-semibold text-gray-800">Est. value in 5yr (improved)</span>
            <span className="font-bold text-emerald-700">{formatCurrency(homeValueWithImprovements)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Cost recovery ratio</span>
            <span className="font-medium">{Math.round((tier.resaleValueAdd / tier.amount) * 100)}%</span>
          </div>
          <div className="bg-gray-50 rounded p-2 mt-1">
            <p className="text-xs text-gray-600">{tier.resaleNote}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h4 className="font-semibold text-sm text-gray-900 mb-3">Opportunity Cost: What If You Invested Instead?</h4>
        <p className="text-xs text-gray-500 mb-3">
          If you invested {tier.label} instead of spending on home improvements, here's what 5 years of growth could look like.
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-semibold text-indigo-900">S&P 500 / Broad Market</div>
                <div className="text-xs text-indigo-700 mt-0.5">Assuming ~7% annual return (near-term consensus)</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-indigo-900">+{formatCurrency(opp.stockGrowth)}</div>
                <div className="text-xs text-indigo-600">in 5 years</div>
              </div>
            </div>
          </div>
          <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-semibold text-teal-900">High-Yield Savings / Treasuries</div>
                <div className="text-xs text-teal-700 mt-0.5">Assuming ~4.5% (current HYSA rates)</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-teal-900">+{formatCurrency(opp.hysaGrowth)}</div>
                <div className="text-xs text-teal-600">in 5 years</div>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-semibold text-amber-900">Home Improvement (this plan)</div>
                <div className="text-xs text-amber-700 mt-0.5">Resale value recovery + quality of life (unquantified)</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-900">+{formatCurrency(tier.resaleValueAdd)}</div>
                <div className="text-xs text-amber-600">value added</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded p-3 mt-3">
          <p className="text-xs text-gray-700">
            <span className="font-semibold">The nuance:</span> Stock market returns are pure financial gain but don't improve your daily life. Home improvements at the {tier.label} level recover ~{Math.round((tier.resaleValueAdd / tier.amount) * 100)}% of cost in resale value, meaning you "lose" ~{formatCurrency(tier.amount - tier.resaleValueAdd)} vs. keeping the cash — but you get to <span className="italic">live in</span> the improvement every day. With a baby coming, the quality-of-life value is real and hard to put a dollar figure on.
          </p>
          {tier.amount >= 350000 && (
            <p className="text-xs text-gray-700 mt-2">
              <span className="font-semibold">ADU-specific note:</span> If you ever rent the ADU ($2,000-3,000/mo in this area), it generates ~$24-36k/year in income — a 10-15% annual cash return on the ADU portion, which beats both the stock market and HYSA on a cash flow basis.
            </p>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h4 className="font-semibold text-sm text-gray-900 mb-3">Your Financial Health at {tier.label} Spend</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Spend as % of liquid assets ({formatCurrency(totalLiquid)})</span>
              <span className={`font-semibold ${Number(spendPctLiquid) > 80 ? "text-red-600" : Number(spendPctLiquid) > 50 ? "text-amber-600" : "text-emerald-600"}`}>
                {spendPctLiquid}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-full rounded-full ${Number(spendPctLiquid) > 80 ? "bg-red-400" : Number(spendPctLiquid) > 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                style={{ width: `${Math.min(100, Number(spendPctLiquid))}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Spend as % of net worth ({formatCurrency(totalNetWorth)})</span>
              <span className={`font-semibold ${Number(spendPctNetWorth) > 40 ? "text-red-600" : Number(spendPctNetWorth) > 25 ? "text-amber-600" : "text-emerald-600"}`}>
                {spendPctNetWorth}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-full rounded-full ${Number(spendPctNetWorth) > 40 ? "bg-red-400" : Number(spendPctNetWorth) > 25 ? "bg-amber-400" : "bg-emerald-400"}`}
                style={{ width: `${Math.min(100, Number(spendPctNetWorth))}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-xs bg-gray-50 rounded p-2">
              <span className="text-gray-500">Remaining liquid after spend</span>
              <div className={`font-medium ${postSpendLiquid < 50000 ? "text-red-700" : "text-gray-800"}`}>
                {postSpendLiquid > 0 ? formatCurrency(postSpendLiquid) : "Need to sell/vest more"}
              </div>
            </div>
            <div className="text-xs bg-gray-50 rounded p-2">
              <span className="text-gray-500">Emergency fund coverage</span>
              <div className={`font-medium ${emergencyMonths < 3 ? "text-red-700" : emergencyMonths < 6 ? "text-amber-700" : "text-emerald-700"}`}>
                {emergencyMonths > 0 ? `~${emergencyMonths} months` : "Depleted"}
              </div>
            </div>
            <div className="text-xs bg-gray-50 rounded p-2">
              <span className="text-gray-500">401k (untouched)</span>
              <div className="font-medium text-emerald-700">{formatCurrency(fp.retirement401k)}</div>
            </div>
            <div className="text-xs bg-gray-50 rounded p-2">
              <span className="text-gray-500">Google unvested (incoming)</span>
              <div className="font-medium text-gray-800">{formatCurrency(fp.googleUnvested)} over 4yr</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs font-semibold text-gray-700 mb-1">How to fund it</div>
            <p className="text-xs text-gray-600">{tier.feasibility}</p>
            <p className="text-xs text-gray-500 mt-1 italic">{tier.fundingSource}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h4 className="font-semibold text-sm text-gray-900 mb-3">Retirement Check (Ages 41 & 42)</h4>
        <div className="space-y-2">
          <div className="bg-emerald-50 rounded p-3">
            <p className="text-xs text-emerald-800">
              <span className="font-semibold">You're in good shape.</span> With $700k in 401k at 41/42, maxing contributions (~$46k/yr combined with catch-up), and assuming 7% growth, you're projected to hit <span className="font-bold">~{formatCurrency(projected401k)}</span> by age 65 — in 401k alone. That exceeds the typical $3.5M target for your income level.
            </p>
          </div>
          <div className="bg-blue-50 rounded p-3">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Google stock concentration risk.</span> You have ~$450k vested + $800k unvested in GOOG. That's a LOT of single-stock exposure (~$1.25M). Home improvements are actually a reasonable diversification play — you're converting concentrated tech stock into real estate equity in a different asset class. At the {tier.label} level, you'd still retain {formatCurrency(fp.googleVested - Math.max(0, tier.amount - fp.savings - fp.moneyMarket - fp.etfBonds))} in vested stock plus the full unvested pipeline.
            </p>
          </div>
          {tier.amount >= 350000 && (
            <div className="bg-amber-50 rounded p-3">
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Watch the cash reserves.</span> At {tier.label}, you'd need to sell meaningful Google stock or spread funding across 2-3 years of RSU vests. The key rule: keep at least 6 months of expenses (~$50k) liquid at all times, especially with a baby on the way. Phase the spending to match your vesting schedule.
              </p>
            </div>
          )}
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Bottom line:</span> None of these tiers threaten your retirement trajectory. The $200k tier is a no-brainer financially. The $350k tier is solid if you time it with RSU vests. The $500k tier is feasible but requires careful cash management and increases your real estate concentration.
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-slate-50 border-slate-200">
        <h4 className="font-semibold text-slate-900 text-sm mb-2">LA Housing Market Outlook (2026-2031)</h4>
        <div className="space-y-1.5 text-xs text-slate-700">
          <p>
            <span className="font-semibold">Short term (2026-2027):</span> LA home prices forecast to grow 1-4% annually. Limited inventory keeps floors firm, but high rates suppress demand. Your 90018 zip (West Adams/Jefferson Park area) has been one of the stronger appreciating neighborhoods in South LA.
          </p>
          <p>
            <span className="font-semibold">Medium term (2028-2031):</span> If rates ease toward 5-5.5%, expect a wave of pent-up demand. Properties with ADUs command premium pricing — LA's ADU-friendly policies and housing shortage mean this is likely a durable advantage.
          </p>
          <p>
            <span className="font-semibold">Risk factors:</span> LA market is vulnerable to economic downturns, earthquake events, and insurance cost increases. A major recession could temporarily erase 10-15% of value. However, your 2.9% rate means you're insulated from payment shock.
          </p>
        </div>
      </div>
    </div>
  );
}

function InvestmentModal({ isOpen, onClose, initialTier, onTierChange }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`body { overflow: hidden; }`}</style>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-full flex items-start justify-center pt-8 pb-8 px-4">
        <div
          className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between rounded-t-xl z-10">
            <h2 className="font-bold text-gray-900 text-sm">Investment Analysis</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            <InvestmentAnalysis key={initialTier} initialTier={initialTier} onTierChange={onTierChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryBar({ selectedProjects, budgetTier, onBudgetTierChange, onOpenAnalysis }) {
  const totalLow = selectedProjects.reduce((s, p) => s + p.costLow, 0);
  const totalHigh = selectedProjects.reduce((s, p) => s + p.costHigh, 0);
  const totalHousing = selectedProjects.reduce((s, p) => s + p.housingCostEstimate, 0);
  const totalMonths = selectedProjects.reduce((s, p) => s + p.timelineMonths, 0);
  const totalMid = (totalLow + totalHigh) / 2;
  const budgetMax = TIERS[budgetTier].amount;
  const budgetPct = Math.min(100, (totalMid / budgetMax) * 100);
  const tierColor = budgetPct > 90 ? "bg-red-400" : budgetPct > 70 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-xs sm:text-sm text-gray-900">
          {selectedProjects.length} project{selectedProjects.length !== 1 ? "s" : ""} selected
        </h3>
        <span className="text-xs sm:text-sm font-bold text-gray-900">
          {formatRange(totalLow, totalHigh)}
          {totalHousing > 0 && (
            <span className="text-xs font-normal text-gray-500 hidden sm:inline"> + ~{formatCurrency(totalHousing)} temp housing</span>
          )}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${tierColor}`}
          style={{ width: `${budgetPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 gap-2">
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
          <span className="text-xs text-gray-500 hidden sm:inline">Budget:</span>
          {TIERS.map((t, i) => (
            <button
              key={i}
              onClick={() => onBudgetTierChange(i)}
              className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full transition-all ${
                budgetTier === i
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={onOpenAnalysis}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 whitespace-nowrap flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" /><path d="M18 12a2 2 0 000 4h4v-4h-4z" />
          </svg>
          Analyze
        </button>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
        <span>~{Math.round(totalMonths)} mo of work</span>
        <span>~{Math.round(selectedProjects.reduce((s, p) => s + p.valueAdd, 0) / Math.max(1, selectedProjects.length) * 100)}% value recovery</span>
        {totalMid > budgetMax && (
          <span className="text-red-500 font-medium">Over budget by {formatCurrency(totalMid - budgetMax)}</span>
        )}
      </div>
    </div>
  );
}

function parseHash() {
  try {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    const ids = params.get("p")?.split(",").filter(Boolean);
    const tier = parseInt(params.get("t"), 10);
    const tab = params.get("tab");
    return {
      ids: ids && ids.length > 0 ? ids : null,
      tier: !isNaN(tier) && tier >= 0 && tier <= 2 ? tier : null,
      tab: tab || null,
    };
  } catch { return null; }
}

function writeHash(selected, tier, tab) {
  const ids = Array.from(selected).join(",");
  const hash = `p=${ids}&t=${tier}&tab=${tab}`;
  window.history.replaceState(null, "", `#${hash}`);
}

export default function HomePlanner() {
  const initial = parseHash();
  const [selected, setSelected] = useState(
    () => new Set(initial?.ids || ["foundation"])
  );
  const [activeTab, setActiveTab] = useState(initial?.tab || "projects");
  const [budgetTier, setBudgetTier] = useState(initial?.tier ?? 0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    writeHash(selected, budgetTier, activeTab);
  }, [selected, budgetTier, activeTab]);

  const handleToggle = useCallback((id) => {
    setActivePreset(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (id === "foundation") return next;
        next.delete(id);
      } else {
        const proj = PROJECTS.find((p) => p.id === id);
        if (proj.mutuallyExclusive) {
          next.delete(proj.mutuallyExclusive);
        }
        next.add(id);
      }
      return next;
    });
  }, []);

  const applyPreset = useCallback((key) => {
    const preset = PRESETS[key];
    setSelected(new Set(preset.ids));
    setBudgetTier(preset.tier);
    setActivePreset(key);
  }, []);

  const selectedProjects = useMemo(
    () => PROJECTS.filter((p) => selected.has(p.id)),
    [selected]
  );

  const totalMid = useMemo(
    () => selectedProjects.reduce((s, p) => s + (p.costLow + p.costHigh) / 2, 0),
    [selectedProjects]
  );

  const tabs = [
    { id: "projects", label: "Projects" },
    { id: "timeline", label: "Timeline" },
    { id: "compare", label: "Stay vs. Move" },
    { id: "status", label: "Status" },
  ];

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 font-sans">
      <div className="mb-5">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Gramercy Place Home Planner</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          3506 S Gramercy Pl · 1,027sqft · 2BR/2BA · Est. value: ~$1M · Equity: ~$285k
        </p>
      </div>

      <SummaryBar
        selectedProjects={selectedProjects}
        budgetTier={budgetTier}
        onBudgetTierChange={setBudgetTier}
        onOpenAnalysis={() => setShowAnalysis(true)}
      />
      <InvestmentModal
        isOpen={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        initialTier={budgetTier}
        onTierChange={setBudgetTier}
      />

      <div className="flex gap-1 mt-3 mb-3 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 text-xs font-medium py-2 px-2 sm:px-3 rounded-md transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "projects" && (
        <div className="space-y-3">
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Quick start</span>
              {activePreset && (
                <span className="text-xs text-gray-500 italic">{PRESETS[activePreset].description}</span>
              )}
            </div>
            <div className="flex gap-2">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`flex-1 text-xs font-medium py-2 px-2 rounded-lg transition-all border ${
                    activePreset === key
                      ? "border-blue-400 bg-blue-50 text-blue-800"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="block text-base leading-none mb-1">{preset.emoji}</span>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {PROJECTS.map((project) => {
            const isSelected = selected.has(project.id);
            let disabled = false;
            let disabledReason = "";
            if (project.mutuallyExclusive && selected.has(project.mutuallyExclusive)) {
              const other = PROJECTS.find((p) => p.id === project.mutuallyExclusive);
              disabled = true;
              disabledReason = `Can't combine with "${other?.name}" — deselect it first.`;
            }
            return (
              <ProjectCard
                key={project.id}
                project={project}
                selected={isSelected}
                onToggle={handleToggle}
                disabled={disabled}
                disabledReason={disabledReason}
              />
            );
          })}
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Recommended 5-Year Timeline</h3>
          <p className="text-xs text-gray-500 mb-4">
            Based on priority, dependencies, and baby timeline. Projects are assigned to their recommended year — you can adjust by changing selections.
          </p>
          <TimelineView selectedProjects={selectedProjects} />
          <div className="mt-4 bg-pink-50 rounded-lg p-3">
            <p className="text-xs text-pink-800">
              <span className="font-semibold">👶 Key constraint:</span> Foundation + floors and bedroom expansion should ideally be completed before baby arrives (est. 2027-2028). Construction dust and open floors are not safe for infants.
            </p>
          </div>
        </div>
      )}

      {activeTab === "compare" && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm text-gray-900 mb-1">Stay + Improve vs. Move</h3>
            <p className="text-xs text-gray-500 mb-4">
              Compares your selected improvements against buying a ~$1.2M home in the area. The big factor: your 2.9% mortgage is worth a LOT in a 6.5% rate environment.
            </p>
            <MoveComparison selectedProjects={selectedProjects} costEstimate={totalMid} />
          </div>
          <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
            <h4 className="font-semibold text-amber-900 text-sm mb-2">The Rate Lock Advantage</h4>
            <p className="text-xs text-amber-800">
              Your 2.9% rate on ~$720k remaining is effectively saving you <span className="font-bold">~$1,500/month</span> compared to today's ~6.5% rates on the same balance. Over 5 years, that's roughly <span className="font-bold">$90k in savings</span> you'd lose by moving. And if you move up to a $1.2M home, your monthly payment jumps from $3,900 to ~$6,800+ — that's an extra <span className="font-bold">$2,900/month</span>. This is the single biggest financial argument for staying and improving.
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">When Moving DOES Make Sense</h4>
            <ul className="text-xs text-gray-700 space-y-1.5">
              <li>• You need 3+ bedrooms AND a home office AND don't want construction chaos with a baby</li>
              <li>• You find a turnkey 1,400-1,600sqft home under $1.1M in the area (unlikely but possible)</li>
              <li>• Mortgage rates drop below 5% making the rate differential less painful</li>
              <li>• Your income increases substantially and the higher payment isn't a concern</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "status" && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Current Home Status</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Property</h4>
                <p className="text-xs text-gray-600">
                  1914 Craftsman bungalow, 1,027sqft, 2BR/2BA. Purchased Sept 2021 for $800k at 2.9%. Current est. value: ~$1M.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">✓ Completed</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs bg-emerald-50 rounded p-2">
                    <span className="text-emerald-800">Front + back garden, fence, deck (2022)</span>
                    <span className="text-emerald-600 font-medium">$10-15k</span>
                  </div>
                  <div className="flex justify-between text-xs bg-emerald-50 rounded p-2">
                    <span className="text-emerald-800">Perimeter foundation repair (2023)</span>
                    <span className="text-emerald-600 font-medium">~$15k + housing</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">⚠ Known Issues</h4>
                <div className="space-y-1.5">
                  <div className="text-xs bg-amber-50 rounded p-2 text-amber-800">
                    <span className="font-medium">Interior foundation:</span> Center of house still needs pier work. Floors must be ripped up.
                  </div>
                  <div className="text-xs bg-amber-50 rounded p-2 text-amber-800">
                    <span className="font-medium">Floors:</span> Current LVP/laminate is low quality. Will be replaced during foundation work.
                  </div>
                  <div className="text-xs bg-amber-50 rounded p-2 text-amber-800">
                    <span className="font-medium">Deck:</span> TimberTech Azek English Walnut. Functional but has construction quality issues (sharp edges, uneven connections).
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">📋 Existing Plans</h4>
                <div className="space-y-1.5">
                  <div className="text-xs bg-blue-50 rounded p-2 text-blue-800">
                    <span className="font-medium">ADU design (DR6, July 2022):</span> Matthew Remington Manion / Applied Design. 314sf + 128sf loft, dark corrugated siding, Scandinavian modern. Shelved due to cost.
                  </div>
                  <div className="text-xs bg-blue-50 rounded p-2 text-blue-800">
                    <span className="font-medium">Landscape plans (Oct 2022):</span> Jesse Torruhon Design. Front/back landscape, fence, deck — largely completed.
                  </div>
                  <div className="text-xs bg-blue-50 rounded p-2 text-blue-800">
                    <span className="font-medium">Bedroom expansion (SketchUp):</span> Concept to convert part of shared bathroom into master closet.
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Financial Snapshot</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">Purchase price</span>
                    <div className="font-medium text-gray-800">$800,000</div>
                  </div>
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">Est. current value</span>
                    <div className="font-medium text-gray-800">~$1,000,000</div>
                  </div>
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">Mortgage remaining</span>
                    <div className="font-medium text-gray-800">~$720,000</div>
                  </div>
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">Equity</span>
                    <div className="font-medium text-emerald-700">~$285,000</div>
                  </div>
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">Monthly payment</span>
                    <div className="font-medium text-gray-800">$3,900</div>
                  </div>
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">Rate</span>
                    <div className="font-medium text-emerald-700">2.9% (locked)</div>
                  </div>
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">HH income</span>
                    <div className="font-medium text-gray-800">~$450k/yr</div>
                  </div>
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">Spent so far</span>
                    <div className="font-medium text-gray-800">~$25-30k</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 border-t pt-4 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard?.writeText(url).then(() => {
                alert("Link copied! Share it with Edina.");
              }).catch(() => {
                prompt("Copy this link:", url);
              });
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            Share this configuration
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center">
          Last updated March 2026 · Estimates based on LA market data · Not financial advice
        </p>
      </div>
    </div>
  );
}
