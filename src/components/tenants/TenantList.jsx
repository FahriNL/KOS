import React, { useState, useMemo } from 'react';
import { useKos } from '../../context/KosContext';
import {
  formatRupiah,
  formatTanggalIndo,
  getBillingStatus
} from '../../lib/formatters';
import {
  Users,
  Search,
  Plus,
  Phone,
  Edit2,
  Trash2,
  Clock
} from 'lucide-react';

export default function TenantList({
  onAddTenant,
  onEditTenant,
  onOpenWhatsApp,
  onQuickPay,
  onCheckOut
}) {
  const { tenants, rooms, deleteTenant } = useKos();

  const [statusFilter, setStatusFilter] = useState('active');
  const [search, setSearch] = useState('');

  const filteredTenants = useMemo(() => {
    return tenants.filter(tenant => {
      if (statusFilter !== 'all' && tenant.status !== statusFilter) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const room = rooms.find(r => r.id === tenant.room_id);
        const matchName = tenant.name?.toLowerCase().includes(q);
        const matchPhone = tenant.phone?.includes(q);
        const matchIdCard = tenant.id_card?.includes(q);
        const matchRoom = room?.room_number?.toLowerCase().includes(q);
        return matchName || matchPhone || matchIdCard || matchRoom;
      }

      return true;
    });
  }, [tenants, rooms, statusFilter, search]);

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus data ${name}?`)) {
      deleteTenant(id);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {[
            { id: 'active', label: 'Aktif', count: tenants.filter(t => t.status === 'active').length },
            { id: 'inactive', label: 'Riwayat', count: tenants.filter(t => t.status === 'inactive').length },
            { id: 'all', label: 'Semua', count: tenants.length },
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

        <button
          onClick={onAddTenant}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Check-in Baru
        </button>
      </div>

      {/* List */}
      {filteredTenants.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
          <p className="text-xs text-slate-400">Tidak ada data penghuni yang sesuai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTenants.map((tenant) => {
            const room = rooms.find(r => r.id === tenant.room_id);
            const isActive = tenant.status === 'active';
            const billing = isActive ? getBillingStatus(tenant.billing_day, tenant.entry_date) : null;

            return (
              <div
                key={tenant.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Kamar {room?.room_number || '-'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (Tgl {tenant.billing_day})
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                        {tenant.name}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isActive ? 'Aktif' : 'Keluar'}
                    </span>
                  </div>

                  <div className="mt-3 text-xs space-y-1 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{tenant.phone}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-50 dark:border-slate-800/60">
                      <span>Sewa Bulanan:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatRupiah(tenant.rent_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status Tagihan:</span>
                      <span className={`font-medium ${
                        billing?.status === 'overdue' ? 'text-rose-600' :
                        billing?.status === 'due_soon' ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {billing?.label || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-2.5 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                  {isActive ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onOpenWhatsApp(tenant, room, billing?.dueDate)}
                        className="py-1 px-2.5 text-[11px] font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
                      >
                        WA
                      </button>
                      <button
                        onClick={() => onQuickPay(tenant, room)}
                        className="py-1 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition"
                      >
                        Bayar
                      </button>
                      <button
                        onClick={() => onCheckOut(tenant, room)}
                        className="py-1 px-2 text-[11px] text-slate-400 hover:text-rose-600 transition"
                      >
                        Keluar
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">Tidak aktif</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditTenant(tenant)}
                      className="p-1 text-slate-400 hover:text-slate-700 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tenant.id, tenant.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
