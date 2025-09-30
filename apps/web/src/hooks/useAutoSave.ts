'use client';

import { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { savePreferencesToIndexedDB, saveSolfaTextToIndexedDB } from "@/lib/dexie";
import { EditorPreferences } from "@/contexts/types";

const DEBOUNCE_DELAYS = {
  SOLFA_TEXT: 2130,
  BACKEND_SYNC: 5000
} as const;

export function useAutoSave(
  projectId: string | undefined,
  solfaText: string | undefined,
  preferences: EditorPreferences | undefined
) {
  const [debouncedSolfaText] = useDebounce(solfaText, DEBOUNCE_DELAYS.SOLFA_TEXT);
  const [debouncedBackendSync] = useDebounce(solfaText, DEBOUNCE_DELAYS.BACKEND_SYNC);

  // Save preferences to IndexedDB whenever the projectId or preferences change
  useEffect(() => {
    if (projectId && preferences) {
      savePreferencesToIndexedDB(projectId, preferences);
    }
  }, [projectId, preferences]);

  // Auto-save solfa text to IndexedDB when it changes (debounced)
  useEffect(() => {
    if (projectId && debouncedSolfaText !== undefined) {
      saveSolfaTextToIndexedDB(projectId, debouncedSolfaText);
    }
  }, [projectId, debouncedSolfaText]);

  // Sync with backend when solfa text changes (debounced)
  useEffect(() => {
    if (projectId && debouncedBackendSync !== undefined) {
      const syncToBackend = async () => {
        try {
          const res = await fetch(`/api/sync/project/${projectId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notationContent: debouncedBackendSync })
          });
          console.log("Successfully synced to backend:", await res.json());
        } catch (error) {
          console.error("Error syncing to backend:", error);
        }
      }
      syncToBackend();
    }
  }, [projectId, debouncedBackendSync]);

  return {
    debouncedSolfaText,
    debouncedBackendSync
  };
}