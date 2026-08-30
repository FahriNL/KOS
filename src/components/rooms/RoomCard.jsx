import React from 'react';
import { useKos } from '../../context/KosContext';
import { formatRupiah, getBillingStatus } from '../../lib/formatters';
import {
  User,
  Edit2,
  Trash2,
  Plus,
  MessageCircle,
  CreditCard,
  LogOut,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export default function RoomCard({
  room,
  tenant,
  onEditRoom,
  onCheckIn,
  onCheckOut,
  onOpenWhatsApp,
  onQuickPay,
}) {
  const { deleteRoom, updateRoom } = useKos();

  const isOccupied = room.status === 'occupied' && tenant;
  const isAvailable = room.status === 'available';
  const isMaintenance = room.status === 'maintenance';

  const billing = isOccupied ? getBillingStatus(tenant.billing_day, tenant.entry_date) : null;

  const handleDelete = () => {
    if (window.confirm(`Hapus Kamar ${room.room_number}?`)) {
      deleteRoom(room.id);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
      
      {/* Top Info */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center font-bold text-sm text-slate-900 dark:text-white">
              {room.room_number}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                {room.room_type || 'Standard'}
              </div>
              <div className="text-[11px] text-slate-400">
                Lt. {room.floor || 1} • {formatRupiah(room.price)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isOccupied ? (
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                billing?.status === 'overdue' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' :
                billing?.status === 'due_soon' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  billing?.status === 'overdue' ? 'bg-rose-500' :
                  billing?.status === 'due_soon' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                {billing?.status === 'overdue' ? 'Menunggak' : billing?.status === 'due_soon' ? 'Jatuh Tempo' : 'Terisi'}
              </span>
            ) : isAvailable ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Kosong
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Perbaikan
              </span>
            )}

            <button
              onClick={() => onEditRoom(room)}
              className="p-1 text-slate-300 hover:text-slate-600 dark:hover:text-slate-300 transition"
              title="Edit Kamar"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Middle Content */}
        <div className="mt-3 pt-2.5 border-t border-slate-50 dark:border-slate-800/60">
          {isOccupied ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white truncate">
                  {tenant.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  Tgl {tenant.billing_day}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {billing?.label}
              </div>
            </div>
          ) : isAvailable ? (
            <div className="text-[11px] text-slate-400">
              {room.facilities?.slice(0, 3).join(', ') || 'Kamar siap huni'}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> {room.notes || 'Sedang dalam perbaikan'}
            </div>
          )}
        </div>
      </div>

      {/* Clean Bottom Action Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-50 dark:border-slate-800/60">
        {isOccupied ? (
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex gap-1 flex-1">
              <button
                onClick={() => onOpenWhatsApp(tenant, room, billing?.dueDate)}
                className="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition text-center"
              >
                WhatsApp
              </button>
              <button
                onClick={() => onQuickPay(tenant, room)}
                className="flex-1 py-1 px-2 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition text-center"
              >
                Bayar
              </button>
            </div>
            <button
              onClick={() => onCheckOut(tenant, room)}
              className="py-1 px-2 text-[11px] text-slate-400 hover:text-rose-600 transition"
              title="Check-out"
            >
              Keluar
            </button>
          </div>
        ) : isAvailable ? (
          <button
            onClick={() => onCheckIn(room)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Check-in
          </button>
        ) : (
          <button
            onClick={() => updateRoom(room.id, { status: 'available' })}
            className="w-full py-1.5 px-3 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
          >
            Selesai Perbaikan
          </button>
        )}
      </div>

    </div>
  );
}
