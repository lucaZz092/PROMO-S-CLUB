import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, ExternalLink } from 'lucide-react';
import { Deal } from '../types';
import {
  generateAffiliateShareText,
  buildAmazonAffiliateUrl,
} from '../services/amazonAffiliateService';

interface ShareAffiliateModalProps {
  deal: Deal;
  onClose: () => void;
  onAffiliateClick: (deal: Deal) => void;
}

export const ShareAffiliateModal: React.FC<ShareAffiliateModalProps> = ({
  deal,
  onClose,
  onAffiliateClick,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Still passes user's associate tag invisibly in the URL behind the scenes
  const shareText = generateAffiliateShareText(deal);
  const dealUrl = deal.affiliateUrl || buildAmazonAffiliateUrl(deal.asin || deal.productUrl, undefined, deal.title);

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    onAffiliateClick(deal);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dealUrl);
    setCopiedLink(true);
    onAffiliateClick(deal);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    onAffiliateClick(deal);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    onAffiliateClick(deal);
    const url = `https://t.me/share/url?url=${encodeURIComponent(dealUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <img
              src={deal.imageUrl}
              alt={deal.title}
              referrerPolicy="no-referrer"
              className="w-11 h-11 object-contain bg-white rounded-lg border border-neutral-200 dark:border-neutral-700 p-1 shrink-0"
              onError={(e) => {
                if (deal.asin && !deal.imageUrl.includes(deal.asin)) {
                  (e.currentTarget as HTMLImageElement).src = `https://images-na.ssl-images-amazon.com/images/P/${deal.asin}.01.LZZZZZZZ.jpg`;
                }
              }}
            />
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Compartilhar Oferta
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Compartilhe o melhor preço com seus amigos
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Share Buttons */}
          <div>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">
              Compartilhar no WhatsApp ou Telegram:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar no WhatsApp</span>
              </button>

              <button
                onClick={handleShareTelegram}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar no Telegram</span>
              </button>
            </div>
          </div>

          {/* Deal Link Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Link Direto da Oferta
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <input
                type="text"
                readOnly
                value={dealUrl}
                className="flex-1 bg-transparent text-xs font-mono text-neutral-700 dark:text-neutral-300 select-all focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-md hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Texto Formatado
              </span>
            </div>
            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-sans whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 max-h-44 overflow-y-auto leading-relaxed">
                {shareText}
              </pre>
              <button
                onClick={handleCopyText}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 shadow-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copiado!' : 'Copiar Mensagem'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900">
          <a
            href={dealUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onAffiliateClick(deal)}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
          >
            <span>Abrir página na Amazon</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
