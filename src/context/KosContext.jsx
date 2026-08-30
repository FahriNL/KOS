import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSupabase } from '../lib/supabase';
import {
  initialProfile,
  initialRooms,
  initialTenants,
  initialTransactions,
} from '../lib/demoData';

const KosContext = createContext(null);

export function KosProvider({ children }) {
  const { user, isDemoMode } = useAuth();
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('kos_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('kos_rooms');
    return saved ? JSON.parse(saved) : initialRooms;
  });
  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem('kos_tenants');
    return saved ? JSON.parse(saved) : initialTenants;
  });
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('kos_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'rooms', 'tenants', 'finance', 'settings'

  // Persist to local storage in demo mode
  useEffect(() => {
    if (isDemoMode || !user) {
      localStorage.setItem('kos_profile', JSON.stringify(profile));
      localStorage.setItem('kos_rooms', JSON.stringify(rooms));
      localStorage.setItem('kos_tenants', JSON.stringify(tenants));
      localStorage.setItem('kos_transactions', JSON.stringify(transactions));
    }
  }, [profile, rooms, tenants, transactions, isDemoMode, user]);

  // Fetch data from Supabase when logged in and not in demo mode
  const fetchCloudData = useCallback(async () => {
    if (isDemoMode || !user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    try {
      // 1. Profile
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profData) setProfile(profData);

      // 2. Rooms
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true });
      if (roomsData) setRooms(roomsData);

      // 3. Tenants
      const { data: tenantsData } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      if (tenantsData) setTenants(tenantsData);

      // 4. Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      if (txData) setTransactions(txData);
    } catch (error) {
      console.error('Error fetching Supabase data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    fetchCloudData();
  }, [fetchCloudData]);

  // -------------------------------------------------------------
  // CRUD ROOMS
  // -------------------------------------------------------------
  const addRoom = async (roomData) => {
    const newRoom = {
      id: isDemoMode || !user ? `room-${Date.now()}` : undefined,
      user_id: user?.id,
      ...roomData,
      price: Number(roomData.price) || 0,
      floor: Number(roomData.floor) || 1,
      status: roomData.status || 'available',
      facilities: roomData.facilities || [],
      created_at: new Date().toISOString(),
    };

    if (isDemoMode || !user) {
      setRooms((prev) => [...prev, newRoom]);
      return { data: newRoom, error: null };
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('rooms')
      .insert([newRoom])
      .select()
      .single();
    if (!error && data) {
      setRooms((prev) => [...prev, data]);
    }
    return { data, error };
  };

  const updateRoom = async (id, updatedFields) => {
    if (isDemoMode || !user) {
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
      );
      return { error: null };
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('rooms')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setRooms((prev) => prev.map((r) => (r.id === id ? data : r)));
    }
    return { data, error };
  };

  const deleteRoom = async (id) => {
    if (isDemoMode || !user) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
      // Unlink room from tenants
      setTenants((prev) =>
        prev.map((t) => (t.room_id === id ? { ...t, room_id: null } : t))
      );
      return { error: null };
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (!error) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    }
    return { error };
  };

  // -------------------------------------------------------------
  // CRUD TENANTS
  // -------------------------------------------------------------
  const addTenant = async (tenantData) => {
    const newTenant = {
      id: isDemoMode || !user ? `tenant-${Date.now()}` : undefined,
      user_id: user?.id,
      ...tenantData,
      rent_amount: Number(tenantData.rent_amount) || 0,
      deposit: Number(tenantData.deposit) || 0,
      billing_day: Number(tenantData.billing_day) || 1,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    if (isDemoMode || !user) {
      setTenants((prev) => [newTenant, ...prev]);
      // Update room status to occupied
      if (tenantData.room_id) {
        updateRoom(tenantData.room_id, { status: 'occupied' });
      }
      return { data: newTenant, error: null };
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tenants')
      .insert([newTenant])
      .select()
      .single();
    if (!error && data) {
      setTenants((prev) => [data, ...prev]);
      if (data.room_id) {
        await updateRoom(data.room_id, { status: 'occupied' });
      }
    }
    return { data, error };
  };

  const updateTenant = async (id, updatedFields) => {
    if (isDemoMode || !user) {
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
      );
      return { error: null };
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tenants')
      .update(updatedFields)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setTenants((prev) => prev.map((t) => (t.id === id ? data : r)));
    }
    return { data, error };
  };

  const checkOutTenant = async (tenantId, roomId) => {
    // 1. Mark tenant inactive
    await updateTenant(tenantId, { status: 'inactive' });
    // 2. Set room to available
    if (roomId) {
      await updateRoom(roomId, { status: 'available' });
    }
  };

  const deleteTenant = async (id) => {
    if (isDemoMode || !user) {
      setTenants((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (!error) {
      setTenants((prev) => prev.filter((t) => t.id !== id));
    }
    return { error };
  };

  // -------------------------------------------------------------
  // CRUD TRANSACTIONS
  // -------------------------------------------------------------
  const addTransaction = async (txData) => {
    const newTx = {
      id: isDemoMode || !user ? `tx-${Date.now()}` : undefined,
      user_id: user?.id,
      ...txData,
      amount: Number(txData.amount) || 0,
      created_at: new Date().toISOString(),
    };

    if (isDemoMode || !user) {
      setTransactions((prev) => [newTx, ...prev]);
      return { data: newTx, error: null };
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('transactions')
      .insert([newTx])
      .select()
      .single();
    if (!error && data) {
      setTransactions((prev) => [data, ...prev]);
    }
    return { data, error };
  };

  const deleteTransaction = async (id) => {
    if (isDemoMode || !user) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
    return { error };
  };

  // -------------------------------------------------------------
  // RECORD RENT PAYMENT SHORTCUT
  // -------------------------------------------------------------
  const recordRentPayment = async (tenant, room, amount, date, notes) => {
    const tx = {
      tenant_id: tenant?.id || null,
      room_id: room?.id || null,
      type: 'income',
      category: 'rent',
      amount: Number(amount) || tenant?.rent_amount || 0,
      transaction_date: date || new Date().toISOString().split('T')[0],
      description: notes || `Pembayaran Sewa Kamar ${room?.room_number || ''} - ${tenant?.name || ''}`,
    };
    return await addTransaction(tx);
  };

  // -------------------------------------------------------------
  // UPDATE PROFILE / SETTINGS
  // -------------------------------------------------------------
  const updateProfile = async (newProfile) => {
    setProfile(newProfile);
    if (!isDemoMode && user) {
      const supabase = getSupabase();
      if (supabase) {
        await supabase
          .from('profiles')
          .upsert({ id: user.id, ...newProfile, updated_at: new Date().toISOString() });
      }
    }
  };

  // -------------------------------------------------------------
  // RESET DEMO DATA
  // -------------------------------------------------------------
  const resetToDemoData = () => {
    setProfile(initialProfile);
    setRooms(initialRooms);
    setTenants(initialTenants);
    setTransactions(initialTransactions);
    localStorage.setItem('kos_profile', JSON.stringify(initialProfile));
    localStorage.setItem('kos_rooms', JSON.stringify(initialRooms));
    localStorage.setItem('kos_tenants', JSON.stringify(initialTenants));
    localStorage.setItem('kos_transactions', JSON.stringify(initialTransactions));
  };

  return (
    <KosContext.Provider
      value={{
        profile,
        updateProfile,
        rooms,
        addRoom,
        updateRoom,
        deleteRoom,
        tenants,
        addTenant,
        updateTenant,
        checkOutTenant,
        deleteTenant,
        transactions,
        addTransaction,
        deleteTransaction,
        recordRentPayment,
        resetToDemoData,
        selectedFloor,
        setSelectedFloor,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        loading,
        refreshData: fetchCloudData,
      }}
    >
      {children}
    </KosContext.Provider>
  );
}

export function useKos() {
  const context = useContext(KosContext);
  if (!context) {
    throw new Error('useKos must be used within a KosProvider');
  }
  return context;
}
