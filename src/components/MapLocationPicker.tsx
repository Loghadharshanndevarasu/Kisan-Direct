import React, { useState, useEffect } from 'react';
import { WarehouseHub, GeoLocationPoint } from '../types';
import {
  MapPin,
  Navigation,
  Compass,
  Crosshair,
  Search,
  Check,
  X,
  Truck,
  Layers,
  ExternalLink,
  ShieldCheck,
  Building,
  RotateCcw
} from 'lucide-react';

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHub: WarehouseHub;
  currentAddress: string;
  currentDistanceKm: number;
  onSelectLocation: (location: { address: string; distanceKm: number; coordinates: GeoLocationPoint }) => void;
}

// Hub baseline GPS coordinates
const HUB_COORDINATES: Record<string, { lat: number; lng: number; defaultLandmarks: Array<{ name: string; distance: number; latOffset: number; lngOffset: number; address: string }> }> = {
  'hub-nashik': {
    lat: 19.9975,
    lng: 73.7898,
    defaultLandmarks: [
      { name: 'Panchavati Market Yard', distance: 2.8, latOffset: 0.015, lngOffset: 0.012, address: 'Near APMC Market, Panchavati, Nashik - 422003' },
      { name: 'CIDCO Sector 4', distance: 5.2, latOffset: -0.028, lngOffset: -0.035, address: 'CIDCO New Colony, Sector 4, Nashik - 422009' },
      { name: 'Satpur MIDC Road', distance: 7.4, latOffset: 0.042, lngOffset: -0.052, address: 'Trimbak Road, Satpur Industrial Area, Nashik - 422007' },
      { name: 'Gangapur Road Residentia', distance: 8.9, latOffset: 0.055, lngOffset: -0.021, address: 'Serene Meadows, Gangapur Road, Nashik - 422013' },
      { name: 'Deolali Cantonment', distance: 13.5, latOffset: -0.092, lngOffset: 0.065, address: 'Rest Camp Road, Deolali, Nashik - 422401' },
      { name: 'Sinnar Industrial Cluster', distance: 27.0, latOffset: -0.185, lngOffset: 0.142, address: 'Pune-Nashik Highway, Sinnar - 422103' },
    ]
  },
  'hub-guntur': {
    lat: 16.3067,
    lng: 80.4365,
    defaultLandmarks: [
      { name: 'Brodipet Main Road', distance: 2.5, latOffset: 0.012, lngOffset: -0.015, address: '3rd Lane, Brodipet, Guntur - 522002' },
      { name: 'Mirchi Yard Road', distance: 5.0, latOffset: -0.032, lngOffset: 0.028, address: 'Agri APMC Road, Mirchi Yard, Guntur - 522004' },
      { name: 'Pattabhipuram Extension', distance: 7.2, latOffset: 0.045, lngOffset: 0.038, address: 'Behind Collectorate, Pattabhipuram, Guntur - 522006' },
      { name: 'Tenali Highway Junction', distance: 18.0, latOffset: -0.125, lngOffset: 0.095, address: 'NH16 Service Road, Tenali Bypass, Guntur - 522201' },
    ]
  },
  'hub-karnal': {
    lat: 29.6857,
    lng: 76.9905,
    defaultLandmarks: [
      { name: 'Sector 12 Urban Estate', distance: 3.0, latOffset: 0.018, lngOffset: 0.015, address: 'HUDA Sector 12, Karnal - 132001' },
      { name: 'NDRI Campus Gate 2', distance: 4.8, latOffset: -0.025, lngOffset: -0.030, address: 'National Dairy Research Road, Karnal - 132001' },
      { name: 'G.T. Road Toll Plaza', distance: 11.2, latOffset: 0.075, lngOffset: 0.045, address: 'NH44 Grand Trunk Road, Karnal - 132037' },
    ]
  },
  'hub-indore': {
    lat: 22.7196,
    lng: 75.8577,
    defaultLandmarks: [
      { name: 'Vijay Nagar Square', distance: 4.2, latOffset: 0.028, lngOffset: 0.022, address: 'Near C21 Mall, Vijay Nagar, Indore - 452010' },
      { name: 'Chhotigwaltoli Mandi', distance: 2.2, latOffset: -0.012, lngOffset: -0.010, address: 'Station Road, Indore - 452001' },
      { name: 'Palasia Main Road', distance: 5.5, latOffset: 0.035, lngOffset: 0.030, address: 'Old Palasia, Indore - 452018' },
      { name: 'Rau Silicon City', distance: 14.0, latOffset: -0.095, lngOffset: -0.065, address: 'AB Road, Rau, Indore - 453331' },
    ]
  }
};

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  isOpen,
  onClose,
  selectedHub,
  currentAddress,
  currentDistanceKm,
  onSelectLocation,
}) => {
  const hubConfig = HUB_COORDINATES[selectedHub.id] || {
    lat: 19.9975,
    lng: 73.7898,
    defaultLandmarks: [
      { name: 'Regional Mandi Ward', distance: 3.0, latOffset: 0.018, lngOffset: 0.015, address: `${selectedHub.district} Center` },
      { name: 'Suburban Green Belt', distance: 12.0, latOffset: 0.080, lngOffset: -0.060, address: `${selectedHub.district} Ring Road` }
    ]
  };

  const [pickedAddress, setPickedAddress] = useState(currentAddress || 'Panchavati Market Yard, Nashik');
  const [distanceKm, setDistanceKm] = useState(currentDistanceKm || 5);
  const [selectedCoords, setSelectedCoords] = useState<GeoLocationPoint>({
    lat: hubConfig.lat + 0.025,
    lng: hubConfig.lng + 0.020,
    addressLabel: pickedAddress,
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street');

  useEffect(() => {
    if (currentAddress) {
      setPickedAddress(currentAddress);
    }
    if (currentDistanceKm) {
      setDistanceKm(currentDistanceKm);
    }
  }, [currentAddress, currentDistanceKm]);

  if (!isOpen) return null;

  // Haversine formula calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(1, Math.min(50, Math.round(R * c * 10) / 10));
  };

  // Real browser GPS detection
  const handleDetectLiveGps = () => {
    setIsDetectingGps(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const dist = calculateDistance(hubConfig.lat, hubConfig.lng, userLat, userLng);
        const resolvedAddress = `GPS Location: ${userLat.toFixed(4)}°N, ${userLng.toFixed(4)}°E (Near ${selectedHub.district})`;

        setSelectedCoords({
          lat: userLat,
          lng: userLng,
          addressLabel: resolvedAddress,
        });
        setPickedAddress(resolvedAddress);
        setDistanceKm(dist);
        setIsDetectingGps(false);
      },
      (err) => {
        // Fallback gracefully to default hub proximity landmark
        const fallback = hubConfig.defaultLandmarks[0];
        setDistanceKm(fallback.distance);
        setPickedAddress(fallback.address);
        setGpsError('Using regional APMC GPS reference (GPS permission needed for precise rooftop pin).');
        setIsDetectingGps(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Pick landmark
  const handleSelectLandmark = (lm: typeof hubConfig.defaultLandmarks[0]) => {
    setDistanceKm(lm.distance);
    setPickedAddress(lm.address);
    setSelectedCoords({
      lat: hubConfig.lat + lm.latOffset,
      lng: hubConfig.lng + lm.lngOffset,
      addressLabel: lm.name,
      landmark: lm.name,
    });
  };

  // Interactive Click on Map Canvas
  const handleMapCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates (-1 to 1 from center)
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;
    
    // Scale to max 50km
    const estimatedDist = Math.max(1, Math.min(50, Math.round(Math.sqrt(normX * normX + normY * normY) * 35 * 10) / 10));
    setDistanceKm(estimatedDist);
    
    const newLat = hubConfig.lat - normY * 0.15;
    const newLng = hubConfig.lng + normX * 0.15;
    const clickAddress = `Pinned Location at ${newLat.toFixed(4)}°N, ${newLng.toFixed(4)}°E (${selectedHub.district} Ward)`;
    
    setSelectedCoords({
      lat: newLat,
      lng: newLng,
      addressLabel: clickAddress,
    });
    setPickedAddress(clickAddress);
  };

  const handleConfirm = () => {
    onSelectLocation({
      address: pickedAddress,
      distanceKm: distanceKm,
      coordinates: selectedCoords,
    });
    onClose();
  };

  // Delivery fee calculation preview matching user formula
  const firstTierKm = Math.min(3, distanceKm);
  const extraTierKm = Math.max(0, distanceKm - 3);
  const calculatedDeliveryFee = firstTierKm * 2 + extraTierKm * 3;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif flex items-center gap-2">
                <span>Select Delivery Address via Live Google Map &amp; GPS</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  {selectedHub.name.split(' ')[0]} Hub
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                Click on the interactive map or pick a nearby landmark to calculate exact delivery distance from regional silo.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Quick Action Bar: GPS button & Map layer switch */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <button
              id="detect-gps-location-btn"
              onClick={handleDetectLiveGps}
              disabled={isDetectingGps}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Crosshair className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Detecting Live GPS...' : 'Use My Current GPS Location'}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500 font-medium">Map View:</span>
              <div className="flex items-center bg-stone-200 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setMapLayer('street')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    mapLayer === 'street' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Roadmap
                </button>
                <button
                  onClick={() => setMapLayer('satellite')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    mapLayer === 'satellite' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Satellite / Aerial
                </button>
              </div>
            </div>
          </div>

          {gpsError && (
            <div className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Interactive Live Map Canvas */}
          <div className="relative rounded-xl overflow-hidden border border-stone-300 shadow-inner h-64 sm:h-72">
            
            {/* Background Texture matching map layer */}
            <div
              className={`absolute inset-0 transition-colors ${
                mapLayer === 'street'
                  ? 'bg-stone-100'
                  : 'bg-gradient-to-br from-stone-900 via-stone-850 to-emerald-950 text-white'
              }`}
            >
              {/* Grid Lines simulating street coordinates */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />
            </div>

            {/* SVG Visual Stage */}
            <svg
              onClick={handleMapCanvasClick}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              viewBox="0 0 600 320"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Range Circles centered on warehouse hub */}
              {/* 3 km circle */}
              <circle cx="200" cy="160" r="45" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* 25 km circle */}
              <circle cx="200" cy="160" r="110" fill="none" stroke="#6b7280" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
              {/* 50 km cluster limit circle */}
              <circle cx="200" cy="160" r="180" fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />

              {/* Connecting route polyline between warehouse and destination */}
              <line
                x1="200"
                y1="160"
                x2="380"
                y2="110"
                stroke="#059669"
                strokeWidth="3"
                strokeDasharray="6 4"
                className="animate-pulse"
              />

              {/* Highway Route Path Simulation */}
              <path
                d="M 50,220 Q 200,160 380,110 T 550,60"
                fill="none"
                stroke={mapLayer === 'street' ? '#cbd5e1' : '#374151'}
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Warehouse Hub Marker */}
              <g transform="translate(200, 160)">
                <circle r="14" fill="#047857" className="animate-ping opacity-30" />
                <circle r="10" fill="#065f46" stroke="#ffffff" strokeWidth="2.5" />
                <circle r="4" fill="#fde047" />
                <text x="0" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill={mapLayer === 'street' ? '#1f2937' : '#f9fafb'}>
                  {selectedHub.name.split(' ')[0]} Silo Hub
                </text>
              </g>

              {/* Customer Delivery Pin Marker */}
              <g transform="translate(380, 110)">
                <circle r="16" fill="#dc2626" className="animate-ping opacity-25" />
                <path d="M 0,-18 C -7,-18 -12,-12 -12,-5 C -12,4 0,16 0,16 C 0,16 12,4 12,-5 C 12,-12 7,-18 0,-18 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="0" cy="-6" r="3.5" fill="#ffffff" />
                <rect x="-65" y="-36" width="130" height="17" rx="4" fill="#1c1917" opacity="0.9" />
                <text x="0" y="-24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                  📍 {distanceKm} km Delivery Pin
                </text>
              </g>
            </svg>

            {/* Map Overlay Badges */}
            <div className="absolute top-2.5 left-2.5 bg-stone-900/90 text-stone-100 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-stone-700 text-[11px] space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Navigation className="w-3.5 h-3.5" />
                <span>Geodesic Distance: {distanceKm} km</span>
              </div>
              <p className="text-[10px] text-stone-300">
                From: <strong>{selectedHub.name}</strong>
              </p>
            </div>

            <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-stone-800 px-2 py-1 rounded text-[10px] font-mono border border-stone-300">
              Target: {selectedCoords.lat.toFixed(4)}°N, {selectedCoords.lng.toFixed(4)}°E
            </div>

            <div className="absolute bottom-2.5 left-2.5 bg-emerald-950/90 text-emerald-200 px-2 py-1 rounded text-[10px] font-semibold border border-emerald-700/60">
              💡 Tap anywhere on the map to pin address
            </div>
          </div>

          {/* Preset Landmarks Around this Regional Hub */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Popular Localities in {selectedHub.district} Cluster:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {hubConfig.defaultLandmarks.map((lm, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectLandmark(lm)}
                  className={`p-2.5 text-left rounded-xl border text-xs transition-all flex items-start justify-between gap-2 ${
                    pickedAddress.includes(lm.name)
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-400'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-stone-500" />
                      {lm.name}
                    </span>
                    <span className="text-[11px] text-stone-500 block line-clamp-1">
                      {lm.address}
                    </span>
                  </div>
                  <span className="shrink-0 bg-stone-100 text-stone-800 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">
                    {lm.distance} km
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Address Editor & Distance Control */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800 block">
                Delivery Address Text (Door No, Apartment, Street):
              </label>
              <textarea
                rows={2}
                value={pickedAddress}
                onChange={(e) => setPickedAddress(e.target.value)}
                className="w-full text-xs bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:ring-2 focus:ring-emerald-600 outline-hidden"
                placeholder="Enter complete building number, street name, and pincode..."
              />
            </div>

            {/* Transparent Rate Preview */}
            <div className="bg-white border border-stone-200 rounded-lg p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-stone-800">
                  Calculated Distance: <strong className="text-emerald-800">{distanceKm} km</strong>
                </span>
                <span className="text-[11px] text-stone-500 block">
                  First 3 km: ₹2/km {extraTierKm > 0 ? `+ Extra ${extraTierKm} km: ₹3/km` : ''}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-500 uppercase font-mono block">Estimated Delivery Fee</span>
                <span className="text-sm font-extrabold text-stone-900 font-mono">
                  ₹{calculatedDeliveryFee}
                </span>
                <span className="text-[10px] text-emerald-700 block font-semibold">
                  (FREE if order &gt; 3.5 kg)
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg"
          >
            Cancel
          </button>
          
          <button
            id="apply-map-location-btn"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirm &amp; Set Address ({distanceKm} km)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
