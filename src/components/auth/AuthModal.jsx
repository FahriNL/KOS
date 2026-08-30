import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useKos } from '../../context/KosContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  X,
  Lock,
  Mail,
  User,
  Building2,
  ShieldCheck,
  Sparkles,
  CloudOff
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onOpenSettings }) {
  const { signIn, signUp, toggleDemoMode, isDemoMode, authError } = useAuth();
  const { refreshData } = useKos();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localMsg, setLocalMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalMsg('');

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (!error) {
        refreshData();
        onClose();
      }
    } else {
      const { data, error } = await signUp(email, password, fullName);
      if (!error) {
        if (data?.session) {
          refreshData();
          onClose();
        } else {
          setLocalMsg('Pendaftaran berhasil! Cek email Anda untuk konfirmasi atau langsung masuk.');
        }
      }
    }

    setLoading(false);
  };

  const handleContinueDemo = () => {
    toggleDemoMode(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-elevated overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {mode === 'login' ? 'Masuk ke KosManager' : 'Daftar Akun Pengelola'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Akses tersinkronisasi aman dari Smartphone & Laptop
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

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* Warning jika belum set Supabase */}
          {!isSupabaseConfigured() && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold mb-0.5">ℹ️ Belum Terhubung ke Supabase Cloud</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Saat ini Anda berada dalam <strong>Mode Demo</strong>. Untuk mengaktifkan login sungguhan & sinkronisasi multi-device, isi kunci Supabase di menu Pengaturan.
              </p>
            </div>
          )}

          {(authError || localMsg) && (
            <div className={`p-3 rounded-xl text-xs ${
              authError
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40'
            }`}>
              {authError || localMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap / Pemilik Kos
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Bpk. Hendra"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="pemilik@kosku.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : (mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun Baru')}
            </button>

          </form>

          {/* Toggle Login / Sign Up */}
          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' ? (
              <span>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Daftar di sini
                </button>
              </span>
            ) : (
              <span>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Masuk di sini
                </button>
              </span>
            )}
          </div>

          {/* Demo Mode Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleContinueDemo}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <CloudOff className="w-3.5 h-3.5 text-slate-400" />
              Lanjutkan dalam Mode Demo / Offline
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
