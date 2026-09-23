import React, { useState } from 'react';
import { Heart, ExternalLink, Share2, Copy, Check, LineChart, ShieldCheck } from 'lucide-react';
import { Deal } from '../types';

interface DealCardProps {
  deal: Deal;
  isWishlisted: boolean;
  onToggleWishlist: (deal: Deal) => void;
  onOpenPriceHistory: (deal: Deal) => void;
  onOpenShareAffiliate: (deal: Deal) => void;
  onCopyCoupon?: (code: string) => void;
  onClaimDeal: (deal: Deal) => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  isWishlisted,
  onToggleWishlist,
  onOpenPriceHistory,
  onOpenShareAffiliate,
  onCopyCoupon,
  onClaimDeal,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deal.couponCode) return;
    navigator.clipboard.writeText(deal.couponCode);
    setCopied(true);
    if (onCopyCoupon) {
      onCopyCoupon(deal.couponCode);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedCurrentPrice = deal.currentPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const formattedOriginalPrice = deal.originalPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <article className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl overflow-hidden hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-all duration-200">
      {/* Product Image Slot */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
        {!imgError ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => {
              setImgError(true);
            }}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300 bg-white"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-950 text-neutral-400">
            <LineChart className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-medium text-center line-clamp-2">{deal.title}</span>
          </div>
        )}

        {/* Wishlist toggle affordance */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(deal);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
            isWishlisted
              ? 'bg-rose-500/90 text-white shadow-sm'
              : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 hover:text-rose-500'
          }`}
          title={isWishlisted ? 'Remover da Lista de Desejos' : 'Adicionar à Lista de Desejos'}
          aria-label="Favoritar oferta"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Discount sticker text */}
        <div className="absolute bottom-3 left-3 bg-neutral-950/85 backdrop-blur-md text-amber-400 px-2.5 py-1 rounded text-xs font-mono font-semibold">
          -{deal.discountPercent}% OFF
        </div>

        {/* Prime indicator tag */}
        {deal.isPrime && (
          <div className="absolute top-3 left-3 bg-sky-600/90 backdrop-blur-md text-white px-2 py-0.5 rounded text-[11px] font-sans font-semibold">
            Prime
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div className="flex flex-col flex-1 p-5">
        {/* Unboxed Metadata Line with typographic separators */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-2 truncate">
          <span className="font-semibold text-amber-600 dark:text-amber-400 truncate">Amazon Brasil</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[11px] truncate">ASIN: {deal.asin}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{deal.verifiedAt}</span>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 mb-3 leading-snug">
          {deal.title}
        </h3>

        {/* Price Information */}
        <div className="mt-auto pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white font-mono tabular-nums">
              {formattedCurrentPrice}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through font-mono tabular-nums">
              {formattedOriginalPrice}
            </span>
          </div>

          {/* Price Verification Info */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate font-medium">
              {deal.isLowestEver
                ? 'Menor preço nos últimos 90 dias'
                : `Abaixo da média (${deal.averagePrice90d.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`}
            </span>
          </div>

          {/* Coupon bar if available */}
          {deal.couponCode && (
            <div className="flex items-center justify-between gap-2 p-2 mb-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-dashed border-amber-300 dark:border-amber-900/60">
              <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-700 dark:text-neutral-300 truncate">
                <span className="text-neutral-400">Cupom:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{deal.couponCode}</span>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer px-2 py-1 rounded bg-neutral-200/60 dark:bg-neutral-700/60 transition-colors"
                title="Copiar cupom"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onOpenPriceHistory(deal)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer truncate"
              title="Ver histórico de preços e validação de desconto"
            >
              <LineChart className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Histórico</span>
            </button>

            <button
              onClick={() => onOpenShareAffiliate(deal)}
              className="p-2.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Compartilhar oferta com amigos"
              aria-label="Compartilhar oferta"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <a
              href={deal.affiliateUrl || deal.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClaimDeal(deal)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer truncate shadow-xs no-underline"
              title="Acessar produto oficial na Amazon Brasil"
            >
              <span className="truncate">Ir à Oferta</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
