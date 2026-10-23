/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SyncProvider, useSync } from './context/SyncContext';
import { DataProvider, useData } from './context/DataContext';

import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { HousingTab } from './components/dashboard/HousingTab';
import { HouseDetailModal } from './components/dashboard/HouseDetailModal';
import { AddBeneficiaryModal } from './components/dashboard/AddBeneficiaryModal';
import { InspectionsTab } from './components/dashboard/InspectionsTab';
import { PanchayatTab } from './components/dashboard/PanchayatTab';
import { VerificationTab } from './components/dashboard/VerificationTab';
import { ApprovalsTab } from './components/dashboard/ApprovalsTab';
import { InstalmentsTab } from './components/dashboard/InstalmentsTab';
import { ReportsTab } from './components/dashboard/ReportsTab';
import { NotificationsTab } from './components/dashboard/NotificationsTab';
import { SettingsTab } from './components/dashboard/SettingsTab';
import { MobileFieldApp } from './components/mobile/MobileFieldApp';
import { Menu } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { beneficiaries, housingProjects } = useData();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Modals
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (isMobileMode) {
    return <MobileFieldApp onExitMobileMode={() => setIsMobileMode(false)} />;
  }

  const selectedHousingProject = selectedHouseId
    ? housingProjects.find((hp) => hp.beneficiaryId === selectedHouseId || hp.id === selectedHouseId)
    : null;
  const companionBeneficiary = selectedHouseId
    ? beneficiaries.find((b) => b.id === selectedHouseId || b.id === selectedHousingProject?.beneficiaryId)
    : undefined;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isSidebarOpenMobile}
        setIsOpenMobile={setIsSidebarOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
        {/* Top Navbar */}
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpenMobile(true)}
            className="p-3 lg:hidden text-gray-500 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <Header
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isMobileMode={isMobileMode}
              setIsMobileMode={setIsMobileMode}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenBeneficiary={(id) => setSelectedHouseId(id)}
              onOpenAddBeneficiary={() => setShowAddBeneficiary(true)}
            />
          )}

          {(activeTab === 'housing' || activeTab === 'beneficiaries') && (
            <HousingTab
              onOpenBeneficiary={(id) => setSelectedHouseId(id)}
              onOpenAddBeneficiary={() => setShowAddBeneficiary(true)}
            />
          )}

          {activeTab === 'inspections' && (
            <InspectionsTab onOpenBeneficiary={(id) => setSelectedHouseId(id)} />
          )}

          {activeTab === 'panchayat' && <PanchayatTab />}

          {activeTab === 'verification' && <VerificationTab />}

          {activeTab === 'approvals' && (
            <ApprovalsTab onOpenBeneficiary={(id) => setSelectedHouseId(id)} />
          )}

          {activeTab === 'instalments' && <InstalmentsTab />}

          {activeTab === 'reports' && <ReportsTab />}

          {activeTab === 'notifications' && (
            <NotificationsTab onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>

      {/* 4-Stage Housing Timeline Detail Modal */}
      {selectedHousingProject && (
        <HouseDetailModal
          housingProject={selectedHousingProject}
          beneficiary={companionBeneficiary}
          onClose={() => setSelectedHouseId(null)}
        />
      )}

      {/* Add Beneficiary Dialog */}
      {showAddBeneficiary && (
        <AddBeneficiaryModal
          onClose={() => setShowAddBeneficiary(false)}
          onSuccess={() => {
            // Can redirect to housing tab if needed
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <SyncProvider>
          <DashboardContent />
        </SyncProvider>
      </DataProvider>
    </AuthProvider>
  );
}
