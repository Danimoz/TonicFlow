import { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { EditorAction, EditorContextValue, EditorPreferences, EditorState } from "./types";
import { getProjectFromIndexedDB, addProjectToIndexedDb, savePreferencesToIndexedDB } from "@/lib/dexie";
import { getProjectById } from "@/app/(dashboard)/actions";
import { getPreferencesFromProject } from "@/lib/editorUtils";
import { Project } from "@/app/(dashboard)/types";

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

interface EditorProviderProps {
  projectId: string;
  children: React.ReactNode;
}

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
    default:
      return state
  }
}

export function EditorProvider({ projectId, children }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, null);
  const [isLoading, setIsLoading] = useState(false);

  const createInitialEditorState = (project: Project): EditorState => ({
    projectId: project.id,
    preferences: getPreferencesFromProject(project),
    solfaText: project.currentVersion?.notationContent || undefined,
    isPlaying: false,
  });

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      // check if projectId is new
      const newProjectJSON = sessionStorage.getItem("newProject");
      if (newProjectJSON) {
        const newProject = JSON.parse(newProjectJSON);
        if (newProject && newProject.id === projectId) {
          dispatch({ type: 'SET_EDITOR_STATE', payload: createInitialEditorState(newProject) });
          sessionStorage.removeItem("newProject");
          setIsLoading(false);
          return;
        }
      }
      // If not new project, load from IndexedDB or API
      await loadProject(projectId);
      setIsLoading(false);
    }
    initialize();
  }, [projectId])

  const loadProject = async (projectId: string) => {
    try {
      const project = await getProjectById(projectId);
      if (!project) throw new Error("Project not found");
      const indexedProject = await getProjectFromIndexedDB(projectId);
      if (!indexedProject) {
        await addProjectToIndexedDb(project);
        dispatch({ type: 'SET_EDITOR_STATE', payload: createInitialEditorState(project) });
      } else {
        dispatch({
          type: 'SET_EDITOR_STATE', payload: {
            projectId: indexedProject.id,
            preferences: indexedProject.preferences!,
            solfaText: indexedProject.currentVersion?.notationContent || undefined,
            isPlaying: false,
          }
        });
      }
    } catch (error) {
      console.error("Error loading project:", error);
      return;
    }
  };

  useEffect(() => {
    if (state?.projectId && state.preferences) {
      // Save preferences to IndexedDB whenever the projectId or preferences change
      savePreferencesToIndexedDB(state.projectId, state.preferences);
    }
  }, [state?.projectId, state?.preferences]);

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

  const contextValue: EditorContextValue = {
    state,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    setSolfaText,
    updatePreferences,
    setPlaying,
    togglePlaying,
    stopPlayback,
    setViewMode,
    setPageLayout
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}