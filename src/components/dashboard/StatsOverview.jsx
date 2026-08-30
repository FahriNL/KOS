import React from 'react';
import { useKos } from '../../context/KosContext';
import { formatRupiah, getBillingStatus } from '../../lib/formatters';
import {
  DoorClosed,
  AlertCircle,
  TrendingUp,
  Wallet
} from 'lucide-react';

export default function StatsOverview({ onFilterDueSoon }) {
  const { rooms, tenants, transactions } = useKos();

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;

  const dueTenants = tenants.filter(t => {
    if (t.status !== 'active') return false;
    const status = getBillingStatus(t.billing_day, t.entry_date);
    return status.status === 'due_soon' || status.status === 'overdue';
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthIncome = transactions
    .filter(t => {
      const d = new Date(t.transaction_date);
      return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const thisMonthExpense = transactions
    .filter(t => {
      const d = new Date(t.transaction_date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      
      {/* 1. Kamar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Kamar</span>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {occupiedRooms}
          </span>
          <span className="text-xs text-slate-400">
            / {totalRooms} terisi
          </span>
        </div>
        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          {availableRooms} kamar siap huni
        </p>
      </div>

      {/* 2. Tagihan Perlu Perhatian */}
      <div
        onClick={onFilterDueSoon}
        className={`p-4 rounded-2xl border transition shadow-sm ${
          dueTenants.length > 0
            ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        }`}
      >
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Jatuh Tempo</span>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className={`text-xl sm:text-2xl font-bold ${
            dueTenants.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
          }`}>
            {dueTenants.length}
          </span>
          <span className="text-xs text-slate-400">penghuni</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          {dueTenants.length > 0 ? 'Perlu kirim pengingat' : 'Semua aman terkendali'}
        </p>
      </div>

      {/* 3. Pemasukan Kas */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pemasukan Bulan Ini</span>
        <div className="mt-1.5 text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
          {formatRupiah(thisMonthIncome)}
        </div>
        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          Kas sewa masuk
        </p>
      </div>

      {/* 4. Laba Bersih */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Laba Bersih</span>
        <div className="mt-1.5 text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
          {formatRupiah(thisMonthIncome - thisMonthExpense)}
        </div>
        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          Biaya: {formatRupiah(thisMonthExpense)}
        </p>
      </div>

    </div>
  );
}
