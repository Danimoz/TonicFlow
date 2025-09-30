'use client';

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { 
  savePreferencesToIndexedDB, 
  saveSolfaTextToIndexedDB, 
} from "@/lib/dexie";
import { EditorPreferences } from "@/contexts/types";

const DEBOUNCE_DELAYS = {
  SOLFA_TEXT: 2130,
  BACKEND_SYNC: 5432,
  RETRY_DELAY: 10000, // 10 seconds for retry
} as const;

interface SyncQueueItem {
  projectId: string;
  notationContent: string;
  timestamp: number;
  retryCount: number;
}

interface ConflictResolutionResult {
  useLocal: boolean;
  useBackend: boolean;
  merged?: string;
}

export function useAutoSave(
  projectId: string | undefined,
  solfaText: string | undefined,
  preferences: EditorPreferences | undefined
) {
  const [debouncedSolfaText] = useDebounce(solfaText, DEBOUNCE_DELAYS.SOLFA_TEXT);
  const [debouncedBackendSync] = useDebounce(solfaText, DEBOUNCE_DELAYS.BACKEND_SYNC);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'failed' | 'success'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const syncQueueRef = useRef<SyncQueueItem[]>([]);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process queued sync operations when coming back online
      processQueuedSyncs();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save preferences to IndexedDB whenever they change
  useEffect(() => {
    if (projectId && preferences) {
      savePreferencesToIndexedDB(projectId, preferences).catch(error => {
        console.error("Failed to save preferences to IndexedDB:", error);
      });
    }
  }, [projectId, preferences]);

  // Auto-save solfa text to IndexedDB when it changes (debounced)
  useEffect(() => {
    if (projectId && debouncedSolfaText !== undefined) {
      saveSolfaTextToIndexedDB(projectId, debouncedSolfaText).catch(error => {
        console.error("Failed to save solfa text to IndexedDB:", error);
      });
    }
  }, [projectId, debouncedSolfaText]);

  // Sync with backend when solfa text changes (debounced)
  useEffect(() => {
    if (projectId && debouncedBackendSync !== undefined) {
      syncToBackendWithRetry(projectId, debouncedBackendSync);
    }
  }, [projectId, debouncedBackendSync]);

  // Process queued syncs when coming back online
  const processQueuedSyncs = async () => {
    if (!isOnline || syncQueueRef.current.length === 0) return;

    const queue = [...syncQueueRef.current];
    syncQueueRef.current = [];

    for (const item of queue) {
      try {
        await syncToBackend(item.projectId, item.notationContent);
        console.log(`Successfully synced queued item for project ${item.projectId}`);
      } catch (error) {
        console.error(`Failed to sync queued item for project ${item.projectId}:`, error);
        // Re-queue with increased retry count if under limit
        if (item.retryCount < 3) {
          syncQueueRef.current.push({
            ...item,
            retryCount: item.retryCount + 1
          });
        }
      }
    }
  };

  // Enhanced sync function with retry mechanism
  const syncToBackendWithRetry = async (projectId: string, notationContent: string) => {
    if (!isOnline) {
      // Queue for later when online
      syncQueueRef.current.push({
        projectId,
        notationContent,
        timestamp: Date.now(),
        retryCount: 0
      });
      return;
    }

    try {
      setSyncStatus('syncing');
      await syncToBackend(projectId, notationContent);
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Sync failed, will retry:", error);
      setSyncStatus('failed');
      
      // Schedule retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      retryTimeoutRef.current = setTimeout(() => {
        syncToBackendWithRetry(projectId, notationContent);
      }, DEBOUNCE_DELAYS.RETRY_DELAY);
    }
  };

  // Core sync function
  const syncToBackend = async (projectId: string, notationContent: string): Promise<void> => {
    const response = await fetch(`/api/sync/project/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notationContent })
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
    }
  };

  // Manual sync trigger for user-initiated sync
  const manualSync = async () => {
    if (!projectId || !debouncedSolfaText) return;
    
    try {
      setSyncStatus('syncing');
      await syncToBackend(projectId, debouncedSolfaText);
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } catch (error) {
      setSyncStatus('failed');
      throw error;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedSolfaText,
    debouncedBackendSync,
    isOnline,
    syncStatus,
    lastSyncTime,
    queuedSyncs: syncQueueRef.current.length,
    manualSync
  };
}