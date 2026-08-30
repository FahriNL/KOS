import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useKos } from '../../context/KosContext';
import {
  Building2,
  Cloud,
  CloudOff,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Search,
  Bell
} from 'lucide-react';
import { getBillingStatus } from '../../lib/formatters';

export default function Navbar({ onOpenAuth }) {
  const { user, isDemoMode, signOut } = useAuth();
  const { profile, activeTab, setActiveTab, searchQuery, setSearchQuery, tenants } = useKos();
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('kos_theme') === 'dark' ||
      (!('kos_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kos_theme', 'light');
    }
  }, [darkMode]);

  const urgentCount = tenants.filter(t => {
    if (t.status !== 'active') return false;
    const status = getBillingStatus(t.billing_day, t.entry_date);
    return status.status === 'overdue' || status.status === 'due_soon';
  }).length;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-850 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Kos Title (Minimal & Clean) */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-none">
                  {profile?.kost_name || 'KosManager'}
                </h1>
                {isDemoMode ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <CloudOff className="w-2.5 h-2.5" /> Demo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Cloud className="w-2.5 h-2.5" /> Cloud
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Clean Search Input (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kamar / nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            
            {urgentCount > 0 && (
              <button
                onClick={() => setActiveTab('dashboard')}
                title={`${urgentCount} tagihan perlu perhatian`}
                className="relative p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
            )}

            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              title="Ganti Tema"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth */}
            {user && !isDemoMode ? (
              <button
                onClick={signOut}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isDemoMode ? 'Sync Cloud' : 'Masuk'}</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
