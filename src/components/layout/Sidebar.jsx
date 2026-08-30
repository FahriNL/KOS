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

export default function Sidebar({ onOpenAddRoom, onOpenAddTenant, onOpenAddTransaction }) {
  const { activeTab, setActiveTab, rooms, tenants } = useKos();

  const totalOccupied = rooms.filter(r => r.status === 'occupied').length;
  const activeTenantsCount = tenants.filter(t => t.status === 'active').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: 'Kamar', icon: DoorClosed, count: rooms.length },
    { id: 'tenants', label: 'Penghuni', icon: Users, count: activeTenantsCount },
    { id: 'finance', label: 'Keuangan', icon: Wallet },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-56 pr-6 py-6 justify-between min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        
        {/* Quick Check-in Button */}
        <button
          onClick={onOpenAddTenant}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Check-in Baru
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-950 dark:text-white font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Mini Progress Card */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px]">
        <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
          <span>Kamar Terisi</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {totalOccupied}/{rooms.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-300"
            style={{ width: `${rooms.length > 0 ? (totalOccupied / rooms.length) * 100 : 0}%` }}
          />
        </div>
      </div>

    </aside>
  );
}
