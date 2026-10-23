import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  UserCheck,
  Check,
  Trash2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface NotificationsTabProps {
  onNavigateTab: (tab: string) => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ onNavigateTab }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsRead } = useData();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.read;
    if (filterType === 'APPROVAL') return n.type === 'APPROVAL';
    if (filterType === 'VERIFICATION') return n.type === 'VERIFICATION';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#24213A]">
            Government Notification Centre
          </h1>
          <p className="text-xs sm:text-sm text-[#77748B] mt-0.5">
            System alerts for field inspection uploads, approval requests, and duplicate checks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#EAE5F5] text-[#7654D6] hover:bg-[#F8F6FF] transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#F4EEFF] rounded-2xl border border-[#EAE5F5] w-fit">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
            filterType === 'ALL' ? 'bg-[#7654D6] text-white shadow-xs' : 'text-[#77748B]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('UNREAD')}
          className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
            filterType === 'UNREAD' ? 'bg-[#7654D6] text-white shadow-xs' : 'text-[#77748B]'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
        <button
          onClick={() => setFilterType('VERIFICATION')}
          className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
            filterType === 'VERIFICATION' ? 'bg-[#7654D6] text-white shadow-xs' : 'text-[#77748B]'
          }`}
        >
          Verification Flags
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-[#EAE5F5] shadow-2xs divide-y divide-[#EAE5F5] overflow-hidden">
        {filteredNotifs.map((notif) => (
          <div
            key={notif.id}
            onClick={() => {
              markNotificationAsRead(notif.id);
              if (notif.actionUrl) onNavigateTab(notif.actionUrl);
            }}
            className={`p-4 transition-all cursor-pointer flex items-start justify-between gap-4 ${
              notif.read ? 'bg-white hover:bg-[#F8F6FF]/60' : 'bg-[#F8F6FF] hover:bg-[#F4EEFF]/80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-[#EAE5F5] shrink-0 mt-0.5">
                {notif.type === 'APPROVAL' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : notif.type === 'VERIFICATION' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                ) : (
                  <Bell className="w-4 h-4 text-[#7654D6]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#24213A]">{notif.title}</h3>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-[#7654D6]"></span>
                  )}
                </div>
                <p className="text-xs text-[#77748B] mt-0.5 leading-relaxed">{notif.message}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {new Date(notif.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {notif.actionUrl && (
              <span className="text-xs font-semibold text-[#7654D6] shrink-0 hover:underline">
                View &rarr;
              </span>
            )}
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className="py-12 text-center">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#24213A]">No Notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};
