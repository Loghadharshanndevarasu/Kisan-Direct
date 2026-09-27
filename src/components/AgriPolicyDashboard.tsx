import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Sliders,
  Sparkles,
  Download,
  Users,
  PieChart,
  DollarSign,
  Scale,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const AgriPolicyDashboard: React.FC = () => {
  // Policy levers
  const [directProcurement, setDirectProcurement] = useState(45); // % of total harvest sold direct
  const [storageLossReduction, setStorageLossReduction] = useState(40); // % reduction in spoilage
  const [farmLevelProcessing, setFarmLevelProcessing] = useState(35); // % of produce graded at village level
  const [fpoCooperativeShare, setFpoCooperativeShare] = useState(30); // % farmers in active FPOs

  const [aiInsights, setAiInsights] = useState<{
    keyTakeaways: string[];
    policyRecommendation: string;
    projectedGdpSharePercent: number;
  } | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);

  // Mathematical Model for GDP and Farmer Income
  // Baseline: 55% population -> 11.4% GDP, ₹1,26,000 annual farmer household income
  const baselineGdpPercent = 11.4;
  const baselineAnnualIncome = 126000;

  // Impact calculations
  const gdpUpliftFromDirectSales = (directProcurement - 15) * 0.055;
  const gdpUpliftFromWasteSaving = (storageLossReduction - 10) * 0.042;
  const gdpUpliftFromProcessing = (farmLevelProcessing - 10) * 0.048;
  const gdpUpliftFromFpos = (fpoCooperativeShare - 10) * 0.035;

  const totalGdpUplift = Math.max(0, gdpUpliftFromDirectSales + gdpUpliftFromWasteSaving + gdpUpliftFromProcessing + gdpUpliftFromFpos);
  const projectedGdpShare = Number((baselineGdpPercent + totalGdpUplift).toFixed(1));

  // Income multiplier
  const incomeMultiplier = 1 + (directProcurement * 0.008) + (storageLossReduction * 0.005) + (farmLevelProcessing * 0.007);
  const projectedAnnualIncome = Math.round(baselineAnnualIncome * incomeMultiplier);
  const incomeIncreasePercent = Math.round(((projectedAnnualIncome - baselineAnnualIncome) / baselineAnnualIncome) * 100);

  // Food grain loss saved in Million Metric Tonnes (MMT) - Baseline loss is ~22 MMT
  const grainLossSavedMMT = Number(((storageLossReduction / 100) * 21.8).toFixed(1));

  // Consumer savings
  const consumerSavingsPercent = Math.round((directProcurement * 0.32));

  const handleFetchAiPolicyAdvice = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/policy-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directProcurementPercent: directProcurement,
          storageLossReductionPercent: storageLossReduction,
          farmProcessingPercent: farmLevelProcessing,
        }),
      });
      const data = await res.json();
      setAiInsights(data);
    } catch (err) {
      console.error('Failed to get policy AI advice:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Structural Paradox Highlight */}
      <div className="bg-gradient-to-br from-indigo-950 via-stone-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 border border-indigo-900/60 shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <Scale className="w-3.5 h-3.5" />
            National Macro-Economic Disparity Simulator
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white leading-tight">
            The 55% Workforce vs 11% GDP Paradox: Actionable Pathways to Equity
          </h1>

          <p className="text-sm text-stone-300 leading-relaxed">
            In India, <strong>over 55% of the total population</strong> derives its livelihood directly from agriculture and allied activities, yet the sector generates <strong>only ~11.4% to 14% of National GDP</strong>.
            This structural imbalance depresses rural capital formation, suppresses farmer purchasing power, and perpetuates generational debt.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
            <span>&bull; Direct Loose Sourcing</span>
            <span>&bull; Village Micro-Warehouses</span>
            <span>&bull; Middlemen Disintermediation</span>
            <span>&bull; Farm-Gate Value Capture</span>
          </div>
        </div>
      </div>

      {/* Disparity Comparison Grid: Baseline vs Projected */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider block">
            Agrarian Workforce Share
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">54.6%</span>
            <span className="text-xs text-stone-500">of Indian Workforce</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-tight">
            ~150+ Million active rural agricultural workers and cultivating households.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider block">
            Agri Sector GDP Share
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-700">{projectedGdpShare}%</span>
            <span className="text-xs font-semibold text-emerald-700">
              (from 11.4% baseline)
            </span>
          </div>
          <p className="text-[11px] text-stone-500 leading-tight">
            +{totalGdpUplift.toFixed(1)}% expansion in national value addition through direct procurement.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider block">
            Avg. Annual Farmer Income
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-800">
              ₹{projectedAnnualIncome.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            +{incomeIncreasePercent}% Realization Jump
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider block">
            Annual Grain Spoilage Saved
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-700">{grainLossSavedMMT}</span>
            <span className="text-xs text-stone-600 font-medium">Million Tonnes</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-tight">
            Protected from dampness, rodent infestation, and unconditioned transit.
          </p>
        </div>
      </div>

      {/* Interactive Policy Simulation Levers */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                Interactive Economic Model
              </span>
              <span className="text-xs text-stone-400">&bull;</span>
              <span className="text-xs text-stone-500">
                Adjust reform levers to view systemic GDP & income shifts
              </span>
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-serif mt-1">
              Simulate Agricultural Reform Levers & Structural Interventions
            </h3>
          </div>

          <button
            onClick={handleFetchAiPolicyAdvice}
            disabled={isAiLoading}
            className="px-4 py-2 text-xs font-semibold bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            {isAiLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Generate AI Policy Brief</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lever 1 */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-stone-900">
                1. Direct Farm-Gate Procurement (Disintermediation):
              </span>
              <span className="text-sm font-extrabold text-indigo-700">{directProcurement}%</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-snug">
              Bypassing 4 tiers of mandi commission agents (arhtiyas), directly connecting regional warehouse hubs with local consumers.
            </p>
            <input
              type="range"
              min={15}
              max={85}
              step={5}
              value={directProcurement}
              onChange={(e) => setDirectProcurement(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>15% (Status Quo)</span>
              <span>50% Target</span>
              <span>85% Maximum</span>
            </div>
          </div>

          {/* Lever 2 */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-stone-900">
                2. Post-Harvest Storage Loss Reduction:
              </span>
              <span className="text-sm font-extrabold text-emerald-700">{storageLossReduction}%</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-snug">
              Equipping regional hubs with climate-controlled grain aeration silos, hermetic bags, and solar crop dehydrators.
            </p>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={storageLossReduction}
              onChange={(e) => setStorageLossReduction(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>10% (Primitive)</span>
              <span>45% Moderate</span>
              <span>80% Scientific Hubs</span>
            </div>
          </div>

          {/* Lever 3 */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-stone-900">
                3. Primary Farm-Level Cleaning & Loose Sorting:
              </span>
              <span className="text-sm font-extrabold text-amber-700">{farmLevelProcessing}%</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-snug">
              Optical sorting, de-stoning, and unpolished grading at village clusters instead of selling raw distressed field harvest.
            </p>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={farmLevelProcessing}
              onChange={(e) => setFarmLevelProcessing(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>10% Raw Paddy</span>
              <span>45% De-stoned Loose</span>
              <span>80% Precision Graded</span>
            </div>
          </div>

          {/* Lever 4 */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-stone-900">
                4. FPO Collective Bargaining & Inter-State Trade:
              </span>
              <span className="text-sm font-extrabold text-purple-700">{fpoCooperativeShare}%</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-snug">
              Organizing smallholders into statutory Farmer Producer Companies with direct GST e-Way bills and APEDA export quotas.
            </p>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={fpoCooperativeShare}
              onChange={(e) => setFpoCooperativeShare(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>10% Fragmented</span>
              <span>45% Clustered</span>
              <span>80% Pan-India Collective</span>
            </div>
          </div>
        </div>

        {/* AI Policy Analysis Box */}
        {aiInsights && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-700" />
              <h4 className="font-bold text-indigo-950 text-sm">
                Gemini Economic Policy Evaluation:
              </h4>
            </div>

            <div className="space-y-1.5 text-xs text-stone-700">
              {aiInsights.keyTakeaways.map((takeaway, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-white rounded-lg border border-indigo-200 text-xs">
              <strong className="text-indigo-900 block mb-0.5">Recommended Policy Action:</strong>
              <p className="text-stone-700 leading-relaxed">{aiInsights.policyRecommendation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Structural Pillars for Policy Makers (Whitepaper Sections) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs">
            01
          </div>
          <h4 className="font-bold text-stone-900 text-sm">
            Dismantle Middlemen Brokerage Rent-Seeking
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Eliminate traditional APMC monopolies that mandate commission fees (2–8.5%) for arhtiyas even when transactions occur digitally. Introduce direct farm-gate electronic billing with single-point mandi cess.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            02
          </div>
          <h4 className="font-bold text-stone-900 text-sm">
            Decentralized Micro-Warehouses & Aeration Silos
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Shift state infrastructure subsidies from mega urban warehouses to village cluster hubs within 25km of farms, enabling farmers to hold produce until off-season prices peak without insect spoilage.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            03
          </div>
          <h4 className="font-bold text-stone-900 text-sm">
            Incentivize Unbranded Loose Food Supply Chains
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Corporate multi-layer plastic packaging adds 15–22% to retail costs without improving nutritional quality. Prioritize unbranded, laboratory-tested loose staples in biodegradable burlap bags.
          </p>
        </div>
      </div>
    </div>
  );
};
