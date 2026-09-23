import React, { useState } from 'react';
import { WishlistItem, Deal } from '../types';
import { Heart, Trash2, BellRing, ExternalLink, LineChart, Zap, CheckCircle2 } from 'lucide-react';
import { buildAmazonAffiliateUrl, getStoredAffiliateConfig } from '../services/amazonAffiliateService';

interface WishlistViewProps {
  wishlist: WishlistItem[];
  onRemoveItem: (id: string) => void;
  onUpdateTargetPrice: (id: string, newTarget: number) => void;
  onSimulatePriceDrop: (item: WishlistItem) => void;
  onOpenPriceHistory: (dealId: string) => void;
  onExploreDeals: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  onRemoveItem,
  onUpdateTargetPrice,
  onSimulatePriceDrop,
  onOpenPriceHistory,
  onExploreDeals,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTarget, setTempTarget] = useState<string>('');
  const affiliateTag = getStoredAffiliateConfig().associateTag;

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const startEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setTempTarget(item.targetPrice.toString());
  };

  const saveEdit = (id: string) => {
    const val = parseFloat(tempTarget);
    if (!isNaN(val) && val > 0) {
      onUpdateTargetPrice(id, val);
    }
    setEditingId(null);
  };

  const totalCurrentValue = wishlist.reduce((acc, item) => acc + item.currentPrice, 0);
  const totalTargetValue = wishlist.reduce((acc, item) => acc + item.targetPrice, 0);
  const potentialSavings = Math.max(0, totalCurrentValue - totalTargetValue);

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>Lista de Desejos & Alertas de Preço</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Defina seu preço-alvo e receba alertas imediatos quando os produtos atingirem o valor desejado.
          </p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-neutral-400">Itens Monitorados:</span>
              <p className="font-bold text-neutral-900 dark:text-white">{wishlist.length}</p>
            </div>
            <div className="text-right">
              <span className="text-neutral-400">Economia Esperada:</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(potentialSavings)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Wishlist Items List */}
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3 text-neutral-400">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            Sua lista de desejos está vazia
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-4">
            Explore as promoções em tempo real e clique no ícone de coração para monitorar automaticamente qualquer produto com seu preço-alvo.
          </p>
          <button
            onClick={onExploreDeals}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Explorar Radar de Ofertas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {wishlist.map((item) => {
            const isTargetReached = item.currentPrice <= item.targetPrice;
            const affiliateProductUrl = buildAmazonAffiliateUrl(item.productUrl, affiliateTag, item.title);

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                {/* Product thumbnail & Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">Amazon Brasil</span>
                      <span aria-hidden="true">·</span>
                      <span>Adicionado em {item.addedAt}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {item.title}
                    </h4>

                    {/* Target Price status info */}
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      {isTargetReached ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Preço-alvo atingido! Compre agora.</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                          <BellRing className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Rastreamento ativo no servidor</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price & Target setting module */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-neutral-400 block">Preço Atual</span>
                    <span className="text-base font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
                      {formatCurrency(item.currentPrice)}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-neutral-400 block">Preço Desejado (Alvo)</span>
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          value={tempTarget}
                          onChange={(e) => setTempTarget(e.target.value)}
                          className="w-20 px-1.5 py-0.5 text-xs font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="text-xs px-2 py-0.5 bg-emerald-600 text-white rounded font-medium cursor-pointer"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer tabular-nums"
                        title="Clique para alterar preço-alvo"
                      >
                        {formatCurrency(item.targetPrice)}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Simulator button */}
                    <button
                      onClick={() => onSimulatePriceDrop(item)}
                      title="Testar Simulação de Queda de Preço com Notificação Push Imediata"
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                      aria-label="Simular queda de preço"
                    >
                      <Zap className="w-4 h-4" />
                    </button>

                    {/* View history */}
                    <button
                      onClick={() => onOpenPriceHistory(item.dealId)}
                      title="Ver Histórico de Preços"
                      className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                      aria-label="Ver histórico"
                    >
                      <LineChart className="w-4 h-4" />
                    </button>

                    {/* Go to Amazon store */}
                    <a
                      href={affiliateProductUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Ver produto na Amazon Brasil"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Delete */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      title="Remover da lista de desejos"
                      className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
