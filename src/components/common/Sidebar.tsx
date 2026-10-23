import React from 'react';
import {
  LayoutDashboard,
  Home,
  Users,
  ClipboardCheck,
  Building2,
  ShieldCheck,
  CheckSquare,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  Landmark,
  X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { inspections, verificationCases, unreadNotifsCount } = useData();

  const pendingApprovalsCount = inspections.filter((i) => i.status === 'SUBMITTED').length;
  const pendingVerificationsCount = verificationCases.filter(
    (c) => c.reviewStatus === 'POTENTIAL_DUPLICATE' || c.reviewStatus === 'PREVIOUS_BENEFIT_REVIEW' || c.reviewStatus === 'INCOMPLETE_INFO'
  ).length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'housing', label: 'Housing Projects', icon: Home },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    {
      id: 'inspections',
      label: 'Inspections',
      icon: ClipboardCheck,
      badge: inspections.length.toString(),
    },
    { id: 'panchayat', label: 'Panchayat Works', icon: Building2 },
    {
      id: 'verification',
      label: 'Verification Centre',
      icon: ShieldCheck,
      badge: pendingVerificationsCount > 0 ? pendingVerificationsCount.toString() : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200',
    },
    {
      id: 'approvals',
      label: 'Approvals Queue',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount.toString() : undefined,
      badgeColor: 'bg-[#EDE5FF] text-[#7654D6] border border-[#D8CEF6]',
    },
    { id: 'instalments', label: 'Instalment Tracking', icon: CreditCard },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount.toString() : undefined,
      badgeColor: 'bg-[#7654D6] text-white',
    },
    { id: 'settings', label: 'Settings & Tools', icon: Settings },
  ];

  const handleSelect = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-[#24213A]/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-[#EAE5F5] z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#EAE5F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9B7BFF] to-[#7654D6] flex items-center justify-center text-white shadow-md shadow-[#9B7BFF]/25">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#24213A]">
                  Gram<span className="text-[#7654D6]">Track</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EDE5FF] text-[#7654D6]">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#77748B]">Rural Housing & Works</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#F4EEFF] text-[#7654D6] shadow-xs'
                    : 'text-[#77748B] hover:text-[#24213A] hover:bg-[#F8F6FF]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#7654D6]' : 'text-[#77748B]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & prototype disclaimer */}
        <div className="p-4 border-t border-[#EAE5F5] bg-[#F8F6FF]/60">
          <div className="p-3 bg-white rounded-xl border border-[#EAE5F5] shadow-2xs">
            <p className="text-[11px] font-semibold text-[#24213A]">GovTech Prototype</p>
            <p className="text-[10px] text-[#77748B] mt-0.5 leading-snug">
              Simulated rural monitoring environment with offline IndexedDB sync.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
