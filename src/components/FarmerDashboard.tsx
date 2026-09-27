import React, { useState } from 'react';
import {
  FarmerProfile,
  FarmerEarningsRecord,
  MonthlyTaxReport,
  WarehouseHub,
  ProduceTier
} from '../types';
import {
  Tractor,
  TrendingUp,
  FileText,
  ShieldCheck,
  Globe,
  Sliders,
  DollarSign,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  PlusCircle,
  MapPin,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

interface FarmerDashboardProps {
  selectedHub: WarehouseHub;
  earningsRecords: FarmerEarningsRecord[];
  taxReports: MonthlyTaxReport[];
  onAddHarvestBatch: (newBatch: any) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  selectedHub,
  earningsRecords,
  taxReports,
  onAddHarvestBatch,
}) => {
  // Farmer profile state with toggle for Premium / Inter-State status
  const [isPremiumFarmer, setIsPremiumFarmer] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'visualizer' | 'earnings' | 'tax' | 'list_crop'>('visualizer');

  // Breakdown Visualizer state
  const [calcTier, setCalcTier] = useState<ProduceTier>('on-demand');
  const [calcQuantityKg, setCalcQuantityKg] = useState(1500); // 1.5 tonnes / 15 quintals
  const [calcPricePerKg, setCalcPricePerKg] = useState(120);
  const [calcDistanceKm, setCalcDistanceKm] = useState(16); // km to regional warehouse

  // Tax report selected
  const [selectedTaxReport, setSelectedTaxReport] = useState<MonthlyTaxReport>(taxReports[0]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // New Produce Form state
  const [newCropName, setNewCropName] = useState('');
  const [newCropCategory, setNewCropCategory] = useState<'pulses' | 'grains' | 'oilseeds' | 'peas'>('pulses');
  const [newCropTier, setNewCropTier] = useState<ProduceTier>('on-demand');
  const [newCropQtyQuintals, setNewCropQtyQuintals] = useState(25);
  const [newCropPricePerKg, setNewCropPricePerKg] = useState(110);
  const [newCropHarvestDate, setNewCropHarvestDate] = useState('2026-09-15');
  const [newCropSoil, setNewCropSoil] = useState('Black Cotton Soil (Regur)');
  const [cropSubmittedNotice, setCropSubmittedNotice] = useState(false);

  // Visualizer mathematical calculations
  const grossAmount = calcQuantityKg * calcPricePerKg;
  const isWithinWarehouseProximity = calcDistanceKm <= selectedHub.coverageRadiusKm;
  const proximityDiscountPercent = isWithinWarehouseProximity ? selectedHub.proximityDiscountPercent : 0;

  // On-demand vs Underdog logic
  const isDemand = calcTier === 'on-demand';
  const farmerSharePercent = isDemand ? 91.2 : 80.0;
  const basePlatformPercent = isDemand ? 3.0 : 6.0;
  const baseLogisticsPercent = isDemand ? 3.8 : 8.0;
  // Apply proximity discount on logistics
  const effectiveLogisticsPercent = Math.max(1.5, baseLogisticsPercent - (proximityDiscountPercent * 0.35));
  const inventoryStoragePercent = isDemand ? 2.0 : 6.0;
  const fixedUnderdogServiceFee = isDemand ? 0 : 250; // Fixed fee for slow-moving underdog produce

  const platformDeduction = Math.round((grossAmount * basePlatformPercent) / 100);
  const logisticsDeduction = Math.round((grossAmount * effectiveLogisticsPercent) / 100);
  const inventoryDeduction = Math.round((grossAmount * inventoryStoragePercent) / 100);
  const totalDeductions = platformDeduction + logisticsDeduction + inventoryDeduction + fixedUnderdogServiceFee;
  const netFarmerPayout = grossAmount - totalDeductions;
  const netPayoutPercentage = ((netFarmerPayout / grossAmount) * 100).toFixed(1);

  // Traditional Mandi Comparison (middlemen, arhtiya 8.5%, karda deduction 4%, unregulated transport 12%, handling 3%)
  const traditionalMandiLossPercent = 32.5;
  const traditionalMandiPayout = Math.round(grossAmount * (1 - traditionalMandiLossPercent / 100));
  const extraEarningsViaKisanDirect = netFarmerPayout - traditionalMandiPayout;

  // Aggregate totals
  const totalGrossSold = earningsRecords.reduce((acc, r) => acc + r.grossAmount, 0);
  const totalNetRealized = earningsRecords.reduce((acc, r) => acc + r.farmerPayout, 0);
  const totalDeductionsAccumulated = totalGrossSold - totalNetRealized;

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName) return;

    onAddHarvestBatch({
      name: newCropName,
      category: newCropCategory,
      tier: newCropTier,
      quantityKg: newCropQtyQuintals * 100,
      pricePerKg: newCropPricePerKg,
      harvestDate: newCropHarvestDate,
      soilType: newCropSoil,
    });

    setCropSubmittedNotice(true);
    setTimeout(() => {
      setCropSubmittedNotice(false);
      setNewCropName('');
      setActiveSubTab('earnings');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Farmer Profile Header & Tier Status */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-700 text-white flex items-center justify-center shrink-0 shadow-md">
            <Tractor className="w-7 h-7 text-amber-100" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-stone-900 font-serif">
                Shri Rameshwar B. Patil
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Verified Farmer Producer
              </span>
              <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono">
                ID: FARMER-MH-NSK-101
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                Dindori, Nashik (Maharashtra) &bull; 6.5 Acres Black Basalt Soil
              </span>
              <span className="text-stone-300 hidden sm:inline">&bull;</span>
              <span className="text-emerald-700 font-medium">
                18 km from {selectedHub.name} ({selectedHub.proximityDiscountPercent}% Proximity Discount Active)
              </span>
            </div>
          </div>
        </div>

        {/* Tier Toggle: Regular vs Premium Inter-state/Export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 w-full md:w-auto">
          <div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-stone-900">
                {isPremiumFarmer ? 'Premium Producer Tier' : 'Regular Local Seller Tier'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 max-w-xs">
              {isPremiumFarmer
                ? 'Unlocked Inter-state e-Way bills & APEDA export corridors.'
                : 'Limited to local 60km regional warehouse delivery.'}
            </p>
          </div>

          <button
            onClick={() => setIsPremiumFarmer(!isPremiumFarmer)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              isPremiumFarmer
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            {isPremiumFarmer ? 'Switch to Regular' : 'Upgrade to Premium (Inter-state)'}
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium block">Total Harvest Turnover</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-stone-900">
              ₹{(totalGrossSold / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-xs text-emerald-600 font-semibold">+18% MoM</span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">5 Batches Dispatched in Loose Bags</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium block">Net Bank Realization</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-700">
              ₹{(totalNetRealized / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
              90.8% Payout
            </span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Direct RTGS within 24h of Silo Inward</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium block">Middlemen Losses Saved</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-700">
              ₹{Math.round(totalGrossSold * 0.28).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-stone-500">vs APMC Mandi</span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Zero Arhtiya 8.5% commission or karda cut</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium block">Inter-state & Export Volume</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-purple-900">
              2.42 Tonnes
            </span>
            <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-semibold">
              Premium
            </span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">Sold to Karnataka & Dubai Export</span>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-stone-100 p-1 rounded-xl flex flex-wrap gap-1 border border-stone-200">
        <button
          onClick={() => setActiveSubTab('visualizer')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'visualizer'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-700" />
          <span>Deduction Visualizer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('earnings')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'earnings'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-700" />
          <span>Batch Earnings History</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tax')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'tax'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-700" />
          <span>Automated Tax Reports</span>
        </button>

        <button
          onClick={() => setActiveSubTab('list_crop')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'list_crop'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-purple-700" />
          <span>List Harvest Batch</span>
        </button>
      </div>

      {/* SUB-VIEW 1: Interactive Deduction Breakdown Visualization Tool */}
      {activeSubTab === 'visualizer' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Transparent Fee Simulator
              </span>
              <span className="text-xs text-stone-400">&bull;</span>
              <span className="text-xs text-stone-500">
                Empowering farmers with full financial planning clarity
              </span>
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-serif mt-1">
              Interactive Deduction & Profit Share Visualizer
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
              Compare deductions between <strong>On-Demand high-velocity produce</strong> (higher profit share, low logistics & inventory fees) and <strong>Underdog regional produce</strong> (fixed platform maintenance fee, specialized climate aeration fee).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls Column */}
            <div className="lg:col-span-5 bg-stone-50 p-5 rounded-xl border border-stone-200 space-y-5">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                Configure Harvest Parameters
              </h4>

              {/* Tier Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Produce Category & Velocity Tier:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcTier('on-demand')}
                    className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all ${
                      calcTier === 'on-demand'
                        ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-400'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="block font-bold">On-Demand Produce</span>
                    <span className="text-[11px] text-stone-500 font-normal">
                      Toor, Moong, Basmati (91.2% payout, low fees)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCalcTier('underdog')}
                    className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all ${
                      calcTier === 'underdog'
                        ? 'bg-purple-100 border-purple-400 text-purple-950 shadow-xs ring-1 ring-purple-400'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="block font-bold">Underdog Produce</span>
                    <span className="text-[11px] text-stone-500 font-normal">
                      Black Rice, Kulthi, Peas (80% payout + fixed fee)
                    </span>
                  </button>
                </div>
              </div>

              {/* Quantity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-stone-700">Harvest Quantity:</span>
                  <span className="font-bold text-stone-900">
                    {calcQuantityKg} kg ({(calcQuantityKg / 100).toFixed(1)} Quintals)
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={50}
                  value={calcQuantityKg}
                  onChange={(e) => setCalcQuantityKg(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>100 kg (1 Quintal)</span>
                  <span>2,500 kg (25 Q)</span>
                  <span>5,000 kg (50 Q)</span>
                </div>
              </div>

              {/* Price Per Kg Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-stone-700">Base Selling Price (Loose):</span>
                  <span className="font-bold text-stone-900">₹{calcPricePerKg} / kg</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={250}
                  step={2}
                  value={calcPricePerKg}
                  onChange={(e) => setCalcPricePerKg(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>₹40/kg (Paddy/Wheat)</span>
                  <span>₹120/kg (Pulses)</span>
                  <span>₹250/kg (Heirloom)</span>
                </div>
              </div>

              {/* Proximity Distance Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-stone-700">Distance to Regional Warehouse:</span>
                  <span className="font-bold text-stone-900">{calcDistanceKm} km</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={75}
                  step={1}
                  value={calcDistanceKm}
                  onChange={(e) => setCalcDistanceKm(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>2 km (Local Hub)</span>
                  <span>{selectedHub.coverageRadiusKm} km (Proximity Limit)</span>
                  <span>75 km (Inter-cluster)</span>
                </div>
                {isWithinWarehouseProximity ? (
                  <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    ✓ Proximity discount applied: Logistics fee discounted by {proximityDiscountPercent}%!
                  </p>
                ) : (
                  <p className="text-[11px] text-stone-500 bg-stone-100 px-2 py-1 rounded">
                    Outside standard {selectedHub.coverageRadiusKm}km warehouse radius. Standard regional freight applies.
                  </p>
                )}
              </div>
            </div>

            {/* Right Visualization & Waterfall Column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Grand Total Summary Box */}
              <div className="bg-stone-900 text-stone-100 p-5 rounded-xl border border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                  <div>
                    <span className="text-xs text-stone-400 block">Gross Harvest Market Value:</span>
                    <span className="text-2xl font-bold text-white">
                      ₹{grossAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-stone-400 block">Your Net Direct Payout:</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      ₹{netFarmerPayout.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-emerald-300 font-medium block">
                      ({netPayoutPercentage}% of Gross Value)
                    </span>
                  </div>
                </div>

                {/* Deductions Breakdown Stack */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span className="font-semibold text-stone-200">Itemized Deductions Breakdown</span>
                    <span className="text-stone-400">Total Deductions: ₹{totalDeductions.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Visual Stacked Progress Bar */}
                  <div className="h-4 w-full rounded-md bg-stone-800 overflow-hidden flex">
                    <div
                      style={{ width: `${netPayoutPercentage}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Net Farmer Payout: ₹${netFarmerPayout} (${netPayoutPercentage}%)`}
                    />
                    <div
                      style={{ width: `${((logisticsDeduction / grossAmount) * 100).toFixed(1)}%` }}
                      className="bg-blue-500 h-full"
                      title={`Logistics & Freight: ₹${logisticsDeduction}`}
                    />
                    <div
                      style={{ width: `${((inventoryDeduction / grossAmount) * 100).toFixed(1)}%` }}
                      className="bg-amber-500 h-full"
                      title={`Inventory & Silo Aeration: ₹${inventoryDeduction}`}
                    />
                    <div
                      style={{ width: `${((platformDeduction / grossAmount) * 100).toFixed(1)}%` }}
                      className="bg-stone-500 h-full"
                      title={`Platform Maintenance: ₹${platformDeduction}`}
                    />
                  </div>

                  {/* Deductions Detailed Rows */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
                    <div className="bg-stone-850 p-2.5 rounded-lg border border-stone-700/60">
                      <div className="flex justify-between items-baseline">
                        <span className="text-stone-300">Platform Maintenance Fee:</span>
                        <span className="font-semibold text-white">₹{platformDeduction.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {basePlatformPercent}% rate for {calcTier} tier
                      </span>
                    </div>

                    <div className="bg-stone-850 p-2.5 rounded-lg border border-stone-700/60">
                      <div className="flex justify-between items-baseline">
                        <span className="text-stone-300">Logistics & Handling Fee:</span>
                        <span className="font-semibold text-white">₹{logisticsDeduction.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {effectiveLogisticsPercent.toFixed(1)}% rate (discount applied)
                      </span>
                    </div>

                    <div className="bg-stone-850 p-2.5 rounded-lg border border-stone-700/60">
                      <div className="flex justify-between items-baseline">
                        <span className="text-stone-300">Warehouse Silo & Aeration Fee:</span>
                        <span className="font-semibold text-white">₹{inventoryDeduction.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {inventoryStoragePercent}% climate-controlled holding
                      </span>
                    </div>

                    {fixedUnderdogServiceFee > 0 && (
                      <div className="bg-stone-850 p-2.5 rounded-lg border border-stone-700/60">
                        <div className="flex justify-between items-baseline">
                          <span className="text-stone-300">Underdog Crop Support Fee:</span>
                          <span className="font-semibold text-white">₹{fixedUnderdogServiceFee}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          Fixed marketing buffer for specialty/slow-velocity crops
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comparative Mandi Reality Box */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-stone-800 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-800" />
                  <h5 className="font-bold text-amber-950 text-xs sm:text-sm">
                    Why Direct Loose Sourcing Wins Over Traditional APMC Mandis:
                  </h5>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  In a typical district APMC Mandi, a farmer selling this batch for ₹{grossAmount.toLocaleString('en-IN')} loses
                  an average of <strong>32.5%</strong> in arhtiya commissions, karda/spoilage cuts, market fees, and unregulated freight—leaving you with only <strong>₹{traditionalMandiPayout.toLocaleString('en-IN')}</strong>.
                </p>
                <div className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-900">
                    Additional Net Profit Retained in Your Pocket:
                  </span>
                  <span className="text-sm font-bold text-emerald-800">
                    +₹{extraEarningsViaKisanDirect.toLocaleString('en-IN')} extra
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Batch Earnings History */}
      {activeSubTab === 'earnings' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                Individual Batch Dispatches & Net Payout Ledger
              </h3>
              <p className="text-xs text-stone-500">
                Transparent auditing of every quintal dispatched from farm-gate to warehouse silos.
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-semibold px-2.5 py-1 rounded">
              All Payments Settled via RBI RTGS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-3">Date / Batch</th>
                  <th className="py-3 px-3">Produce & Tier</th>
                  <th className="py-3 px-3">Volume (Kg)</th>
                  <th className="py-3 px-3">Gross Value</th>
                  <th className="py-3 px-3">Deductions</th>
                  <th className="py-3 px-3">Net Payout</th>
                  <th className="py-3 px-3">Destination</th>
                  <th className="py-3 px-3">Tax Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {earningsRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-medium text-stone-900">
                      <div>{rec.date}</div>
                      <span className="font-mono text-[10px] text-stone-500">{rec.batchNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-stone-900">{rec.produceName}</div>
                      <span
                        className={`inline-block text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded mt-0.5 ${
                          rec.tier === 'on-demand'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-purple-100 text-purple-900'
                        }`}
                      >
                        {rec.tier === 'on-demand' ? 'On-Demand' : 'Underdog Crop'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-800">
                      {rec.quantitySoldKg} kg
                    </td>
                    <td className="py-3 px-3 text-stone-700">
                      ₹{rec.grossAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-red-700 font-medium">
                      -₹{(rec.platformFee + rec.logisticsFee + rec.warehouseStorageFee).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-emerald-800 font-bold text-sm">
                      ₹{rec.farmerPayout.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      <div className="flex items-center gap-1">
                        {rec.isInterstateOrExport ? (
                          <Globe className="w-3 h-3 text-purple-700" />
                        ) : (
                          <Truck className="w-3 h-3 text-stone-400" />
                        )}
                        <span className="text-[11px] truncate max-w-[150px]">{rec.destinationState}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {rec.taxStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Automated Monthly Tax Reports */}
      {activeSubTab === 'tax' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Statutory Tax & APMC Compliance
                </span>
                <span className="text-xs text-stone-400">&bull;</span>
                <span className="text-xs text-stone-500">
                  Section 10(1) Income Tax Act 1961
                </span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 font-serif mt-1">
                Automated Monthly Agricultural Tax Statements
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Pre-formatted, CA-ready audit certificates streamline farmer accounting, loan applications, and IT exemption claims.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrintModal(true)}
                className="px-3 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => {
                  // CSV download simulation
                  const csvContent = `data:text/csv;charset=utf-8,Month,FarmerName,GrossTurnover,ExemptAgriIncome,MandiCess,NetPayout\n${selectedTaxReport.month} ${selectedTaxReport.year},${selectedTaxReport.farmerName},${selectedTaxReport.totalGrossTurnover},${selectedTaxReport.exemptAgriculturalIncomeSec10_1},${selectedTaxReport.mandiCessAPMC},${selectedTaxReport.netBankPayout}`;
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `KisanDirect_Tax_${selectedTaxReport.month}_${selectedTaxReport.year}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-3 py-2 text-xs font-medium bg-stone-100 text-stone-800 rounded-lg hover:bg-stone-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Month Selector Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Select Statement Period:</span>
            {taxReports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedTaxReport(report)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  selectedTaxReport.id === report.id
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {report.month} {report.year}
              </button>
            ))}
          </div>

          {/* Official Tax Report Statement Card */}
          <div className="bg-stone-50 rounded-xl p-5 sm:p-6 border border-stone-200 space-y-5 font-sans">
            {/* Header of Certificate */}
            <div className="border-b-2 border-stone-300 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-stone-500">
                  Government of India &bull; Ministry of Finance &bull; Agricultural Exemption Annexure
                </span>
                <h4 className="text-lg font-bold text-stone-900 mt-0.5">
                  Certificate of Agricultural Income Realization
                </h4>
                <p className="text-xs text-stone-600">
                  Issued by KisanDirect Agri-Cluster Warehouse Registry for Assessment Year 2026–27
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                  Status: {selectedTaxReport.status}
                </span>
                <span className="block text-[11px] text-stone-400 mt-1">
                  Report ID: {selectedTaxReport.id.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Farmer Identification Block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-lg border border-stone-200">
              <div>
                <span className="text-stone-400 block text-[10px]">Beneficiary Farmer:</span>
                <span className="font-bold text-stone-900">{selectedTaxReport.farmerName}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Registry PAN / Aadhaar:</span>
                <span className="font-mono text-stone-800">{selectedTaxReport.panOrAadharMasked}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">FPO / Cluster ID:</span>
                <span className="font-semibold text-stone-800">{selectedTaxReport.farmerId}</span>
              </div>
            </div>

            {/* Financial Numbers Table */}
            <div className="bg-white rounded-lg border border-stone-200 overflow-hidden text-xs">
              <div className="grid grid-cols-2 p-3 border-b border-stone-100">
                <span className="text-stone-600">Gross Harvest Turnover (Market Value):</span>
                <span className="font-bold text-stone-900 text-right">
                  ₹{selectedTaxReport.totalGrossTurnover.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 p-3 border-b border-stone-100 bg-emerald-50/40">
                <span className="font-semibold text-emerald-900">
                  Exempt Agricultural Income (Sec 10(1), IT Act):
                </span>
                <span className="font-bold text-emerald-800 text-right text-sm">
                  ₹{selectedTaxReport.exemptAgriculturalIncomeSec10_1.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 p-3 border-b border-stone-100">
                <span className="text-stone-600">Platform & Logistics Deductions (Documented):</span>
                <span className="text-stone-800 text-right">
                  -₹{selectedTaxReport.platformDeductionsTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 p-3 border-b border-stone-100">
                <span className="text-stone-600">APMC Mandi Facilitation Cess Paid (Statutory):</span>
                <span className="text-stone-800 text-right">
                  ₹{selectedTaxReport.mandiCessAPMC.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 p-3 bg-stone-100/70 font-semibold">
                <span className="text-stone-900">Net Bank Deposit Received:</span>
                <span className="text-emerald-900 text-right text-sm">
                  ₹{selectedTaxReport.netBankPayout.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Statutory Notes & Digital Signature Watermark */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-[11px] text-stone-500">
              <div className="space-y-1">
                <p>
                  &bull; This certificate constitutes verifiable primary evidence for agricultural income tax exemption under <strong>Section 10(1)</strong>.
                </p>
                <p>
                  &bull; Inter-state dispatches covered by <strong>{selectedTaxReport.eWayBillCount} statutory GST e-Way bills</strong> with zero GST on unbranded loose agricultural produce.
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-stone-300 text-right shrink-0">
                <span className="block text-[10px] text-emerald-700 font-bold uppercase">
                  Digitally Verified & Signed
                </span>
                <span className="text-[10px] font-mono text-stone-600 block">
                  {selectedTaxReport.digitalSignatureDate}
                </span>
                <span className="text-[9px] text-stone-400">Auth Token: #KD-SIGN-7781-AX</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: List New Harvest Batch Form */}
      {activeSubTab === 'list_crop' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5 max-w-3xl">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              Direct Inward to Warehouse
            </span>
            <h3 className="text-xl font-bold text-stone-900 font-serif mt-1">
              List Harvest Batch for Regional Silo Inward
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Strictly loose unbranded produce. Cleaned, sun-dried, and ready for quality moisture inspection at {selectedHub.name}.
            </p>
          </div>

          {cropSubmittedNotice && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Batch successfully submitted! Quality inspection scheduled at {selectedHub.name}. Redirecting to ledger...</span>
            </div>
          )}

          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Produce Name (Loose Unbranded):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Desi Chana, Whole Moong, Basmati Paddy"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Category:
                </label>
                <select
                  value={newCropCategory}
                  onChange={(e) => setNewCropCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="pulses">Pulses & Dals</option>
                  <option value="grains">Grains & Rice</option>
                  <option value="oilseeds">Oilseeds & Groundnut</option>
                  <option value="peas">Raw Peas & Legumes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Produce Velocity Tier:
                </label>
                <select
                  value={newCropTier}
                  onChange={(e) => setNewCropTier(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="on-demand">On-Demand Staple (91.2% Share)</option>
                  <option value="underdog">Underdog Regional Crop (80% Share)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Quantity Available (Quintals):
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  value={newCropQtyQuintals}
                  onChange={(e) => setNewCropQtyQuintals(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Desired Price / Kg (₹):
                </label>
                <input
                  type="number"
                  min={20}
                  max={400}
                  required
                  value={newCropPricePerKg}
                  onChange={(e) => setNewCropPricePerKg(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Harvest Date:
                </label>
                <input
                  type="date"
                  required
                  value={newCropHarvestDate}
                  onChange={(e) => setNewCropHarvestDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Soil Chemistry / Region:
                </label>
                <input
                  type="text"
                  required
                  value={newCropSoil}
                  onChange={(e) => setNewCropSoil(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-xs"
              >
                Submit Harvest Batch for Silo Inward
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Print Certificate Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-stone-300 print:m-0 print:p-0">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-stone-900 text-base">Print Tax Audit Statement</h4>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-stone-50 border rounded-lg text-xs space-y-2">
              <p><strong>Month:</strong> {selectedTaxReport.month} {selectedTaxReport.year}</p>
              <p><strong>Farmer Name:</strong> {selectedTaxReport.farmerName}</p>
              <p><strong>Sec 10(1) Exempt Amount:</strong> ₹{selectedTaxReport.exemptAgriculturalIncomeSec10_1.toLocaleString('en-IN')}</p>
              <p><strong>Mandi APMC Cess:</strong> ₹{selectedTaxReport.mandiCessAPMC.toLocaleString('en-IN')}</p>
              <p><strong>Net Payout:</strong> ₹{selectedTaxReport.netBankPayout.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-stone-500 pt-2 border-t">
                This document is formatted for direct submission to the Income Tax Department or bank credit officers.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Confirm & Print</span>
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 text-xs font-medium bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
