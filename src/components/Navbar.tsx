import React from 'react';
import { WarehouseHub, DeliveryTrackingInfo } from '../types';
import {
  ShoppingBag,
  Tractor,
  Bot,
  TrendingUp,
  Landmark,
  MapPin,
  Percent,
  CheckCircle2,
  Wheat,
  Truck,
  Ban,
  RotateCcw,
  Smartphone,
  Bell
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'marketplace' | 'farmer' | 'chatbot' | 'policy' | 'platform';
  setActiveTab: (tab: 'marketplace' | 'farmer' | 'chatbot' | 'policy' | 'platform') => void;
  selectedHub: WarehouseHub;
  onSelectHub: (hub: WarehouseHub) => void;
  allHubs: WarehouseHub[];
  cartCount: number;
  onOpenCart: () => void;
  activeTrackingOrder?: DeliveryTrackingInfo | null;
  onOpenTracking?: () => void;
  onOpenInstallModal?: () => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedHub,
  onSelectHub,
  allHubs,
  cartCount,
  onOpenCart,
  activeTrackingOrder,
  onOpenTracking,
  onOpenInstallModal,
  onOpenNotifications,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Utility Bar */}
      <div className="bg-stone-950 px-4 py-1.5 text-xs text-stone-300 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Unbranded Loose Produce Only
            </span>
            <span className="text-stone-600 hidden md:inline">|</span>
            <span className="text-stone-400 hidden md:inline">
              Zero Corporate Brand Markups • Transparent Farm Payouts
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Regional Warehouse Hub Selector */}
            <div className="flex items-center gap-1.5 bg-stone-900/90 px-2.5 py-0.5 rounded border border-stone-700/60">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-stone-400 text-xs hidden sm:inline">Hub:</span>
              <select
                aria-label="Select Regional Warehouse Hub"
                value={selectedHub.id}
                onChange={(e) => {
                  const found = allHubs.find((h) => h.id === e.target.value);
                  if (found) onSelectHub(found);
                }}
                className="bg-transparent text-amber-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                {allHubs.map((hub) => (
                  <option key={hub.id} value={hub.id} className="bg-stone-900 text-stone-100">
                    {hub.name} ({hub.state}) - {hub.proximityDiscountPercent}% Proximity Discount
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded text-xs border border-emerald-800/50">
              <Percent className="w-3 h-3 text-emerald-400" />
              <span>{selectedHub.proximityDiscountPercent}% Local Saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
              <Wheat className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-serif">
                  KisanDirect
                </span>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-medium px-2 py-0.5 rounded border border-amber-500/30">
                  किसान डायरेक्ट
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Direct Loose Harvest &bull; Transparent Sourcing
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-950/60 p-1 rounded-xl border border-stone-800">
            <button
              id="nav-tab-marketplace"
              onClick={() => setActiveTab('marketplace')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'marketplace'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Wheat className="w-4 h-4" />
              <span>Produce Bazaar</span>
            </button>

            <button
              id="nav-tab-farmer"
              onClick={() => setActiveTab('farmer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'farmer'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Tractor className="w-4 h-4" />
              <span>Farmer Portal & Tax</span>
            </button>

            <button
              id="nav-tab-chatbot"
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'chatbot'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Provenance AI</span>
            </button>

            <button
              id="nav-tab-policy"
              onClick={() => setActiveTab('policy')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'policy'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>55% Pop vs 11% GDP</span>
            </button>

            <button
              id="nav-tab-platform"
              onClick={() => setActiveTab('platform')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'platform'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Platform & Ads</span>
            </button>
          </nav>

          {/* Action Buttons: Live Tracking, Notifications, Mobile App & Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile App Install Button */}
            {onOpenInstallModal && (
              <button
                id="open-pwa-install-btn"
                onClick={onOpenInstallModal}
                className="hidden md:flex items-center gap-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 px-2.5 py-2 rounded-xl text-xs font-semibold shadow-xs border border-stone-700 transition-colors"
                title="Install KisanDirect Mobile PWA"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>App</span>
              </button>
            )}

            {/* Notification Center Alert Button */}
            {onOpenNotifications && (
              <button
                id="open-notifications-btn"
                onClick={onOpenNotifications}
                className="p-2 bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white rounded-xl text-xs font-semibold shadow-xs border border-stone-700 transition-colors relative"
                title="Delivery & Doorstep Alerts"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>
            )}

            {/* Tracking Button (STRICT: Never blinks when cancelled or returned) */}
            {activeTrackingOrder && onOpenTracking && (
              activeTrackingOrder.status === 'cancelled' ? (
                <button
                  id="open-tracking-button"
                  onClick={onOpenTracking}
                  className="relative flex items-center gap-1.5 bg-stone-800 hover:bg-stone-750 text-rose-300 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs border border-rose-800/60 transition-all cursor-pointer"
                  title="View cancelled order and refund receipt"
                >
                  <Ban className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Order Cancelled:</span>
                  <span className="text-emerald-300 font-mono">100% Refunded</span>
                </button>
              ) : activeTrackingOrder.status === 'returned_at_doorstep' ? (
                <button
                  id="open-tracking-button"
                  onClick={onOpenTracking}
                  className="relative flex items-center gap-1.5 bg-stone-800 hover:bg-stone-750 text-amber-300 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs border border-amber-800/60 transition-all cursor-pointer"
                  title="View doorstep returned produce receipt"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Doorstep Returned:</span>
                  <span className="text-emerald-300 font-mono">₹0 Paid</span>
                </button>
              ) : (
                <button
                  id="open-tracking-button"
                  onClick={onOpenTracking}
                  className="relative flex items-center gap-1.5 bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs border border-emerald-500/40 transition-all animate-pulse cursor-pointer"
                  title="Track active farm dispatch live"
                >
                  <Truck className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Live Dispatch:</span>
                  <span className="font-mono text-emerald-200">~{activeTrackingOrder.currentEtaMinutes}m</span>
                </button>
              )
            )}

            <button
              id="open-cart-button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Loose Cart</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-stone-950 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-1.5 pt-3 pb-1 border-t border-stone-800 mt-2">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
              activeTab === 'marketplace' ? 'bg-emerald-700 text-white' : 'bg-stone-800 text-stone-300'
            }`}
          >
            <Wheat className="w-3.5 h-3.5" />
            Produce Bazaar
          </button>
          <button
            onClick={() => setActiveTab('farmer')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
              activeTab === 'farmer' ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-300'
            }`}
          >
            <Tractor className="w-3.5 h-3.5" />
            Farmer & Tax
          </button>
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
              activeTab === 'chatbot' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Provenance AI
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
              activeTab === 'policy' ? 'bg-indigo-700 text-white' : 'bg-stone-800 text-stone-300'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            55% vs 11% GDP
          </button>
          <button
            onClick={() => setActiveTab('platform')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
              activeTab === 'platform' ? 'bg-stone-700 text-white' : 'bg-stone-800 text-stone-300'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            Platform & Ads
          </button>
        </div>
      </div>
    </header>
  );
};
