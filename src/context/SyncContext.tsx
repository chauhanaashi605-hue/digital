import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineStorage, QueuedInspection, SyncLogEntry } from '../services/indexedDb';
import { InspectionRecord } from '../types';

interface SyncContextType {
  isOnline: boolean;
  effectiveOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulateOffline: () => void;
  queuedInspections: QueuedInspection[];
  queuedCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<{ success: number; failed: number }>;
  queueInspectionOffline: (inspection: InspectionRecord) => Promise<void>;
  refreshQueue: () => Promise<void>;
  syncLogs: SyncLogEntry[];
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{
  children: React.ReactNode;
  onInspectionSynced?: (inspection: InspectionRecord) => void;
}> = ({ children, onInspectionSynced }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [queuedInspections, setQueuedInspections] = useState<QueuedInspection[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);

  const effectiveOnline = isOnline && !isSimulatedOffline;

  const refreshQueue = useCallback(async () => {
    try {
      const items = await offlineStorage.getQueuedInspections();
      setQueuedInspections(items);
      const logs = await offlineStorage.getSyncLogs();
      setSyncLogs(logs);
    } catch (err) {
      console.error('Failed to load queued inspections from IndexedDB:', err);
    }
  }, []);

  useEffect(() => {
    refreshQueue();

    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshQueue]);

  const toggleSimulateOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  const queueInspectionOffline = async (inspection: InspectionRecord) => {
    await offlineStorage.queueInspection({
      ...inspection,
      syncStatus: 'SAVED_LOCALLY',
    });
    await refreshQueue();
  };

  const syncNow = async (): Promise<{ success: number; failed: number }> => {
    if (!effectiveOnline) {
      return { success: 0, failed: 0 };
    }

    setIsSyncing(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      const items = await offlineStorage.getQueuedInspections();

      for (const item of items) {
        try {
          // Update status to uploading in IndexedDB
          await offlineStorage.updateQueuedInspection({
            ...item,
            syncStatus: 'UPLOADING',
          });

          // Simulate network latency for realism
          await new Promise((res) => setTimeout(res, 500));

          // Call parent sync handler
          if (onInspectionSynced) {
            onInspectionSynced({
              ...item,
              syncStatus: 'SYNCED',
            });
          }

          // Log success in sync audit history
          await offlineStorage.addSyncLog({
            inspectionId: item.id,
            beneficiaryName: item.beneficiaryName,
            stage: item.stage,
            status: 'SUCCESS',
            message: `Geo-tagged ${item.stage} inspection synced successfully (${item.latitude?.toFixed(4)}, ${item.longitude?.toFixed(4)}).`,
          });

          // Remove synced item from queue
          await offlineStorage.removeQueuedInspection(item.id);
          successCount++;
        } catch (error) {
          failedCount++;
          await offlineStorage.updateQueuedInspection({
            ...item,
            syncStatus: 'SYNC_FAILED',
            retryAttempts: (item.retryAttempts || 0) + 1,
            lastError: String(error),
          });

          await offlineStorage.addSyncLog({
            inspectionId: item.id,
            beneficiaryName: item.beneficiaryName,
            stage: item.stage,
            status: 'FAILED',
            message: `Sync failed on attempt ${item.retryAttempts + 1}: ${String(error)}`,
          });
        }
      }
    } finally {
      await refreshQueue();
      setIsSyncing(false);
    }

    return { success: successCount, failed: failedCount };
  };

  // Auto-sync when transitioning from offline to online
  useEffect(() => {
    if (effectiveOnline && queuedInspections.length > 0 && !isSyncing) {
      syncNow();
    }
  }, [effectiveOnline]);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        effectiveOnline,
        isSimulatedOffline,
        toggleSimulateOffline,
        queuedInspections,
        queuedCount: queuedInspections.length,
        isSyncing,
        syncNow,
        queueInspectionOffline,
        refreshQueue,
        syncLogs,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
