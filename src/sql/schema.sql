-- ==============================================================================
-- KOSMANAGER - SUPABASE DATABASE SCHEMA (100% GRATIS & AMAN)
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABEL PROFIL PEMILIK KOS
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  kost_name text default 'Kos Bahagia',
  owner_name text default 'Pengelola Kos',
  phone text default '',
  payment_info text default 'BCA 1234567890 a/n Pengelola Kos',
  wa_template text default 'Halo kak {nama}, mengingatkan untuk pembayaran sewa kamar {kamar} sebesar {nominal} yang jatuh tempo pada {jatuh_tempo}. Pembayaran bisa ditransfer ke {rekening}. Terima kasih! 🙏',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABEL KAMAR (ROOMS)
create table if not exists public.rooms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  room_number text not null,
  floor integer default 1,
  room_type text default 'Standard', -- 'Standard', 'Deluxe', 'VIP'
  price numeric not null default 0,
  status text default 'available', -- 'available' (kosong), 'occupied' (terisi), 'maintenance' (perbaikan)
  facilities text[] default '{"Kasur", "Lemari", "Kamar Mandi Dalam"}',
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABEL PENGHUNI (TENANTS)
create table if not exists public.tenants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  room_id uuid references public.rooms(id) on delete set null,
  name text not null,
  phone text not null,
  id_card text default '',
  entry_date date not null default current_date,
  billing_day integer not null default 1, -- Tanggal jatuh tempo per bulan (1-31)
  rent_period text default 'monthly', -- 'monthly', '3_months', '6_months', 'yearly'
  rent_amount numeric not null default 0,
  deposit numeric default 0,
  emergency_contact text default '',
  status text default 'active', -- 'active' (menghuni), 'inactive' (sudah keluar)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABEL TRANSAKSI KEUANGAN (TRANSACTIONS)
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  tenant_id uuid references public.tenants(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  type text not null, -- 'income' (pemasukan sewa/deposit) atau 'expense' (pengeluaran operasional)
  category text not null, -- 'rent', 'deposit', 'electricity', 'water', 'internet', 'maintenance', 'trash', 'other'
  amount numeric not null default 0,
  transaction_date date not null default current_date,
  description text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- KEAMANAN: ROW LEVEL SECURITY (RLS)
-- Memastikan HANYA ANDA (user yang login) yang bisa membaca/mengubah data Anda sendiri.
-- Data pribadi TIDAK BISA dilihat oleh orang asing!
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.tenants enable row level security;
alter table public.transactions enable row level security;

-- Policies Profiles
create policy "Users can view their own profile" 
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" 
  on public.profiles for insert with check (auth.uid() = id);

-- Policies Rooms
create policy "Users can view their own rooms" 
  on public.rooms for select using (auth.uid() = user_id);
create policy "Users can insert their own rooms" 
  on public.rooms for insert with check (auth.uid() = user_id);
create policy "Users can update their own rooms" 
  on public.rooms for update using (auth.uid() = user_id);
create policy "Users can delete their own rooms" 
  on public.rooms for delete using (auth.uid() = user_id);

-- Policies Tenants
create policy "Users can view their own tenants" 
  on public.tenants for select using (auth.uid() = user_id);
create policy "Users can insert their own tenants" 
  on public.tenants for insert with check (auth.uid() = user_id);
create policy "Users can update their own tenants" 
  on public.tenants for update using (auth.uid() = user_id);
create policy "Users can delete their own tenants" 
  on public.tenants for delete using (auth.uid() = user_id);

-- Policies Transactions
create policy "Users can view their own transactions" 
  on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own transactions" 
  on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own transactions" 
  on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own transactions" 
  on public.transactions for delete using (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER OTOMATIS: BUAT PROFIL SAAT USER BARU SIGN UP
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, kost_name, owner_name)
  values (new.id, 'Kos Saya', coalesce(new.raw_user_meta_data->>'full_name', 'Pengelola Kos'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
