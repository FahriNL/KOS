import React, { useState, useEffect } from 'react';
import { useKos } from '../../context/KosContext';
import { formatRupiah, formatTanggalIndo, normalizePhoneNumber } from '../../lib/formatters';
import { X, MessageCircle, Copy, ExternalLink, Check, Sparkles } from 'lucide-react';

export default function WhatsAppModal({ isOpen, onClose, data }) {
  const { profile } = useKos();
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data?.tenant && isOpen) {
      const template = profile?.wa_template || 
        'Halo kak {nama}, mengingatkan untuk sewa kos kamar {kamar} sebesar {nominal} yang jatuh tempo pada {jatuh_tempo}. Mohon konfirmasinya jika sudah transfer ke {rekening}. Terima kasih banyak! 🙏';
      
      const filled = template
        .replace(/{nama}/g, data.tenant.name || '')
        .replace(/{kamar}/g, data.room?.room_number || '-')
        .replace(/{nominal}/g, formatRupiah(data.tenant.rent_amount || 0))
        .replace(/{jatuh_tempo}/g, data.dueDate ? formatTanggalIndo(data.dueDate) : `tgl ${data.tenant.billing_day}`)
        .replace(/{rekening}/g, profile?.payment_info || 'rekening pengelola');
      
      setCustomMessage(filled);
      setCopied(false);
    }
  }, [data, profile, isOpen]);

  if (!isOpen || !data?.tenant) return null;

  const phoneClean = normalizePhoneNumber(data.tenant.phone);
  const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(customMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-elevated overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Kirim Pengingat WhatsApp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pesan otomatis ke {data.tenant.name} ({data.tenant.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
            <div className="flex items-center justify-between font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
              <span>Kamar {data.room?.room_number || '-'}</span>
              <span>{formatRupiah(data.tenant.rent_amount)}</span>
            </div>
            <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
              Jatuh Tempo: {data.dueDate ? formatTanggalIndo(data.dueDate) : `Tiap tgl ${data.tenant.billing_day}`}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Isi Pesan WhatsApp:
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin!' : 'Salin Teks'}
              </button>
            </div>
            <textarea
              rows="5"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
            >
              <MessageCircle className="w-4 h-4" /> Buka WhatsApp Sekarang
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
