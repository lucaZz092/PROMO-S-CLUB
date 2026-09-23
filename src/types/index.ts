export type CategoryId =
  | 'smartphones'
  | 'hardware'
  | 'audio'
  | 'peripherals'
  | 'wearables'
  | 'games'
  | 'smarthome';

export type StoreId = 'amazon';

export interface PricePoint {
  date: string;
  price: number;
  store: StoreId;
  event?: string;
}

export interface Coupon {
  id: string;
  code: string;
  store: StoreId;
  storeName: string;
  storeLogo?: string;
  discountDescription: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  minOrderValue?: number;
  category: CategoryId | 'all';
  validUntil: string;
  terms: string;
  successRate: number;
  usesCount: number;
  amazonAsinTarget?: string;
}

export interface Deal {
  id: string;
  asin: string;
  title: string;
  category: CategoryId;
  categoryName: string;
  store: 'amazon';
  storeName: 'Amazon Brasil';
  originalPrice: number;
  currentPrice: number;
  discountPercent: number;
  lowestPrice90d: number;
  highestPrice90d: number;
  averagePrice90d: number;
  isLowestEver: boolean;
  isPrime: boolean;
  couponCode?: string;
  couponDiscount?: number;
  imageUrl: string;
  productUrl: string;
  affiliateUrl: string;
  priceHistory: PricePoint[];
  freeShipping: boolean;
  installments?: string;
  verifiedAt: string;
  likesCount: number;
  rating: number;
  dealVerdict: 'historico_minimo' | 'preco_excelente' | 'preco_bom';
  commissionRate: number; // e.g. 0.08 (8%)
  affiliateClicks: number;
}

export interface AffiliateConfig {
  associateTag: string; // e.g. 'lucas-20'
  subTrackingId?: string;
}

export interface WishlistItem {
  id: string;
  dealId: string;
  asin?: string;
  title: string;
  targetPrice: number;
  initialPrice: number;
  currentPrice: number;
  store: StoreId;
  imageUrl: string;
  productUrl: string;
  affiliateUrl: string;
  addedAt: string;
  notified: boolean;
}

export interface UserSavingsMetrics {
  totalSaved: number;
  dealsClaimedCount: number;
  couponsUsedCount: number;
  averageDiscountPercent: number;
  savingsByCategory: Record<string, number>;
  savingsByStore: Record<string, number>;
  totalAffiliateClicks: number;
  estimatedCommissions: number;
}

export interface NotificationSettings {
  browserPushEnabled: boolean;
  soundEnabled: boolean;
  minDiscountThreshold: number;
  alertOnLowestEver: boolean;
  trackedStores: StoreId[];
  trackedCategories: CategoryId[];
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  dealId?: string;
  read: boolean;
  type: 'price_drop' | 'target_hit' | 'coupon_alert' | 'system';
}
