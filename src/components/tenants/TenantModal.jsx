import React, { useState, useEffect } from 'react';
import { useKos } from '../../context/KosContext';
import { X, UserPlus, Phone, CreditCard, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '../../lib/formatters';

export default function TenantModal({ isOpen, onClose, tenantToEdit, defaultRoomId }) {
  const { rooms, addTenant, updateTenant, addTransaction } = useKos();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [roomId, setRoomId] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [billingDay, setBillingDay] = useState(new Date().getDate());
  const [rentPeriod, setRentPeriod] = useState('monthly');
  const [rentAmount, setRentAmount] = useState('');
  const [deposit, setDeposit] = useState('500000');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [recordInitialPayment, setRecordInitialPayment] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tenantToEdit) {
      setName(tenantToEdit.name || '');
      setPhone(tenantToEdit.phone || '');
      setIdCard(tenantToEdit.id_card || '');
      setRoomId(tenantToEdit.room_id || '');
      setEntryDate(tenantToEdit.entry_date || new Date().toISOString().split('T')[0]);
      setBillingDay(tenantToEdit.billing_day || 1);
      setRentPeriod(tenantToEdit.rent_period || 'monthly');
      setRentAmount(tenantToEdit.rent_amount || '');
      setDeposit(tenantToEdit.deposit || '0');
      setEmergencyContact(tenantToEdit.emergency_contact || '');
      setRecordInitialPayment(false);
    } else {
      setName('');
      setPhone('');
      setIdCard('');
      const initialRoom = defaultRoomId || rooms.find(r => r.status === 'available')?.id || '';
      setRoomId(initialRoom);
      
      const today = new Date();
      setEntryDate(today.toISOString().split('T')[0]);
      setBillingDay(today.getDate());
      setRentPeriod('monthly');
      
      const selectedRoom = rooms.find(r => r.id === initialRoom);
      setRentAmount(selectedRoom ? String(selectedRoom.price) : '1200000');
      setDeposit('500000');
      setEmergencyContact('');
      setRecordInitialPayment(true);
    }
  }, [tenantToEdit, defaultRoomId, isOpen, rooms]);

  // Update harga sewa saat ganti pilihan kamar
  const handleRoomChange = (newRoomId) => {
    setRoomId(newRoomId);
    const selectedRoom = rooms.find(r => r.id === newRoomId);
    if (selectedRoom) {
      setRentAmount(String(selectedRoom.price));
    }
  };

  // Update billing day saat entry date diubah
  const handleEntryDateChange = (dateVal) => {
    setEntryDate(dateVal);
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getDate())) {
        setBillingDay(d.getDate());
      }
    } catch (e) {}
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !roomId) {
      alert('Nama, Nomor WhatsApp, dan Kamar wajib diisi!');
      return;
    }

    setLoading(true);
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      id_card: idCard.trim(),
      room_id: roomId,
      entry_date: entryDate,
      billing_day: Number(billingDay) || 1,
      rent_period: rentPeriod,
      rent_amount: Number(rentAmount) || 0,
      deposit: Number(deposit) || 0,
      emergency_contact: emergencyContact.trim(),
    };

    if (tenantToEdit) {
      await updateTenant(tenantToEdit.id, payload);
    } else {
      const res = await addTenant(payload);
      
      // Catat transaksi pembayaran awal jika dicentang
      if (recordInitialPayment && res.data) {
        const selectedRoom = rooms.find(r => r.id === roomId);
        
        // 1. Pemasukan sewa bulan pertama
        if (Number(rentAmount) > 0) {
          await addTransaction({
            tenant_id: res.data.id,
            room_id: roomId,
            type: 'income',
            category: 'rent',
            amount: Number(rentAmount),
            transaction_date: entryDate,
            description: `Pembayaran Sewa Awal Kamar ${selectedRoom?.room_number || ''} - ${name}`,
          });
        }
        
        // 2. Pemasukan deposit (jika ada)
        if (Number(deposit) > 0) {
          await addTransaction({
            tenant_id: res.data.id,
            room_id: roomId,
            type: 'income',
            category: 'deposit',
            amount: Number(deposit),
            transaction_date: entryDate,
            description: `Deposit / Uang Jaminan Kamar ${selectedRoom?.room_number || ''} - ${name}`,
          });
        }
      }
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-elevated overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {tenantToEdit ? `Edit Data Penghuni: ${tenantToEdit.name}` : 'Check-in Penghuni Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan data sewa, tanggal jatuh tempo, dan kontak
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
          
          {/* Nama & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap Penghuni <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Dimas Arya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Pilih Kamar & No KTP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Kamar <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={roomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              >
                <option value="">-- Pilih Kamar --</option>
                {rooms.map(room => (
                  <option
                    key={room.id}
                    value={room.id}
                    disabled={room.status === 'occupied' && room.id !== tenantToEdit?.room_id}
                  >
                    Kamar {room.room_number} (Lt {room.floor} - {room.room_type}) - {formatRupiah(room.price)}
                    {room.status === 'occupied' && room.id !== tenantToEdit?.room_id ? ' [Terisi]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor KTP / NIK (Opsional)
              </label>
              <input
                type="text"
                placeholder="3201..."
                value={idCard}
                onChange={(e) => setIdCard(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tanggal Masuk & Siklus Tagihan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Masuk (Check-in)
              </label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => handleEntryDateChange(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tgl Jatuh Tempo Tiap Bulan
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Harga Sewa & Deposit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominal Sewa / Periode (Rp)
              </label>
              <input
                type="number"
                required
                min="0"
                step="50000"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Uang Jaminan / Deposit (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Kontak Darurat */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kontak Darurat (Keluarga / Kerabat)
            </label>
            <input
              type="text"
              placeholder="Contoh: 081345678901 (Ibu Kandung)"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Checkbox Otomatis Catat Kas Pembayaran Pertama */}
          {!tenantToEdit && (
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 cursor-pointer">
              <input
                type="checkbox"
                checked={recordInitialPayment}
                onChange={(e) => setRecordInitialPayment(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Catat otomatis pembayaran awal & deposit ke Kas
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Total kas masuk: {formatRupiah((Number(rentAmount) || 0) + (Number(deposit) || 0))}
                </span>
              </div>
            </label>
          )}

          {/* Buttons */}
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
              className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : (tenantToEdit ? 'Simpan Perubahan' : 'Check-in Sekarang')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
