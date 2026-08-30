import React, { useState, useEffect } from 'react';
import { useKos } from '../../context/KosContext';
import { formatRupiah } from '../../lib/formatters';
import { X, Wallet, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  { id: 'electricity', label: 'Token Listrik / PLN' },
  { id: 'water', label: 'Air PDAM / Sumur' },
  { id: 'internet', label: 'WiFi / Internet' },
  { id: 'trash', label: 'Kebersihan & Sampah' },
  { id: 'maintenance', label: 'Perbaikan / Tukang' },
  { id: 'supplies', label: 'Perlengkapan Kos (Sabun/Sapu)' },
  { id: 'other', label: 'Pengeluaran Lainnya' },
];

const INCOME_CATEGORIES = [
  { id: 'rent', label: 'Sewa Kamar' },
  { id: 'deposit', label: 'Uang Jaminan / Deposit' },
  { id: 'laundry', label: 'Jasa Cuci / Laundry' },
  { id: 'parking', label: 'Parkir Tambahan' },
  { id: 'other', label: 'Pemasukan Lainnya' },
];

export default function TransactionModal({ isOpen, onClose, defaultType = 'income', prefillData }) {
  const { rooms, tenants, addTransaction } = useKos();

  const [type, setType] = useState(defaultType); // 'income' | 'expense'
  const [category, setCategory] = useState(defaultType === 'income' ? 'rent' : 'electricity');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [roomId, setRoomId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (prefillData) {
        setType('income');
        setCategory('rent');
        setAmount(String(prefillData.amount || prefillData.tenant?.rent_amount || ''));
        setRoomId(prefillData.room?.id || prefillData.tenant?.room_id || '');
        setTenantId(prefillData.tenant?.id || '');
        setDescription(`Pembayaran Sewa Kamar ${prefillData.room?.room_number || ''} - ${prefillData.tenant?.name || ''}`);
        setTransactionDate(new Date().toISOString().split('T')[0]);
      } else {
        setType(defaultType);
        setCategory(defaultType === 'income' ? 'rent' : 'electricity');
        setAmount('');
        setRoomId('');
        setTenantId('');
        setDescription('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, defaultType, prefillData]);

  // Saat tipe berubah, ganti kategori default
  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'income' ? 'rent' : 'electricity');
  };

  // Saat pilih tenant, auto-isi kamar
  const handleTenantChange = (tId) => {
    setTenantId(tId);
    const tenant = tenants.find(t => t.id === tId);
    if (tenant) {
      setRoomId(tenant.room_id || '');
      if (!amount) setAmount(String(tenant.rent_amount));
      const room = rooms.find(r => r.id === tenant.room_id);
      if (!description) {
        setDescription(`Pembayaran Sewa Kamar ${room?.room_number || ''} - ${tenant.name}`);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Nominal transaksi harus lebih dari Rp 0!');
      return;
    }

    setLoading(true);
    await addTransaction({
      type,
      category,
      amount: Number(amount),
      transaction_date: transactionDate,
      room_id: roomId || null,
      tenant_id: tenantId || null,
      description: description.trim() || (type === 'income' ? 'Pemasukan Kas' : 'Pengeluaran Kas'),
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-elevated overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              type === 'income'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Catat Transaksi Kas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan uang masuk dan biaya operasional kos
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Toggle Type: Pemasukan / Pengeluaran */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Pemasukan (Kas Masuk)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" /> Pengeluaran (Biaya)
            </button>
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nominal Transaksi (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1000"
              step="1000"
              placeholder="Contoh: 1500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
            {amount && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                Terbaca: {formatRupiah(amount)}
              </span>
            )}
          </div>

          {/* Kategori & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {type === 'income'
                  ? INCOME_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)
                  : EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)
                }
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Terkait Penghuni (Opsional / untuk Pemasukan Sewa) */}
          {type === 'income' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penyewa / Kamar Terkait (Opsional)
              </label>
              <select
                value={tenantId}
                onChange={(e) => handleTenantChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">-- Tidak Terkait Penghuni Khusus --</option>
                {tenants.filter(t => t.status === 'active').map(t => {
                  const r = rooms.find(rm => rm.id === t.room_id);
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} (Kamar {r?.room_number || '-'})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Keterangan
            </label>
            <textarea
              rows="2"
              placeholder="Contoh: Sewa Kamar 101 Agustus 2026 atau Token Listrik 200rb"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl text-white shadow-md transition disabled:opacity-50 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
