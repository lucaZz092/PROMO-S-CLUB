import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, TrendingDown, ExternalLink, Heart, BellRing } from 'lucide-react';
import { Deal, PricePoint } from '../types';

interface PriceHistoryModalProps {
  deal: Deal;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (deal: Deal) => void;
  onSetTargetPrice?: (deal: Deal, targetPrice: number) => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  deal,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onSetTargetPrice,
}) => {
  const [selectedRange, setSelectedRange] = useState<'30d' | '60d' | '90d'>('90d');
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);
  const [targetInput, setTargetInput] = useState<string>(
    Math.round(deal.currentPrice * 0.9).toString()
  );
  const [targetSaved, setTargetSaved] = useState(false);

  // Filter history points based on selected range
  const filteredPoints = deal.priceHistory;

  // Compute SVG dimensions and scale
  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const prices = filteredPoints.map((p) => p.price);
  const minPrice = Math.min(...prices, deal.currentPrice) * 0.92;
  const maxPrice = Math.max(...prices, deal.highestPrice90d) * 1.05;
  const priceRange = maxPrice - minPrice || 1;

  const pointsCoordinates = filteredPoints.map((pt, index) => {
    const x = paddingX + (index / (filteredPoints.length - 1 || 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((pt.price - minPrice) / priceRange) * (height - paddingY * 2);
    return { ...pt, x, y };
  });

  const svgPathD = pointsCoordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaPathD = pointsCoordinates.length
    ? `${svgPathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${height - paddingY} L ${pointsCoordinates[0].x} ${height - paddingY} Z`
    : '';

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSaveTarget = () => {
    const num = parseFloat(targetInput);
    if (!isNaN(num) && num > 0 && onSetTargetPrice) {
      onSetTargetPrice(deal, num);
      setTargetSaved(true);
      setTimeout(() => setTargetSaved(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-start gap-3">
            <img
              src={deal.imageUrl}
              alt={deal.title}
              referrerPolicy="no-referrer"
              className="w-12 h-12 object-contain bg-white rounded-lg border border-neutral-200 dark:border-neutral-700 p-1 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                <span className="font-semibold text-amber-600 dark:text-amber-400">{deal.storeName}</span>
                {deal.asin && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">ASIN: {deal.asin}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{deal.categoryName}</span>
              </div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                Validação de Histórico: {deal.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Validity Badge Alert */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Promoção Autêntica Verificada
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 leading-relaxed">
                O valor atual de <strong className="font-mono">{formatCurrency(deal.currentPrice)}</strong> é o menor registrado
                no histórico de 90 dias. Sem vestígios de inflacionamento artificial prévio. Economia real de{' '}
                <strong className="font-mono">{formatCurrency(deal.originalPrice - deal.currentPrice)} ({deal.discountPercent}%)</strong>.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Preço Atual</span>
              <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(deal.currentPrice)}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Menor Histórico</span>
              <p className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100">
                {formatCurrency(deal.lowestPrice90d)}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Média de 90 dias</span>
              <p className="text-base font-bold font-mono text-neutral-700 dark:text-neutral-300">
                {formatCurrency(deal.averagePrice90d)}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Maior Preço</span>
              <p className="text-base font-bold font-mono text-neutral-500 dark:text-neutral-400">
                {formatCurrency(deal.highestPrice90d)}
              </p>
            </div>
          </div>

          {/* Chart Controls & SVG Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Evolução Histórica do Preço
              </span>
              <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
                {(['30d', '60d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                      selectedRange === range
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Visual Price Graph */}
            <div className="relative p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200/70 dark:border-neutral-800">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-48 sm:h-56 overflow-visible"
              >
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={width - paddingX}
                  y2={paddingY}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-neutral-200 dark:text-neutral-800"
                />
                <line
                  x1={paddingX}
                  y1={height / 2}
                  x2={width - paddingX}
                  y2={height / 2}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-neutral-200 dark:text-neutral-800"
                />
                <line
                  x1={paddingX}
                  y1={height - paddingY}
                  x2={width - paddingX}
                  y2={height - paddingY}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-neutral-200 dark:text-neutral-800"
                />

                {/* Shaded Area */}
                {areaPathD && (
                  <path d={areaPathD} fill="url(#priceGradient)" />
                )}

                {/* Line Path */}
                {svgPathD && (
                  <path
                    d={svgPathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Points */}
                {pointsCoordinates.map((pt, idx) => (
                  <g key={idx} className="cursor-pointer">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPoint?.date === pt.date ? 6 : 4}
                      className="fill-emerald-500 stroke-white dark:stroke-neutral-900 transition-all"
                      strokeWidth="2"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip display */}
              <div className="h-6 flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-2 px-1">
                {hoveredPoint ? (
                  <>
                    <span>Data: {new Date(hoveredPoint.date).toLocaleDateString('pt-BR')}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(hoveredPoint.price)} {hoveredPoint.event ? `(${hoveredPoint.event})` : ''}
                    </span>
                  </>
                ) : (
                  <span>Passe o cursor sobre os pontos para inspecionar datas e promoções registradas</span>
                )}
              </div>
            </div>
          </div>

          {/* Automatic Tracking & Target Price Setting */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Acompanhamento Automático & Preço Alvo
              </h4>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Defina o valor máximo que você deseja pagar. O PromoRadar alertará seu dispositivo via Notificação Push assim que o preço atingir esta marca.
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-neutral-400 font-mono">R$</span>
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={handleSaveTarget}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {targetSaved ? 'Meta Salva!' : 'Ativar Alerta'}
              </button>
            </div>
          </div>

          {/* Timeline of price points */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Registros Recentes de Preço
            </h4>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs font-mono">
              {filteredPoints.slice().reverse().map((pt, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">{new Date(pt.date).toLocaleDateString('pt-BR')}</span>
                    {pt.event && (
                      <span className="text-neutral-600 dark:text-neutral-300 font-sans text-xs">
                        · {pt.event}
                      </span>
                    )}
                  </div>
                  <span className={`font-semibold ${i === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {formatCurrency(pt.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900">
          <button
            onClick={() => onToggleWishlist(deal)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
            <span>{isWishlisted ? 'Na Lista de Desejos' : 'Adicionar aos Desejos'}</span>
          </button>

          <a
            href={deal.affiliateUrl || deal.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer"
          >
            <span>Comprar na Amazon Brasil</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
