'use client';

import { useCallback, useEffect, useState } from "react";
import { createProjectVersion } from "@/lib/dexie";
import { generateSolfaDiff } from "@/lib/editorUtils";

const VERSION_THRESHOLDS = {
  CHANGE_PERCENTAGE: 20,
  MIN_SESSION_DURATION: 180, // 3 minutes
  AUTO_VERSION_INTERVAL: 300 // 5 minutes
} as const;

export function useVersioning(
  projectId: string | undefined,
  solfaText: string | undefined,
  debouncedSolfaText: string | undefined
) {
  const [lastVersionContent, setLastVersionContent] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());

  const hasSignificantChanges = useCallback(() => {
    if (!lastVersionContent || !solfaText) return false;
    const changePercentage = generateSolfaDiff(lastVersionContent, solfaText);
    return changePercentage > VERSION_THRESHOLDS.CHANGE_PERCENTAGE;
  }, [lastVersionContent, solfaText]);

  // Auto-create version when the user leaves the page
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (!projectId || !solfaText) return;

      const sessionDuration = (new Date().getTime() - sessionStartTime.getTime()) / 1000;
      const hasChanges = hasSignificantChanges();
      if (hasChanges && sessionDuration > VERSION_THRESHOLDS.MIN_SESSION_DURATION) {
        await createProjectVersion(projectId, solfaText, 'auto', true);
        setLastVersionContent(solfaText);
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [projectId, solfaText, sessionStartTime, hasSignificantChanges]);

  // Auto-create version when there are significant changes or session duration is greater than 30 minutes
  useEffect(() => {
    if (!debouncedSolfaText || !projectId) return
    const sessionDuration = (new Date().getTime() - sessionStartTime.getTime()) / 1000;

    const checkForVersionCreation = async () => {
      if (hasSignificantChanges() || sessionDuration > 1800) {
        if (solfaText) {
          await createProjectVersion(projectId, solfaText, 'auto')
          setLastVersionContent(solfaText);
        }
      }
    }

    checkForVersionCreation()
  }, [hasSignificantChanges, projectId, debouncedSolfaText, solfaText]);

  return {
    lastVersionContent,
    setLastVersionContent,
    sessionStartTime,
    setSessionStartTime,
    hasSignificantChanges
  };
}