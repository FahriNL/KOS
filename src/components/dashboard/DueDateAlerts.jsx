import React from 'react';
import { useKos } from '../../context/KosContext';
import { getBillingStatus, formatRupiah, formatTanggalIndo } from '../../lib/formatters';
import { MessageCircle, CreditCard, Clock } from 'lucide-react';

export default function DueDateAlerts({ onOpenWhatsApp, onQuickPay }) {
  const { tenants, rooms } = useKos();

  const dueList = tenants
    .filter(t => t.status === 'active')
    .map(t => {
      const room = rooms.find(r => r.id === t.room_id);
      const billing = getBillingStatus(t.billing_day, t.entry_date);
      return {
        tenant: t,
        room,
        ...billing
      };
    })
    .filter(item => item.status === 'overdue' || item.status === 'due_soon')
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (dueList.length === 0) return null;

  return (
    <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
          Peringatan Tagihan ({dueList.length})
        </h3>
        <span className="text-[10px] text-amber-700 dark:text-amber-400">
          Jatuh tempo terdekat
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {dueList.map(({ tenant, room, status, label, dueDate }) => {
          const isOverdue = status === 'overdue';
          return (
            <div
              key={tenant.id}
              className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {tenant.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-medium">
                    Kamar {room?.room_number || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatRupiah(tenant.rent_amount)}
                  </span>
                  <span>•</span>
                  <span className={isOverdue ? 'text-rose-600 font-medium' : 'text-amber-600 font-medium'}>
                    {label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onOpenWhatsApp(tenant, room, dueDate)}
                  className="p-1.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 transition"
                  title="Kirim WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onQuickPay(tenant, room)}
                  className="p-1.5 text-xs rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 transition"
                  title="Catat Bayar"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
