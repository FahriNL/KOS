export const initialProfile = {
  kost_name: "Kost Melati Residence",
  owner_name: "Bpk. Hendra",
  phone: "081234567890",
  payment_info: "BCA 8830129841 a/n Hendra Pratama",
  wa_template: "Halo kak {nama}, mengingatkan untuk sewa kos kamar {kamar} sebesar {nominal} yang jatuh tempo pada {jatuh_tempo}. Mohon konfirmasinya jika sudah transfer ke {rekening}. Terima kasih banyak! 🙏",
};

export const initialRooms = [
  {
    id: "room-101",
    room_number: "101",
    floor: 1,
    room_type: "Deluxe",
    price: 1500000,
    status: "occupied",
    facilities: ["AC", "Kamar Mandi Dalam", "Kasur Springbed", "Lemari 2 Pintu", "WiFi 50Mbps"],
    notes: "Dekat pintu gerbang utama"
  },
  {
    id: "room-102",
    room_number: "102",
    floor: 1,
    room_type: "Standard",
    price: 1100000,
    status: "occupied",
    facilities: ["Kipas Angin", "Kamar Mandi Dalam", "Kasur Busa", "Lemari"],
    notes: ""
  },
  {
    id: "room-103",
    room_number: "103",
    floor: 1,
    room_type: "Standard",
    price: 1100000,
    status: "available",
    facilities: ["Kipas Angin", "Kamar Mandi Dalam", "Kasur Busa", "Lemari"],
    notes: "Sudah dibersihkan, siap huni"
  },
  {
    id: "room-104",
    room_number: "104",
    floor: 1,
    room_type: "VIP",
    price: 1850000,
    status: "occupied",
    facilities: ["AC", "Water Heater", "Smart TV", "Kamar Mandi Dalam", "Kasur King Size", "Balkon"],
    notes: "Parkir mobil included"
  },
  {
    id: "room-201",
    room_number: "201",
    floor: 2,
    room_type: "Deluxe",
    price: 1500000,
    status: "occupied",
    facilities: ["AC", "Kamar Mandi Dalam", "Kasur Springbed", "Lemari", "Meja Belajar"],
    notes: "Lantai 2 view taman"
  },
  {
    id: "room-202",
    room_number: "202",
    floor: 2,
    room_type: "Deluxe",
    price: 1500000,
    status: "available",
    facilities: ["AC", "Kamar Mandi Dalam", "Kasur Springbed", "Lemari", "Meja Belajar"],
    notes: "Baru dicat ulang"
  },
  {
    id: "room-203",
    room_number: "203",
    floor: 2,
    room_type: "Standard",
    price: 1050000,
    status: "maintenance",
    facilities: ["Kipas Angin", "Kamar Mandi Luar", "Kasur Single"],
    notes: "Perbaikan kran air & lampu plafon"
  },
  {
    id: "room-204",
    room_number: "204",
    floor: 2,
    room_type: "VIP",
    price: 1850000,
    status: "occupied",
    facilities: ["AC", "Water Heater", "Smart TV", "Kamar Mandi Dalam", "Kasur King Size", "Balkon"],
    notes: ""
  }
];

export const initialTenants = [
  {
    id: "tenant-1",
    room_id: "room-101",
    name: "Dimas Arya Pratama",
    phone: "081298765432",
    id_card: "3201123456780001",
    entry_date: "2026-01-05",
    billing_day: 5,
    rent_period: "monthly",
    rent_amount: 1500000,
    deposit: 500000,
    emergency_contact: "081345678901 (Ibu)",
    status: "active"
  },
  {
    id: "tenant-2",
    room_id: "room-102",
    name: "Siti Rahmawati",
    phone: "085712348899",
    id_card: "3201123456780002",
    entry_date: "2026-02-01",
    billing_day: 1, // Lewat jatuh tempo jika hari ini > tgl 1
    rent_period: "monthly",
    rent_amount: 1100000,
    deposit: 500000,
    emergency_contact: "085812345678 (Kakak)",
    status: "active"
  },
  {
    id: "tenant-3",
    room_id: "room-104",
    name: "Kevin Sanjaya",
    phone: "082199887766",
    id_card: "3201123456780003",
    entry_date: "2026-03-02",
    billing_day: 2, // Jatuh tempo dekat
    rent_period: "monthly",
    rent_amount: 1850000,
    deposit: 1000000,
    emergency_contact: "082144556677 (Teman)",
    status: "active"
  },
  {
    id: "tenant-4",
    room_id: "room-201",
    name: "Anisa Fitriani",
    phone: "087811223344",
    id_card: "3201123456780004",
    entry_date: "2026-02-15",
    billing_day: 15,
    rent_period: "monthly",
    rent_amount: 1500000,
    deposit: 500000,
    emergency_contact: "087855443322 (Ayah)",
    status: "active"
  },
  {
    id: "tenant-5",
    room_id: "room-204",
    name: "Rizky Ramadhan",
    phone: "081988776655",
    id_card: "3201123456780005",
    entry_date: "2026-04-10",
    billing_day: 10,
    rent_period: "monthly",
    rent_amount: 1850000,
    deposit: 1000000,
    emergency_contact: "081900112233 (Kakak)",
    status: "active"
  }
];

export const initialTransactions = [
  {
    id: "tx-1",
    tenant_id: "tenant-1",
    room_id: "room-101",
    type: "income",
    category: "rent",
    amount: 1500000,
    transaction_date: "2026-08-05",
    description: "Sewa Kamar 101 - Periode Agustus 2026"
  },
  {
    id: "tx-2",
    tenant_id: "tenant-4",
    room_id: "room-201",
    type: "income",
    category: "rent",
    amount: 1500000,
    transaction_date: "2026-08-15",
    description: "Sewa Kamar 201 - Periode Agustus 2026"
  },
  {
    id: "tx-3",
    tenant_id: "tenant-5",
    room_id: "room-204",
    type: "income",
    category: "rent",
    amount: 1850000,
    transaction_date: "2026-08-10",
    description: "Sewa Kamar 204 - Periode Agustus 2026"
  },
  {
    id: "tx-4",
    tenant_id: null,
    room_id: null,
    type: "expense",
    category: "electricity",
    amount: 450000,
    transaction_date: "2026-08-03",
    description: "Token Listrik Utama & Pompa Air"
  },
  {
    id: "tx-5",
    tenant_id: null,
    room_id: null,
    type: "expense",
    category: "internet",
    amount: 385000,
    transaction_date: "2026-08-07",
    description: "Langganan WiFi Indihome 50Mbps"
  },
  {
    id: "tx-6",
    tenant_id: null,
    room_id: "room-203",
    type: "expense",
    category: "maintenance",
    amount: 120000,
    transaction_date: "2026-08-20",
    description: "Ganti kran kamar mandi & lampu Kamar 203"
  }
];
