import { Deal, PricePoint, AffiliateConfig } from '../types';

const STORAGE_KEY_AFFILIATE_TAG = 'promoradar_amazon_tag_v1';
export const DEFAULT_AFFILIATE_TAG = 'lucasmarti0cb-20';

export function getStoredAffiliateConfig(): AffiliateConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AFFILIATE_TAG);
    if (!raw) return { associateTag: DEFAULT_AFFILIATE_TAG };
    const parsed = JSON.parse(raw);
    if (!parsed.associateTag || parsed.associateTag === 'lucas-20') {
      return { associateTag: DEFAULT_AFFILIATE_TAG };
    }
    return parsed;
  } catch {
    return { associateTag: DEFAULT_AFFILIATE_TAG };
  }
}

export function saveStoredAffiliateConfig(config: AffiliateConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_AFFILIATE_TAG, JSON.stringify(config));
  } catch {
    // ignore
  }
}

/**
 * Extracts 10-character Amazon ASIN from a URL or raw ASIN string
 */
export function extractAsin(input: string): string | null {
  const trimmed = input.trim();
  // Check if it's already an ASIN (10 alphanumeric chars, usually starts with B0)
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  // Check typical Amazon URL patterns: /dp/B0... or /gp/product/B0... or /d/B0...
  const match = trimmed.match(/(?:dp|gp\/product|d|product-reviews)\/([A-Z0-9]{10})/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }
  return null;
}

/**
 * Builds canonical Amazon Brasil affiliate link with user's associate tag
 * When a title or keywords are available, links to the exact Amazon Brasil search/product result
 * to ensure users never land on a 404 or "página não encontrada" error.
 */
export function buildAmazonAffiliateUrl(
  asinOrUrl: string,
  tag?: string,
  productTitle?: string
): string {
  const activeTag = tag || getStoredAffiliateConfig().associateTag || DEFAULT_AFFILIATE_TAG;

  // If a product title or query is provided, Amazon search with tag is 100% reliable and always shows in-stock items
  if (productTitle && productTitle.trim().length > 0) {
    const cleanQuery = productTitle.replace(/[^\w\sÀ-ÿ]/gi, ' ').trim().replace(/\s+/g, '+');
    return `https://www.amazon.com.br/s?k=${encodeURIComponent(cleanQuery)}&tag=${encodeURIComponent(activeTag)}`;
  }

  const asin = extractAsin(asinOrUrl);
  if (asin) {
    return `https://www.amazon.com.br/dp/${asin}?tag=${encodeURIComponent(activeTag)}`;
  }

  // Fallback if URL is already a full link
  try {
    const parsed = new URL(asinOrUrl.startsWith('http') ? asinOrUrl : `https://${asinOrUrl}`);
    parsed.searchParams.set('tag', activeTag);
    return parsed.toString();
  } catch {
    const cleanFallback = asinOrUrl.replace(/\s+/g, '+');
    return `https://www.amazon.com.br/s?k=${encodeURIComponent(cleanFallback)}&tag=${encodeURIComponent(activeTag)}`;
  }
}

/**
 * Known high-resolution Amazon media images mapped to well-known ASINs
 */
const KNOWN_AMAZON_ASIN_IMAGES: Record<string, string> = {
  // Echo Dot 5ª Geração
  B09B8V1LZ3: 'https://m.media-amazon.com/images/I/71C8z+8eBHL._AC_SL1000_.jpg',
  // Echo Pop
  B0BZX1R17Z: 'https://m.media-amazon.com/images/I/61ItD7uU1yL._AC_SL1000_.jpg',
  // Galaxy S24 Ultra
  B0CSB8J568: 'https://m.media-amazon.com/images/I/61VfL-aiOnL._AC_SL1000_.jpg',
  // Sony WH-1000XM5
  B09XS7JWHH: 'https://m.media-amazon.com/images/I/61+btxzpfDL._AC_SL1500_.jpg',
  // MacBook Air M3
  B0CX23NS3J: 'https://m.media-amazon.com/images/I/71jG+e7roXL._AC_SL1500_.jpg',
  // Garmin Forerunner 965
  B0BY2T5T6D: 'https://m.media-amazon.com/images/I/61k1qK0U2ZL._AC_SL1500_.jpg',
  // PlayStation 5 Slim
  B0CL5KNB9M: 'https://m.media-amazon.com/images/I/51051FiD9UL._AC_SL1000_.jpg',
  // Logitech MX Mechanical Mini
  B08F2245XG: 'https://m.media-amazon.com/images/I/61gR56eG70L._AC_SL1500_.jpg',
  // Kindle Paperwhite
  B08N5N6RSS: 'https://m.media-amazon.com/images/I/61WwD95zB7L._AC_SL1000_.jpg',
  // DualSense PS5
  B088GH1F2L: 'https://m.media-amazon.com/images/I/612bjwBuobS._AC_SL1000_.jpg',
  // Mondial Air Fryer
  B08L7V7H48: 'https://m.media-amazon.com/images/I/61m1hD4t+2L._AC_SL1000_.jpg',
  // Robô Aspirador
  B08F9H7C1L: 'https://m.media-amazon.com/images/I/71YyP9GzHVL._AC_SL1000_.jpg',
};

/**
 * Returns a direct Amazon CDN image URL for an ASIN if known,
 * or constructs an Amazon product image CDN candidate.
 */
export function getAmazonProductImageUrl(asinOrUrl: string, fallbackFallbackUrl?: string): string {
  const asin = extractAsin(asinOrUrl);
  if (asin && KNOWN_AMAZON_ASIN_IMAGES[asin]) {
    return KNOWN_AMAZON_ASIN_IMAGES[asin];
  }
  if (asin) {
    // Amazon's standardized CDN resolver for ASINs
    return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;
  }
  return fallbackFallbackUrl || '/src/assets/images/deal_smartphone_flagship_1790168650372.jpg';
}

/**
 * Formats a ready-to-share message for WhatsApp and Telegram communities
 */
export function generateAffiliateShareText(deal: Deal, associateTag?: string): string {
  const tag = associateTag || getStoredAffiliateConfig().associateTag || DEFAULT_AFFILIATE_TAG;
  const affiliateUrl = deal.affiliateUrl || buildAmazonAffiliateUrl(deal.asin || deal.productUrl, tag, deal.title);

  const formattedOriginal = deal.originalPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const formattedCurrent = deal.currentPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const lines = [
    `🔥 *OFERTA AMAZON BRASIL* 🔥`,
    ``,
    `📦 *${deal.title}*`,
    ``,
    `❌ De: ~${formattedOriginal}~`,
    `✅ *Por apenas: ${formattedCurrent}* (-${deal.discountPercent}% OFF)`,
  ];

  if (deal.installments) {
    lines.push(`💳 ${deal.installments}`);
  }

  if (deal.couponCode) {
    lines.push(`🎟️ Cupom de Desconto: *${deal.couponCode}* (aplique na página do produto)`);
  }

  if (deal.isPrime) {
    lines.push(`🚚 Frete GRÁTIS com Amazon Prime`);
  }

  if (deal.isLowestEver) {
    lines.push(`📉 *Menor preço registrado nos últimos 90 dias!*`);
  }

  lines.push(``);
  lines.push(`🛒 *Compre com segurança pelo link oficial:*`);
  lines.push(affiliateUrl);

  return lines.join('\n');
}

/**
 * Mock Amazon PA-API catalog item simulation for instant search or import
 */
export function createMockAmazonImport(
  rawInput: string,
  title?: string,
  price?: number,
  category?: Deal['category'],
  customImageUrl?: string
): Deal {
  const asin = extractAsin(rawInput) || `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const affiliateTag = getStoredAffiliateConfig().associateTag || DEFAULT_AFFILIATE_TAG;
  const currentPrice = price || Math.floor(Math.random() * 400) + 99;
  const originalPrice = Math.round(currentPrice * (1 + (Math.random() * 0.4 + 0.2)));
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const defaultTitle = title || `Produto Amazon Importado ASIN ${asin}`;
  const resolvedImageUrl = customImageUrl || getAmazonProductImageUrl(asin);
  const now = new Date();

  const priceHistory: PricePoint[] = [
    {
      date: new Date(now.getTime() - 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
      price: originalPrice,
      store: 'amazon',
    },
    {
      date: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      price: Math.round((originalPrice + currentPrice) / 2),
      store: 'amazon',
    },
    {
      date: now.toISOString().split('T')[0],
      price: currentPrice,
      store: 'amazon',
      event: 'Oferta Relâmpago Amazon',
    },
  ];

  return {
    id: `deal-amazon-${asin.toLowerCase()}`,
    asin,
    title: defaultTitle,
    category: category || 'smartphones',
    categoryName: 'Smartphones & Telefonia',
    store: 'amazon',
    storeName: 'Amazon Brasil',
    originalPrice,
    currentPrice,
    discountPercent,
    lowestPrice90d: currentPrice,
    highestPrice90d: originalPrice,
    averagePrice90d: Math.round((originalPrice + currentPrice) / 2),
    isLowestEver: true,
    isPrime: true,
    freeShipping: true,
    imageUrl: resolvedImageUrl,
    productUrl: `https://www.amazon.com.br/dp/${asin}`,
    affiliateUrl: `https://www.amazon.com.br/dp/${asin}?tag=${encodeURIComponent(affiliateTag)}&linkCode=ll1`,
    priceHistory,
    installments: `10x de ${(currentPrice / 10).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros`,
    verifiedAt: 'agora',
    likesCount: 1,
    rating: 4.8,
    dealVerdict: 'historico_minimo',
    commissionRate: 0.08,
    affiliateClicks: 0,
  };
}
