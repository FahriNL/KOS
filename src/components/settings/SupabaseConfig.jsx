import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useKos } from '../../context/KosContext';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  isSupabaseConfigured
} from '../../lib/supabase';
import {
  Cloud,
  Key,
  Globe,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Database,
  Lock
} from 'lucide-react';

const SQL_SCHEMA_SNIPPET = `-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
create extension if not exists "uuid-ossp";

-- 1. Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  kost_name text default 'Kos Saya',
  owner_name text default 'Pengelola',
  phone text default '',
  payment_info text default 'BCA 1234567890',
  wa_template text default 'Halo kak {nama}, tagihan sewa kamar {kamar} sebesar {nominal} jatuh tempo pada {jatuh_tempo}.',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Rooms
create table if not exists public.rooms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  room_number text not null,
  floor integer default 1,
  room_type text default 'Standard',
  price numeric not null default 0,
  status text default 'available',
  facilities text[] default '{}',
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tenants
create table if not exists public.tenants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  room_id uuid references public.rooms(id) on delete set null,
  name text not null,
  phone text not null,
  id_card text default '',
  entry_date date not null default current_date,
  billing_day integer not null default 1,
  rent_period text default 'monthly',
  rent_amount numeric not null default 0,
  deposit numeric default 0,
  emergency_contact text default '',
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Transactions
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  type text not null,
  category text not null,
  amount numeric not null default 0,
  transaction_date date not null default current_date,
  description text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.tenants enable row level security;
alter table public.transactions enable row level security;

create policy "Users manage own profiles" on public.profiles for all using (auth.uid() = id);
create policy "Users manage own rooms" on public.rooms for all using (auth.uid() = user_id);
create policy "Users manage own tenants" on public.tenants for all using (auth.uid() = user_id);
create policy "Users manage own transactions" on public.transactions for all using (auth.uid() = user_id);
`;

export default function SupabaseConfig() {
  const { isDemoMode, toggleDemoMode } = useAuth();
  const { refreshData } = useKos();

  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url || '');
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      alert('Mohon isi Supabase Project URL dan Anon Key.');
      return;
    }

    saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
    toggleDemoMode(false);
    refreshData();
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Putuskan koneksi Supabase dan kembali ke Demo Mode?')) {
      saveSupabaseConfig('', '');
      setSupabaseUrl('');
      setSupabaseKey('');
      toggleDemoMode(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Status Koneksi */}
      <div className={`p-5 rounded-2xl border ${
        !isDemoMode && isSupabaseConfigured()
          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
          : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              !isDemoMode && isSupabaseConfigured()
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
            }`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Status Cloud: {!isDemoMode && isSupabaseConfigured() ? 'Terhubung ke Supabase' : 'Mode Offline / Demo'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {!isDemoMode && isSupabaseConfigured()
                  ? 'Data Anda tersinkronisasi aman di cloud dan dapat dibuka dari Laptop & HP.'
                  : 'Data tersimpan lokal di browser ini. Hubungkan ke Supabase gratis untuk sinkronisasi multi-device.'}
              </p>
            </div>
          </div>

          {!isDemoMode && isSupabaseConfigured() && (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              Putuskan Koneksi
            </button>
          )}
        </div>
      </div>

      {/* Form Konfigurasi Kunci Supabase */}
      <form onSubmit={handleSaveConfig} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-5 sm:p-6 space-y-4">
        
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" /> Kunci Kredensial Supabase Anda
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dapatkan Project URL & Anon Key gratis dari dashboard Supabase Anda
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Supabase Project URL
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="url"
              required
              placeholder="https://xyzabcdefghijklm.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Supabase Project API Key (Anon / Public)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
            <span>{saveSuccess ? 'Tersimpan & Terhubung!' : 'Simpan & Hubungkan Cloud'}</span>
          </button>
        </div>

      </form>

      {/* Panduan Singkat 3 Langkah */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft p-5 sm:p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Panduan Setup Database Supabase Gratis (3 Menit)
            </h3>
          </div>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Buka Supabase.com <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
              1
            </span>
            <div>
              <strong className="text-slate-900 dark:text-white">Buat Proyek Gratis di Supabase:</strong>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                Daftar akun di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">supabase.com</a>, lalu klik <em>New Project</em> (misal: "Kos Saya").
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
              2
            </span>
            <div className="flex-1">
              <strong className="text-slate-900 dark:text-white">Jalankan Skrip Tabel & Keamanan (RLS):</strong>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                Buka menu <strong>SQL Editor</strong> di Supabase dashboard, buat query baru, lalu salin dan tempelkan skrip di bawah ini:
              </p>
              
              <div className="mt-2 relative">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="absolute right-2 top-2 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                >
                  {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedSql ? 'Tersalin!' : 'Salin Skrip SQL'}
                </button>
                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-40">
                  {SQL_SCHEMA_SNIPPET}
                </pre>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
              3
            </span>
            <div>
              <strong className="text-slate-900 dark:text-white">Salin URL & API Key:</strong>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                Buka menu <strong>Project Settings → API</strong> di Supabase. Salin <code>Project URL</code> dan <code>anon public key</code> ke formulir di atas. Selesai!
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
