import React from 'react';
import { LocalAd } from '../types';
import { Megaphone, MapPin, Phone, ExternalLink, ShieldCheck } from 'lucide-react';

interface LocalAdBannerProps {
  currentHubName: string;
  ads: LocalAd[];
  onOpenAdManager: () => void;
}

export const LocalAdBanner: React.FC<LocalAdBannerProps> = ({
  currentHubName,
  ads,
  onOpenAdManager,
}) => {
  // Find ad matching hub or pick first
  const relevantAd = ads.find((a) => a.locationHub === currentHubName) || ads[0];

  if (!relevantAd) return null;

  return (
    <div
      id="local-ad-banner"
      className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 sm:p-4 text-stone-800 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5 sm:mt-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-sm">
                Hyperlocal Agri Sponsor
              </span>
              <span className="inline-flex items-center text-xs text-amber-900 font-medium">
                <MapPin className="w-3.5 h-3.5 mr-0.5 text-amber-700" />
                {relevantAd.locationHub}
              </span>
              <span className="inline-flex items-center text-xs text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                {relevantAd.badge}
              </span>
            </div>
            <h4 className="font-semibold text-stone-900 text-sm sm:text-base mt-1">
              {relevantAd.title}
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5 leading-relaxed">
              {relevantAd.tagline} — <strong className="font-medium text-stone-800">{relevantAd.businessName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0">
          <a
            href={`tel:${relevantAd.contactNumber}`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Partner</span>
          </a>
          <button
            onClick={onOpenAdManager}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded-lg transition-colors"
            title="View Hyperlocal Ad Network"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ad Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
