import { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { EditorAction, EditorContextValue, EditorPreferences, EditorState } from "./types";
import { getProjectFromIndexedDB, addProjectToIndexedDb, savePreferencesToIndexedDB, saveSolfaTextToIndexedDB, createProjectVersion } from "@/lib/dexie";
import { getProjectById } from "@/app/(dashboard)/actions";
import { generateSolfaDiff, getPreferencesFromProject } from "@/lib/editorUtils";
import { Project } from "@/app/(dashboard)/types";
import { useDebounce } from "use-debounce";

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

const DEBOUNCE_DELAYS = {
  SOLFA_TEXT: 2130,
  BACKEND_SYNC: 90000
} as const;

const VERSION_THRESHOLDS = {
  CHANGE_PERCENTAGE: 20,
  MIN_SESSION_DURATION: 180, // 3 minutes
  AUTO_VERSION_INTERVAL: 300 // 5 minutes
} as const

export function EditorProvider({ projectId, children }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSolfaText] = useDebounce(state?.solfaText, DEBOUNCE_DELAYS.SOLFA_TEXT);
  const [debouncedBackendSync] = useDebounce(state?.solfaText, DEBOUNCE_DELAYS.BACKEND_SYNC);

  // Track versioning state
  const [lastVersionContent, setLastVersionContent] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());

  const createInitialEditorState = useCallback((project: Project): EditorState => ({
    projectId: project.id,
    preferences: getPreferencesFromProject(project),
    solfaText: project.currentVersion?.notationContent || undefined,
    isPlaying: false,
  }), []);

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error occurred in ${context}:`, error);
    setError(`Failed to ${context}. Please try again.`);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setSessionStartTime(new Date());
      // check if projectId is new
      const newProjectJSON = sessionStorage.getItem("newProject");
      if (newProjectJSON) {
        const newProject = JSON.parse(newProjectJSON);
        if (newProject && newProject.id === projectId) {
          dispatch({ type: 'SET_EDITOR_STATE', payload: createInitialEditorState(newProject) });
          setLastVersionContent(newProject.currentVersion?.notationContent || '');
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
        setLastVersionContent(project.currentVersion?.notationContent || '');
      } else {
        dispatch({
          type: 'SET_EDITOR_STATE', payload: {
            projectId: indexedProject.id,
            preferences: indexedProject.preferences!,
            solfaText: indexedProject.currentVersion?.notationContent || undefined,
            isPlaying: false,
          }
        });
        setLastVersionContent(indexedProject.currentVersion?.notationContent || '');
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

  // Auto-save solfa text to IndexedDB when it changes (debounced)
  useEffect(() => {
    if (state?.projectId && debouncedSolfaText !== undefined) {
      saveSolfaTextToIndexedDB(state.projectId, debouncedSolfaText);
    }
  }, [state?.projectId, debouncedSolfaText]);

  // Sync with backend when solfa text changes (debounced)
  useEffect(() => {
    if (state?.projectId && debouncedBackendSync!== undefined) {
      const syncToBackend = async() => {
        try {
          await fetch(`/api/sync/project/${state.projectId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notationContent: debouncedBackendSync })
          });
        } catch (error) {
          console.error("Error syncing to backend:", error);
        }
      }
      syncToBackend();
    }
  }, [state?.projectId, debouncedBackendSync]);  

  const hasSignificantChanges = useCallback(() => {
    if (!lastVersionContent || !state?.solfaText) return false;
    const changePercentage = generateSolfaDiff(lastVersionContent, state.solfaText);
    return changePercentage > 20;
  }, [lastVersionContent, state?.solfaText]);

  // Auto-create version when the user leaves the page
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (!state?.projectId || !state.solfaText) return;
      
      const sessionDuration = (new Date().getTime() - sessionStartTime.getTime()) / 1000;
      const hasChanges = hasSignificantChanges();
      if (hasChanges && sessionDuration > 180) {
        await createProjectVersion(state.projectId, state.solfaText, 'auto');
        setLastVersionContent(state.solfaText);
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state?.projectId, debouncedSolfaText]);

  // Auto-create version when ther'e are significant changes or session duration is greater than 30 minutes
  useEffect(() => {
    if (!debouncedSolfaText || !state?.projectId) return
    const sessionDuration = (new Date().getTime() - sessionStartTime.getTime()) / 1000;

    const checkForVersionCreation = async () => {
      if (hasSignificantChanges() || sessionDuration > 1800){
        if (state.solfaText) {
          await createProjectVersion(state.projectId, state.solfaText, 'auto')
          setLastVersionContent(state.solfaText);
        }
      }
    }

    checkForVersionCreation()
  }, [hasSignificantChanges])


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