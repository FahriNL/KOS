import { format, parseISO, isBefore, addDays, startOfDay } from 'date-fns';
import { id } from 'date-fns/locale';

// Format angka ke format Rupiah (contoh: Rp 1.500.000)
export function formatRupiah(number) {
  if (number === undefined || number === null || isNaN(number)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

// Format tanggal ke Bahasa Indonesia (contoh: 25 Agustus 2026)
export function formatTanggalIndo(dateString, pattern = 'd MMMM yyyy') {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, pattern, { locale: id });
  } catch (err) {
    return dateString;
  }
}

// Hitung tanggal jatuh tempo berikutnya berdasarkan billing_day dan tanggal masuk
export function getNextDueDate(billingDay, entryDateStr) {
  const today = startOfDay(new Date());
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Tanggal jatuh tempo bulan ini
  let dueDate = new Date(currentYear, currentMonth, Math.min(billingDay || 1, 28));
  
  // Jika hari ini sudah lewat dari tanggal jatuh tempo bulan ini, maka jatuh tempo adalah bulan berikutnya
  if (isBefore(dueDate, today)) {
    dueDate = new Date(currentYear, currentMonth + 1, Math.min(billingDay || 1, 28));
  }
  
  return dueDate;
}

// Menghitung status tagihan (overdue, due_soon, ok)
export function getBillingStatus(billingDay, entryDateStr) {
  const today = startOfDay(new Date());
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const thisMonthDue = new Date(currentYear, currentMonth, Math.min(billingDay || 1, 28));
  const diffTime = thisMonthDue.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      status: 'overdue',
      label: `Lewat ${Math.abs(diffDays)} hari`,
      color: 'rose',
      daysLeft: diffDays,
      dueDate: thisMonthDue
    };
  } else if (diffDays <= 7) {
    return {
      status: 'due_soon',
      label: diffDays === 0 ? 'Jatuh tempo hari ini' : `${diffDays} hari lagi`,
      color: 'amber',
      daysLeft: diffDays,
      dueDate: thisMonthDue
    };
  } else {
    return {
      status: 'ok',
      label: `${diffDays} hari lagi`,
      color: 'emerald',
      daysLeft: diffDays,
      dueDate: thisMonthDue
    };
  }
}

// Bersihkan nomor HP dan sesuaikan format internasional (0812... -> 62812...)
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = '62' + cleaned.substring(3);
  }
  return cleaned;
}

// Generate URL WhatsApp dengan template pesan terisi
export function generateWhatsAppUrl(phone, template, data) {
  const cleanPhone = normalizePhoneNumber(phone);
  if (!cleanPhone) return '#';
  
  let message = template || 'Halo kak {nama}, mengingatkan untuk pembayaran sewa kamar {kamar} sebesar {nominal} yang jatuh tempo pada {jatuh_tempo}. Pembayaran bisa ditransfer ke {rekening}. Terima kasih!';
  
  message = message
    .replace(/{nama}/g, data.nama || '')
    .replace(/{kamar}/g, data.kamar || '')
    .replace(/{nominal}/g, formatRupiah(data.nominal || 0))
    .replace(/{jatuh_tempo}/g, data.jatuh_tempo || '')
    .replace(/{rekening}/g, data.rekening || 'rekening pengelola');
    
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
