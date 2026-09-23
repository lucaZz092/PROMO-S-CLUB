import React, { useState } from 'react';
import { Coupon } from '../types';
import { Tag, Copy, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { buildAmazonAffiliateUrl, getStoredAffiliateConfig } from '../services/amazonAffiliateService';

interface CouponsViewProps {
  coupons: Coupon[];
  onUseCoupon: (coupon: Coupon) => void;
}

export const CouponsView: React.FC<CouponsViewProps> = ({ coupons, onUseCoupon }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const affiliateTag = getStoredAffiliateConfig().associateTag;

  const handleCopy = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    onUseCoupon(coupon);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAmazon = (coupon: Coupon) => {
    onUseCoupon(coupon);
    const targetUrl = coupon.amazonAsinTarget
      ? buildAmazonAffiliateUrl(coupon.amazonAsinTarget, affiliateTag, coupon.discountDescription)
      : buildAmazonAffiliateUrl('ofertas', affiliateTag, 'ofertas do dia');
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cupons Verificados & Testados Hoje</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              <span>Cupons de Desconto Amazon Brasil</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
              Códigos de desconto oficiais ativos e testados para compras no site e aplicativo da Amazon Brasil. Copie o código e aproveite o desconto no checkout.
            </p>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => {
          const isCopied = copiedId === coupon.id;

          return (
            <div
              key={coupon.id}
              className="flex flex-col justify-between p-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl hover:border-amber-400/50 dark:hover:border-amber-500/40 transition-colors"
            >
              <div>
                {/* Store and Expiry header line */}
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    Amazon Brasil Oficial
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    Expira em {coupon.validUntil}
                  </span>
                </div>

                {/* Discount Title */}
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {coupon.discountDescription}
                </h3>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2">
                  {coupon.terms}
                </p>

                {/* Validation and Success Rate */}
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{coupon.successRate}% de aprovação</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{coupon.usesCount} resgates hoje</span>
                </div>
              </div>

              {/* Code Box & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-dashed border-amber-300 dark:border-amber-900/60">
                <div className="font-mono font-bold text-base tracking-wider text-amber-600 dark:text-amber-400">
                  {coupon.code}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(coupon)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenAmazon(coupon)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-400 hover:bg-amber-500 text-neutral-950 transition-colors cursor-pointer"
                    title="Acessar página da promoção na Amazon Brasil"
                  >
                    <span>Ir à Amazon</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
