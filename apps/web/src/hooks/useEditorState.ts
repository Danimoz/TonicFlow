'use client'

import { useCallback, useReducer } from "react";
import { EditorAction, EditorPreferences, EditorState, ScoreElementReference } from "@/contexts/types";

function editorReducer(state: EditorState | null, action: EditorAction): EditorState | null {
  if (!state && action.type !== 'SET_EDITOR_STATE') return null;

  switch (action.type) {
    case 'SET_EDITOR_STATE':
      return action.payload;
    case 'SET_SIDEBAR_COLLAPSED':
      if (!state) return null;
      return { ...state, preferences: { ...state.preferences, sidebarCollapsed: action.payload } };
    case 'TOGGLE_SIDEBAR_COLLAPSED':
      if (!state) return null;
      return { ...state, preferences: { ...state.preferences, sidebarCollapsed: !state.preferences.sidebarCollapsed } };
    case 'SET_SOLFA_TEXT':
      if (!state) return null;
      return { ...state, solfaText: action.payload };
    case 'UPDATE_PREFERENCES':
      if (!state) return null;
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'SET_VIEW_MODE':
      if (!state) return null;
      return { ...state, preferences: { ...state.preferences, viewMode: action.payload } };
    case 'SET_PAGE_LAYOUT':
      if (!state) return null;
      return { ...state, preferences: { ...state.preferences, pageLayout: action.payload } };
    case 'SET_IS_PLAYING':
      if (!state) return null;
      return { ...state, isPlaying: action.payload };
    case 'TOGGLE_PLAYING':
      if (!state) return null;
      return { ...state, isPlaying: !state.isPlaying };
    case 'STOP_PLAYING':
      if (!state) return null;
      return { ...state, isPlaying: false };
    case 'SET_SELECTION':
      if (!state) return null;
      return { ...state, selection: action.payload };
    default:
      return state
  }
}

export function useEditorState() {
  const [state, dispatch] = useReducer(editorReducer, null);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR_COLLAPSED' });
  }, []);

  const updatePreferences = useCallback((preferences: Partial<EditorPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  const setSolfaText = useCallback((text: string) => {
    dispatch({ type: 'SET_SOLFA_TEXT', payload: text });
  }, []);

  const setPlaying = useCallback((isPlaying: boolean) => {
    dispatch({ type: 'SET_IS_PLAYING', payload: isPlaying });
  }, []);

  const togglePlaying = useCallback(() => {
    dispatch({ type: 'TOGGLE_PLAYING' });
  }, []);

  const stopPlayback = useCallback(() => {
    dispatch({ type: 'STOP_PLAYING' });
  }, []);

  const setViewMode = useCallback((mode: 'engrave' | 'write') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setPageLayout = useCallback((layout: 'horizontal' | 'vertical') => {
    dispatch({ type: 'SET_PAGE_LAYOUT', payload: layout });
  }, []);

  const setSelection = useCallback((selection: ScoreElementReference | undefined) => {
    dispatch({ type: 'SET_SELECTION', payload: selection });
  }, []);

  return {
    state,
    dispatch,
    setSidebarCollapsed,
    toggleSidebarCollapsed,
    updatePreferences,
    setSolfaText,
    setPlaying,
    togglePlaying,
    stopPlayback,
    setViewMode,
    setPageLayout,
    setSelection
  };
}