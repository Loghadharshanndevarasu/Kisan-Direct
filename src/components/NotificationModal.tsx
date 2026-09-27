import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  Clock,
  Truck,
  ShieldCheck,
  Send,
  RotateCcw
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerTestNotification?: (title: string, message: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onTriggerTestNotification,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        sendBrowserNotification(
          'KisanDirect Notifications Enabled!',
          'You will receive live delivery updates, cancellation cutoff reminders, and 3-minute doorstep inspection alerts.'
        );
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
      } catch (e) {
        // Fallback if inside iframe
        console.log('Browser notification fallback in iframe');
      }
    }
    if (onTriggerTestNotification) {
      onTriggerTestNotification(title, body);
    }
  };

  const handleSendSampleAlert = (type: 'dispatched' | 'cancel_cutoff' | 'doorstep') => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);

    if (type === 'dispatched') {
      sendBrowserNotification(
        '🌾 Order Dispatched from Regional Silo!',
        'Your unbranded loose produce has been sealed in food-grade gunny sacks and is en route with Driver Partner Anand Shinde (Mahindra EV).'
      );
    } else if (type === 'cancel_cutoff') {
      sendBrowserNotification(
        '⏳ 5 Minutes Remaining in Cancellation Window',
        '100% instant refund cancellation cutoff will expire shortly as driver completes half the transit duration.'
      );
    } else {
      sendBrowserNotification(
        '🚚 Driver Arrived! 3-Minute Inspection Started',
        'Anand Shinde is at your doorstep. Please inspect your loose produce quality and weight before signing off.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif">
                Mobile Push &amp; Delivery Notifications
              </h3>
              <p className="text-[11px] text-stone-400">
                Real-time delivery progress &amp; doorstep arrival alerts
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Permission Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            permission === 'granted'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : permission === 'denied'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <div className="space-y-0.5">
              <span className="font-bold text-xs flex items-center gap-1.5">
                {permission === 'granted' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-600" />
                )}
                System Notification Status: {permission.toUpperCase()}
              </span>
              <p className="text-[11px] text-stone-600">
                {permission === 'granted'
                  ? 'Enabled! Real browser and device push alerts are active.'
                  : 'Enable permissions to receive doorstep and dispatch alerts on your lock screen.'}
              </p>
            </div>

            {permission !== 'granted' && (
              <button
                id="enable-notifications-btn"
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs shrink-0 shadow-xs cursor-pointer"
              >
                Enable
              </button>
            )}
          </div>

          {/* Core Notification Types Handled */}
          <div className="space-y-2">
            <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px] block">
              Automated Push Notification Triggers:
            </span>
            <div className="space-y-2 text-stone-700">
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-stone-900">Silo Dispatch &amp; Live Tracking</span>
                  <span className="text-[11px] text-stone-500">Notifies when loose sacks are sealed and vehicle departs hub.</span>
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-stone-900">Half-Time Cancellation Countdown Alert</span>
                  <span className="text-[11px] text-stone-500">Sends high-priority reminder before 50% cutoff window locks.</span>
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-stone-900">3-Minute Doorstep Inspection Countdown</span>
                  <span className="text-[11px] text-stone-500">Buzzes when driver reaches doorstep for on-site quality check.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Live Push Notification Actions */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800">Test Push Alerts Simulator:</span>
              {testSent && (
                <span className="text-emerald-700 font-bold text-[10px] animate-pulse">
                  ✓ Sent to System Tray &amp; App!
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <button
                onClick={() => handleSendSampleAlert('dispatched')}
                className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg font-semibold text-[10px] text-stone-800 text-center shadow-2xs"
              >
                1. Silo Dispatch
              </button>
              <button
                onClick={() => handleSendSampleAlert('cancel_cutoff')}
                className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg font-semibold text-[10px] text-amber-800 text-center shadow-2xs"
              >
                2. Cancel Window
              </button>
              <button
                onClick={() => handleSendSampleAlert('doorstep')}
                className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg font-semibold text-[10px] text-emerald-800 text-center shadow-2xs"
              >
                3. Doorstep Arrival
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
