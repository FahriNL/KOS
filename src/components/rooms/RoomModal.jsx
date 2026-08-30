import React, { useState, useEffect } from 'react';
import { useKos } from '../../context/KosContext';
import { X, DoorClosed, Check, Sparkles } from 'lucide-react';

const COMMON_FACILITIES = [
  'AC',
  'Kipas Angin',
  'Kamar Mandi Dalam',
  'Kamar Mandi Luar',
  'Kasur Springbed',
  'Kasur Busa',
  'Lemari Pakaian',
  'Meja Belajar',
  'Kursi',
  'WiFi',
  'Water Heater',
  'Smart TV',
  'Balkon',
  'Jendela Luar',
];

export default function RoomModal({ isOpen, onClose, roomToEdit }) {
  const { addRoom, updateRoom } = useKos();

  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [roomType, setRoomType] = useState('Standard');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('available');
  const [facilities, setFacilities] = useState(['Kasur Busa', 'Lemari Pakaian', 'Kamar Mandi Dalam']);
  const [customFacility, setCustomFacility] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roomToEdit) {
      setRoomNumber(roomToEdit.room_number || '');
      setFloor(roomToEdit.floor || 1);
      setRoomType(roomToEdit.room_type || 'Standard');
      setPrice(roomToEdit.price || '');
      setStatus(roomToEdit.status || 'available');
      setFacilities(roomToEdit.facilities || []);
      setNotes(roomToEdit.notes || '');
    } else {
      setRoomNumber('');
      setFloor(1);
      setRoomType('Standard');
      setPrice('1200000');
      setStatus('available');
      setFacilities(['AC', 'Kasur Springbed', 'Lemari Pakaian', 'Kamar Mandi Dalam']);
      setNotes('');
    }
  }, [roomToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleFacility = (facility) => {
    if (facilities.includes(facility)) {
      setFacilities(facilities.filter(f => f !== facility));
    } else {
      setFacilities([...facilities, facility]);
    }
  };

  const handleAddCustomFacility = (e) => {
    e.preventDefault();
    if (customFacility.trim() && !facilities.includes(customFacility.trim())) {
      setFacilities([...facilities, customFacility.trim()]);
      setCustomFacility('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      alert('Nomor kamar wajib diisi!');
      return;
    }

    setLoading(true);
    const payload = {
      room_number: roomNumber.trim(),
      floor: Number(floor),
      room_type: roomType,
      price: Number(price),
      status,
      facilities,
      notes,
    };

    if (roomToEdit) {
      await updateRoom(roomToEdit.id, payload);
    } else {
      await addRoom(payload);
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
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DoorClosed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {roomToEdit ? `Edit Kamar ${roomToEdit.room_number}` : 'Tambah Kamar Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur informasi kamar, fasilitas, dan harga sewa
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
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Kamar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 101, A2"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lantai
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Kamar
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="VIP">VIP</option>
                <option value="Khusus">Khusus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Harga Sewa / Bulan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="50000"
                placeholder="1500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status Awal Kamar
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'available', label: '🟢 Kosong' },
                { id: 'occupied', label: '🔵 Terisi' },
                { id: 'maintenance', label: '⚪ Perbaikan' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    status === s.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fasilitas Kamar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Fasilitas Kamar
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_FACILITIES.map((facility) => {
                const isSelected = facilities.includes(facility);
                return (
                  <button
                    type="button"
                    key={facility}
                    onClick={() => toggleFacility(facility)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-medium shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {facility}
                  </button>
                );
              })}
            </div>

            {/* Tambah Fasilitas Kustom */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="+ Tambah fasilitas lainnya..."
                value={customFacility}
                onChange={(e) => setCustomFacility(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomFacility}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Catatan Khusus */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Kamar (Opsional)
            </label>
            <textarea
              rows="2"
              placeholder="Contoh: Dekat tangga, meteran listrik terpisah..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Submit Buttons */}
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
              className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : (roomToEdit ? 'Simpan Perubahan' : 'Tambah Kamar')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
