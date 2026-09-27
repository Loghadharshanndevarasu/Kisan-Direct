export type ProduceCategory = 'pulses' | 'grains' | 'oilseeds' | 'millets' | 'peas';
export type ProduceTier = 'on-demand' | 'underdog';

export interface FarmerProfile {
  id: string;
  name: string;
  phone?: string;
  village: string;
  district: string;
  state: string;
  distanceToWarehouseKm?: number;
  isProximityDiscountEligible?: boolean;
  isPremiumInterstateSeller?: boolean;
  acreage: number;
  soilType: string;
  irrigation: string;
  isPremium?: boolean;
  exportLicenseNumber?: string;
  fpoAffiliation?: string;
  rating?: number;
  totalBatchesSold?: number;
  experienceYears?: number;
  memberSince?: string;
}

export interface HarvestInfo {
  batchNumber: string;
  sowingDate: string;
  harvestDate: string;
  sunDryingDays: number;
  moisturePercent: number;
  sortingGrade?: string;
  organicCertified: boolean;
  pesticideFree: boolean;
  labCertificateId: string;
}

export interface FeeStructure {
  farmerSharePercent: number; // e.g. 91% for on-demand, 80% for underdog
  platformFeePercent: number; // e.g. 3% for on-demand, 6% for underdog
  logisticsFeePercent: number; // e.g. 4% for on-demand, 8% for underdog
  inventoryHoldingFeePercent: number; // e.g. 2% for on-demand, 6% for underdog
  inventoryFeePercent?: number;
  fixedServiceFeeRs?: number; // for underdog produce
  underdogFixedServiceFeeRs?: number;
}

export interface ProduceItem {
  id: string;
  name: string;
  hindiName: string;
  category: ProduceCategory;
  tier: ProduceTier;
  description: string;
  stockKg?: number;
  availableStockKg?: number;
  pricePerKg: number;
  marketMandiPricePerKg: number; // Comparison with APMC mandi price or supermarket brand
  warehouseHubId?: string;
  warehouseId?: string;
  warehouseName: string;
  regionState?: string;
  looseUnits: string[]; // e.g. ['1 kg', '5 kg', '25 kg Gunny Sack', '50 kg Quintal']
  looseUnitOptions?: string[];
  farmer: FarmerProfile;
  harvestInfo: HarvestInfo;
  feeStructure: FeeStructure;
  imageAccentColor?: string;
  imageUrl?: string;
  dietaryNotes?: string;
  isLooseOnly?: boolean;
}

export interface WarehouseHub {
  id: string;
  name: string;
  district: string;
  locality?: string;
  state: string;
  pinCode: string;
  coverageRadiusKm: number;
  proximityDiscountPercent: number; // e.g. 6% discount if user/farmer is in same cluster
  inventoryCapacityTonnes: number;
  currentHoldingTonnes: number;
}

export interface CartItem {
  id: string;
  produce: ProduceItem;
  quantityKg: number;
  unitLabel: string;
  pricePerKg?: number;
  appliedPricePerKg: number;
  appliedDiscountPerKg?: number;
  totalPrice?: number;
}

export interface FarmerEarningsRecord {
  id: string;
  date: string;
  batchNumber: string;
  farmerId?: string;
  farmerName?: string;
  produceId?: string;
  produceName: string;
  tier: ProduceTier;
  quantitySoldKg: number;
  pricePerKg?: number;
  grossAmount: number;
  farmerPayout: number;
  platformFee: number;
  logisticsFee: number;
  warehouseStorageFee: number;
  underdogFixedFee?: number;
  taxStatus: 'Sec 10(1) Exempt' | 'TDS/APMC Cleared' | string;
  destinationState: string;
  isInterstateOrExport: boolean;
}

export interface MonthlyTaxReport {
  id: string;
  month: string;
  year: number;
  farmerName: string;
  farmerId: string;
  panOrAadharMasked: string;
  totalGrossTurnover: number;
  exemptAgriculturalIncomeSec10_1: number;
  mandiCessAPMC: number;
  platformDeductionsTotal: number;
  netBankPayout: number;
  interstateVolumeKg: number;
  eWayBillCount: number;
  digitalSignatureDate: string;
  status: 'Audited & Verified' | 'Generated';
}

export interface LocalAd {
  id: string;
  title: string;
  businessName: string;
  locationHub: string;
  contactNumber: string;
  tagline: string;
  category: 'Farm Machinery & Rental' | 'Organic Bio-Compost' | 'Solar Agro Pumps' | 'Jute & Gunny Packaging' | 'Soil Testing & Seedlings';
  badge: string;
  monthlyRevenueRs: number;
  impressions: number;
  clicks: number;
  verifiedLocal: boolean;
}

export interface PolicySimulationState {
  directProcurementPercent: number; // 10% - 90%
  storageLossReductionPercent: number; // 5% - 80%
  farmProcessingPercent: number; // 10% - 85%
  fpoCooperativeSharePercent: number; // 5% - 75%
}

export interface PlatformFinancials {
  gmvMonthly: number;
  farmerPayoutMonthly: number;
  platformCommissionRevenue: number;
  warehouseHoldingRevenue: number;
  logisticsFeeRevenue: number;
  localAdRevenueMonthly: number;
  totalGrossPlatformRevenue: number;
  operatingCosts: {
    warehouseLeases: number;
    labTestingAndQuality: number;
    logisticsPartnerPayout: number;
    cloudAndEngineering: number;
    customerSupportRural: number;
  };
  netPlatformProfitMonthly: number;
  netMarginPercent: number;
}

export type DeliveryMilestoneId = 'confirmed' | 'weighed_packed' | 'dispatched' | 'out_for_delivery' | 'delivered';

export interface DeliveryMilestone {
  id: DeliveryMilestoneId;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  active: boolean;
}

export type DeliveryOrderStatus = 'active' | 'cancelled' | 'delivered' | 'returned_at_doorstep';

export interface DoorstepInspectionRecord {
  inspectionTimerSecondsRemaining: number;
  driverWaitDurationSeconds: number;
  decision?: 'accepted' | 'returned';
  inspectedAt?: string;
  issueType?: 'wrong_produce' | 'damaged_spoiled' | 'foreign_matter_stones' | 'weight_mismatch' | 'torn_packaging' | 'other';
  issueDescription?: string;
  proofImageUrl?: string;
  driverSignOffName?: string;
  driverVerificationCode?: string;
  refundStatus?: 'instant_upi_reversal' | 'cod_waived_zero_charge';
  refundAmount?: number;
}

export interface GeoLocationPoint {
  lat: number;
  lng: number;
  addressLabel?: string;
  landmark?: string;
}

export interface DeliveryTrackingInfo {
  orderId: string;
  placedAt: string;
  placedTimestamp?: number;
  totalDurationSeconds?: number;
  cancellationWindowSeconds?: number;
  status?: DeliveryOrderStatus;
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus?: 'completed' | 'processing';
  customerName: string;
  deliveryAddress: string;
  deliveryCoordinates?: GeoLocationPoint;
  warehouseCoordinates?: GeoLocationPoint;
  distanceKm: number;
  warehouseHubName: string;
  items: CartItem[];
  totalWeightKg: number;
  totalAmountPaid: number;
  paymentMethod: 'UPI' | 'Cash on Delivery';
  upiTransactionRef?: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  currentEtaMinutes: number;
  deliveryFeeCharged: number;
  freeDeliveryUnlocked: boolean;
  milestones: DeliveryMilestone[];
  currentMilestoneIndex: number;
  doorstepInspection?: DoorstepInspectionRecord;
}
