import { WishlistItem, Deal } from '../types';

const STORAGE_KEY_WISHLIST = 'promoradar_wishlist_v1';

export function getStoredWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WISHLIST);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredWishlist(items: WishlistItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function addToWishlist(deal: Deal, customTargetPrice?: number): WishlistItem[] {
  const current = getStoredWishlist();
  if (current.some((item) => item.dealId === deal.id)) {
    return current;
  }
  const defaultTarget = customTargetPrice || Math.round(deal.currentPrice * 0.9);
  const newItem: WishlistItem = {
    id: `wish-${Date.now()}`,
    dealId: deal.id,
    title: deal.title,
    initialPrice: deal.currentPrice,
    currentPrice: deal.currentPrice,
    targetPrice: defaultTarget,
    store: deal.store,
    imageUrl: deal.imageUrl,
    productUrl: deal.productUrl,
    affiliateUrl: deal.affiliateUrl,
    asin: deal.asin,
    addedAt: new Date().toLocaleDateString('pt-BR'),
    notified: false,
  };
  const updated = [newItem, ...current];
  saveStoredWishlist(updated);
  return updated;
}

export function updateWishlistTargetPrice(itemId: string, newTarget: number): WishlistItem[] {
  const current = getStoredWishlist();
  const updated = current.map((item) =>
    item.id === itemId ? { ...item, targetPrice: newTarget } : item
  );
  saveStoredWishlist(updated);
  return updated;
}

export function removeFromWishlist(dealIdOrItemId: string): WishlistItem[] {
  const current = getStoredWishlist();
  const updated = current.filter(
    (item) => item.id !== dealIdOrItemId && item.dealId !== dealIdOrItemId
  );
  saveStoredWishlist(updated);
  return updated;
}
