import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Bell,
  WifiOff,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotifications?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({
  isOpen,
  onClose,
  onOpenNotifications,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Detect if already installed / standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallSuccess(true);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // If browser doesn't expose deferred prompt (e.g. Chrome desktop or already triggered)
      alert("To install KisanDirect: click the 'Install App' icon in your browser address bar, or use 'Add to Home Screen' in your mobile browser menu.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif">
                Install KisanDirect Mobile App
              </h3>
              <p className="text-[11px] text-emerald-300">
                PWA • Works on Android, iOS &amp; Desktop
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
          
          {installSuccess || isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-emerald-900 text-sm">
                Application Installed on Home Screen!
              </h4>
              <p className="text-emerald-700 text-xs">
                You can now launch KisanDirect directly from your device app launcher with zero browser chrome and instant offline cache.
              </p>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 text-stone-700">
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Live Push Alerts</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Get doorstep countdown and delivery arrival alerts on your phone lock screen.
                  </p>
                </div>

                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Offline Silo Cache</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Browse regional grains &amp; pulses even with poor rural connectivity.
                  </p>
                </div>
              </div>

              {/* Platform Specific Instructions */}
              {isIOS ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2 text-amber-900">
                  <span className="font-bold block text-xs flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-amber-700" />
                    iOS Safari Installation Steps:
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-stone-700">
                    <li>
                      Tap the <strong>Share</strong> icon (box with upward arrow) at the bottom of Safari.
                    </li>
                    <li>
                      Scroll down and tap <strong>'Add to Home Screen'</strong> (
                      <PlusSquare className="w-3 h-3 inline text-stone-800" />).
                    </li>
                    <li>
                      Tap <strong>'Add'</strong> in the top right corner.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    id="trigger-pwa-install-btn"
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Add to Mobile Home Screen</span>
                  </button>
                  <p className="text-[11px] text-stone-500 text-center">
                    Instant 1-tap download (only ~150 KB). No app store download required.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Quick Notification Settings Link */}
          {onOpenNotifications && (
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[11px] text-stone-600">Want order &amp; doorstep notifications?</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenNotifications();
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Configure Push Alerts ➔
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
