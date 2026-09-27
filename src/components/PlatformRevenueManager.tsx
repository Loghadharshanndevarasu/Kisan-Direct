import React, { useState } from 'react';
import { LocalAd, PlatformFinancials } from '../types';
import {
  Landmark,
  DollarSign,
  TrendingUp,
  Megaphone,
  MapPin,
  ShieldCheck,
  PlusCircle,
  Eye,
  MousePointerClick,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowUpRight,
  Phone
} from 'lucide-react';

interface PlatformRevenueManagerProps {
  financials: PlatformFinancials;
  localAds: LocalAd[];
  onAddNewLocalAd: (newAd: any) => void;
}

export const PlatformRevenueManager: React.FC<PlatformRevenueManagerProps> = ({
  financials,
  localAds,
  onAddNewLocalAd,
}) => {
  const [showAdModal, setShowAdModal] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adBusiness, setAdBusiness] = useState('');
  const [adHub, setAdHub] = useState('Nashik Agri-Cluster Hub');
  const [adPhone, setAdPhone] = useState('+91 98220 00111');
  const [adTagline, setAdTagline] = useState('');
  const [adCategory, setAdCategory] = useState<LocalAd['category']>('Farm Machinery & Rental');
  const [adSubmittedNotice, setAdSubmittedNotice] = useState(false);

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle || !adBusiness) return;

    onAddNewLocalAd({
      title: adTitle,
      businessName: adBusiness,
      locationHub: adHub,
      contactNumber: adPhone,
      tagline: adTagline,
      category: adCategory,
      badge: 'Local Farm Partner',
      monthlyRevenueRs: 4500,
    });

    setAdSubmittedNotice(true);
    setTimeout(() => {
      setAdSubmittedNotice(false);
      setShowAdModal(false);
      setAdTitle('');
      setAdBusiness('');
      setAdTagline('');
    }, 1500);
  };

  const totalLocalAdRevenue = localAds.reduce((acc, a) => acc + a.monthlyRevenueRs, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
            <Landmark className="w-3.5 h-3.5" />
            Platform Economics & Business Model
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
            Platform Revenue, Net Profit & Hyperlocal Ad Engine
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed">
            KisanDirect operates on sustainable micro-margins (3–6% platform fee, warehouse holding, and logistics facilitation) while maintaining a healthy <strong>22.6% net operating margin</strong>.
            We strictly run <strong>local agricultural advertisements</strong> for nearby farm businesses instead of intrusive international corporate banners.
          </p>
        </div>
      </div>

      {/* Primary Financial Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Monthly Gross Merchandise Value (GMV)</span>
          <div className="text-2xl font-bold text-stone-900">
            ₹{(financials.gmvMonthly / 10000000).toFixed(2)} Crores
          </div>
          <p className="text-[11px] text-stone-400">Total loose produce traded through hubs</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Direct Farmer Payout (89.0%)</span>
          <div className="text-2xl font-bold text-emerald-700">
            ₹{(financials.farmerPayoutMonthly / 10000000).toFixed(2)} Crores
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">Paid out directly to farmers within 24h</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Gross Platform Revenue</span>
          <div className="text-2xl font-bold text-stone-900">
            ₹{(financials.totalGrossPlatformRevenue / 100000).toFixed(2)} Lakhs
          </div>
          <p className="text-[11px] text-stone-400">From commission, storage, freight, & local ads</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Net Platform Profit</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">
              ₹{(financials.netPlatformProfitMonthly / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
              {financials.netMarginPercent}% Net
            </span>
          </div>
          <p className="text-[11px] text-stone-400">After all warehouse leases, QA, & logistics costs</p>
        </div>
      </div>

      {/* Revenue & Operating Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Streams */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base font-serif flex items-center justify-between">
            <span>Platform Revenue Inflow Breakdown</span>
            <span className="text-xs font-mono text-stone-500">Monthly Run Rate</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center">
              <div>
                <strong className="text-stone-900 block">1. Platform Commission (Avg 3.2%)</strong>
                <span className="text-stone-500">Applied on successful consumer purchase dispatches</span>
              </div>
              <span className="font-bold text-stone-900 text-sm">
                ₹{financials.platformCommissionRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center">
              <div>
                <strong className="text-stone-900 block">2. Warehouse Silo Holding & Climate Aeration</strong>
                <span className="text-stone-500">2% for on-demand staples; 6% for underdog specialty crops</span>
              </div>
              <span className="font-bold text-stone-900 text-sm">
                ₹{financials.warehouseHoldingRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center">
              <div>
                <strong className="text-stone-900 block">3. Logistics & Local Freight Facilitation Margin</strong>
                <span className="text-stone-500">Electric mini-truck fleet aggregation & route optimization</span>
              </div>
              <span className="font-bold text-stone-900 text-sm">
                ₹{financials.logisticsFeeRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 flex justify-between items-center">
              <div>
                <strong className="text-amber-950 block">4. Hyperlocal Agricultural Advertisements</strong>
                <span className="text-amber-800">40+ local tractors, vermicompost, solar pump sponsors</span>
              </div>
              <span className="font-bold text-amber-900 text-sm">
                ₹{financials.localAdRevenueMonthly.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-sm">
              <span className="text-stone-900">Total Monthly Gross Revenue:</span>
              <span className="text-stone-900">₹{financials.totalGrossPlatformRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Operating Costs */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base font-serif flex items-center justify-between">
            <span>Operational Expenses & Overheads</span>
            <span className="text-xs font-mono text-stone-500">Monthly Outflow</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center">
              <div>
                <strong className="text-stone-900 block">Regional Warehouse Leases (6 Hubs)</strong>
                <span className="text-stone-500">Nashik, Guntur, Karnal, Indore, Thanjavur, Kalaburagi</span>
              </div>
              <span className="font-bold text-stone-800">
                ₹{financials.operatingCosts.warehouseLeases.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center">
              <div>
                <strong className="text-stone-900 block">Logistics Partner Driver Payouts</strong>
                <span className="text-stone-500">Mini-truck drivers, fuel, toll, and rural cluster transport</span>
              </div>
              <span className="font-bold text-stone-800">
                ₹{financials.operatingCosts.logisticsPartnerPayout.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center">
              <div>
                <strong className="text-stone-900 block">NABL Lab Testing & Moisture Sorting QA</strong>
                <span className="text-stone-500">Quality inspection certification for all farmer batches</span>
              </div>
              <span className="font-bold text-stone-800">
                ₹{financials.operatingCosts.labTestingAndQuality.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center">
              <div>
                <strong className="text-stone-900 block">Vernacular Rural Support Helpline</strong>
                <span className="text-stone-500">Support in Marathi, Telugu, Hindi, Tamil, Kannada</span>
              </div>
              <span className="font-bold text-stone-800">
                ₹{financials.operatingCosts.customerSupportRural.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center">
              <div>
                <strong className="text-stone-900 block">Cloud Hosting & Gemini AI Inference</strong>
                <span className="text-stone-500">Database, Provenance AI chatbot, SMS alerts</span>
              </div>
              <span className="font-bold text-stone-800">
                ₹{financials.operatingCosts.cloudAndEngineering.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-sm text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
              <span>Clean Net Platform Profit (Earnings):</span>
              <span>₹{financials.netPlatformProfitMonthly.toLocaleString('en-IN')} / mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hyperlocal Advertisements Engine */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Strictly Local Advertisements Only
              </span>
              <span className="text-xs text-stone-400">&bull;</span>
              <span className="text-xs text-stone-500">No international corporate ads</span>
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-serif mt-1">
              Regional Hyperlocal Agri-Business Ad Network
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              We empower local tractor rental providers, organic vermicompost producers, solar pump installers, and jute sack weavers within each regional hub radius.
            </p>
          </div>

          <button
            onClick={() => setShowAdModal(true)}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Local Ad Slot</span>
          </button>
        </div>

        {/* Active Local Ads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/80 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    {ad.category}
                  </span>
                  <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {ad.badge}
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-sm leading-snug">
                  {ad.title}
                </h4>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {ad.tagline}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-700" />
                    {ad.locationHub}
                  </span>
                  <span>&bull;</span>
                  <span className="font-medium text-stone-700">{ad.businessName}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {ad.impressions.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    {ad.clicks} calls
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">₹{ad.monthlyRevenueRs}/mo</span>
                  <a
                    href={`tel:${ad.contactNumber}`}
                    className="p-1.5 bg-stone-900 text-white rounded-md hover:bg-stone-800"
                    title={`Call ${ad.contactNumber}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Book Local Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase">
                  Hyperlocal Advertising
                </span>
                <h4 className="font-bold text-stone-900 text-lg mt-0.5">
                  Book Local Agri-Business Ad Slot
                </h4>
              </div>
              <button
                onClick={() => setShowAdModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            {adSubmittedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Local business ad created and activated in selected hub!</span>
              </div>
            )}

            <form onSubmit={handleCreateAd} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Ad Headline:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50HP John Deere Tractor with Laser Leveler for Rent"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Local Business Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kisan Seva Custom Hiring Center (Dindori)"
                  value={adBusiness}
                  onChange={(e) => setAdBusiness(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Regional Hub:</label>
                  <select
                    value={adHub}
                    onChange={(e) => setAdHub(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Nashik Agri-Cluster Hub">Nashik Agri-Cluster Hub</option>
                    <option value="Guntur Krishna-Delta Hub">Guntur Krishna-Delta Hub</option>
                    <option value="Karnal Granary Hub">Karnal Granary Hub</option>
                    <option value="Indore Malwa Plateau Hub">Indore Malwa Plateau Hub</option>
                    <option value="Thanjavur Cauvery Delta Hub">Thanjavur Cauvery Delta Hub</option>
                    <option value="Kalaburagi Red Gram Special Hub">Kalaburagi Red Gram Special Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Ad Category:</label>
                  <select
                    value={adCategory}
                    onChange={(e) => setAdCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Farm Machinery & Rental">Farm Machinery & Rental</option>
                    <option value="Organic Bio-Compost">Organic Bio-Compost</option>
                    <option value="Solar Agro Pumps">Solar Agro Pumps</option>
                    <option value="Jute & Gunny Packaging">Jute & Gunny Packaging</option>
                    <option value="Soil Testing & Seedlings">Soil Testing & Seedlings</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Contact Phone Number:</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98220 12345"
                  value={adPhone}
                  onChange={(e) => setAdPhone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Offer Tagline / Details:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. ₹500/hr including fuel and driver. Free farm-gate delivery within 25km radius."
                  value={adTagline}
                  onChange={(e) => setAdTagline(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="bg-stone-50 p-2.5 rounded-lg border text-stone-600 text-[11px]">
                Monthly sponsorship fee: <strong>₹4,500/month</strong> for 15,000+ targeted local farmer and consumer impressions within the selected warehouse radius.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold"
                >
                  Activate Local Ad Slot
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdModal(false)}
                  className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg font-medium hover:bg-stone-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
