import React, { useState } from 'react';
import { useKos } from '../../context/KosContext';
import {
  Building,
  User,
  Phone,
  CreditCard,
  MessageSquare,
  Save,
  RotateCcw,
  Sparkles,
  Check
} from 'lucide-react';

export default function KosSettings() {
  const { profile, updateProfile, resetToDemoData } = useKos();

  const [kostName, setKostName] = useState(profile?.kost_name || '');
  const [ownerName, setOwnerName] = useState(profile?.owner_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [paymentInfo, setPaymentInfo] = useState(profile?.payment_info || '');
  const [waTemplate, setWaTemplate] = useState(profile?.wa_template || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({
      kost_name: kostName.trim(),
      owner_name: ownerName.trim(),
      phone: phone.trim(),
      payment_info: paymentInfo.trim(),
      wa_template: waTemplate.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const insertTag = (tag) => {
    setWaTemplate((prev) => `${prev} ${tag}`);
  };

  const handleReset = () => {
    if (window.confirm('Reset semua data kamar, penghuni, dan transaksi ke data demo awal? Semua perubahan lokal akan dikembalikan.')) {
      resetToDemoData();
      alert('Data berhasil di-reset ke data demo!');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Form Pengaturan Kos */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-5 sm:p-6 space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Profil & Informasi Kos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Informasi ini akan ditampilkan di header dan disisipkan pada template WhatsApp tagihan
            </p>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Profil'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Rumah Kos
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Contoh: Kost Melati Residence"
                value={kostName}
                onChange={(e) => setKostName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Pemilik / Pengelola
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Contoh: Bpk. Hendra"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor WhatsApp Pengelola
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Rekening / Pembayaran Sewa
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Contoh: BCA 8830129841 a/n Hendra Pratama"
                value={paymentInfo}
                onChange={(e) => setPaymentInfo(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Template WhatsApp */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Template Pesan Pengingat WhatsApp
            </label>
            <span className="text-[11px] text-slate-400">Klik tag untuk menyisipkan otomatis:</span>
          </div>

          {/* Quick Insert Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[
              { tag: '{nama}', label: '+ Nama Penghuni' },
              { tag: '{kamar}', label: '+ No Kamar' },
              { tag: '{nominal}', label: '+ Nominal Sewa' },
              { tag: '{jatuh_tempo}', label: '+ Tgl Jatuh Tempo' },
              { tag: '{rekening}', label: '+ Info Rekening' },
            ].map(item => (
              <button
                type="button"
                key={item.tag}
                onClick={() => insertTag(item.tag)}
                className="px-2 py-1 text-[11px] font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 transition"
              >
                {item.label}
              </button>
            ))}
          </div>

          <textarea
            rows="4"
            value={waTemplate}
            onChange={(e) => setWaTemplate(e.target.value)}
            className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

      </form>

      {/* Reset Demo Data Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-slate-400" /> Reset ke Data Contoh Awal
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kembalikan daftar kamar, penghuni, dan kas ke 8 kamar contoh default.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
        >
          Reset Data Demo
        </button>
      </div>

    </div>
  );
}
