'use client';

import { useEditor } from "@/contexts/editor-context";
import { Edit, Eye, Monitor, Pause, Play, Smartphone, Square } from "lucide-react";
import { useEffect } from "react";

export interface SidebarAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  isActive?: boolean;
  group: string;
}

export function useSidebarActions() {
  const {
    state,
    setViewMode,
    setPageLayout,
    stopPlayback,
    togglePlaying,
  } = useEditor();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Avoid interfering with form inputs or other focusable elements
      if (event.target instanceof HTMLElement && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable)) {
        return;
      }

      if (state?.preferences.viewMode === 'engrave') {
        if (event.key === ' ' || event.code === 'Space') {
          event.preventDefault();
          togglePlaying();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state?.preferences.viewMode, togglePlaying]);

  const actions: SidebarAction[] = [
    {
      id: 'engrave-mode',
      label: 'Engrave Mode',
      icon: Eye,
      onClick: () => setViewMode('engrave'),
      isActive: state?.preferences.viewMode === 'engrave',
      group: 'view'
    },
    {
      id: 'write-mode',
      label: 'Write Mode',
      icon: Edit,
      onClick: () => setViewMode('write'),
      isActive: state?.preferences.viewMode === 'write',
      group: 'view'
    },
    {
      id: 'play-pause',
      label: state?.isPlaying ? 'Pause Playback' : 'Play Playback',
      icon: state?.isPlaying ? Pause : Play,
      onClick: togglePlaying,
      group: 'playback'
    },
    {
      id: 'stop',
      label: 'Stop Playback',
      icon: Square,
      onClick: stopPlayback,
      group: 'playback'
    },
    {
      id: 'vertical-pages',
      label: 'Vertical Pages',
      icon: Monitor,
      onClick: () => setPageLayout('vertical'),
      isActive: state?.preferences.pageLayout === 'vertical',
      group: 'layout'
    },
    {
      id: 'horizontal-pages',
      label: 'Horizontal Pages',
      icon: Smartphone,
      onClick: () => setPageLayout('horizontal'),
      isActive: state?.preferences.pageLayout === 'horizontal',
      group: 'layout'
    }
  ]

  // Group actions by their group property
  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.group]) acc[action.group] = [];
    acc[action.group]!.push(action);
    return acc;
  }, {} as Record<string, SidebarAction[]>);

  return { actions, groupedActions, state };
}