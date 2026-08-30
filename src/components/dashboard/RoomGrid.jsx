import React, { useState, useMemo } from 'react';
import { useKos } from '../../context/KosContext';
import RoomCard from '../rooms/RoomCard';
import { getBillingStatus } from '../../lib/formatters';
import { Plus, DoorClosed } from 'lucide-react';

export default function RoomGrid({
  onAddRoom,
  onEditRoom,
  onCheckIn,
  onCheckOut,
  onOpenWhatsApp,
  onQuickPay,
}) {
  const { rooms, tenants, searchQuery, setSearchQuery } = useKos();
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');

  const availableFloors = useMemo(() => {
    const floors = new Set(rooms.map(r => r.floor || 1));
    return Array.from(floors).sort((a, b) => a - b);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (floorFilter !== 'all' && (room.floor || 1) !== Number(floorFilter)) {
        return false;
      }

      const tenant = tenants.find(t => t.room_id === room.id && t.status === 'active');
      const billing = tenant ? getBillingStatus(tenant.billing_day, tenant.entry_date) : null;

      if (statusFilter === 'available' && room.status !== 'available') return false;
      if (statusFilter === 'occupied' && room.status !== 'occupied') return false;
      if (statusFilter === 'maintenance' && room.status !== 'maintenance') return false;
      if (statusFilter === 'due_soon') {
        if (!tenant || (billing?.status !== 'due_soon' && billing?.status !== 'overdue')) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchRoom = room.room_number?.toLowerCase().includes(query) ||
          room.room_type?.toLowerCase().includes(query);
        const matchTenant = tenant?.name?.toLowerCase().includes(query) ||
          tenant?.phone?.includes(query);
        return matchRoom || matchTenant;
      }

      return true;
    });
  }, [rooms, tenants, floorFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      
      {/* Clean Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Semua', count: rooms.length },
            { id: 'available', label: 'Kosong', count: rooms.filter(r => r.status === 'available').length },
            { id: 'occupied', label: 'Terisi', count: rooms.filter(r => r.status === 'occupied').length },
            {
              id: 'due_soon',
              label: 'Jatuh Tempo',
              count: tenants.filter(t => {
                if (t.status !== 'active') return false;
                const s = getBillingStatus(t.billing_day, t.entry_date);
                return s.status === 'overdue' || s.status === 'due_soon';
              }).length
            },
            { id: 'maintenance', label: 'Perbaikan', count: rooms.filter(r => r.status === 'maintenance').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] ${statusFilter === tab.id ? 'opacity-80' : 'text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Floor and Add Room */}
        <div className="flex items-center gap-2">
          {availableFloors.length > 1 && (
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Semua Lantai</option>
              {availableFloors.map(floor => (
                <option key={floor} value={floor}>Lt. {floor}</option>
              ))}
            </select>
          )}

          <button
            onClick={onAddRoom}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-750 hover:bg-slate-50 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Kamar Baru
          </button>
        </div>

      </div>

      {/* Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tidak ada kamar yang cocok dengan filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredRooms.map((room) => {
            const tenant = tenants.find(t => t.room_id === room.id && t.status === 'active');
            return (
              <RoomCard
                key={room.id}
                room={room}
                tenant={tenant}
                onEditRoom={onEditRoom}
                onCheckIn={onCheckIn}
                onCheckOut={onCheckOut}
                onOpenWhatsApp={onOpenWhatsApp}
                onQuickPay={onQuickPay}
              />
            );
          })}
        </div>
      )}

    </div>
  );
}
