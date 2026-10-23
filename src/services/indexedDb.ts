import { InspectionRecord } from '../types';

const DB_NAME = 'gramtrack_offline_db';
const DB_VERSION = 1;

export interface QueuedInspection extends InspectionRecord {
  localQueuedAt: string;
  retryAttempts: number;
  lastError?: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  inspectionId: string;
  beneficiaryName: string;
  stage: string;
  status: 'SUCCESS' | 'FAILED' | 'RETRY';
  message: string;
}

class IndexedDbService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async getDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Offline inspections queue
        if (!db.objectStoreNames.contains('inspections_queue')) {
          const store = db.createObjectStore('inspections_queue', { keyPath: 'id' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('beneficiaryId', 'beneficiaryId', { unique: false });
          store.createIndex('localQueuedAt', 'localQueuedAt', { unique: false });
        }

        // Cache for offline viewing
        if (!db.objectStoreNames.contains('offline_cache')) {
          db.createObjectStore('offline_cache', { keyPath: 'key' });
        }

        // Sync history audit
        if (!db.objectStoreNames.contains('sync_logs')) {
          const logStore = db.createObjectStore('sync_logs', { keyPath: 'id' });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.initPromise;
  }

  // Queue inspection locally
  async queueInspection(inspection: InspectionRecord): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inspections_queue', 'readwrite');
      const store = tx.objectStore('inspections_queue');

      const queuedItem: QueuedInspection = {
        ...inspection,
        localQueuedAt: new Date().toISOString(),
        retryAttempts: inspection.syncRetryCount || 0,
        syncStatus: inspection.syncStatus || 'SAVED_LOCALLY',
      };

      const request = store.put(queuedItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all queued inspections
  async getQueuedInspections(): Promise<QueuedInspection[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inspections_queue', 'readonly');
      const store = tx.objectStore('inspections_queue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Update a single queued item
  async updateQueuedInspection(item: QueuedInspection): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inspections_queue', 'readwrite');
      const store = tx.objectStore('inspections_queue');
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Delete an inspection once synced or discarded
  async removeQueuedInspection(id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inspections_queue', 'readwrite');
      const store = tx.objectStore('inspections_queue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Add a sync audit log
  async addSyncLog(log: Omit<SyncLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_logs', 'readwrite');
      const store = tx.objectStore('sync_logs');
      const entry: SyncLogEntry = {
        ...log,
        id: `sync-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
      };
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get sync logs
  async getSyncLogs(): Promise<SyncLogEntry[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_logs', 'readonly');
      const store = tx.objectStore('sync_logs');
      const request = store.getAll();

      request.onsuccess = () => {
        const sorted = (request.result || []).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Offline caching for general entities (beneficiaries, villages)
  async setCachedData<T>(key: string, data: T): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_cache', 'readwrite');
      const store = tx.objectStore('offline_cache');
      const request = store.put({ key, data, cachedAt: new Date().toISOString() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_cache', 'readonly');
      const store = tx.objectStore('offline_cache');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? (request.result.data as T) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new IndexedDbService();
