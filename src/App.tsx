import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Deal,
  Coupon,
  WishlistItem,
  UserSavingsMetrics,
  NotificationSettings,
  InAppNotification,
  CategoryId,
} from './types';
import {
  INITIAL_DEALS,
  INITIAL_COUPONS,
  CATEGORY_NAMES,
} from './data/mockDeals';
import {
  getStoredWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistTargetPrice,
} from './services/wishlistService';
import {
  getStoredSavingsMetrics,
  getStoredClaimsLog,
  recordDealSavings,
  recordCouponSavings,
  ClaimRecord,
} from './services/analyticsService';
import {
  getStoredNotificationSettings,
  saveStoredNotificationSettings,
  getStoredNotifications,
  saveStoredNotifications,
  sendPushAlert,
} from './services/notificationService';
import {
  getStoredAffiliateConfig,
  DEFAULT_AFFILIATE_TAG,
} from './services/amazonAffiliateService';

import { Navbar } from './components/Navbar';
import { DealCard } from './components/DealCard';
import { PriceHistoryModal } from './components/PriceHistoryModal';
import { WishlistView } from './components/WishlistView';
import { AnalyticsView } from './components/AnalyticsView';
import { CouponsView } from './components/CouponsView';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { LiveDropToast } from './components/LiveDropToast';
import { ShareAffiliateModal } from './components/ShareAffiliateModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { onServiceWorkerNotificationClick } from './services/serviceWorkerManager';

import {
  Search,
  Flame,
  Truck,
  Sparkles,
  Tag,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('promoradar_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('promoradar_dark_mode', darkMode.toString());
    } catch {
      // ignore
    }
  }, [darkMode]);

  // Affiliate Tag state
  const [associateTag, setAssociateTag] = useState<string>(
    () => getStoredAffiliateConfig().associateTag || DEFAULT_AFFILIATE_TAG
  );

  // Tab navigation
  const [currentTab, setCurrentTab] = useState<'deals' | 'coupons' | 'wishlist' | 'analytics'>('deals');

  // Main data states (strictly Amazon Brasil)
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(getStoredWishlist);
  const [savingsMetrics, setSavingsMetrics] = useState<UserSavingsMetrics>(getStoredSavingsMetrics);
  const [claimsLog, setClaimsLog] = useState<ClaimRecord[]>(getStoredClaimsLog);
  const [notifications, setNotifications] = useState<InAppNotification[]>(getStoredNotifications);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    getStoredNotificationSettings
  );

  // Modals & Drawers
  const [selectedDealForHistory, setSelectedDealForHistory] = useState<Deal | null>(null);
  const [selectedDealForShare, setSelectedDealForShare] = useState<Deal | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [liveToastDeal, setLiveToastDeal] = useState<Deal | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyPrime, setOnlyPrime] = useState(false);
  const [onlyLowestEver, setOnlyLowestEver] = useState(false);
  const [onlyWithCoupons, setOnlyWithCoupons] = useState(false);
  const [sortBy, setSortBy] = useState<'discount' | 'price_asc' | 'price_desc' | 'popular'>('discount');

  // Periodic automatic price monitor & live drop simulation for real-time deal alerts
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate real-time price monitoring
      const randomIndex = Math.floor(Math.random() * INITIAL_DEALS.length);
      const targetDeal = INITIAL_DEALS[randomIndex];
      const dropAmount = Math.round(targetDeal.currentPrice * 0.05);
      const newPrice = Math.max(15, targetDeal.currentPrice - dropAmount);

      setDeals((prev) =>
        prev.map((d) =>
          d.id === targetDeal.id
            ? {
                ...d,
                currentPrice: newPrice,
                discountPercent: Math.round(((d.originalPrice - newPrice) / d.originalPrice) * 100),
                verifiedAt: 'agora',
                dealVerdict: 'historico_minimo',
                isLowestEver: true,
              }
            : d
        )
      );

      // Check against wishlist
      const updatedWishlist = getStoredWishlist();
      const matchedWishlistItem = updatedWishlist.find((w) => w.dealId === targetDeal.id);

      if (matchedWishlistItem && newPrice <= matchedWishlistItem.targetPrice) {
        sendPushAlert(
          `Alerta de Preço: Meta Atingida!`,
          `${targetDeal.title.substring(0, 35)}... caiu para R$ ${newPrice.toLocaleString('pt-BR')} (Abaixo do seu alvo)!`,
          {
            dealId: targetDeal.id,
            url: targetDeal.affiliateUrl || targetDeal.productUrl,
            price: newPrice,
            originalPrice: targetDeal.originalPrice,
          }
        );
      } else {
        sendPushAlert(
          `Oferta Relâmpago Detectada!`,
          `${targetDeal.title.substring(0, 40)}... caiu para R$ ${newPrice.toLocaleString('pt-BR')} (-${Math.round(((targetDeal.originalPrice - newPrice) / targetDeal.originalPrice) * 100)}% OFF).`,
          {
            dealId: targetDeal.id,
            url: targetDeal.affiliateUrl || targetDeal.productUrl,
            price: newPrice,
            originalPrice: targetDeal.originalPrice,
          }
        );
      }

      setNotifications(getStoredNotifications());
      setLiveToastDeal({
        ...targetDeal,
        currentPrice: newPrice,
        discountPercent: Math.round(((targetDeal.originalPrice - newPrice) / targetDeal.originalPrice) * 100),
      });
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  // Handle native OS notification clicks received via Service Worker postMessage
  useEffect(() => {
    const unsubscribe = onServiceWorkerNotificationClick(({ dealId }) => {
      if (dealId) {
        const target = deals.find((d) => d.id === dealId) || INITIAL_DEALS.find((d) => d.id === dealId);
        if (target) {
          setSelectedDealForHistory(target);
          setCurrentTab('deals');
        }
      }
    });
    return unsubscribe;
  }, [deals]);

  // Wishlist actions
  const handleToggleWishlist = (deal: Deal) => {
    const exists = wishlist.some((item) => item.dealId === deal.id);
    if (exists) {
      const updated = removeFromWishlist(deal.id);
      setWishlist(updated);
    } else {
      const updated = addToWishlist(deal);
      setWishlist(updated);
      sendPushAlert(
        'Item Adicionado aos Favoritos',
        `Acompanhamento automático ativado para "${deal.title.substring(0, 35)}...". Você receberá alertas a cada queda de preço.`,
        { dealId: deal.id }
      );
      setNotifications(getStoredNotifications());
    }
  };

  const handleSetTargetPrice = (deal: Deal, targetPrice: number) => {
    const exists = wishlist.some((item) => item.dealId === deal.id);
    let current = wishlist;
    if (!exists) {
      current = addToWishlist(deal, targetPrice);
    } else {
      const item = wishlist.find((i) => i.dealId === deal.id);
      if (item) {
        current = updateWishlistTargetPrice(item.id, targetPrice);
      }
    }
    setWishlist(current);
  };

  const handleSimulateWishlistDrop = (item: WishlistItem) => {
    const targetPrice = Math.max(10, Math.round(item.targetPrice * 0.95));
    sendPushAlert(
      `Alerta de Preço-Alvo Atingido!`,
      `"${item.title.substring(0, 35)}..." atingiu R$ ${targetPrice.toLocaleString('pt-BR')} na Amazon Brasil!`,
      { dealId: item.dealId }
    );
    setNotifications(getStoredNotifications());

    const updated = wishlist.map((w) =>
      w.id === item.id ? { ...w, currentPrice: targetPrice } : w
    );
    setWishlist(updated);
  };

  // Claim actions
  const handleClaimDeal = (deal: Deal) => {
    const result = recordDealSavings(deal);
    setSavingsMetrics(result.metrics);
    setClaimsLog(result.log);
  };

  const handleAffiliateClick = (deal: Deal) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === deal.id ? { ...d, affiliateClicks: d.affiliateClicks + 1 } : d))
    );
  };

  const handleUseCoupon = (coupon: Coupon) => {
    const result = recordCouponSavings(coupon);
    setSavingsMetrics(result.metrics);
    setClaimsLog(result.log);
  };

  // Notifications handlers
  const handleClearAllNotifications = () => {
    saveStoredNotifications([]);
    setNotifications([]);
  };

  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveStoredNotifications(updated);
    setNotifications(updated);
  };

  const handleSelectDealFromNotif = (dealId: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (deal) {
      setSelectedDealForHistory(deal);
    }
  };

  // Filtered deals memo
  const filteredDeals = useMemo(() => {
    return deals
      .filter((deal) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = deal.title.toLowerCase().includes(query);
          const matchesAsin = deal.asin?.toLowerCase().includes(query);
          const matchesCoupon = deal.couponCode?.toLowerCase().includes(query);
          if (!matchesTitle && !matchesAsin && !matchesCoupon) return false;
        }

        if (selectedCategory !== 'all' && deal.category !== selectedCategory) {
          return false;
        }

        if (onlyPrime && !deal.isPrime) {
          return false;
        }

        if (onlyLowestEver && !deal.isLowestEver) {
          return false;
        }

        if (onlyWithCoupons && !deal.couponCode) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
        if (sortBy === 'price_asc') return a.currentPrice - b.currentPrice;
        if (sortBy === 'price_desc') return b.currentPrice - a.currentPrice;
        if (sortBy === 'popular') return b.likesCount - a.likesCount;
        return 0;
      });
  }, [deals, searchQuery, selectedCategory, onlyPrime, onlyLowestEver, onlyWithCoupons, sortBy]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-amber-400 selection:text-neutral-950 transition-colors duration-150">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        wishlistCount={wishlist.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenNotificationSettings={() => setIsSettingsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentTab === 'deals' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <section className="p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Monitoramento em Tempo Real
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Preços Oficiais Verificados</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-500">Menores Históricos de 90 dias</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 text-balance leading-tight mb-3">
                  Radar de Ofertas & Cupons Amazon Brasil
                </h1>

                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                  Curadoria automatizada das maiores quedas de preço e cupons reais da Amazon Brasil. Verificamos o histórico de 90 dias de cada produto para garantir economia genuína sem maquiagem de preços.
                </p>

                {/* Instant Search Bar */}
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar por produto, marca ou cupom..."
                    className="w-full pl-10 pr-24 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-neutral-900 transition-all"
                  />
                  <div className="absolute right-3 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Filter Controls Row */}
            <section className="space-y-4">
              {/* Category Segmented Controls */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                      : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/80 dark:border-neutral-800'
                  }`}
                >
                  Todos os Departamentos
                </button>
                {(Object.keys(CATEGORY_NAMES) as CategoryId[]).map((catId) => (
                  <button
                    key={catId}
                    onClick={() => setSelectedCategory(catId)}
                    className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      selectedCategory === catId
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                        : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/80 dark:border-neutral-800'
                    }`}
                  >
                    {CATEGORY_NAMES[catId]}
                  </button>
                ))}
              </div>

              {/* Secondary Filters Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setOnlyPrime((prev) => !prev)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      onlyPrime
                        ? 'bg-sky-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Amazon Prime</span>
                  </button>

                  <button
                    onClick={() => setOnlyLowestEver((prev) => !prev)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      onlyLowestEver
                        ? 'bg-amber-500 text-neutral-950 font-semibold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Menor Preço 90 dias</span>
                  </button>

                  <button
                    onClick={() => setOnlyWithCoupons((prev) => !prev)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      onlyWithCoupons
                        ? 'bg-amber-500 text-neutral-950 font-semibold'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Com Cupom Amazon</span>
                  </button>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Ordenar por:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-medium"
                  >
                    <option value="discount">Maior Desconto (%)</option>
                    <option value="price_asc">Menor Preço (R$)</option>
                    <option value="price_desc">Maior Preço (R$)</option>
                    <option value="popular">Mais Populares</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Results Counter & Deals Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>
                  Exibindo <strong className="text-neutral-900 dark:text-neutral-100 font-mono">{filteredDeals.length}</strong> ofertas verificadas na Amazon Brasil
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Atualizado em tempo real
                </span>
              </div>

              {filteredDeals.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    Nenhuma oferta encontrada com os filtros selecionados
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    Experimente limpar a pesquisa ou selecionar outro departamento.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setOnlyPrime(false);
                      setOnlyLowestEver(false);
                      setOnlyWithCoupons(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg cursor-pointer"
                  >
                    Restaurar Filtros Padrão
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredDeals.map((deal) => {
                    const isWishlisted = wishlist.some((item) => item.dealId === deal.id);
                    return (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        isWishlisted={isWishlisted}
                        onToggleWishlist={handleToggleWishlist}
                        onOpenPriceHistory={(d) => setSelectedDealForHistory(d)}
                        onOpenShareAffiliate={(d) => setSelectedDealForShare(d)}
                        onClaimDeal={handleClaimDeal}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {currentTab === 'coupons' && (
          <CouponsView
            coupons={coupons}
            onUseCoupon={handleUseCoupon}
          />
        )}

        {currentTab === 'wishlist' && (
          <WishlistView
            wishlist={wishlist}
            onRemoveItem={(id) => {
              const updated = removeFromWishlist(id);
              setWishlist(updated);
            }}
            onUpdateTargetPrice={(id, target) => {
              const updated = updateWishlistTargetPrice(id, target);
              setWishlist(updated);
            }}
            onSimulatePriceDrop={handleSimulateWishlistDrop}
            onOpenPriceHistory={(dealId) => {
              const deal = deals.find((d) => d.id === dealId);
              if (deal) setSelectedDealForHistory(deal);
            }}
            onExploreDeals={() => setCurrentTab('deals')}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            metrics={savingsMetrics}
            claimsLog={claimsLog}
            onExploreDeals={() => setCurrentTab('deals')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">PromoRadar</span>
            <span aria-hidden="true">·</span>
            <span>Radar Inteligente de Ofertas & Cupons Amazon Brasil</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Histórico Verificado</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('deals')}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
            >
              Melhores Ofertas
            </button>
            <button
              onClick={() => setCurrentTab('coupons')}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
            >
              Cupons
            </button>
            <button
              onClick={() => setCurrentTab('wishlist')}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
            >
              Lista de Desejos
            </button>
            <button
              onClick={() => setCurrentTab('analytics')}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
            >
              Painel de Economia
            </button>
          </div>
        </div>
      </footer>

      {/* Price History & Validation Modal */}
      {selectedDealForHistory && (
        <PriceHistoryModal
          deal={selectedDealForHistory}
          onClose={() => setSelectedDealForHistory(null)}
          isWishlisted={wishlist.some((item) => item.dealId === selectedDealForHistory.id)}
          onToggleWishlist={handleToggleWishlist}
          onSetTargetPrice={handleSetTargetPrice}
        />
      )}

      {/* Share Deal Modal (WhatsApp / Telegram / Link) */}
      {selectedDealForShare && (
        <ShareAffiliateModal
          deal={selectedDealForShare}
          onClose={() => setSelectedDealForShare(null)}
          onAffiliateClick={handleAffiliateClick}
        />
      )}

      {/* Notification Preferences Modal */}
      {isSettingsOpen && (
        <NotificationSettingsModal
          settings={notificationSettings}
          onSaveSettings={(newSettings) => {
            setNotificationSettings(newSettings);
            saveStoredNotificationSettings(newSettings);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        notifications={notifications}
        onClose={() => setIsNotificationsOpen(false)}
        onClearAll={handleClearAllNotifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onSelectDeal={handleSelectDealFromNotif}
      />

      {/* Real-time floating price drop toast */}
      <LiveDropToast
        deal={liveToastDeal}
        onClose={() => setLiveToastDeal(null)}
        onViewDeal={(d) => setSelectedDealForHistory(d)}
      />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
