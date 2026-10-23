import React, { useState } from 'react';
import {
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Smartphone,
  Monitor,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { useData } from '../../context/DataContext';
import { generateProjectZip, downloadBlob } from '../../services/zipExporter';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  isMobileMode: boolean;
  setIsMobileMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  searchQuery,
  isMobileMode,
  setIsMobileMode,
  setActiveTab,
}) => {
  const { currentUser, logout, quickLogin } = useAuth();
  const { effectiveOnline, isSimulatedOffline, toggleSimulateOffline, queuedCount, isSyncing, syncNow } = useSync();
  const { notifications, unreadNotifsCount, markNotificationAsRead, markAllNotificationsRead } = useData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<string>('');

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      setZipProgress('Packaging project...');
      const blob = await generateProjectZip((percent, status) => {
        setZipProgress(`${status} (${percent}%)`);
      });
      downloadBlob(blob, 'GramTrack-Rural-Monitoring-System.zip');
      setTimeout(() => {
        setIsExportingZip(false);
        setZipProgress('');
      }, 1000);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
      setIsExportingZip(false);
      setZipProgress('');
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrator', bg: 'bg-[#EDE5FF] text-[#7654D6] border-[#D8CEF6]' };
      case 'DISTRICT_OFFICER':
        return { label: 'District Officer', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'FIELD_INSPECTOR':
        return { label: 'Field Inspector', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'Authorized Official', bg: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const roleConfig = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#EAE5F5] px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77748B]" />
            <input
              type="text"
              placeholder="Search beneficiary, house ID, village, or scheme ref..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] placeholder-[#77748B] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]/40 focus:border-[#9B7BFF] transition-all"
            />
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Mode Switcher: Desktop Web vs Field Mobile */}
          <div className="flex items-center p-1 bg-[#F4EEFF] rounded-xl border border-[#EAE5F5]">
            <button
              onClick={() => setIsMobileMode(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !isMobileMode
                  ? 'bg-white text-[#7654D6] shadow-sm'
                  : 'text-[#77748B] hover:text-[#24213A]'
              }`}
              title="Central Web Dashboard"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setIsMobileMode(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isMobileMode
                  ? 'bg-[#7654D6] text-white shadow-sm'
                  : 'text-[#77748B] hover:text-[#24213A]'
              }`}
              title="Mobile Field Inspector View (Android APK Simulation)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Field App</span>
            </button>
          </div>

          {/* Online / Offline Status & Simulation Toggle */}
          <button
            onClick={toggleSimulateOffline}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              effectiveOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
            }`}
            title="Click to toggle Simulated Field Offline Mode"
          >
            {effectiveOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">Online (Live)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Offline{isSimulatedOffline ? ' (Simulated)' : ''}</span>
              </>
            )}
          </button>

          {/* Sync Button & Queue Counter */}
          {queuedCount > 0 && (
            <button
              onClick={() => syncNow()}
              disabled={isSyncing || !effectiveOnline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                effectiveOnline
                  ? 'bg-[#EDE5FF] text-[#7654D6] border-[#D8CEF6] hover:bg-[#9B7BFF] hover:text-white'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
              title={effectiveOnline ? 'Sync local queue to server' : 'Connect online to sync'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                Sync ({queuedCount})
              </span>
            </button>
          )}

          {/* Download Project ZIP Button */}
          <button
            onClick={handleDownloadZip}
            disabled={isExportingZip}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D8CEF6] text-[#7654D6] hover:bg-[#F8F6FF] text-xs font-semibold shadow-xs transition-all"
            title="Download complete project folder with source code, backend, and database schema"
          >
            <Download className={`w-3.5 h-3.5 ${isExportingZip ? 'animate-bounce' : ''}`} />
            <span>{isExportingZip ? (zipProgress || 'Packaging...') : 'Export ZIP'}</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-[#77748B] hover:text-[#24213A] hover:bg-[#F8F6FF] transition-all"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#7654D6] ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#EAE5F5] p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EAE5F5]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#24213A]">Notifications</span>
                    {unreadNotifsCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#EDE5FF] text-[#7654D6]">
                        {unreadNotifsCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-[#7654D6] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.actionUrl) {
                          setActiveTab(notif.actionUrl);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-2.5 rounded-xl text-left cursor-pointer transition-all border ${
                        notif.read
                          ? 'bg-white border-transparent hover:bg-[#F8F6FF]'
                          : 'bg-[#F8F6FF] border-[#EDE5FF]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.type === 'APPROVAL' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        ) : notif.type === 'VERIFICATION' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-[#7654D6] mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#24213A]">{notif.title}</p>
                          <p className="text-[11px] text-[#77748B] mt-0.5 leading-relaxed">{notif.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-[#EAE5F5] text-center">
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold text-[#7654D6] hover:underline"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Role Badge */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-[#F8F6FF] transition-all border border-transparent hover:border-[#EAE5F5]"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9B7BFF] to-[#7654D6] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-xs font-semibold text-[#24213A] leading-tight truncate max-w-[120px]">
                  {currentUser?.name}
                </p>
                <span className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded-md border ${roleConfig.bg}`}>
                  {roleConfig.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#77748B]" />
            </button>

            {/* Switch User Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAE5F5] p-3 z-50">
                <div className="pb-2 mb-2 border-b border-[#EAE5F5]">
                  <p className="text-xs font-semibold text-[#24213A]">{currentUser?.name}</p>
                  <p className="text-[11px] text-[#77748B]">{currentUser?.email}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{currentDate}</p>
                </div>

                <div className="text-[11px] font-semibold text-[#77748B] px-1 mb-1">
                  Switch Demonstration Role:
                </div>
                <div className="space-y-1 mb-2">
                  <button
                    onClick={() => {
                      quickLogin('ADMIN');
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentUser?.role === 'ADMIN' ? 'bg-[#EDE5FF] text-[#7654D6]' : 'hover:bg-[#F8F6FF] text-[#24213A]'
                    }`}
                  >
                    <span>Administrator</span>
                    {currentUser?.role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-[#7654D6]" />}
                  </button>
                  <button
                    onClick={() => {
                      quickLogin('DISTRICT_OFFICER');
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentUser?.role === 'DISTRICT_OFFICER' ? 'bg-[#EDE5FF] text-[#7654D6]' : 'hover:bg-[#F8F6FF] text-[#24213A]'
                    }`}
                  >
                    <span>District Officer</span>
                    {currentUser?.role === 'DISTRICT_OFFICER' && <CheckCircle2 className="w-3.5 h-3.5 text-[#7654D6]" />}
                  </button>
                  <button
                    onClick={() => {
                      quickLogin('FIELD_INSPECTOR');
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentUser?.role === 'FIELD_INSPECTOR' ? 'bg-[#EDE5FF] text-[#7654D6]' : 'hover:bg-[#F8F6FF] text-[#24213A]'
                    }`}
                  >
                    <span>Field Inspector</span>
                    {currentUser?.role === 'FIELD_INSPECTOR' && <CheckCircle2 className="w-3.5 h-3.5 text-[#7654D6]" />}
                  </button>
                </div>

                <div className="pt-2 border-t border-[#EAE5F5]">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
