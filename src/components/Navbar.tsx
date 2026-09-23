import React from 'react';
import { Bell, Moon, Sun, Heart, BarChart3, Tag, Sliders } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentTab: 'deals' | 'coupons' | 'wishlist' | 'analytics';
  onSelectTab: (tab: 'deals' | 'coupons' | 'wishlist' | 'analytics') => void;
  wishlistCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNotifications: () => void;
  onOpenNotificationSettings: () => void;
  unreadNotificationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  wishlistCount,
  darkMode,
  onToggleDarkMode,
  onOpenNotifications,
  onOpenNotificationSettings,
  unreadNotificationsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('deals')}
            className="text-left font-bold tracking-tight text-xl text-neutral-900 dark:text-neutral-50 hover:opacity-85 transition-opacity flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black text-sm shadow-xs">
              PR
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span>PromoRadar</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold">
                  Ofertas Verificadas
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => onSelectTab('deals')}
            className={`transition-colors cursor-pointer py-1 ${
              currentTab === 'deals'
                ? 'text-neutral-950 dark:text-white font-semibold border-b-2 border-amber-500'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Melhores Ofertas
          </button>

          <button
            onClick={() => onSelectTab('coupons')}
            className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              currentTab === 'coupons'
                ? 'text-neutral-950 dark:text-white font-semibold border-b-2 border-amber-500'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Cupons Testados</span>
          </button>

          <button
            onClick={() => onSelectTab('wishlist')}
            className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              currentTab === 'wishlist'
                ? 'text-neutral-950 dark:text-white font-semibold border-b-2 border-amber-500'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Lista de Desejos</span>
            {wishlistCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono font-medium">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              currentTab === 'analytics'
                ? 'text-neutral-950 dark:text-white font-semibold border-b-2 border-amber-500'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Painel de Economia</span>
          </button>
        </nav>

        {/* Zone 3: User interactive controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Alert Configuration Button */}
          <button
            onClick={onOpenNotificationSettings}
            title="Configurar Alertas de Preço Personalizados"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Configurar alertas de preço"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Notifications Inbox Button */}
          <button
            onClick={onOpenNotifications}
            title="Alertas de Quedas de Preço"
            className="relative p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-neutral-900" />
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Alternar tema"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex md:hidden border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto px-4 py-2 gap-4 text-xs font-medium no-scrollbar">
        <button
          onClick={() => onSelectTab('deals')}
          className={`whitespace-nowrap ${currentTab === 'deals' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          Ofertas
        </button>
        <button
          onClick={() => onSelectTab('coupons')}
          className={`whitespace-nowrap ${currentTab === 'coupons' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          Cupons
        </button>
        <button
          onClick={() => onSelectTab('wishlist')}
          className={`whitespace-nowrap flex items-center gap-1 ${currentTab === 'wishlist' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          <span>Desejos</span>
          {wishlistCount > 0 && <span className="font-mono">({wishlistCount})</span>}
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`whitespace-nowrap ${currentTab === 'analytics' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          Economia
        </button>
      </div>
    </header>
  );
};
