import React from 'react';
import { X, Bell, Trash2, CheckCheck, ExternalLink, ArrowRight } from 'lucide-react';
import { InAppNotification } from '../types';

interface NotificationsDrawerProps {
  notifications: InAppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onMarkAllAsRead: () => void;
  onSelectDeal?: (dealId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onClearAll,
  onMarkAllAsRead,
  onSelectDeal,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-neutral-950/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Notificações do Radar
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="px-5 py-2.5 bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <button
              onClick={onMarkAllAsRead}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar como lidas</span>
            </button>
            <button
              onClick={onClearAll}
              className="text-neutral-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar tudo</span>
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <Bell className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs font-medium">Nenhum alerta recente</p>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
                Assim que uma loja cadastrada registrar uma queda de preço ou atingir sua meta da lista de desejos, o alerta aparecerá aqui.
              </span>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.dealId && onSelectDeal) {
                    onSelectDeal(notif.dealId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                  notif.read
                    ? 'bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-200/50 dark:border-neutral-800/50'
                    : 'bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 shadow-xs'
                } hover:border-neutral-300 dark:hover:border-neutral-600`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {notif.title}
                  </span>
                  <span className="text-neutral-400 font-mono text-[11px]">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {notif.message}
                </p>
                {notif.dealId && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Ver detalhes da oferta</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
