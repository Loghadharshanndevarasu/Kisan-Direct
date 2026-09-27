import React, { useState } from 'react';
import {
  ProduceItem,
  WarehouseHub,
  CartItem,
  FarmerEarningsRecord,
  MonthlyTaxReport,
  PlatformFinancials,
  LocalAd,
  DeliveryTrackingInfo,
  DoorstepInspectionRecord,
} from './types';
import {
  WAREHOUSE_HUBS,
  INITIAL_PRODUCE,
  MOCK_FARMER_EARNINGS,
  MOCK_TAX_REPORTS,
  INITIAL_PLATFORM_FINANCIALS,
  LOCAL_ADVERTISEMENTS,
} from './data/mockAgriData';

import { Navbar } from './components/Navbar';
import { LocalAdBanner } from './components/LocalAdBanner';
import { ConsumerMarketplace } from './components/ConsumerMarketplace';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ProvenanceChatbot } from './components/ProvenanceChatbot';
import { AgriPolicyDashboard } from './components/AgriPolicyDashboard';
import { PlatformRevenueManager } from './components/PlatformRevenueManager';
import { CartModal } from './components/CartModal';
import { DeliveryTrackingModal } from './components/DeliveryTrackingModal';
import { MobileInstallModal } from './components/MobileInstallModal';
import { NotificationModal } from './components/NotificationModal';

export default function App() {
  // Navigation tabs: 'marketplace' | 'farmer' | 'chatbot' | 'policy' | 'platform'
  const [activeTab, setActiveTab] = useState<'marketplace' | 'farmer' | 'chatbot' | 'policy' | 'platform'>('marketplace');

  // Hub Selection State
  const [selectedHub, setSelectedHub] = useState<WarehouseHub>(WAREHOUSE_HUBS[0]);

  // Produce State
  const [produceList, setProduceList] = useState<ProduceItem[]>(INITIAL_PRODUCE);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Real-Time Delivery Tracking State
  const [currentDeliveryOrder, setCurrentDeliveryOrder] = useState<DeliveryTrackingInfo | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isMobileInstallOpen, setIsMobileInstallOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Context pre-selection for Chatbot
  const [preselectedProduce, setPreselectedProduce] = useState<ProduceItem | null>(null);

  // Farmer Portal Data State
  const [farmerEarnings, setFarmerEarnings] = useState<FarmerEarningsRecord[]>(MOCK_FARMER_EARNINGS);
  const [taxReports, setTaxReports] = useState<MonthlyTaxReport[]>(MOCK_TAX_REPORTS);

  // Platform and Local Ads State
  const [platformFinancials, setPlatformFinancials] = useState<PlatformFinancials>(INITIAL_PLATFORM_FINANCIALS);
  const [localAds, setLocalAds] = useState<LocalAd[]>(LOCAL_ADVERTISEMENTS);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Add to cart handler
  const handleAddToCart = (
    produce: ProduceItem,
    quantityKg: number,
    unitLabel: string,
    appliedPricePerKg: number
  ) => {
    const existingIndex = cartItems.findIndex((item) => item.produce.id === produce.id);
    if (existingIndex > -1) {
      setCartItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantityKg: item.quantityKg + quantityKg }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${produce.id}`,
        produce,
        quantityKg,
        unitLabel,
        appliedPricePerKg,
      };
      setCartItems((prev) => [...prev, newItem]);
    }

    showToast(`Added ${quantityKg}kg loose ${produce.name} to cart!`);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateCartQuantity = (id: string, newKg: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantityKg: newKg } : item))
    );
  };

  // Inspect batch in AI Chatbot
  const handleInspectBatchWithAI = (produce: ProduceItem) => {
    setPreselectedProduce(produce);
    setActiveTab('chatbot');
  };

  // Handle Order Cancellation (allowed within first half of delivery window)
  const handleCancelOrder = (orderId: string, reason?: string) => {
    if (!currentDeliveryOrder) return;

    // Restore stock back into available silo inventory
    setProduceList((prev) =>
      prev.map((prod) => {
        const item = currentDeliveryOrder.items.find(
          (cartIt) => cartIt.id === prod.id || cartIt.produce.id === prod.id
        );
        if (item) {
          const currentAvailable = prod.availableStockKg ?? prod.stockKg ?? 0;
          return {
            ...prod,
            availableStockKg: currentAvailable + item.quantityKg,
          };
        }
        return prod;
      })
    );

    const refundedAmount = currentDeliveryOrder.totalAmountPaid;

    setCurrentDeliveryOrder((prev) =>
      prev
        ? {
            ...prev,
            status: 'cancelled',
            cancellationReason: reason || 'Customer requested before 50% cutoff window',
            refundAmount: refundedAmount,
            refundStatus: 'completed',
          }
        : null
    );

    showToast(`Order #${orderId} cancelled. 100% refund of ₹${refundedAmount} processed!`);
  };

  // Handle 3-Minute Doorstep Inspection Return (Defect / Damaged / Weight Mismatch)
  const handleReturnOrderAtDoorstep = (inspectionRecord: DoorstepInspectionRecord) => {
    if (!currentDeliveryOrder) return;

    // Restore stock back into available silo inventory
    setProduceList((prev) =>
      prev.map((prod) => {
        const item = currentDeliveryOrder.items.find(
          (cartIt) => cartIt.id === prod.id || cartIt.produce.id === prod.id
        );
        if (item) {
          const currentAvailable = prod.availableStockKg ?? prod.stockKg ?? 0;
          return {
            ...prod,
            availableStockKg: currentAvailable + item.quantityKg,
          };
        }
        return prod;
      })
    );

    setCurrentDeliveryOrder((prev) =>
      prev
        ? {
            ...prev,
            status: 'returned_at_doorstep',
            doorstepInspection: inspectionRecord,
          }
        : null
    );

    showToast(`Produce returned to driver partner at doorstep. Verification code: ${inspectionRecord.driverVerificationCode}. Zero payment settled!`);
  };

  // Farmer adds new harvest batch
  const handleAddHarvestBatch = (batchData: any) => {
    const newId = `produce-${Date.now()}`;
    const newBatchNumber = `MH-NSK-${Math.floor(100 + Math.random() * 900)}`;

    const newProduce: ProduceItem = {
      id: newId,
      name: batchData.name,
      hindiName: batchData.name,
      category: batchData.category,
      tier: batchData.tier,
      isLooseOnly: true,
      pricePerKg: batchData.pricePerKg,
      marketMandiPricePerKg: Math.round(batchData.pricePerKg * 1.35),
      availableStockKg: batchData.quantityKg,
      warehouseName: selectedHub.name,
      looseUnits: ['1 kg Loose Bag', '5 kg Cotton Sack', '25 kg Jute Bag'],
      looseUnitOptions: ['1 kg Loose Bag', '5 kg Cotton Sack', '25 kg Jute Bag'],
      description: `Direct farm-gate loose harvest from Dindori cluster. Cleaned and sun-dried, verified moisture certified at ${selectedHub.name}.`,
      farmer: {
        id: 'FARMER-MH-NSK-101',
        name: 'Shri Rameshwar B. Patil',
        village: 'Dindori, Nashik',
        district: 'Nashik',
        state: 'Maharashtra',
        distanceToWarehouseKm: 18,
        isProximityDiscountEligible: true,
        isPremiumInterstateSeller: true,
        isPremium: true,
        acreage: 6.5,
        soilType: batchData.soilType,
        irrigation: 'Drip Irrigation & Well Water',
        experienceYears: 24,
        memberSince: '2023',
      },
      harvestInfo: {
        harvestDate: batchData.harvestDate,
        sowingDate: '2026-06-12',
        sunDryingDays: 4,
        moisturePercent: 11.2,
        sortingGrade: 'Grade A (Premium Kitchen)',
        pesticideFree: true,
        organicCertified: false,
        batchNumber: newBatchNumber,
        labCertificateId: 'NABL-NSK-2026-7891',
      },
      feeStructure: {
        farmerSharePercent: batchData.tier === 'on-demand' ? 91.2 : 80.0,
        platformFeePercent: batchData.tier === 'on-demand' ? 3.0 : 6.0,
        logisticsFeePercent: 3.8,
        inventoryHoldingFeePercent: batchData.tier === 'on-demand' ? 2.0 : 6.0,
        underdogFixedServiceFeeRs: batchData.tier === 'underdog' ? 250 : 0,
      },
      warehouseId: selectedHub.id,
    };

    setProduceList((prev) => [newProduce, ...prev]);

    // Record in earnings history
    const grossVal = batchData.quantityKg * batchData.pricePerKg;
    const sharePercent = batchData.tier === 'on-demand' ? 0.912 : 0.80;
    const netPayout = Math.round(grossVal * sharePercent);

    const newEarning: FarmerEarningsRecord = {
      id: `earn-${Date.now()}`,
      farmerId: 'FARMER-MH-NSK-101',
      farmerName: 'Shri Rameshwar B. Patil',
      produceId: newId,
      produceName: batchData.name,
      batchNumber: newBatchNumber,
      tier: batchData.tier,
      quantitySoldKg: batchData.quantityKg,
      pricePerKg: batchData.pricePerKg,
      grossAmount: grossVal,
      farmerPayout: netPayout,
      platformFee: Math.round(grossVal * 0.03),
      logisticsFee: Math.round(grossVal * 0.038),
      warehouseStorageFee: Math.round(grossVal * 0.02),
      underdogFixedFee: batchData.tier === 'underdog' ? 250 : 0,
      date: new Date().toISOString().split('T')[0],
      destinationState: 'Maharashtra Regional Warehouse',
      isInterstateOrExport: false,
      taxStatus: 'Sec 10(1) Exempt (Agricultural Produce)',
    };

    setFarmerEarnings((prev) => [newEarning, ...prev]);
    showToast(`Batch ${newBatchNumber} successfully added to loose marketplace inventory!`);
  };

  // Add new local ad
  const handleAddNewLocalAd = (newAdData: any) => {
    const newAd: LocalAd = {
      id: `ad-${Date.now()}`,
      title: newAdData.title,
      businessName: newAdData.businessName,
      locationHub: newAdData.locationHub,
      contactNumber: newAdData.contactNumber,
      tagline: newAdData.tagline,
      category: newAdData.category,
      badge: newAdData.badge || 'Local Farm Partner',
      monthlyRevenueRs: newAdData.monthlyRevenueRs || 4500,
      impressions: 120,
      clicks: 8,
      verifiedLocal: true,
    };

    setLocalAds((prev) => [newAd, ...prev]);

    // Increase platform ad revenue
    setPlatformFinancials((prev) => ({
      ...prev,
      localAdRevenueMonthly: prev.localAdRevenueMonthly + newAd.monthlyRevenueRs,
      totalGrossPlatformRevenue: prev.totalGrossPlatformRevenue + newAd.monthlyRevenueRs,
      netPlatformProfitMonthly: prev.netPlatformProfitMonthly + Math.round(newAd.monthlyRevenueRs * 0.7),
    }));

    showToast(`Local Ad "${newAd.title}" published for ${newAd.locationHub}!`);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedHub={selectedHub}
        onSelectHub={setSelectedHub}
        allHubs={WAREHOUSE_HUBS}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantityKg, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        activeTrackingOrder={currentDeliveryOrder}
        onOpenTracking={() => setIsTrackingModalOpen(true)}
        onOpenInstallModal={() => setIsMobileInstallOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
      />

      {/* Real-Time Live Farm Dispatch Banner (when order is active, cancelled, or returned) */}
      {currentDeliveryOrder && (
        currentDeliveryOrder.status === 'cancelled' ? (
          <div className="bg-gradient-to-r from-rose-950 via-stone-900 to-rose-900 text-white px-4 py-2 border-b border-rose-700/60 shadow-xs">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="font-semibold text-rose-300">
                  Order #{currentDeliveryOrder.orderId} Cancelled:
                </span>
                <span className="text-stone-300">
                  100% Refund (₹{currentDeliveryOrder.refundAmount || currentDeliveryOrder.totalAmountPaid}) Processed
                </span>
                <span className="hidden sm:inline text-stone-500">|</span>
                <span className="hidden sm:inline text-stone-300">
                  {currentDeliveryOrder.totalWeightKg.toFixed(2)} kg restocked to {currentDeliveryOrder.warehouseHubName} silo
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTrackingModalOpen(true)}
                  className="bg-rose-700 hover:bg-rose-600 text-white px-2.5 py-1 rounded text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  View Refund Receipt
                </button>
                <button
                  onClick={() => setCurrentDeliveryOrder(null)}
                  className="text-stone-400 hover:text-white text-xs px-1 cursor-pointer"
                  title="Dismiss banner"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ) : currentDeliveryOrder.status === 'returned_at_doorstep' ? (
          <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white px-4 py-2 border-b border-amber-700/60 shadow-xs">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-semibold text-amber-300">
                  Order #{currentDeliveryOrder.orderId} Returned to Driver:
                </span>
                <span className="text-stone-300">
                  3-Minute Doorstep Inspection Verified • ₹0 Due / 100% UPI Reversal
                </span>
                <span className="hidden sm:inline text-stone-500">|</span>
                <span className="hidden sm:inline text-stone-300">
                  Driver: {currentDeliveryOrder.driverName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTrackingModalOpen(true)}
                  className="bg-amber-700 hover:bg-amber-600 text-white px-2.5 py-1 rounded text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  View Doorstep Slip
                </button>
                <button
                  onClick={() => setCurrentDeliveryOrder(null)}
                  className="text-stone-400 hover:text-white text-xs px-1 cursor-pointer"
                  title="Dismiss banner"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white px-4 py-2 border-b border-emerald-700/60 shadow-xs">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-emerald-300">
                  Live Farm Dispatch En Route:
                </span>
                <span className="text-stone-300">
                  Order #{currentDeliveryOrder.orderId} ({currentDeliveryOrder.totalWeightKg.toFixed(2)} kg loose)
                </span>
                <span className="hidden sm:inline text-stone-500">|</span>
                <span className="hidden sm:inline text-stone-300">
                  Vehicle: {currentDeliveryOrder.vehicleNumber} (Mahindra EV)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-mono font-bold">
                  ETA: ~{currentDeliveryOrder.currentEtaMinutes} mins
                </span>
                <button
                  onClick={() => setIsTrackingModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Track &amp; Manage (Cancel Window)
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Hyperlocal Regional Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 w-full">
        <LocalAdBanner
          currentHubName={selectedHub.name}
          ads={localAds}
          onOpenAdManager={() => setActiveTab('platform')}
        />
      </div>

      {/* Main Content View Switcher */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex-1 w-full">
        {activeTab === 'marketplace' && (
          <ConsumerMarketplace
            produceList={produceList}
            selectedHub={selectedHub}
            onAddToCart={handleAddToCart}
            onInspectBatchWithAI={handleInspectBatchWithAI}
          />
        )}

        {activeTab === 'farmer' && (
          <FarmerDashboard
            selectedHub={selectedHub}
            earningsRecords={farmerEarnings}
            taxReports={taxReports}
            onAddHarvestBatch={handleAddHarvestBatch}
          />
        )}

        {activeTab === 'chatbot' && (
          <ProvenanceChatbot
            produceList={produceList}
            preselectedProduce={preselectedProduce}
            onClearPreselection={() => setPreselectedProduce(null)}
          />
        )}

        {activeTab === 'policy' && <AgriPolicyDashboard />}

        {activeTab === 'platform' && (
          <PlatformRevenueManager
            financials={platformFinancials}
            localAds={localAds}
            onAddNewLocalAd={handleAddNewLocalAd}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800 py-8 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-bold text-white text-sm font-serif">
              KisanDirect &bull; Direct Loose Agrarian Platform
            </div>
            <p className="text-stone-400 max-w-xl">
              Strictly loose unbranded pulses, grains, and oilseeds sourced from verified smallholders within regional warehouse clusters. Zero arhtiya commission, transparent payouts, and Section 10(1) tax compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-stone-300">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="hover:text-white transition-colors"
            >
              Produce Bazaar
            </button>
            <button
              onClick={() => setActiveTab('farmer')}
              className="hover:text-white transition-colors"
            >
              Farmer Portal
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className="hover:text-white transition-colors"
            >
              Provenance AI
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className="hover:text-white transition-colors"
            >
              55% vs 11% GDP
            </button>
            <button
              onClick={() => setActiveTab('platform')}
              className="hover:text-white transition-colors"
            >
              Platform Financials
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
          <span>&copy; {new Date().getFullYear()} KisanDirect. Built for Indian smallholder farmers & conscious consumers.</span>
          <span>Regional Hubs: Nashik &bull; Guntur &bull; Karnal &bull; Indore &bull; Thanjavur &bull; Kalaburagi</span>
        </div>
      </footer>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        selectedHub={selectedHub}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClearCart={() => setCartItems([])}
        onOrderPlacedSuccess={(trackingData) => {
          setCurrentDeliveryOrder(trackingData);
          setIsTrackingModalOpen(true);
        }}
      />

      {/* Real-Time Live Delivery Route Tracker Modal */}
      <DeliveryTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        trackingInfo={currentDeliveryOrder}
        onAdvanceMilestone={() => {
          showToast('Updated live delivery dispatch waypoint!');
        }}
        onCancelOrder={handleCancelOrder}
        onReturnOrderAtDoorstep={handleReturnOrderAtDoorstep}
      />

      {/* Mobile App PWA Install Modal */}
      {isMobileInstallOpen && (
        <MobileInstallModal
          isOpen={isMobileInstallOpen}
          onClose={() => setIsMobileInstallOpen(false)}
        />
      )}

      {/* Push Notification Preferences & Dispatch Alerts Modal */}
      {isNotificationModalOpen && (
        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl border border-stone-700 text-xs flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
