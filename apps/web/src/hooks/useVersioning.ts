'use client';

import { useCallback, useEffect, useRef, useState } from "react";
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

  // Use refs to capture current values without causing re-renders
  const projectIdRef = useRef(projectId);
  const solfaTextRef = useRef(solfaText);
  const lastVersionContentRef = useRef(lastVersionContent);
  const sessionStartTimeRef = useRef(sessionStartTime);

  // Update refs when values change
  useEffect(() => { projectIdRef.current = projectId; }, [projectId]);
  useEffect(() => { solfaTextRef.current = solfaText; }, [solfaText]);
  useEffect(() => { lastVersionContentRef.current = lastVersionContent; }, [lastVersionContent]);
  useEffect(() => { sessionStartTimeRef.current = sessionStartTime; }, [sessionStartTime]);

  const hasSignificantChanges = useCallback(() => {
    if (!lastVersionContent || !solfaText) return false;
    const changePercentage = generateSolfaDiff(lastVersionContent, solfaText);
    return changePercentage > VERSION_THRESHOLDS.CHANGE_PERCENTAGE;
  }, [lastVersionContent, solfaText]);

  // Auto-create version when the user actually leaves the page (not on re-renders)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('🚨 beforeunload fired!', {
        timestamp: new Date().toISOString(),
        eventType: event.type,
        reason: 'Page unload detected'
      });

      const currentProjectId = projectIdRef.current;
      const currentSolfaText = solfaTextRef.current;
      const currentLastVersionContent = lastVersionContentRef.current;
      const currentSessionStart = sessionStartTimeRef.current;
      
      if (!currentProjectId || !currentSolfaText) {
        console.log('❌ Skipping version creation - missing data:', {
          hasProjectId: !!currentProjectId,
          hasSolfaText: !!currentSolfaText
        });
        return;
      }

      const sessionDuration = (new Date().getTime() - currentSessionStart.getTime()) / 1000;
      const changePercentage = currentLastVersionContent && currentSolfaText 
        ? generateSolfaDiff(currentLastVersionContent, currentSolfaText)
        : 0;
      const hasChanges = changePercentage > VERSION_THRESHOLDS.CHANGE_PERCENTAGE;
      
      console.log('📊 Version creation check:', {
        sessionDuration: `${sessionDuration}s`,
        changePercentage: `${changePercentage}%`,
        hasChanges,
        minDuration: VERSION_THRESHOLDS.MIN_SESSION_DURATION,
        minChangePercentage: VERSION_THRESHOLDS.CHANGE_PERCENTAGE,
        willCreateVersion: hasChanges && sessionDuration > VERSION_THRESHOLDS.MIN_SESSION_DURATION
      });
      
      if (hasChanges && sessionDuration > VERSION_THRESHOLDS.MIN_SESSION_DURATION) {
        // Use the correct API endpoint for version creation
        navigator.sendBeacon(`/api/sync/project-versions/${currentProjectId}`, JSON.stringify({
          notationContent: currentSolfaText,
          versionType: 'auto'
        }));
        
        console.log('✅ Version created on page unload via sendBeacon');
      }
    };

    // Only add listener once - no dependencies to avoid re-registration
    console.log('🔧 Registering beforeunload listener (should only happen once)');
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      console.log('🧹 Cleaning up beforeunload listener');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Empty dependency array - only runs once!

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