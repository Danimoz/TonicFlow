import { createContext, useContext, useEffect } from "react";
import { EditorContextValue } from "./types";
import { useEditorState } from "@/hooks/useEditorState";
import { useProjectLoader } from "@/hooks/useProjectLoader";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useVersioning } from "@/hooks/useVersioning";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

interface EditorProviderProps {
  projectId: string;
  children: React.ReactNode;
}

export function EditorProvider({ projectId, children }: EditorProviderProps) {
  // Initialize all hooks
  const {
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
  } = useEditorState();

  const {
    project,
    setProject,
    isLoading,
    setIsLoading,
    error,
    setError,
    createInitialEditorState,
    loadProject,
    loadProjectFromSession
  } = useProjectLoader();

  const { layoutSettings } = useLayoutSettings();
  const { debouncedSolfaText } = useAutoSave(state?.projectId, state?.solfaText, state?.preferences);
  const { setLastVersionContent, setSessionStartTime } = useVersioning(state?.projectId, state?.solfaText, debouncedSolfaText);

  // Initialize project on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      setSessionStartTime(new Date());

      // Check if projectId is new
      const newProject = loadProjectFromSession(projectId);
      if (newProject) {
        dispatch({ type: 'SET_EDITOR_STATE', payload: createInitialEditorState(newProject) });
        setLastVersionContent(newProject.currentVersion?.notationContent || '');
        setIsLoading(false);
        return;
      }

      // If not new project, load from IndexedDB or API
      try {
        const { project, indexedProject } = await loadProject(projectId);
        if (!indexedProject) {
          dispatch({ type: 'SET_EDITOR_STATE', payload: createInitialEditorState(project) });
          setLastVersionContent(project.currentVersion?.notationContent || '');
        } else {
          dispatch({
            type: 'SET_EDITOR_STATE', payload: {
              projectId: indexedProject.id,
              preferences: indexedProject.preferences!,
              solfaText: project.currentVersion?.notationContent || undefined,
              isPlaying: false,
            }
          });
          setLastVersionContent(project.currentVersion?.notationContent || '');
        }
      } catch (error) {
        console.error("Failed to load project:", error);
      }

      setIsLoading(false);
    };

    initialize();
  }, [projectId, dispatch, createInitialEditorState, loadProject, loadProjectFromSession, setError, setIsLoading, setLastVersionContent, setSessionStartTime]);

  const contextValue: EditorContextValue = {
    state,
    project,
    isLoading,
    error,
    layoutSettings,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    setSolfaText,
    updatePreferences,
    setPlaying,
    togglePlaying,
    stopPlayback,
    setViewMode,
    setPageLayout,
    setSelection
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