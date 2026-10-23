import React, { useState } from 'react';
import {
  Settings,
  Database,
  Smartphone,
  HardDrive,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Key,
  Shield,
  Layers,
  Code2,
} from 'lucide-react';
import { useSync } from '../../context/SyncContext';
import { DEMO_USERS } from '../../services/mockData';

export const SettingsTab: React.FC = () => {
  const { queuedCount, queuedInspections, syncLogs, refreshQueue, syncNow, effectiveOnline } = useSync();
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearIndexedDb = async () => {
    try {
      indexedDB.deleteDatabase('gramtrack_offline_db');
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2000);
      refreshQueue();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-[#24213A]">
          System Settings & Offline Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-[#77748B] mt-0.5">
          IndexedDB engine status, Capacitor Android configuration, and demo account registry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offline IndexedDB Engine Status */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE5F5] shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EDE5FF] text-[#7654D6]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#24213A]">IndexedDB Local Storage</h2>
              <p className="text-xs text-[#77748B]">Persistent browser database for field inspections</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#EAE5F5] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#77748B]">Database Name:</span>
              <span className="font-mono font-medium text-[#24213A]">gramtrack_offline_db</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77748B]">Queued Inspections:</span>
              <span className="font-bold text-[#7654D6]">{queuedCount} pending</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77748B]">Network Connectivity:</span>
              <span className={`font-semibold ${effectiveOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                {effectiveOnline ? 'Online (Synchronized)' : 'Offline / Simulated'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => syncNow()}
              disabled={queuedCount === 0 || !effectiveOnline}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5] disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Force Synchronize</span>
            </button>
            <button
              onClick={handleClearIndexedDb}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#EAE5F5] text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset IndexedDB</span>
            </button>
          </div>

          {clearedNotice && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Local storage database successfully reset!
            </p>
          )}
        </div>

        {/* Capacitor Android Mobile Package Info */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE5F5] shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#24213A]">Capacitor Android Packaging</h2>
              <p className="text-xs text-[#77748B]">Native mobile runtime configuration</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#EAE5F5] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#77748B]">Application ID:</span>
              <span className="font-mono text-[#24213A]">gov.in.gramtrack.inspector</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77748B]">App Name:</span>
              <span className="font-medium text-[#24213A]">GramTrack Field Inspector</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#77748B]">Device Permissions:</span>
              <span className="font-mono text-[#7654D6]">CAMERA, ACCESS_FINE_LOCATION</span>
            </div>
          </div>

          <div className="text-xs text-[#77748B] leading-relaxed">
            Ready to generate an Android APK using the provided <code className="text-[#7654D6] font-mono">capacitor.config.ts</code> and instructions in <code className="text-[#7654D6] font-mono">ANDROID_BUILD.md</code>.
          </div>
        </div>
      </div>

      {/* Demo Credentials Guide */}
      <div className="bg-white p-6 rounded-3xl border border-[#EAE5F5] shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#24213A]">Demonstration Accounts & Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_USERS.map((user) => (
            <div key={user.id} className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#EAE5F5] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#24213A]">{user.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDE5FF] text-[#7654D6]">
                  {user.role}
                </span>
              </div>
              <p className="text-[11px] text-[#77748B] font-mono">{user.email}</p>
              <p className="text-[10px] text-gray-500">Password: <span className="font-mono">demo123</span></p>
              <div className="text-[10px] text-[#77748B] pt-1 border-t border-[#EAE5F5]">
                Jurisdiction: {user.assignedDistrict}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sync Audit History */}
      <div className="bg-white p-6 rounded-3xl border border-[#EAE5F5] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#24213A]">Offline Sync Audit Logs</h2>
          <span className="text-xs text-[#77748B]">{syncLogs.length} events</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {syncLogs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-[#F8F6FF] border border-[#EAE5F5] flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-[#24213A]">{log.beneficiaryName}</span> •{' '}
                <span className="font-mono text-[#7654D6]">{log.stage}</span>
                <p className="text-[11px] text-[#77748B] mt-0.5">{log.message}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {log.status}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {syncLogs.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No sync logs recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
