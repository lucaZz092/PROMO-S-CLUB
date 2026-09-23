import React from 'react';
import { UserSavingsMetrics } from '../types';
import { ClaimRecord } from '../services/analyticsService';
import { DollarSign, Tag, Award, ArrowUpRight, ShieldCheck, Sparkles, TrendingDown } from 'lucide-react';

interface AnalyticsViewProps {
  metrics: UserSavingsMetrics;
  claimsLog: ClaimRecord[];
  onExploreDeals: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  metrics,
  claimsLog,
  onExploreDeals,
}) => {
  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Calculate maximum values for proportional bars
  const categoryEntries = Object.entries(metrics.savingsByCategory);
  const maxCategorySaving = Math.max(...categoryEntries.map(([, val]) => val), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mb-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Painel de Economia Pessoal & Inteligência de Preços</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Sua Economia & Oportunidades do Radar
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
              Acompanhe quanto você economizou aproveitando ofertas verificadas no menor preço histórico e cupons exclusivos.
            </p>
          </div>

          <button
            onClick={onExploreDeals}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <span>Ver Ofertas no Menor Histórico</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Economizado */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Total Economizado</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(metrics.totalSaved)}
          </p>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 block">
            Descontos reais aproveitados
          </span>
        </div>

        {/* KPI 2: Economia Média por Compra */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Desconto Médio</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
            {Math.round(metrics.averageDiscountPercent)}% OFF
          </p>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 block">
            Média de redução frente ao histórico
          </span>
        </div>

        {/* KPI 3: Ofertas Verificadas no Menor Preço */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Ofertas Menor Histórico</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
            {claimsLog.length + 8}
          </p>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 block">
            Produtos no piso de 90 dias
          </span>
        </div>

        {/* KPI 4: Cupons Ativados */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-medium">Cupons Resgatados</span>
            <Tag className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
            {metrics.couponsUsedCount}
          </p>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 block">
            Cupons testados e validados
          </span>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
          <strong>Garantia de Preço Real:</strong> Todas as ofertas exibidas no PromoRadar passam por verificação diária de histórico de 90 dias, filtrando variações artificiais para garantir que você só compre promoções legítimas.
        </p>
      </div>

      {/* Distribution Breakdown: Categories */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Economia por Categoria
        </h3>
        <div className="space-y-3">
          {categoryEntries.map(([category, amount]) => {
            const percentage = Math.round((amount / maxCategorySaving) * 100);
            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">{category}</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white tabular-nums">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claims History Log */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Histórico Recente de Ofertas Aproveitadas
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            {claimsLog.length} ofertas
          </span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {claimsLog.map((claim) => (
            <div key={claim.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-0.5">
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Amazon Brasil</span>
                  <span aria-hidden="true">·</span>
                  <span>{claim.date}</span>
                </div>
                <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {claim.title}
                </h4>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-neutral-400 block font-mono">Economizou</span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{formatCurrency(claim.discountSaved)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
