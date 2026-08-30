import React, { useState, useMemo } from 'react';
import { useKos } from '../../context/KosContext';
import { formatRupiah, formatTanggalIndo } from '../../lib/formatters';
import {
  Plus,
  Calendar,
  Trash2
} from 'lucide-react';

const CATEGORY_NAMES = {
  rent: 'Sewa Kamar',
  deposit: 'Deposit',
  electricity: 'Listrik PLN',
  water: 'Air PDAM',
  internet: 'WiFi',
  trash: 'Kebersihan',
  maintenance: 'Perbaikan',
  supplies: 'Perlengkapan',
  laundry: 'Laundry',
  parking: 'Parkir',
  other: 'Lain-lain'
};

export default function FinanceReport({ onOpenAddTransaction }) {
  const { transactions, rooms, tenants, deleteTransaction } = useKos();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (selectedMonth !== 'all') {
        const tMonth = t.transaction_date.substring(0, 7);
        if (tMonth !== selectedMonth) return false;
      }
      if (filterType !== 'all' && t.type !== filterType) {
        return false;
      }
      return true;
    }).sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }, [transactions, selectedMonth, filterType]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (selectedMonth !== 'all') {
        const tMonth = t.transaction_date.substring(0, 7);
        if (tMonth !== selectedMonth) return;
      }

      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
      } else {
        expense += amt;
      }
    });

    return {
      income,
      expense,
      net: income - expense,
    };
  }, [transactions, selectedMonth]);

  const handleDelete = (id) => {
    if (window.confirm('Hapus transaksi ini?')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          />
          {selectedMonth !== 'all' && (
            <button
              onClick={() => setSelectedMonth('all')}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              Semua Waktu
            </button>
          )}
        </div>

        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Catat Kas
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400">Total Pemasukan</span>
          <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(summary.income)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400">Total Pengeluaran</span>
          <div className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatRupiah(summary.expense)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-400">Laba Bersih</span>
          <div className={`mt-1 text-xl font-bold ${
            summary.net >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'
          }`}>
            {formatRupiah(summary.net)}
          </div>
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            Riwayat Kas ({filteredTransactions.length})
          </h3>

          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'income', label: 'Masuk' },
              { id: 'expense', label: 'Keluar' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition ${
                  filterType === tab.id
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada transaksi di periode ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {filteredTransactions.map(tx => {
              const isIncome = tx.type === 'income';
              const room = rooms.find(r => r.id === tx.room_id);
              const tenant = tenants.find(t => t.id === tx.tenant_id);

              return (
                <div
                  key={tx.id}
                  className="p-3.5 sm:px-4 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {tx.description || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {CATEGORY_NAMES[tx.category] || tx.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatTanggalIndo(tx.transaction_date)}
                      {room && ` • Kamar ${room.room_number}`}
                      {tenant && ` • ${tenant.name}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-bold ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-300'
                    }`}>
                      {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-slate-300 hover:text-rose-600 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
