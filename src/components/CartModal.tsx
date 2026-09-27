import React, { useState } from 'react';
import { CartItem, WarehouseHub, DeliveryTrackingInfo, GeoLocationPoint } from '../types';
import { MapLocationPicker } from './MapLocationPicker';
import {
  ShoppingBag,
  Trash2,
  CheckCircle2,
  Truck,
  Percent,
  MapPin,
  ShieldCheck,
  Wheat,
  X,
  ArrowRight,
  QrCode,
  Smartphone,
  CreditCard,
  Banknote,
  Info,
  Sparkles,
  Navigation,
  Map,
  Compass
} from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  selectedHub: WarehouseHub;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, newKg: number) => void;
  onClearCart: () => void;
  onOrderPlacedSuccess?: (trackingInfo: DeliveryTrackingInfo) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  selectedHub,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onOrderPlacedSuccess,
}) => {
  const [customerName, setCustomerName] = useState('Ananya Deshmukh');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Samarth Residency, College Road, Nashik');
  const [deliveryPincode, setDeliveryPincode] = useState('422005');
  const [distanceKm, setDistanceKm] = useState<number>(5); // default 5 km from hub
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<GeoLocationPoint>({ lat: 19.9975, lng: 73.7898 });
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  // Payment State
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'COD'>('UPI');
  const [upiSubMode, setUpiSubMode] = useState<'qr' | 'apps' | 'vpa'>('qr');
  const [upiVpaInput, setUpiVpaInput] = useState('ananya@okhdfcbank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<DeliveryTrackingInfo | null>(null);

  if (!isOpen) return null;

  const totalKg = cartItems.reduce((acc, item) => acc + item.quantityKg, 0);
  const grossProduceTotal = cartItems.reduce(
    (acc, item) => acc + item.appliedPricePerKg * item.quantityKg,
    0
  );

  // Delivery Fee Calculation Rules:
  // 1. More than 3.5kg worth produce: Delivery is FREE (0 rupees).
  // 2. Less than or equal to 3.5kg: Based on distance (radius <= 50km):
  //    - Within 3 km: 2 rupees per km
  //    - More than 3 km: each extra km 3 rupees
  //    - Transparent breakdown display: e.g. 5km => 3km * 2rupees + extra 2km * 3rupees = 12 rupees.
  const isFreeDelivery = totalKg > 3.5;

  const firstTierKm = Math.min(distanceKm, 3);
  const extraTierKm = Math.max(0, distanceKm - 3);
  const firstTierCharge = firstTierKm * 2;
  const extraTierCharge = extraTierKm * 3;
  const standardDeliveryFee = firstTierCharge + extraTierCharge;
  const deliveryFee = isFreeDelivery ? 0 : standardDeliveryFee;

  const finalTotalAmount = Math.round(grossProduceTotal + deliveryFee);

  // Transparent fee breakdown across produce
  const farmerShareAmount = cartItems.reduce((acc, item) => {
    const share = item.produce.feeStructure.farmerSharePercent / 100;
    return acc + item.appliedPricePerKg * item.quantityKg * share;
  }, 0);

  const logisticsAmount = cartItems.reduce((acc, item) => {
    const logPercent = item.produce.feeStructure.logisticsFeePercent / 100;
    return acc + item.appliedPricePerKg * item.quantityKg * logPercent;
  }, 0);

  const platformAmount = cartItems.reduce((acc, item) => {
    const platPercent = item.produce.feeStructure.platformFeePercent / 100;
    return acc + item.appliedPricePerKg * item.quantityKg * platPercent;
  }, 0);

  const inventoryAmount = grossProduceTotal - farmerShareAmount - logisticsAmount - platformAmount;
  const equivalentBrandedMarketValue = Math.round(grossProduceTotal * 1.35);
  const totalConsumerSavings = equivalentBrandedMarketValue - grossProduceTotal;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const receiptId = `KD-ORD-${Date.now().toString().slice(-6)}`;
      const upiRef =
        paymentMode === 'UPI'
          ? `UPI/20260922/${Math.floor(10000000 + Math.random() * 90000000)}`
          : undefined;

      const etaMinutes = Math.min(45, Math.max(15, Math.round(distanceKm * 3.5)));
      const durationSeconds = etaMinutes * 60;
      const cancellationSeconds = Math.floor(durationSeconds / 2);

      const trackingData: DeliveryTrackingInfo = {
        orderId: receiptId,
        placedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        placedTimestamp: Date.now(),
        totalDurationSeconds: durationSeconds,
        cancellationWindowSeconds: cancellationSeconds,
        status: 'active',
        customerName,
        deliveryAddress: `${deliveryAddress} (PIN: ${deliveryPincode})`,
        deliveryCoordinates: deliveryCoordinates,
        distanceKm,
        warehouseHubName: selectedHub.name,
        items: [...cartItems],
        totalWeightKg: totalKg,
        totalAmountPaid: finalTotalAmount,
        paymentMethod: paymentMode === 'UPI' ? 'UPI' : 'Cash on Delivery',
        upiTransactionRef: upiRef,
        driverName: 'Anand Shinde',
        driverPhone: '+91 98221 44552',
        vehicleNumber: 'MH-15-EV-4421',
        currentEtaMinutes: etaMinutes,
        deliveryFeeCharged: deliveryFee,
        freeDeliveryUnlocked: isFreeDelivery,
        currentMilestoneIndex: 2, // starts at Dispatched from Silo
        milestones: [
          {
            id: 'confirmed',
            title: 'Order Verified & Silo Batch Checked',
            description: `Batch moisture tested (< 11%) and verified at ${selectedHub.name}`,
            timestamp: '09:40 AM',
            completed: true,
            active: false,
          },
          {
            id: 'weighed_packed',
            title: 'Weighed & Packed in Food-Grade Loose Jute',
            description: `${totalKg.toFixed(2)} kg loose produce weighed on certified electronic scale`,
            timestamp: '09:44 AM',
            completed: true,
            active: false,
          },
          {
            id: 'dispatched',
            title: 'Dispatched in Electric Mini-Truck',
            description: `Leaving ${selectedHub.name} via Ring Road Corridor (Vehicle: MH-15-EV-4421)`,
            timestamp: '09:48 AM',
            completed: true,
            active: true,
          },
          {
            id: 'out_for_delivery',
            title: 'Out for Last-Mile Doorstep Delivery',
            description: `Driver Anand Shinde approaching ${deliveryAddress.split(',')[0]}`,
            timestamp: 'Pending (~18 min)',
            completed: false,
            active: false,
          },
          {
            id: 'delivered',
            title: 'Quality Seal Checked & Delivered',
            description: 'Direct farm produce delivered in unbranded breathable bags',
            timestamp: 'Pending',
            completed: false,
            active: false,
          },
        ],
      };

      setPaymentSuccessData(trackingData);

      if (onOrderPlacedSuccess) {
        onOrderPlacedSuccess(trackingData);
      }
    }, 1200);
  };

  const handleFinishAndTrack = () => {
    const data = paymentSuccessData;
    onClearCart();
    onClose();
    if (data && onOrderPlacedSuccess) {
      onOrderPlacedSuccess(data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
        
        {/* Modal Header */}
        <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif">
                Loose Farm Cart &amp; Direct Payout Checkout
              </h3>
              <p className="text-[11px] text-stone-400">
                Sourced from: <strong>{selectedHub.name}</strong> ({selectedHub.district})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {paymentSuccessData ? (
            /* Order Placed Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-stone-900 font-serif">
                  Order Confirmed &amp; Payment Successful!
                </h4>
                <p className="text-xs text-stone-500 mt-1 font-mono">
                  Receipt: {paymentSuccessData.orderId} • Fulfilled by {selectedHub.name}
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-left space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-stone-500">Customer Name:</span>
                  <span className="font-semibold text-stone-900">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivery Address:</span>
                  <span className="font-semibold text-stone-900 text-right">{deliveryAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Total Produce Weight:</span>
                  <span className="font-bold text-stone-900">{totalKg.toFixed(2)} kg (Loose Sacks)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivery Distance:</span>
                  <span className="font-medium text-stone-900">{distanceKm} km from Regional Silo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivery Fee:</span>
                  <span className="font-bold text-emerald-700">
                    {isFreeDelivery ? '₹0 (FREE Delivery Unlocked!)' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-stone-900">Total Paid via {paymentSuccessData.paymentMethod}:</span>
                  <span className="font-bold text-emerald-700 text-base">₹{finalTotalAmount.toLocaleString('en-IN')}</span>
                </div>
                {paymentSuccessData.upiTransactionRef && (
                  <div className="bg-emerald-50/80 p-2 rounded text-[11px] text-emerald-800 font-mono">
                    UPI Reference: {paymentSuccessData.upiTransactionRef}
                  </div>
                )}
                <div className="bg-emerald-50 p-2 rounded text-[11px] text-emerald-800">
                  <span>Direct Farmer Net Realization: </span>
                  <span className="font-bold">₹{Math.round(farmerShareAmount).toLocaleString('en-IN')} (Bank RTGS Initiated)</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleFinishAndTrack}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Launch Live Delivery Tracker</span>
                </button>
                <button
                  onClick={() => {
                    onClearCart();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close &amp; Continue Shopping
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Wheat className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="text-base font-bold text-stone-700">Your loose cart is empty</h4>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                Explore unpolished dal, rice, peas, and groundnuts harvested by local farmers in {selectedHub.district}.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg"
              >
                Browse Produce Bazaar
              </button>
            </div>
          ) : (
            <>
              {/* Free Delivery Announcement Banner */}
              <div
                className={`p-3 rounded-xl border text-xs transition-colors flex items-center justify-between gap-3 ${
                  isFreeDelivery
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isFreeDelivery ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    {isFreeDelivery ? (
                      <p className="font-bold">
                        🎉 Free Home Delivery Unlocked!
                        <span className="font-normal block text-[11px] text-emerald-700">
                          Total cart weight is <strong>{totalKg.toFixed(2)} kg</strong> (&gt; 3.5 kg threshold). Delivery charge is ₹0!
                        </span>
                      </p>
                    ) : (
                      <p className="font-bold">
                        Add {(3.51 - totalKg).toFixed(2)} kg more for FREE Delivery!
                        <span className="font-normal block text-[11px] text-amber-700">
                          Current order: {totalKg.toFixed(2)} kg. Orders above 3.5 kg get 100% free delivery.
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/80 border border-stone-200">
                    Threshold: 3.5 kg
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Selected Loose Farm Produce (Min: 150g • Max: 25kg)</span>
                  <span>{cartItems.length} item(s)</span>
                </div>

                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-stone-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                          {item.produce.imageUrl ? (
                            <img
                              src={item.produce.imageUrl}
                              alt={item.produce.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold text-xs">
                              {item.produce.name.slice(0, 2)}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                            {item.produce.name}
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            Farmer: {item.produce.farmer.name} • {item.produce.farmer.village}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold text-emerald-800">
                              ₹{item.appliedPricePerKg}/kg loose
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              Batch #{item.produce.harvestInfo.batchNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                            ₹{Math.round(item.appliedPricePerKg * item.quantityKg)}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            ({item.quantityKg} kg)
                          </span>
                        </div>

                        {/* Quantity Step Buttons with Min 0.15kg and Max 25kg */}
                        <div className="flex items-center border border-stone-300 rounded-lg p-0.5 bg-stone-50">
                          <button
                            type="button"
                            onClick={() => {
                              const newQty = Number((item.quantityKg - (item.quantityKg <= 1 ? 0.25 : 1)).toFixed(2));
                              onUpdateQuantity(item.id, Math.max(0.15, newQty));
                            }}
                            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-stone-600 hover:bg-stone-200 rounded"
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 text-center text-xs font-bold text-stone-800 min-w-12">
                            {item.quantityKg} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newQty = Number((item.quantityKg + (item.quantityKg < 1 ? 0.25 : 1)).toFixed(2));
                              onUpdateQuantity(item.id, Math.min(25, newQty));
                            }}
                            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-stone-600 hover:bg-stone-200 rounded"
                            title="Increase quantity (Max 25kg)"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-stone-400 hover:text-red-600 p-1.5 transition-colors"
                          title="Remove produce"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Distance Setup & Transparent Fee Breakdown */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Delivery Distance from {selectedHub.name} (Max 50 km)
                    </span>
                    <span className="text-xs font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded font-mono">
                      {distanceKm} km
                    </span>
                  </div>

                  <button
                    type="button"
                    id="choose-map-location-btn"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>Pick on Live Google Map</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Adjust Distance from Regional Warehouse:</span>
                    <span className="font-semibold text-stone-800">{distanceKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>1 km (Local Hub Ward)</span>
                    <span>25 km (Suburban Ring)</span>
                    <span>50 km (Cluster Limit)</span>
                  </div>
                </div>

                {/* Transparent Delivery Charge Box Matching Exact User Spec */}
                <div className="bg-white border border-stone-300/80 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-900 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-stone-600" />
                      Transparent Delivery Charge Calculation:
                    </span>
                    <span className={`font-bold text-sm ${isFreeDelivery ? 'text-emerald-700' : 'text-stone-900'}`}>
                      {isFreeDelivery ? '₹0 (FREE)' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  {isFreeDelivery ? (
                    <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-[11px] font-medium border border-emerald-200">
                      Standard fee of ₹{standardDeliveryFee} waived! Because order weight is <strong>{totalKg.toFixed(2)} kg (&gt; 3.5 kg)</strong>.
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1 text-[11px] text-stone-600 border-t border-stone-100">
                      <p className="font-mono text-stone-800 bg-stone-100 p-1.5 rounded">
                        <strong>Formula:</strong> Within 3 km: ₹2/km • Beyond 3 km: ₹3/km
                      </p>
                      <div className="flex justify-between text-stone-700 pt-0.5">
                        <span>Within 3 km:</span>
                        <span className="font-mono">{firstTierKm}km * 2rupees = ₹{firstTierCharge}</span>
                      </div>
                      {extraTierKm > 0 && (
                        <div className="flex justify-between text-stone-700">
                          <span>More than 3 km:</span>
                          <span className="font-mono">extra {extraTierKm}km * 3rupees = ₹{extraTierCharge}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-dashed border-stone-200">
                        <span>Total Delivery Charge:</span>
                        <span className="font-mono text-emerald-800">
                          {extraTierKm > 0
                            ? `${firstTierKm}km * 2rupees (₹${firstTierCharge}) + extra ${extraTierKm}km * 3rupees (₹${extraTierCharge}) = ₹${deliveryFee}`
                            : `${firstTierKm}km * 2rupees = ₹${deliveryFee}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transparent Revenue & Cost Waterfall for this Cart */}
              <div className="bg-stone-900 text-stone-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Transparent Produce Rupee Breakdown
                  </span>
                  <span className="text-xs text-stone-400">Total Produce: {totalKg.toFixed(2)} kg</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-300">Direct Farmer Payout (Avg 89%):</span>
                    <span className="font-bold text-emerald-400">
                      ₹{Math.round(farmerShareAmount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-400">Regional Warehouse Silo Holding &amp; Aeration:</span>
                    <span className="text-stone-200">
                      ₹{Math.round(inventoryAmount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-400">Platform Maintenance Fee:</span>
                    <span className="text-stone-200">
                      ₹{Math.round(platformAmount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-400">Delivery Charge ({distanceKm} km):</span>
                    <span className="text-stone-200 font-bold">
                      {isFreeDelivery ? '₹0 (Free > 3.5 kg)' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-stone-800 pt-2 font-bold text-sm">
                    <span className="text-white">Total Amount Payable:</span>
                    <span className="text-emerald-400 text-lg">₹{finalTotalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Consumer Savings Callout */}
                <div className="bg-emerald-950/70 border border-emerald-800/80 p-2.5 rounded-lg text-xs text-emerald-200 flex items-center justify-between">
                  <span>Compared to branded plastic supermarket packets:</span>
                  <span className="font-bold text-emerald-300">
                    You save ₹{totalConsumerSavings.toLocaleString('en-IN')} (35% cheaper)!
                  </span>
                </div>
              </div>

              {/* UPI & Payment Method Section */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                    Select Payment Method (UPI Required)
                  </h5>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                    Zero Extra Surcharge
                  </span>
                </div>

                {/* Primary Payment Selector (UPI vs COD) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('UPI')}
                    className={`p-3 rounded-lg border text-left font-medium transition-colors flex items-center gap-2.5 ${
                      paymentMode === 'UPI'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <span className="block font-bold">UPI Payment</span>
                      <span className="text-[10px] text-stone-500">QR / GPay / PhonePe / VPA</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('COD')}
                    className={`p-3 rounded-lg border text-left font-medium transition-colors flex items-center gap-2.5 ${
                      paymentMode === 'COD'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-stone-700 shrink-0" />
                    <div>
                      <span className="block font-bold">Pay on Delivery</span>
                      <span className="text-[10px] text-stone-500">Cash / UPI on Doorstep</span>
                    </div>
                  </button>
                </div>

                {/* UPI Sub-Options */}
                {paymentMode === 'UPI' && (
                  <div className="bg-white border border-stone-200 rounded-lg p-3 space-y-3">
                    <div className="flex border-b border-stone-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setUpiSubMode('qr')}
                        className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                          upiSubMode === 'qr'
                            ? 'border-emerald-600 text-emerald-800'
                            : 'border-transparent text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Dynamic UPI QR Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiSubMode('apps')}
                        className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                          upiSubMode === 'apps'
                            ? 'border-emerald-600 text-emerald-800'
                            : 'border-transparent text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        UPI Apps (GPay/PhonePe)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiSubMode('vpa')}
                        className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                          upiSubMode === 'vpa'
                            ? 'border-emerald-600 text-emerald-800'
                            : 'border-transparent text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Enter UPI ID
                      </button>
                    </div>

                    {upiSubMode === 'qr' && (
                      <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                        {/* Dynamic Stylized QR Code Visual */}
                        <div className="w-32 h-32 bg-stone-900 p-2 rounded-xl border-2 border-emerald-600 flex flex-col items-center justify-center text-white shrink-0 relative shadow-md">
                          <QrCode className="w-24 h-24 text-emerald-400" />
                          <span className="text-[9px] font-mono text-emerald-300 mt-0.5">
                            ₹{finalTotalAmount}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-stone-600">
                          <p className="font-bold text-stone-900 text-sm">
                            Scan with Any UPI App
                          </p>
                          <p className="text-[11px] leading-relaxed">
                            Open Google Pay, PhonePe, Paytm, BHIM, or any banking app to scan and authorize direct farmer payment.
                          </p>
                          <div className="bg-stone-100 p-1.5 rounded font-mono text-[10px] text-stone-700">
                            VPA: <strong>kisandirect@icici</strong> &bull; Amount: ₹{finalTotalAmount}
                          </div>
                        </div>
                      </div>
                    )}

                    {upiSubMode === 'apps' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs py-1">
                        {['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM UPI'].map((appName) => (
                          <div
                            key={appName}
                            className="p-2.5 rounded-lg border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-colors"
                          >
                            <Smartphone className="w-5 h-5 mx-auto text-emerald-700 mb-1" />
                            <span className="font-bold text-stone-800 block text-xs">{appName}</span>
                            <span className="text-[10px] text-emerald-700">Instant Intent</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {upiSubMode === 'vpa' && (
                      <div className="space-y-2 text-xs">
                        <label className="block font-medium text-stone-700">
                          Your Virtual Payment Address (VPA / UPI ID):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={upiVpaInput}
                            onChange={(e) => setUpiVpaInput(e.target.value)}
                            placeholder="username@okhdfcbank"
                            className="flex-1 p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            className="px-3 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
                          >
                            Verify VPA
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-400">
                          A payment request of ₹{finalTotalAmount} will be sent to your UPI app.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Address & Customer Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-3 pt-1">
                <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Customer Delivery Details</span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    Fulfilled by local mini-truck
                  </span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Customer Full Name:</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Delivery PIN Code:</label>
                    <input
                      type="text"
                      required
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value)}
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-medium text-stone-700">Street Address / Locality:</label>
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>Pinpoint on Live Map</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authorizing UPI Payment Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          Pay ₹{finalTotalAmount.toLocaleString('en-IN')} &amp; Place Loose Order
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-stone-400 text-center mt-1.5">
                    100% loose gunny sacks. Real-time GPS delivery tracking enabled immediately after payment.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Interactive Google Map Location Picker Modal */}
      {isMapPickerOpen && (
        <MapLocationPicker
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          selectedHub={selectedHub}
          currentAddress={deliveryAddress}
          currentDistanceKm={distanceKm}
          onSelectLocation={(loc) => {
            setDeliveryAddress(loc.address);
            setDistanceKm(loc.distanceKm);
            setDeliveryCoordinates(loc.coordinates);
            setIsMapPickerOpen(false);
          }}
        />
      )}
    </div>
  );
};
