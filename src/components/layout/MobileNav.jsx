import React from 'react';
import { useKos } from '../../context/KosContext';
import {
  LayoutDashboard,
  DoorClosed,
  Users,
  Wallet,
  Settings,
  Plus
} from 'lucide-react';

export default function MobileNav({ onOpenQuickAction }) {
  const { activeTab, setActiveTab } = useKos();

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'rooms', label: 'Kamar', icon: DoorClosed },
    { id: 'quick', label: 'Tambah', icon: Plus, isAction: true },
    { id: 'tenants', label: 'Penghuni', icon: Users },
    { id: 'finance', label: 'Kas', icon: Wallet },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-850 px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onOpenQuickAction}
                className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shadow-md active:scale-95 transition"
                title="Check-in Baru"
              >
                <Plus className="w-5 h-5" />
              </button>
            );
          }

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? 'text-slate-950 dark:text-white font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
