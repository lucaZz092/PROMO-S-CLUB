import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Volume2,
  Sliders,
  CheckCircle2,
  Cpu,
  Radio,
  Clock,
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { NotificationSettings, CategoryId } from '../types';
import {
  requestBrowserPushPermission,
  sendPushAlert,
  playChimeSound,
} from '../services/notificationService';
import {
  getServiceWorkerStatus,
  subscribeToWebPush,
  scheduleMinimizedTabTest,
  ServiceWorkerStatus
} from '../services/serviceWorkerManager';
import { CATEGORY_NAMES } from '../data/mockDeals';

interface NotificationSettingsModalProps {
  settings: NotificationSettings;
  onSaveSettings: (settings: NotificationSettings) => void;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus | null>(null);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [testSent, setTestSent] = useState(false);
  const [minimizedCountdown, setMinimizedCountdown] = useState<number | null>(null);
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);

  // Load live Service Worker & Web Push status on mount
  useEffect(() => {
    getServiceWorkerStatus().then((status) => {
      setSwStatus(status);
      setBrowserPermission(status.permission);
    });
  }, []);

  const handleRequestPermission = async () => {
    const perm = await requestBrowserPushPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      setLocalSettings((prev) => ({ ...prev, browserPushEnabled: true }));
      const updatedStatus = await getServiceWorkerStatus();
      setSwStatus(updatedStatus);
    }
  };

  const handleEnableWebPush = async () => {
    setIsSubscribingPush(true);
    try {
      await subscribeToWebPush();
      const updatedStatus = await getServiceWorkerStatus();
      setSwStatus(updatedStatus);
      setLocalSettings((prev) => ({ ...prev, browserPushEnabled: true }));
    } catch (err) {
      console.error('Web push subscription failed:', err);
    } finally {
      setIsSubscribingPush(false);
    }
  };

  const handleToggleCategory = (catId: CategoryId) => {
    setLocalSettings((prev) => {
      const exists = prev.trackedCategories.includes(catId);
      const updated = exists
        ? prev.trackedCategories.filter((c) => c !== catId)
        : [...prev.trackedCategories, catId];
      return { ...prev, trackedCategories: updated };
    });
  };

  // Immediate Service Worker Notification test
  const handleSendTestPush = () => {
    sendPushAlert(
      'PromoRadar Amazon: Queda Histórica de Preço!',
      'Echo Pop com Alexa caiu para R$ 199 na Amazon Brasil (-43% OFF). Menor valor já registrado!',
      { dealId: 'deal-echo-pop' }
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3500);
  };

  // Scheduled Minimized Tab Notification test
  const handleStartMinimizedTabTest = async () => {
    setMinimizedCountdown(4);

    // Schedule the notification in the Service Worker thread to fire in 4 seconds
    await scheduleMinimizedTabTest(4, 'Samsung Galaxy S24 Ultra 5G Titânio', 4499.0, 38);

    const interval = setInterval(() => {
      setMinimizedCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      setMinimizedCountdown(null);
    }, 5500);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Service Worker & Alertas de Queda de Preço
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Notificações nativas do sistema operacional mesmo com a aba minimizada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Architecture Status Panel */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Status da Arquitetura Service Worker
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {swStatus?.active ? 'Ativo & Registrado (/sw.js)' : 'Conectando'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 mb-1">
                  <Radio className="w-3.5 h-3.5 text-amber-500" />
                  <span>Web Push API</span>
                </div>
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-[11px]">
                  {swStatus?.pushSubscribed ? (
                    <span className="text-emerald-600 dark:text-emerald-400">PushManager Conectado</span>
                  ) : (
                    <span>Disponível</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 mb-1">
                  <Laptop className="w-3.5 h-3.5 text-blue-500" />
                  <span>Notificações do SO</span>
                </div>
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-[11px]">
                  {browserPermission === 'granted' ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Permitido (Nativas)</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">Requer Autorização</span>
                  )}
                </div>
              </div>
            </div>

            {/* Permission or Subscription CTA */}
            {browserPermission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="w-full py-2 px-3 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Autorizar Notificações Nativas no Navegador
              </button>
            ) : !swStatus?.pushSubscribed ? (
              <button
                onClick={handleEnableWebPush}
                disabled={isSubscribingPush}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSubscribingPush ? 'Inscrevendo no PushManager...' : 'Ativar Inscrição Web Push API'}</span>
              </button>
            ) : (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                ✓ Notificações do sistema operacional ativadas via Service Worker. Os alertas aparecerão na central do Windows / macOS / Android mesmo se a janela estiver minimizada.
              </p>
            )}
          </div>

          {/* Tab-Minimized Testing Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Demonstração de Alerta em Segundo Plano (Aba Minimizada)
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Clique no botão abaixo, <strong>minimize esta janela ou mude de aba</strong> durante a contagem de 4 segundos e veja a notificação nativa do seu sistema operacional saltar na tela com a oferta Amazon.
            </p>

            <button
              onClick={handleStartMinimizedTabTest}
              disabled={minimizedCountdown !== null}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                minimizedCountdown !== null
                  ? 'bg-amber-500 text-neutral-950 animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-500 text-neutral-950'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {minimizedCountdown !== null
                  ? minimizedCountdown > 0
                    ? `MINIMIZE A JANELA AGORA! (${minimizedCountdown}s)`
                    : 'Disparando notificação nativa no SO...'
                  : 'Testar com Aba Minimizada (4 Segundos para Minimizar)'}
              </span>
            </button>
          </div>

          {/* Sound Alert Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Alerta Sonoro Suave (Chime)
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Tocar som ao detectar menor histórico ou queda na lista de desejos
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const nextVal = !localSettings.soundEnabled;
                setLocalSettings((prev) => ({ ...prev, soundEnabled: nextVal }));
                if (nextVal) playChimeSound();
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                localSettings.soundEnabled ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  localSettings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Minimum Discount Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Gatilho Mínimo de Desconto:
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                Pelo menos {localSettings.minDiscountThreshold}% OFF
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={localSettings.minDiscountThreshold}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  minDiscountThreshold: parseInt(e.target.value, 10),
                }))
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>10% (Qualquer oferta)</span>
              <span>25% (Recomendado)</span>
              <span>60% (Super promoções)</span>
            </div>
          </div>

          {/* Tracked Categories */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block">
              Departamentos da Amazon Monitorados
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CATEGORY_NAMES) as CategoryId[]).map((catId) => {
                const isChecked = localSettings.trackedCategories.includes(catId);
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => handleToggleCategory(catId)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border text-left cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        isChecked
                          ? 'bg-amber-500 border-amber-500 text-neutral-950'
                          : 'border-neutral-300 dark:border-neutral-700'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{CATEGORY_NAMES[catId]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Immediate Push Button */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={handleSendTestPush}
              type="button"
              className="w-full py-2.5 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {testSent ? '✓ Alerta Nativo Disparado via Service Worker!' : 'Disparar Notificação Imediata no SO'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 bg-neutral-50/50 dark:bg-neutral-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
