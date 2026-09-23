import React from 'react';
import { TrendingDown, X, ArrowRight } from 'lucide-react';
import { Deal } from '../types';

interface LiveDropToastProps {
  deal: Deal | null;
  onClose: () => void;
  onViewDeal: (deal: Deal) => void;
}

export const LiveDropToast: React.FC<LiveDropToastProps> = ({ deal, onClose, onViewDeal }) => {
  if (!deal) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-xl shadow-2xl p-4 border border-neutral-800 dark:border-neutral-200 animate-slide-up flex items-start gap-3">
      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 dark:text-emerald-600 shrink-0">
        <TrendingDown className="w-5 h-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-600 mb-0.5">
          <span>Queda de Preço Detectada!</span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white dark:hover:text-black p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className="text-xs font-semibold truncate leading-tight mb-1 text-white dark:text-neutral-900">
          {deal.title}
        </h4>

        <div className="flex items-baseline gap-2 mb-2 font-mono text-xs">
          <span className="font-bold text-emerald-400 dark:text-emerald-600">
            {deal.currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="line-through text-neutral-500 text-[11px]">
            {deal.originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-xs font-semibold text-emerald-400 dark:text-emerald-600">
            -{deal.discountPercent}%
          </span>
        </div>

        <button
          onClick={() => {
            onViewDeal(deal);
            onClose();
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 dark:text-emerald-700 hover:underline cursor-pointer"
        >
          <span>Validar no Histórico</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
