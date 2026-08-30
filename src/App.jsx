import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { KosProvider, useKos } from './context/KosContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';

// Views
import StatsOverview from './components/dashboard/StatsOverview';
import DueDateAlerts from './components/dashboard/DueDateAlerts';
import RoomGrid from './components/dashboard/RoomGrid';
import TenantList from './components/tenants/TenantList';
import FinanceReport from './components/finance/FinanceReport';
import KosSettings from './components/settings/KosSettings';
import SupabaseConfig from './components/settings/SupabaseConfig';

// Modals
import RoomModal from './components/rooms/RoomModal';
import TenantModal from './components/tenants/TenantModal';
import WhatsAppModal from './components/tenants/WhatsAppModal';
import TransactionModal from './components/finance/TransactionModal';
import AuthModal from './components/auth/AuthModal';

import { Cloud } from 'lucide-react';

function KosApp() {
  const { activeTab, setActiveTab, checkOutTenant } = useKos();

  // Modals state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState(null);

  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState(null);
  const [defaultRoomIdForTenant, setDefaultRoomIdForTenant] = useState('');

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txPrefillData, setTxPrefillData] = useState(null);
  const [txDefaultType, setTxDefaultType] = useState('income');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState('profile'); // 'profile' | 'supabase'

  // Handlers
  const handleOpenAddRoom = () => {
    setRoomToEdit(null);
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room) => {
    setRoomToEdit(room);
    setIsRoomModalOpen(true);
  };

  const handleOpenAddTenant = () => {
    setTenantToEdit(null);
    setDefaultRoomIdForTenant('');
    setIsTenantModalOpen(true);
  };

  const handleCheckInRoom = (room) => {
    setTenantToEdit(null);
    setDefaultRoomIdForTenant(room.id);
    setIsTenantModalOpen(true);
  };

  const handleOpenEditTenant = (tenant) => {
    setTenantToEdit(tenant);
    setIsTenantModalOpen(true);
  };

  const handleCheckOutTenant = async (tenant, room) => {
    if (window.confirm(`Check-out ${tenant.name} dari Kamar ${room?.room_number || ''}? Kamar akan kembali kosong.`)) {
      await checkOutTenant(tenant.id, room?.id);
    }
  };

  const handleOpenWhatsApp = (tenant, room, dueDate) => {
    setWhatsAppData({ tenant, room, dueDate });
    setIsWhatsAppModalOpen(true);
  };

  const handleQuickPay = (tenant, room) => {
    setTxPrefillData({ tenant, room, amount: tenant.rent_amount });
    setTxDefaultType('income');
    setIsTxModalOpen(true);
  };

  const handleOpenAddTransaction = (type = 'income') => {
    setTxPrefillData(null);
    setTxDefaultType(type);
    setIsTxModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 font-sans">
      
      {/* Top Navigation */}
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Main Content Layout */}
      <div className="flex-1 flex max-w-6xl w-full mx-auto px-4 sm:px-6">
        
        {/* Desktop Sidebar */}
        <Sidebar
          onOpenAddRoom={handleOpenAddRoom}
          onOpenAddTenant={handleOpenAddTenant}
          onOpenAddTransaction={() => handleOpenAddTransaction('income')}
        />

        {/* Content Area */}
        <main className="flex-1 py-6 pb-24 lg:pb-12 max-w-full overflow-x-hidden space-y-5">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              <StatsOverview onFilterDueSoon={() => {}} />

              <DueDateAlerts
                onOpenWhatsApp={handleOpenWhatsApp}
                onQuickPay={handleQuickPay}
              />

              <div className="space-y-3">
                <RoomGrid
                  onAddRoom={handleOpenAddRoom}
                  onEditRoom={handleOpenEditRoom}
                  onCheckIn={handleCheckInRoom}
                  onCheckOut={handleCheckOutTenant}
                  onOpenWhatsApp={handleOpenWhatsApp}
                  onQuickPay={handleQuickPay}
                />
              </div>
            </div>
          )}

          {/* TAB 2: ROOMS */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <RoomGrid
                onAddRoom={handleOpenAddRoom}
                onEditRoom={handleOpenEditRoom}
                onCheckIn={handleCheckInRoom}
                onCheckOut={handleCheckOutTenant}
                onOpenWhatsApp={handleOpenWhatsApp}
                onQuickPay={handleQuickPay}
              />
            </div>
          )}

          {/* TAB 3: TENANTS */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <TenantList
                onAddTenant={handleOpenAddTenant}
                onEditTenant={handleOpenEditTenant}
                onOpenWhatsApp={handleOpenWhatsApp}
                onQuickPay={handleQuickPay}
                onCheckOut={handleCheckOutTenant}
              />
            </div>
          )}

          {/* TAB 4: FINANCE */}
          {activeTab === 'finance' && (
            <div className="space-y-4">
              <FinanceReport
                onOpenAddTransaction={() => handleOpenAddTransaction('income')}
              />
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Sub tabs */}
              <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <button
                  onClick={() => setSettingsSubTab('profile')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                    settingsSubTab === 'profile'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Profil & Template WA
                </button>
                <button
                  onClick={() => setSettingsSubTab('supabase')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                    settingsSubTab === 'supabase'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" /> Database Cloud
                </button>
              </div>

              {settingsSubTab === 'profile' ? <KosSettings /> : <SupabaseConfig />}
            </div>
          )}

        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenQuickAction={handleOpenAddTenant} />

      {/* All Dialog Modals */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        roomToEdit={roomToEdit}
      />

      <TenantModal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        tenantToEdit={tenantToEdit}
        defaultRoomId={defaultRoomIdForTenant}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        data={whatsAppData}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        defaultType={txDefaultType}
        prefillData={txPrefillData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenSettings={() => {
          setIsAuthModalOpen(false);
          setActiveTab('settings');
          setSettingsSubTab('supabase');
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <KosProvider>
        <KosApp />
      </KosProvider>
    </AuthProvider>
  );
}
