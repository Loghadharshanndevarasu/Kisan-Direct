import React, { useState, useMemo } from 'react';
import { ProduceItem, WarehouseHub, ProduceCategory, ProduceTier } from '../types';
import { getProduceImage } from '../data/produceImages';
import {
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  MapPin,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  Check,
  Percent,
  Wheat,
  Scale,
  Package,
  Truck,
  AlertCircle
} from 'lucide-react';

interface ConsumerMarketplaceProps {
  produceList: ProduceItem[];
  selectedHub: WarehouseHub;
  onAddToCart: (produce: ProduceItem, quantityKg: number, unitLabel: string, appliedPricePerKg: number) => void;
  onInspectBatchWithAI: (produce: ProduceItem) => void;
}

export const ConsumerMarketplace: React.FC<ConsumerMarketplaceProps> = ({
  produceList,
  selectedHub,
  onAddToCart,
  onInspectBatchWithAI,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProduceCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<ProduceTier | 'all'>('all');
  const [selectedProduceDetail, setSelectedProduceDetail] = useState<ProduceItem | null>(null);

  // Per-item selected quantity state (kg between 0.15 kg and 25 kg)
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, { kg: number; label: string }>>({});
  const [customInputKg, setCustomInputKg] = useState<Record<string, string>>({});

  // Filter produce
  const filteredProduce = useMemo(() => {
    return produceList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hindiName.includes(searchQuery) ||
        item.farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmer.village.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesTier = selectedTier === 'all' || item.tier === selectedTier;

      return matchesSearch && matchesCategory && matchesTier;
    });
  }, [produceList, searchQuery, selectedCategory, selectedTier]);

  const handleQuickQtySelect = (produceId: string, kg: number, label: string) => {
    // clamp between 0.15kg (150g) and 25kg
    const clampedKg = Math.max(0.15, Math.min(25, kg));
    setSelectedQuantities((prev) => ({
      ...prev,
      [produceId]: { kg: clampedKg, label },
    }));
    setCustomInputKg((prev) => ({
      ...prev,
      [produceId]: clampedKg.toString(),
    }));
  };

  const handleCustomQtyChange = (produceId: string, valueStr: string) => {
    setCustomInputKg((prev) => ({
      ...prev,
      [produceId]: valueStr,
    }));

    const val = parseFloat(valueStr);
    if (!isNaN(val) && val >= 0.15 && val <= 25) {
      const label = val < 1 ? `${Math.round(val * 1000)}g Loose Bag` : `${val} kg Loose Bag`;
      setSelectedQuantities((prev) => ({
        ...prev,
        [produceId]: { kg: val, label },
      }));
    }
  };

  const handleCustomQtyBlur = (produceId: string) => {
    const rawVal = parseFloat(customInputKg[produceId] || '1');
    let clamped = 1;
    if (isNaN(rawVal) || rawVal < 0.15) {
      clamped = 0.15;
    } else if (rawVal > 25) {
      clamped = 25;
    } else {
      clamped = Number(rawVal.toFixed(2));
    }

    const label = clamped < 1 ? `${Math.round(clamped * 1000)}g Loose Bag` : `${clamped} kg Loose Bag`;
    setSelectedQuantities((prev) => ({
      ...prev,
      [produceId]: { kg: clamped, label },
    }));
    setCustomInputKg((prev) => ({
      ...prev,
      [produceId]: clamped.toString(),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Hero Announcement & Unbranded Direct Philosophy */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Wheat className="w-3.5 h-3.5" />
            100% Raw Harvest &bull; Zero Plastic Brand Packaging &bull; Direct Loose Sourcing
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-white">
            Pure Indian Pulses &amp; Raw Grains Straight from Village Silos
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            No brand markups, no chemical wax polishing. We source harvested pulses and raw produce directly from farmers within our{' '}
            <strong className="text-white underline decoration-emerald-500 underline-offset-4">{selectedHub.name}</strong> network.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-300">
            <span className="bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              Min: 150g &bull; Max: 25kg
            </span>
            <span className="bg-emerald-950/60 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-800 flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              Free Delivery for Orders &gt; 3.5 kg!
            </span>
            <span className="bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              Live Regional Silo Inventory
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search unpolished Toor Dal, Green Gram, Basmati, Groundnut, Farmer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-stone-800 placeholder-stone-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as ProduceTier | 'all')}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="all">All Produce Velocity</option>
              <option value="on-demand">On-Demand Staples (Higher Farmer Share)</option>
              <option value="underdog">Underdog Specialty Produce</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-medium text-[11px] uppercase tracking-wider shrink-0 mr-1">
            Produce:
          </span>
          {[
            { id: 'all', label: 'All Raw Harvests' },
            { id: 'pulses', label: 'Indian Pulses (Dals)' },
            { id: 'grains', label: 'Rice & Paddy Grains' },
            { id: 'oilseeds', label: 'Raw Groundnuts & Seeds' },
            { id: 'peas', label: 'Field Peas (Vatana)' },
            { id: 'millets', label: 'Heirloom & Millets' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as ProduceCategory | 'all')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Produce Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProduce.map((item) => {
          const isNearbyWarehouse = item.warehouseHubId === selectedHub.id;
          const proximityDiscountRs = isNearbyWarehouse
            ? Number(((item.pricePerKg * selectedHub.proximityDiscountPercent) / 100).toFixed(1))
            : 0;
          const effectivePricePerKg = item.pricePerKg - proximityDiscountRs;

          const currentUnitConfig = selectedQuantities[item.id] || {
            kg: 1,
            label: '1 kg Loose Bag',
          };

          const totalPrice = Math.round(effectivePricePerKg * currentUnitConfig.kg);

          // Available Inventory
          const availableStock = item.availableStockKg || item.stockKg || 1200;
          const stockPercent = Math.min(100, Math.round((availableStock / 4000) * 100));

          // Breakdown values per kg
          const farmerPayoutRs = ((item.pricePerKg * item.feeStructure.farmerSharePercent) / 100).toFixed(1);
          const platformFeeRs = ((item.pricePerKg * item.feeStructure.platformFeePercent) / 100).toFixed(1);
          const logisticsFeeRs = ((item.pricePerKg * item.feeStructure.logisticsFeePercent) / 100).toFixed(1);
          const storageFeeRs = ((item.pricePerKg * item.feeStructure.inventoryHoldingFeePercent) / 100).toFixed(1);

          // Image resolution
          const produceImgUrl = item.imageUrl || getProduceImage(item.id, item.category);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Visual Produce Photography Banner */}
                <div className="relative h-48 w-full bg-stone-100 overflow-hidden border-b border-stone-200">
                  <img
                    src={produceImgUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                  {/* Overlaid Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs ${
                        item.tier === 'on-demand'
                          ? 'bg-amber-500 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {item.tier === 'on-demand' ? 'On-Demand Staple' : 'Underdog Specialty'}
                    </span>

                    {isNearbyWarehouse ? (
                      <span className="inline-flex items-center text-[10px] font-semibold text-emerald-900 bg-emerald-100/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs">
                        <Percent className="w-3 h-3 mr-0.5 text-emerald-700" />
                        {selectedHub.proximityDiscountPercent}% Proximity Off
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/90 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded font-medium">
                        {item.warehouseName.split(' ')[0]} Silo
                      </span>
                    )}
                  </div>

                  {/* Overlaid Bottom Title on Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base sm:text-lg leading-tight text-white drop-shadow-sm">
                      {item.name}
                    </h3>
                    <p className="text-xs text-amber-200 font-serif italic drop-shadow-xs">
                      {item.hindiName}
                    </p>
                  </div>
                </div>

                {/* Available Inventory Stock Bar */}
                <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                    <Package className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Available Silo Stock:</span>
                    <strong className="text-stone-900 font-mono font-bold">
                      {availableStock.toLocaleString('en-IN')} kg
                    </strong>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      availableStock < 800
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {availableStock < 800 ? 'Fast Moving' : 'Ready to Bag'}
                  </span>
                </div>

                {/* Farmer & Harvest Metadata */}
                <div className="px-4 py-2.5 bg-white border-b border-stone-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="font-medium text-stone-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Farmer: {item.farmer.name}
                    </span>
                    <span className="text-stone-500">{item.farmer.village}, {item.farmer.district}</span>
                  </div>

                  <div className="flex items-center justify-between text-stone-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      Harvested: {new Date(item.harvestInfo.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                      Batch #{item.harvestInfo.batchNumber}
                    </span>
                  </div>
                </div>

                {/* Description & Dietary Notes */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Loose Quantity Selection with Min 150g & Max 25kg */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                        Select Loose Weight:
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        Min: 150g &bull; Max: 25kg
                      </span>
                    </div>

                    {/* Quick Weight Chips */}
                    <div className="grid grid-cols-4 gap-1 text-[11px]">
                      {[
                        { kg: 0.15, label: '150g (Min)' },
                        { kg: 0.5, label: '500g' },
                        { kg: 1, label: '1 kg' },
                        { kg: 2, label: '2 kg' },
                        { kg: 5, label: '5 kg' },
                        { kg: 10, label: '10 kg' },
                        { kg: 15, label: '15 kg' },
                        { kg: 25, label: '25kg (Max)' },
                      ].map((opt) => (
                        <button
                          key={opt.kg}
                          onClick={() => handleQuickQtySelect(item.id, opt.kg, `${opt.kg} kg Loose Bag`)}
                          className={`py-1 px-1 rounded border text-center font-medium transition-colors ${
                            currentUnitConfig.kg === opt.kg
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom Decimal Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-stone-500 font-medium">Custom:</span>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0.15"
                          max="25"
                          step="0.05"
                          placeholder="e.g. 3.5"
                          value={customInputKg[item.id] !== undefined ? customInputKg[item.id] : currentUnitConfig.kg}
                          onChange={(e) => handleCustomQtyChange(item.id, e.target.value)}
                          onBlur={() => handleCustomQtyBlur(item.id)}
                          className="w-full px-2 py-1 bg-stone-50 border border-stone-300 rounded text-xs font-mono font-bold text-stone-800 focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">
                          kg
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400">
                        (0.15 to 25 kg)
                      </span>
                    </div>

                    {/* Free Delivery Trigger Incentive */}
                    {currentUnitConfig.kg <= 3.5 ? (
                      <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1 pt-0.5">
                        <Truck className="w-3 h-3" />
                        Tip: Order &gt; 3.5 kg to unlock 100% FREE Delivery!
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Eligible for 100% FREE Home Delivery!
                      </p>
                    )}
                  </div>

                  {/* Transparent Price Breakdown Bar */}
                  <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-900 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-emerald-700" />
                        Rupee Breakdown (/kg):
                      </span>
                      <span className="text-emerald-700 font-bold text-xs">
                        Farmer: {item.feeStructure.farmerSharePercent}%
                      </span>
                    </div>

                    {/* Progress Stack Bar */}
                    <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden flex">
                      <div
                        style={{ width: `${item.feeStructure.farmerSharePercent}%` }}
                        className="bg-emerald-600 h-full"
                        title={`Farmer Payout: ₹${farmerPayoutRs}/kg (${item.feeStructure.farmerSharePercent}%)`}
                      />
                      <div
                        style={{ width: `${item.feeStructure.logisticsFeePercent}%` }}
                        className="bg-blue-500 h-full"
                        title={`Logistics & Transport: ₹${logisticsFeeRs}/kg`}
                      />
                      <div
                        style={{ width: `${item.feeStructure.inventoryHoldingFeePercent}%` }}
                        className="bg-amber-500 h-full"
                        title={`Hub Silo Storage: ₹${storageFeeRs}/kg`}
                      />
                      <div
                        style={{ width: `${item.feeStructure.platformFeePercent}%` }}
                        className="bg-stone-600 h-full"
                        title={`Platform Maintenance: ₹${platformFeeRs}/kg`}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[10px] text-stone-600 pt-0.5 text-center">
                      <div>
                        <span className="block font-bold text-emerald-700">₹{farmerPayoutRs}</span>
                        <span className="text-[9px]">Farmer</span>
                      </div>
                      <div>
                        <span className="block font-bold text-blue-700">₹{logisticsFeeRs}</span>
                        <span className="text-[9px]">Freight</span>
                      </div>
                      <div>
                        <span className="block font-bold text-amber-700">₹{storageFeeRs}</span>
                        <span className="text-[9px]">Storage</span>
                      </div>
                      <div>
                        <span className="block font-bold text-stone-700">₹{platformFeeRs}</span>
                        <span className="text-[9px]">Platform</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-stone-900">
                        ₹{totalPrice}
                      </span>
                      <span className="text-xs text-stone-500">
                        for {currentUnitConfig.kg} kg
                      </span>
                    </div>
                    {proximityDiscountRs > 0 && (
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Saved ₹{(proximityDiscountRs * currentUnitConfig.kg).toFixed(1)} with Hub Proximity!
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-400 line-through">
                      ₹{Math.round(item.marketMandiPricePerKg * currentUnitConfig.kg)}
                    </span>
                    <span className="block text-[11px] text-emerald-800 font-semibold">
                      Save {Math.round(((item.marketMandiPricePerKg - effectivePricePerKg) / item.marketMandiPricePerKg) * 100)}% vs Branded Pack
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setSelectedProduceDetail(item)}
                    className="px-2.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Provenance</span>
                  </button>

                  <button
                    onClick={() => onAddToCart(item, currentUnitConfig.kg, currentUnitConfig.label, effectivePricePerKg)}
                    className="px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <span>Add to Loose Cart</span>
                  </button>
                </div>

                <button
                  onClick={() => onInspectBatchWithAI(item)}
                  className="w-full text-center text-[11px] text-stone-600 hover:text-emerald-700 flex items-center justify-center gap-1 pt-1 font-medium transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Ask AI about Farmer {item.farmer.name}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Batch Provenance Detail Modal with Large Produce Image & Silo Info */}
      {selectedProduceDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                  Farm Batch Registry Certificate
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-900 mt-1">
                  {selectedProduceDetail.name} ({selectedProduceDetail.hindiName})
                </h3>
                <p className="text-xs text-stone-500">
                  Batch #{selectedProduceDetail.harvestInfo.batchNumber} &bull; Sourced directly into {selectedProduceDetail.warehouseName}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduceDetail(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
              >
                &times;
              </button>
            </div>

            {/* Produce Image Header in Modal */}
            <div className="relative h-56 rounded-xl overflow-hidden border border-stone-200">
              <img
                src={selectedProduceDetail.imageUrl || getProduceImage(selectedProduceDetail.id, selectedProduceDetail.category)}
                alt={selectedProduceDetail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 px-2 py-0.5 rounded text-[11px] font-bold">
                      Available Stock: {(selectedProduceDetail.availableStockKg || selectedProduceDetail.stockKg || 1200).toLocaleString('en-IN')} kg
                    </span>
                    <span className="bg-black/60 px-2 py-0.5 rounded text-[11px]">
                      100% Loose &bull; Zero Polish Wax
                    </span>
                  </div>
                  <p className="text-xs text-stone-200 leading-relaxed max-w-lg">
                    {selectedProduceDetail.dietaryNotes}
                  </p>
                </div>
              </div>
            </div>

            {/* Quality & Lab Certifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg text-center">
                <span className="text-stone-500 text-[10px] block">Moisture Verified</span>
                <span className="font-bold text-emerald-800 text-sm">{selectedProduceDetail.harvestInfo.moisturePercent}%</span>
                <span className="text-[9px] text-emerald-700 block">Below 12% Silo Safe</span>
              </div>
              <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg text-center">
                <span className="text-stone-500 text-[10px] block">Sun Drying</span>
                <span className="font-bold text-amber-800 text-sm">{selectedProduceDetail.harvestInfo.sunDryingDays} Days</span>
                <span className="text-[9px] text-amber-700 block">Traditional Solar</span>
              </div>
              <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-lg text-center">
                <span className="text-stone-500 text-[10px] block">Sorting Grade</span>
                <span className="font-bold text-blue-800 text-xs block truncate">
                  {selectedProduceDetail.harvestInfo.sortingGrade ? selectedProduceDetail.harvestInfo.sortingGrade.split(' ')[0] : 'Grade A'}
                </span>
                <span className="text-[9px] text-blue-700 block">Optical Sieve</span>
              </div>
              <div className="bg-stone-100 border border-stone-200 p-2.5 rounded-lg text-center">
                <span className="text-stone-500 text-[10px] block">Chemical Test</span>
                <span className="font-bold text-stone-800 text-xs block">0% Residue</span>
                <span className="text-[9px] text-stone-600 block">Pesticide Free</span>
              </div>
            </div>

            {/* Farmer Profile Card */}
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Cultivator &amp; Land Registry Record
                </h4>
                {selectedProduceDetail.farmer.isPremium && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                    Verified Exporter &amp; Inter-State Partner
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-700">
                <div>
                  <span className="text-stone-400 block text-[10px]">Cultivator Name:</span>
                  <strong className="text-stone-900">{selectedProduceDetail.farmer.name}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Farm Location:</span>
                  <span>{selectedProduceDetail.farmer.village}, {selectedProduceDetail.farmer.district}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Farm Land Area:</span>
                  <span>{selectedProduceDetail.farmer.acreage} Acres</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Soil Chemistry:</span>
                  <span className="font-medium text-stone-800">{selectedProduceDetail.farmer.soilType}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Irrigation Method:</span>
                  <span>{selectedProduceDetail.farmer.irrigation}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">NABL Lab Certificate:</span>
                  <span className="font-mono text-emerald-800 font-semibold">{selectedProduceDetail.harvestInfo.labCertificateId}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setSelectedProduceDetail(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
