import { UserSavingsMetrics, Deal, Coupon } from '../types';

const STORAGE_KEY_SAVINGS = 'promoradar_savings_metrics_v1';
const STORAGE_KEY_CLAIMS_LOG = 'promoradar_claims_log_v1';

export interface ClaimRecord {
  id: string;
  type: 'deal' | 'coupon';
  title: string;
  storeName: string;
  originalPrice?: number;
  finalPrice?: number;
  discountSaved: number;
  date: string;
}

export const INITIAL_SAVINGS_METRICS: UserSavingsMetrics = {
  totalSaved: 3840.50,
  dealsClaimedCount: 7,
  couponsUsedCount: 5,
  averageDiscountPercent: 36.5,
  totalAffiliateClicks: 468,
  estimatedCommissions: 1284.50,
  savingsByCategory: {
    'Smartphones & Telefonia': 1600.00,
    'Hardware & Peças': 1200.00,
    'Áudio & Fones': 550.50,
    'Periféricos & Acessórios': 290.00,
    'Casa Inteligente': 200.00,
  },
  savingsByStore: {
    'Amazon Brasil': 3840.50,
  },
};

export const INITIAL_CLAIMS_LOG: ClaimRecord[] = [
  {
    id: 'claim-1',
    type: 'deal',
    title: 'Samsung Galaxy S24 Ultra 512GB Titânio',
    storeName: 'Amazon Brasil',
    originalPrice: 8999.00,
    finalPrice: 5399.00,
    discountSaved: 3600.00,
    date: 'Ontem às 18:40',
  },
  {
    id: 'claim-2',
    type: 'coupon',
    title: 'Cupom AMAZONTECH100 aplicado no fone Sony WH-1000XM5',
    storeName: 'Amazon Brasil',
    discountSaved: 100.00,
    date: '21/09/2026',
  },
  {
    id: 'claim-3',
    type: 'deal',
    title: 'Teclado Mecânico Logitech MX Mechanical Mini',
    storeName: 'Amazon Brasil',
    originalPrice: 999.00,
    finalPrice: 599.00,
    discountSaved: 400.00,
    date: '19/09/2026',
  },
];

export function getStoredSavingsMetrics(): UserSavingsMetrics {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVINGS);
    if (!raw) return INITIAL_SAVINGS_METRICS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAVINGS_METRICS;
  }
}

export function getStoredClaimsLog(): ClaimRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLAIMS_LOG);
    if (!raw) return INITIAL_CLAIMS_LOG;
    return JSON.parse(raw);
  } catch {
    return INITIAL_CLAIMS_LOG;
  }
}

export function recordDealSavings(deal: Deal): { metrics: UserSavingsMetrics; log: ClaimRecord[] } {
  const currentMetrics = getStoredSavingsMetrics();
  const currentLog = getStoredClaimsLog();

  const savedAmount = Math.max(0, deal.originalPrice - deal.currentPrice);
  const newMetrics: UserSavingsMetrics = {
    ...currentMetrics,
    totalSaved: +(currentMetrics.totalSaved + savedAmount).toFixed(2),
    dealsClaimedCount: currentMetrics.dealsClaimedCount + 1,
    averageDiscountPercent: +(
      (currentMetrics.averageDiscountPercent * currentMetrics.dealsClaimedCount + deal.discountPercent) /
      (currentMetrics.dealsClaimedCount + 1)
    ).toFixed(1),
    savingsByCategory: {
      ...currentMetrics.savingsByCategory,
      [deal.categoryName]: +((currentMetrics.savingsByCategory[deal.categoryName] || 0) + savedAmount).toFixed(2),
    },
    savingsByStore: {
      ...currentMetrics.savingsByStore,
      [deal.storeName]: +((currentMetrics.savingsByStore[deal.storeName] || 0) + savedAmount).toFixed(2),
    },
  };

  const newRecord: ClaimRecord = {
    id: `claim-${Date.now()}`,
    type: 'deal',
    title: deal.title,
    storeName: deal.storeName,
    originalPrice: deal.originalPrice,
    finalPrice: deal.currentPrice,
    discountSaved: savedAmount,
    date: 'Agora',
  };

  const newLog = [newRecord, ...currentLog];

  try {
    localStorage.setItem(STORAGE_KEY_SAVINGS, JSON.stringify(newMetrics));
    localStorage.setItem(STORAGE_KEY_CLAIMS_LOG, JSON.stringify(newLog));
  } catch {
    // ignore
  }

  return { metrics: newMetrics, log: newLog };
}

export function recordCouponSavings(coupon: Coupon): { metrics: UserSavingsMetrics; log: ClaimRecord[] } {
  const currentMetrics = getStoredSavingsMetrics();
  const currentLog = getStoredClaimsLog();

  const savedAmount = coupon.discountType === 'fixed' ? coupon.discountValue : 50;
  const newMetrics: UserSavingsMetrics = {
    ...currentMetrics,
    totalSaved: +(currentMetrics.totalSaved + savedAmount).toFixed(2),
    couponsUsedCount: currentMetrics.couponsUsedCount + 1,
    savingsByStore: {
      ...currentMetrics.savingsByStore,
      [coupon.storeName]: +((currentMetrics.savingsByStore[coupon.storeName] || 0) + savedAmount).toFixed(2),
    },
  };

  const newRecord: ClaimRecord = {
    id: `coupon-claim-${Date.now()}`,
    type: 'coupon',
    title: `Cupom ${coupon.code} (${coupon.discountDescription})`,
    storeName: coupon.storeName,
    discountSaved: savedAmount,
    date: 'Agora',
  };

  const newLog = [newRecord, ...currentLog];

  try {
    localStorage.setItem(STORAGE_KEY_SAVINGS, JSON.stringify(newMetrics));
    localStorage.setItem(STORAGE_KEY_CLAIMS_LOG, JSON.stringify(newLog));
  } catch {
    // ignore
  }

  return { metrics: newMetrics, log: newLog };
}
