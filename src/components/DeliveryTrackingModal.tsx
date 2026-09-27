import React, { useState, useEffect } from 'react';
import { DeliveryTrackingInfo, DeliveryMilestoneId, DoorstepInspectionRecord } from '../types';
import { DoorstepInspectionModal } from './DoorstepInspectionModal';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Package,
  Navigation,
  Sparkles,
  X,
  RotateCcw,
  Zap,
  ArrowRight,
  XCircle,
  AlertTriangle,
  Lock,
  RotateCw,
  Ban,
  Undo2,
  Scale,
  Eye,
  Camera,
  Map,
  Layers,
  UserCheck
} from 'lucide-react';

interface DeliveryTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingInfo: DeliveryTrackingInfo | null;
  onAdvanceMilestone?: () => void;
  onCancelOrder?: (orderId: string, reason?: string) => void;
  onReturnOrderAtDoorstep?: (inspectionRecord: DoorstepInspectionRecord) => void;
}

export const DeliveryTrackingModal: React.FC<DeliveryTrackingModalProps> = ({
  isOpen,
  onClose,
  trackingInfo,
  onAdvanceMilestone,
  onCancelOrder,
  onReturnOrderAtDoorstep,
}) => {
  const [currentInfo, setCurrentInfo] = useState<DeliveryTrackingInfo | null>(trackingInfo);
  const [etaSeconds, setEtaSeconds] = useState(1320); // 22 minutes countdown
  const [liveDriverCoord, setLiveDriverCoord] = useState(65); // percentage along route (0 to 100)
  const [activeTrackingTab, setActiveTrackingTab] = useState<'milestones' | 'live_map'>('milestones');
  
  // Fast-forward offset for testing and verification
  const [simulatedOffsetSeconds, setSimulatedOffsetSeconds] = useState(0);

  // Cancellation confirmation dialog state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');

  // 3-Minute Doorstep Inspection State
  const [inspectionSecondsLeft, setInspectionSecondsLeft] = useState(180); // 3 minutes = 180s
  const [isInspectionAccepted, setIsInspectionAccepted] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);

  useEffect(() => {
    if (trackingInfo) {
      setCurrentInfo(trackingInfo);
    }
  }, [trackingInfo]);

  // Live countdown timer ticking every second
  useEffect(() => {
    if (!isOpen || !currentInfo) return;
    const interval = setInterval(() => {
      setEtaSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, currentInfo]);

  // 3-minute doorstep countdown timer runs when delivered
  const isDelivered = currentInfo
    ? currentInfo.currentMilestoneIndex >= currentInfo.milestones.length - 1
    : false;

  useEffect(() => {
    if (!isOpen || !isDelivered || isInspectionAccepted || currentInfo?.status === 'returned_at_doorstep') return;

    const inspectionInterval = setInterval(() => {
      setInspectionSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(inspectionInterval);
  }, [isOpen, isDelivered, isInspectionAccepted, currentInfo?.status]);

  if (!isOpen || !currentInfo) return null;

  const currentMilestoneIndex = currentInfo.currentMilestoneIndex;
  const isCancelled = currentInfo.status === 'cancelled';
  const isReturned = currentInfo.status === 'returned_at_doorstep';

  const minutesRemaining = Math.floor(etaSeconds / 60);
  const secondsRemaining = etaSeconds % 60;

  // Calculation for cancellation cutoff:
  // Rule: Allowed ONLY before half the total duration (50% fulfillment window).
  const totalDurationSeconds =
    currentInfo.totalDurationSeconds || currentInfo.currentEtaMinutes * 60 || 1320;
  const halfDurationSeconds = Math.floor(totalDurationSeconds / 2);

  // Elapsed time since order placement + any test offset
  const naturalElapsedSeconds = currentInfo.placedTimestamp
    ? Math.floor((Date.now() - currentInfo.placedTimestamp) / 1000)
    : Math.max(0, totalDurationSeconds - etaSeconds);

  const totalEffectiveElapsed = naturalElapsedSeconds + simulatedOffsetSeconds;

  // Remaining time to cancel before 50% cutoff
  const cancelSecondsRemaining = Math.max(0, halfDurationSeconds - totalEffectiveElapsed);
  const isCancellationAllowed =
    cancelSecondsRemaining > 0 && !isCancelled && !isDelivered && !isReturned;

  const cancelMinsRemaining = Math.floor(cancelSecondsRemaining / 60);
  const cancelSecsRemaining = cancelSecondsRemaining % 60;
  const formattedCancelRemaining = `${String(cancelMinsRemaining).padStart(2, '0')}:${String(
    cancelSecsRemaining
  ).padStart(2, '0')}`;

  // 3-minute inspection countdown formatting
  const inspectMins = Math.floor(inspectionSecondsLeft / 60);
  const inspectSecs = inspectionSecondsLeft % 60;
  const formattedInspectTimer = `${String(inspectMins).padStart(2, '0')}:${String(inspectSecs).padStart(2, '0')}`;

  const handleNextStep = () => {
    if (!currentInfo) return;
    const nextIdx = Math.min(
      currentInfo.milestones.length - 1,
      currentInfo.currentMilestoneIndex + 1
    );
    const updatedMilestones = currentInfo.milestones.map((m, idx) => ({
      ...m,
      completed: idx <= nextIdx,
      active: idx === nextIdx,
    }));

    const nextCoord = Math.min(100, (nextIdx / (currentInfo.milestones.length - 1)) * 100);
    setLiveDriverCoord(nextCoord);

    setCurrentInfo({
      ...currentInfo,
      currentMilestoneIndex: nextIdx,
      milestones: updatedMilestones,
      currentEtaMinutes: Math.max(0, currentInfo.currentEtaMinutes - 5),
    });

    if (onAdvanceMilestone) {
      onAdvanceMilestone();
    }
  };

  const handleConfirmCancel = () => {
    if (!currentInfo) return;
    const refundAmt = currentInfo.totalAmountPaid;

    if (onCancelOrder) {
      onCancelOrder(currentInfo.orderId, cancelReason);
    }

    setCurrentInfo({
      ...currentInfo,
      status: 'cancelled',
      cancellationReason: cancelReason,
      refundAmount: refundAmt,
      refundStatus: 'completed',
    });

    setIsCancelDialogOpen(false);
  };

  const handleDoorstepReturnComplete = (record: DoorstepInspectionRecord) => {
    if (!currentInfo) return;
    const updated: DeliveryTrackingInfo = {
      ...currentInfo,
      status: 'returned_at_doorstep',
      doorstepInspection: record,
    };
    setCurrentInfo(updated);
    if (onReturnOrderAtDoorstep) {
      onReturnOrderAtDoorstep(record);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
              isCancelled
                ? 'bg-rose-700'
                : isReturned
                ? 'bg-amber-600'
                : 'bg-emerald-600 animate-pulse'
            }`}>
              {isCancelled ? (
                <Ban className="w-5 h-5" />
              ) : isReturned ? (
                <RotateCcw className="w-5 h-5" />
              ) : (
                <Truck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isCancelled
                    ? 'bg-rose-500/20 text-rose-300'
                    : isReturned
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {isCancelled
                    ? 'Order Cancelled'
                    : isReturned
                    ? 'Returned at Doorstep'
                    : 'Live Farm Dispatch'}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {currentInfo.orderId}
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base font-serif text-white mt-0.5">
                {isCancelled
                  ? 'Cancellation & Instant Refund Receipt'
                  : isReturned
                  ? 'Doorstep Inspection Return Slip (Zero Charge)'
                  : 'Real-Time Delivery Route Tracker & Doorstep Inspection'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs (Route Milestones vs Live GPS Map) */}
        {!isCancelled && !isReturned && (
          <div className="bg-stone-800 px-4 py-2 border-b border-stone-700 flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-stone-900/90 p-1 rounded-lg">
              <button
                onClick={() => setActiveTrackingTab('milestones')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTrackingTab === 'milestones'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Milestones &amp; Sourcing
              </button>
              <button
                onClick={() => setActiveTrackingTab('live_map')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeTrackingTab === 'live_map'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Live Google Map View</span>
              </button>
            </div>

            <span className="text-[11px] text-emerald-300 font-mono hidden sm:inline">
              Driver: {currentInfo.driverName} ({currentInfo.vehicleNumber})
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Top ETA or Cancellation / Return Status Banner */}
          {isCancelled ? (
            <div className="bg-gradient-to-r from-rose-950 via-stone-900 to-rose-900 text-white rounded-xl p-4 sm:p-5 border border-rose-800/60 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs text-rose-300 font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    100% Refund Processed Automatically
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold font-serif text-white">
                    Order #{currentInfo.orderId} Cancelled
                  </h4>
                  <p className="text-xs text-stone-300">
                    Reason: {currentInfo.cancellationReason || 'Customer requested before 50% cutoff window'}
                  </p>
                  <p className="text-xs text-stone-400">
                    All {currentInfo.totalWeightKg.toFixed(2)} kg of loose produce has been returned to {currentInfo.warehouseHubName} silo.
                  </p>
                </div>

                <div className="bg-stone-800/90 border border-rose-700/60 rounded-lg p-3 text-right shrink-0">
                  <span className="text-[10px] text-stone-400 block uppercase font-mono">Refund Transferred</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    ₹{currentInfo.totalAmountPaid.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-stone-300 block font-mono mt-0.5">
                    Mode: {currentInfo.paymentMethod === 'UPI' ? 'Reversal to UPI VPA' : 'Cash Voided'}
                  </span>
                </div>
              </div>
            </div>
          ) : isReturned ? (
            <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-stone-950 text-white rounded-xl p-4 sm:p-5 border border-amber-700/60 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Doorstep Quality Return Completed
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold font-serif text-white">
                    Produce Returned to Driver (Zero Payment)
                  </h4>
                  <p className="text-xs text-stone-300">
                    Inspected in front of Driver Partner <strong>{currentInfo.driverName}</strong> within the 3-minute inspection window.
                  </p>
                </div>

                <div className="bg-stone-800/90 border border-amber-600/50 rounded-lg p-3 text-right shrink-0">
                  <span className="text-[10px] text-stone-400 block uppercase font-mono">Settlement Status</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {currentInfo.paymentMethod === 'UPI' ? `₹${currentInfo.totalAmountPaid} Refunded` : '₹0 Due (Waived)'}
                  </span>
                  <span className="text-[10px] text-stone-300 block font-mono mt-0.5">
                    Mode: {currentInfo.paymentMethod}
                  </span>
                </div>
              </div>

              {currentInfo.doorstepInspection?.proofImageUrl && (
                <div className="bg-black/40 rounded-lg p-2.5 border border-stone-700 flex items-center gap-3">
                  <img
                    src={currentInfo.doorstepInspection.proofImageUrl}
                    alt="Doorstep Return Proof"
                    className="w-14 h-14 rounded object-cover border border-stone-600"
                  />
                  <div className="text-xs text-stone-300 space-y-0.5">
                    <span className="font-bold text-white block">Inspection Proof Verified by Driver:</span>
                    <span className="text-[11px] text-stone-400">
                      Issue: {currentInfo.doorstepInspection.issueType?.replace('_', ' ')} • Code: {currentInfo.doorstepInspection.driverVerificationCode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white rounded-xl p-4 sm:p-5 border border-emerald-800/50 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live GPS En Route • {currentInfo.distanceKm} km from Silo
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold font-serif">
                    {isDelivered
                      ? 'Produce Delivered! 3-Minute Inspection Period Active'
                      : `Arriving in ~${minutesRemaining} min ${secondsRemaining}s`}
                  </h4>
                  <p className="text-xs text-stone-300">
                    Direct dispatch from <strong>{currentInfo.warehouseHubName}</strong> to {currentInfo.deliveryAddress}
                  </p>
                </div>

                <div className="bg-stone-800/80 border border-stone-700/80 rounded-lg p-2.5 text-right shrink-0">
                  <span className="text-[10px] text-stone-400 block uppercase font-mono">Payment Status</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {currentInfo.paymentMethod} Verified
                  </span>
                  {currentInfo.upiTransactionRef && (
                    <span className="text-[9px] text-stone-400 font-mono block mt-0.5">
                      Ref: {currentInfo.upiTransactionRef}
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive Live Progress Bar */}
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs text-stone-300 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Warehouse Hub ({currentInfo.warehouseHubName.split(' ')[0]})
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    {currentInfo.customerName}'s Address
                  </span>
                </div>

                {/* Vector Track Canvas */}
                <div className="relative h-4 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 transition-all duration-700"
                    style={{ width: `${Math.max(12, liveDriverCoord)}%` }}
                  />
                  {/* Truck marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 flex items-center justify-center"
                    style={{ left: `${Math.max(8, Math.min(94, liveDriverCoord))}%` }}
                  >
                    <div className="w-6 h-6 bg-white rounded-full shadow-lg border-2 border-emerald-600 flex items-center justify-center text-emerald-800">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                  <span>0 km (Origin Silo)</span>
                  <span>Speed: 34 km/h (Zero-Emission EV)</span>
                  <span>{currentInfo.distanceKm} km (Destination)</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3-MINUTE DOORSTEP INSPECTION POLICY SECTION (WHEN DELIVERED)             */}
          {/* ========================================================================= */}
          {isDelivered && !isCancelled && !isReturned && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 text-stone-900 shadow-md space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      3-Minute Doorstep Inspection Period Active
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-stone-900 font-serif">
                    Driver Partner {currentInfo.driverName} is Waiting at Your Doorstep
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    Check your loose produce in front of him. If damaged, incorrect, or weight short, upload proof and return immediately without paying!
                  </p>
                </div>

                {/* 3:00 Minutes Countdown Timer Badge */}
                <div className="bg-stone-950 text-white p-3 rounded-xl border border-stone-800 text-center shrink-0 min-w-32 shadow-sm">
                  <span className="text-[10px] text-amber-400 uppercase font-mono block">Driver Wait Timer</span>
                  <span className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                    {formattedInspectTimer}
                  </span>
                  <span className="text-[9px] text-stone-400 block">3:00 min window</span>
                </div>
              </div>

              {/* Inspection Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200 flex items-start gap-2">
                  <Eye className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-stone-900">1. Inspect Variety</span>
                    <span className="text-[11px] text-stone-600">Verify grain color &amp; correct farmer batch.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-stone-900">2. Moisture &amp; Seal</span>
                    <span className="text-[11px] text-stone-600">Check gunny bag dryness and zero insects.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200 flex items-start gap-2">
                  <Scale className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-stone-900">3. Weight on Scale</span>
                    <span className="text-[11px] text-stone-600">Driver has digital scale for {currentInfo.totalWeightKg.toFixed(2)} kg check.</span>
                  </div>
                </div>
              </div>

              {/* Inspection Decisions */}
              {isInspectionAccepted ? (
                <div className="bg-emerald-100 border border-emerald-400 rounded-xl p-3 text-center text-xs text-emerald-950 font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Inspection Signed Off! Produce Accepted in Good Condition.</span>
                </div>
              ) : (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    id="accept-inspection-btn"
                    onClick={() => setIsInspectionAccepted(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept &amp; Sign Off Produce</span>
                  </button>

                  <button
                    id="report-doorstep-issue-btn"
                    onClick={() => setIsInspectionModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer border border-rose-500"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Report Issue &amp; Return to Driver (Zero Payment)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* LIVE GOOGLE MAP VIEW TAB                                                  */}
          {/* ========================================================================= */}
          {activeTrackingTab === 'live_map' && !isCancelled && !isReturned && (
            <div className="space-y-3 bg-stone-900 p-4 rounded-xl border border-stone-800 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  Live GPS Route &amp; Silo Proximity Map
                </span>
                <span className="text-[11px] text-stone-400 font-mono">
                  Origin: {currentInfo.warehouseHubName}
                </span>
              </div>

              {/* Visual Map Canvas */}
              <div className="relative rounded-xl overflow-hidden border border-stone-700 h-64 bg-stone-950">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 600 280"
                  preserveAspectRatio="xMidYMid slice"
                >
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#262626" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Route Polyline */}
                  <path
                    d="M 120,200 C 220,180 280,100 480,80"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                  />

                  {/* Warehouse Silo Pin */}
                  <g transform="translate(120, 200)">
                    <circle r="12" fill="#047857" className="animate-ping opacity-40" />
                    <circle r="8" fill="#065f46" stroke="#ffffff" strokeWidth="2" />
                    <text x="0" y="22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fde047">
                      Warehouse Silo (0 km)
                    </text>
                  </g>

                  {/* Customer Destination Pin */}
                  <g transform="translate(480, 80)">
                    <circle r="14" fill="#dc2626" className="animate-ping opacity-30" />
                    <path d="M 0,-16 C -6,-16 -10,-10 -10,-4 C -10,4 0,14 0,14 C 0,14 10,4 10,-4 C 10,-10 6,-16 0,-16 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="0" cy="-5" r="3" fill="#ffffff" />
                    <text x="0" y="-22" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                      {currentInfo.customerName} ({currentInfo.distanceKm} km)
                    </text>
                  </g>

                  {/* Moving EV Vehicle Marker */}
                  <g transform={`translate(${120 + (360 * liveDriverCoord) / 100}, ${200 - (120 * liveDriverCoord) / 100})`}>
                    <circle r="16" fill="#10b981" opacity="0.3" className="animate-ping" />
                    <rect x="-14" y="-10" width="28" height="20" rx="6" fill="#022c22" stroke="#34d399" strokeWidth="2" />
                    <text x="0" y="4" textAnchor="middle" fontSize="11">🚚</text>
                    <text x="0" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#34d399">
                      {currentInfo.vehicleNumber} (34 km/h)
                    </text>
                  </g>
                </svg>

                <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] text-stone-300 font-mono border border-stone-700">
                  Target: {currentInfo.deliveryAddress}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* Dedicated ORDER CANCELLATION OPTION & LIVE TIMER SECTION                  */}
          {/* ========================================================================= */}
          {!isCancelled && !isDelivered && !isReturned && (
            <div className={`rounded-xl p-4 sm:p-5 border transition-all ${
              isCancellationAllowed
                ? 'bg-amber-50/70 border-amber-200/90 text-stone-900 shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                      <Clock className={`w-4 h-4 ${isCancellationAllowed ? 'text-amber-600 animate-spin' : 'text-stone-400'}`} />
                      Order Cancellation Policy
                    </span>

                    {isCancellationAllowed ? (
                      <span className="text-[11px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold border border-amber-300 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        Window Open (Before Half-Time)
                      </span>
                    ) : (
                      <span className="text-[11px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full font-bold border border-stone-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-stone-500" />
                        Window Expired (Past Half-Time)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    Free instant cancellation with 100% refund is available only within the{' '}
                    <strong>first half of the delivery window ({Math.round(halfDurationSeconds / 60)} mins)</strong>.
                    After that, produce is moisture-sealed in gunny bags and dispatched.
                  </p>

                  {/* High-visibility Live Countdown Banner */}
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-stone-700">
                      Time remaining to cancel:
                    </span>
                    {isCancellationAllowed ? (
                      <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg font-mono font-extrabold text-sm sm:text-base shadow-xs animate-pulse">
                        <Clock className="w-4 h-4 text-amber-700" />
                        <span>{formattedCancelRemaining}</span>
                        <span className="text-[11px] font-sans font-medium text-amber-800">remaining</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 bg-stone-200 text-stone-500 border border-stone-300 px-2.5 py-1 rounded-lg font-mono font-bold text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>00:00 (Cancellation Disabled)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancel Order Action Button */}
                <div className="w-full sm:w-auto shrink-0 flex flex-col items-stretch sm:items-end gap-1.5">
                  {isCancellationAllowed ? (
                    <button
                      id="cancel-order-active-btn"
                      onClick={() => setIsCancelDialogOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg border border-rose-500"
                      title={`Cancel order with full refund. ${formattedCancelRemaining} remaining.`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Order</span>
                      <span className="bg-rose-800/80 px-2 py-0.5 rounded text-[11px] font-mono border border-rose-400/40">
                        {formattedCancelRemaining}
                      </span>
                    </button>
                  ) : (
                    <button
                      id="cancel-order-disabled-btn"
                      disabled
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-200 text-stone-400 cursor-not-allowed font-semibold text-xs sm:text-sm rounded-xl border border-stone-300 opacity-80"
                      title="Cancellation option is disabled because more than half of the delivery time has elapsed."
                    >
                      <Lock className="w-4 h-4 text-stone-400" />
                      <span>Cancel Order</span>
                      <span className="bg-stone-300 text-stone-500 px-1.5 py-0.5 rounded text-[10px] font-mono">
                        Disabled
                      </span>
                    </button>
                  )}

                  <span className="text-[10px] text-stone-500 text-center sm:text-right">
                    {isCancellationAllowed
                      ? '100% Instant Refund to UPI/Account'
                      : 'Half of delivery duration elapsed'}
                  </span>
                </div>
              </div>

              {/* Fast Forward Bar */}
              <div className="mt-3 pt-2.5 border-t border-dashed border-stone-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                <span className="flex items-center gap-1 font-medium text-stone-600">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Testing controls for evaluation:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimulatedOffsetSeconds(halfDurationSeconds + 30)}
                    disabled={!isCancellationAllowed}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-stone-100 disabled:opacity-40 text-stone-700 border border-stone-300 rounded font-semibold text-[10px] shadow-2xs transition-colors"
                  >
                    <span>⏩ Fast-Forward Past 50% Cutoff</span>
                  </button>

                  <button
                    onClick={() => setSimulatedOffsetSeconds(0)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded font-semibold text-[10px] shadow-2xs transition-colors"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Reset Timer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Milestones */}
          {!isCancelled && !isReturned && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5 space-y-4">
              <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
                <span>Order Milestones &amp; Batch Provenance</span>
                <button
                  onClick={handleNextStep}
                  disabled={isDelivered}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <span>Advance Milestone</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </h5>

              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200">
                {currentInfo.milestones.map((m, idx) => (
                  <div key={m.id} className="relative flex items-start gap-3.5 group">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                      m.completed
                        ? 'bg-emerald-600 text-white'
                        : m.active
                        ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                        : 'bg-stone-200 text-stone-400'
                    }`}>
                      {m.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h6 className={`text-xs font-bold ${m.active ? 'text-stone-900' : 'text-stone-700'}`}>
                          {m.title}
                        </h6>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {m.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {m.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transparent Order Summary & Delivery Cost Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs space-y-2.5">
            <div className="flex justify-between items-center border-b border-stone-200 pb-2">
              <span className="font-bold text-stone-800">
                {isCancelled
                  ? 'Cancelled Package Details'
                  : isReturned
                  ? 'Doorstep Returned Package'
                  : 'Dispatch Package Summary'}
              </span>
              <span className="font-mono text-stone-600 font-semibold">{currentInfo.totalWeightKg.toFixed(2)} kg (Loose Produce)</span>
            </div>

            <div className="space-y-1.5 text-stone-600">
              {currentInfo.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span>
                    {item.produce.name} ({item.quantityKg} kg loose)
                  </span>
                  <span className="font-mono font-medium text-stone-800">
                    ₹{Math.round(item.appliedPricePerKg * item.quantityKg)}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery Charge Transparency Box */}
            <div className="pt-2 border-t border-stone-200 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-600">Delivery Fee ({currentInfo.distanceKm} km radius):</span>
                {currentInfo.freeDeliveryUnlocked ? (
                  <span className="font-bold text-emerald-700">
                    ₹0 (FREE - Order &gt; 3.5 kg)
                  </span>
                ) : (
                  <span className="font-bold text-stone-900">
                    ₹{currentInfo.deliveryFeeCharged}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-stone-900 pt-1 border-t border-dashed border-stone-200">
                <span>
                  {isCancelled
                    ? '100% Refunded Amount:'
                    : isReturned
                    ? 'Settled Amount (Waived / Refunded):'
                    : `Total Paid via ${currentInfo.paymentMethod}:`}
                </span>
                <span className="text-emerald-700">₹{currentInfo.totalAmountPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {isCancelled
                ? 'Produce returned to warehouse silo with zero restocking fee.'
                : isReturned
                ? 'Handed back to driver partner on the spot without paying.'
                : 'Delivery temperature & moisture sealed in food-grade gunny bag.'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {isCancelled || isReturned ? 'Close & Return to Bazaar' : 'Keep Tracking in Background'}
          </button>
        </div>

        {/* CONFIRM ORDER CANCELLATION MODAL DIALOG */}
        {isCancelDialogOpen && (
          <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-300 space-y-4 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-base">
                    Cancel Order #{currentInfo.orderId}?
                  </h4>
                  <p className="text-xs text-stone-500">
                    You are cancelling within the allowed 50% fulfillment window.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-amber-800 font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  Cancellation window closing in:
                </span>
                <span className="font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded text-sm">
                  {formattedCancelRemaining}
                </span>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-stone-700">
                  <span>Full Refund Amount:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ₹{currentInfo.totalAmountPaid.toLocaleString('en-IN')} (100%)
                  </span>
                </div>
                <div className="flex justify-between items-center text-stone-600 text-[11px]">
                  <span>Refund Method:</span>
                  <span className="font-medium text-stone-800">
                    Instant Reversal ({currentInfo.paymentMethod})
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Please specify reason for cancellation:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-300 rounded-lg p-2 text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="Placed order by mistake">Placed order by mistake</option>
                  <option value="Want to change produce quantity / weight">Want to change produce quantity / weight</option>
                  <option value="Need to change delivery location">Need to change delivery location</option>
                  <option value="Selected wrong payment mode">Selected wrong payment mode</option>
                  <option value="Other / Changed mind">Other / Changed mind</option>
                </select>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCancelDialogOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Keep My Order
                </button>
                <button
                  type="button"
                  id="confirm-cancel-dialog-btn"
                  onClick={handleConfirmCancel}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Yes, Cancel & Refund ₹{currentInfo.totalAmountPaid}</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 3-Minute Doorstep Inspection & Instant Return Modal */}
        {isInspectionModalOpen && (
          <DoorstepInspectionModal
            isOpen={isInspectionModalOpen}
            onClose={() => setIsInspectionModalOpen(false)}
            trackingInfo={currentInfo}
            onCompleteReturn={handleDoorstepReturnComplete}
          />
        )}

      </div>
    </div>
  );
};
