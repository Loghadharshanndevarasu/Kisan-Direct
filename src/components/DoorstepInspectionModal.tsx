import React, { useState } from 'react';
import { DeliveryTrackingInfo, DoorstepInspectionRecord } from '../types';
import {
  ShieldAlert,
  Camera,
  UploadCloud,
  CheckCircle2,
  X,
  UserCheck,
  RotateCcw,
  IndianRupee,
  Clock,
  AlertTriangle,
  FileCheck,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DoorstepInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingInfo: DeliveryTrackingInfo;
  onCompleteReturn: (inspectionRecord: DoorstepInspectionRecord) => void;
}

export const DoorstepInspectionModal: React.FC<DoorstepInspectionModalProps> = ({
  isOpen,
  onClose,
  trackingInfo,
  onCompleteReturn,
}) => {
  const [issueType, setIssueType] = useState<DoorstepInspectionRecord['issueType']>('damaged_spoiled');
  const [issueDescription, setIssueDescription] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [driverOtp, setDriverOtp] = useState('7842'); // Driver on-site sign-off OTP
  const [enteredOtp, setEnteredOtp] = useState('7842');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnConfirmed, setReturnConfirmed] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<DoorstepInspectionRecord | null>(null);

  if (!isOpen) return null;

  // Preset sample proof images for instant inspection testing
  const sampleProofImages = [
    {
      label: 'Grain Discoloration / High Moisture Sample',
      url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Wrong Produce / Sack Label Sample',
      url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Sack Tear / Weight Deficit Sample',
      url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80',
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReturn = () => {
    if (!proofImage) {
      alert('Please upload a photo of the damaged or incorrect produce as proof for on-site driver handback.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const record: DoorstepInspectionRecord = {
        inspectionTimerSecondsRemaining: 0,
        driverWaitDurationSeconds: 180,
        decision: 'returned',
        inspectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        issueType,
        issueDescription: issueDescription || 'Inspected produce failed doorstep quality check. Handed back to driver partner on the spot.',
        proofImageUrl: proofImage,
        driverSignOffName: trackingInfo.driverName || 'Anand Shinde',
        driverVerificationCode: 'VERIFIED-RTN-' + Math.floor(100000 + Math.random() * 900000),
        refundStatus: trackingInfo.paymentMethod === 'UPI' ? 'instant_upi_reversal' : 'cod_waived_zero_charge',
        refundAmount: trackingInfo.totalAmountPaid,
      };

      setCreatedRecord(record);
      setReturnConfirmed(true);
      setIsSubmitting(false);
      onCompleteReturn(record);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
        
        {/* Modal Header */}
        <div className="bg-rose-950 text-white p-4 flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif">
                3-Minute Doorstep Return &amp; Instant Refund
              </h3>
              <p className="text-[11px] text-rose-200">
                Driver Partner {trackingInfo.driverName} is waiting in front of you. Hand back without paying.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {returnConfirmed && createdRecord ? (
            /* Return Completed Receipt */
            <div className="space-y-4 py-2">
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-emerald-950 font-serif">
                  Produce Handed Back to Driver Successfully!
                </h4>
                <p className="text-xs text-emerald-800">
                  Zero Payment Obligation • Driver Partner <strong>{createdRecord.driverSignOffName}</strong> took back the produce.
                </p>
                <div className="inline-block bg-white border border-emerald-300 rounded-lg px-3 py-1 font-mono text-[11px] text-emerald-900 font-bold">
                  Receipt: {createdRecord.driverVerificationCode}
                </div>
              </div>

              {/* Settlement Summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2.5">
                <span className="font-bold text-stone-900 uppercase text-[11px] block border-b border-stone-200 pb-1">
                  Immediate Settlement Details:
                </span>
                <div className="flex justify-between">
                  <span className="text-stone-600">Payment Status:</span>
                  <span className="font-bold text-emerald-800">
                    {trackingInfo.paymentMethod === 'UPI'
                      ? `₹${createdRecord.refundAmount} Instant 100% UPI Reversal Initiated`
                      : 'Cash on Delivery Waived (₹0 Paid)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Return Reason:</span>
                  <span className="font-semibold text-stone-900 capitalize">
                    {createdRecord.issueType?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Inspected In Front Of:</span>
                  <span className="font-semibold text-stone-900">{createdRecord.driverSignOffName} ({trackingInfo.vehicleNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Timestamp:</span>
                  <span className="font-mono text-stone-800">{createdRecord.inspectedAt}</span>
                </div>
              </div>

              {/* Proof Image Display */}
              {createdRecord.proofImageUrl && (
                <div className="space-y-1">
                  <span className="font-semibold text-stone-700 block text-[11px]">
                    Verified Doorstep Proof Photo:
                  </span>
                  <div className="relative rounded-lg overflow-hidden border border-stone-300 max-h-48 w-full bg-black">
                    <img
                      src={createdRecord.proofImageUrl}
                      alt="Doorstep Return Proof"
                      className="w-full h-48 object-cover opacity-90"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      VERIFIED ON-SITE • {createdRecord.inspectedAt}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-all"
              >
                Close &amp; Return to Store
              </button>
            </div>
          ) : (
            /* Inspection & Return Form */
            <>
              {/* Active Driver Presence Banner */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-950 block">
                    Driver Partner Anand Shinde is Present At Your Doorstep
                  </span>
                  <p className="text-[11px] text-amber-800">
                    Vehicle: <strong>{trackingInfo.vehicleNumber}</strong> • Phone: <strong>{trackingInfo.driverPhone}</strong>
                  </p>
                  <p className="text-[11px] text-stone-600 pt-0.5">
                    Under KisanDirect's <strong>3-Minute Doorstep Inspection Policy</strong>, you can inspect the sack condition, moisture, and weight in front of him. If dissatisfied, you can return immediately without paying!
                  </p>
                </div>
              </div>

              {/* Step 1: Select Issue Type */}
              <div className="space-y-2">
                <label className="font-bold text-stone-800 block">
                  1. Select Discrepancy or Defect Found:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'damaged_spoiled', label: 'Damaged / High Moisture / Weevils' },
                    { id: 'wrong_produce', label: 'Wrong Produce or Grain Batch' },
                    { id: 'foreign_matter_stones', label: 'Foreign Matter / Stones / Dust' },
                    { id: 'weight_mismatch', label: 'Weight Deficit on Digital Scale' },
                    { id: 'torn_packaging', label: 'Gunny Sack Ruptured / Spilled' },
                    { id: 'other', label: 'Other Quality Defect' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIssueType(opt.id as any)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                        issueType === opt.id
                          ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-1 ring-rose-400'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Upload Proof Photo */}
              <div className="space-y-2">
                <label className="font-bold text-stone-800 block flex items-center justify-between">
                  <span>2. Upload Inspection Proof Photo (Mandatory):</span>
                  <span className="text-[10px] text-stone-500 font-normal">Show defective grains or sack</span>
                </label>

                {proofImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-400 max-h-48 w-full bg-stone-900 group">
                    <img
                      src={proofImage}
                      alt="Uploaded Defect Proof"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setProofImage(null)}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold text-xs shadow-md"
                      >
                        Remove &amp; Retake
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Proof Attached
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-stone-50 hover:bg-emerald-50/40 transition-all text-center">
                      <Camera className="w-6 h-6 text-stone-500" />
                      <div>
                        <span className="font-bold text-stone-800 block">Take Photo / Upload Image</span>
                        <span className="text-[11px] text-stone-500">Tap to use camera or upload file</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Quick Sample Photos for Testing */}
                    <div className="bg-stone-100 p-2.5 rounded-lg border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                        ⚡ Quick Sample Proof Photos (For Instant Testing):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {sampleProofImages.map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setProofImage(sample.url)}
                            className="text-left p-1.5 bg-white hover:bg-stone-50 border border-stone-300 rounded text-[10px] font-medium text-stone-800 truncate"
                          >
                            📷 {sample.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Notes */}
              <div className="space-y-1">
                <label className="font-bold text-stone-800 block">
                  3. Description / Notes for Rural Sourcing Team:
                </label>
                <textarea
                  rows={2}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="e.g. Moisture detected in gunny sack, batch smell is stale or grains have weevil damage..."
                  className="w-full text-xs bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:ring-2 focus:ring-rose-500 outline-hidden"
                />
              </div>

              {/* Step 4: Driver Verification Code */}
              <div className="bg-stone-100 border border-stone-300 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-stone-900 block text-xs">
                    Driver Sign-Off Verification:
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Anand Shinde will accept this code on his driver handheld terminal.
                  </span>
                </div>
                <div className="bg-stone-900 text-amber-400 font-mono text-sm font-bold px-3 py-1.5 rounded-lg tracking-widest">
                  {driverOtp}
                </div>
              </div>

              {/* Settlement Guarantee Notice */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-xs text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Zero Payment &amp; Instant Reversal Guarantee:
                </span>
                <p className="text-[11px] text-rose-800">
                  {trackingInfo.paymentMethod === 'UPI'
                    ? `100% of ₹${trackingInfo.totalAmountPaid} will be reversed to your UPI ID immediately upon handback.`
                    : 'Your Cash on Delivery balance is reset to ₹0. You hand the produce back and pay nothing.'}
                </p>
              </div>

              {/* Submit Button */}
              <button
                id="submit-doorstep-return-btn"
                type="button"
                onClick={handleSubmitReturn}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Processing Doorstep Return...</span>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Return Produce to Driver Anand Shinde (Zero Payment)</span>
                  </>
                )}
              </button>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-between items-center">
          <span className="text-[11px] text-stone-500 font-mono">
            Order #{trackingInfo.orderId}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Cancel / Back
          </button>
        </div>

      </div>
    </div>
  );
};
