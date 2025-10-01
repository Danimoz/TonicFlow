import { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  
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
          // Smart conflict resolution: Compare timestamps to determine which content is newer
          const backendVersion = project.currentVersion;
          const indexedVersion = indexedProject.currentVersion;
          
          let latestContent: string | undefined;
          let contentSource: 'backend' | 'indexed' = 'indexed';
          
          if (backendVersion && indexedVersion) {
            const backendTime = new Date(backendVersion.updatedAt).getTime();
            const indexedTime = new Date(indexedVersion.updatedAt).getTime();
            
            if (backendTime > indexedTime) {
              // Backend has newer content
              latestContent = backendVersion.notationContent;
              contentSource = 'backend';
              console.log('Using backend content (newer):', { backendTime, indexedTime });
            } else {
              // IndexedDB has newer or equal content
              latestContent = indexedVersion.notationContent;
              contentSource = 'indexed';
              console.log('Using IndexedDB content (newer or equal):', { backendTime, indexedTime });
            }
          } else {
            // Fallback to available content
            latestContent = indexedVersion?.notationContent || backendVersion?.notationContent || undefined;
            console.log('Using fallback content:', { hasIndexed: !!indexedVersion, hasBackend: !!backendVersion });
          }
          
          dispatch({
            type: 'SET_EDITOR_STATE', payload: {
              projectId: indexedProject.id,
              preferences: indexedProject.preferences!,
              solfaText: latestContent,
              isPlaying: false,
            }
          });
          setLastVersionContent(latestContent || '');
          
          // If backend content was newer, update IndexedDB to sync local cache
          if (contentSource === 'backend' && backendVersion) {
            console.log('Updating IndexedDB with newer backend content');
            // Update the local IndexedDB with the newer backend content
            import('@/lib/dexie').then(({ saveSolfaTextToIndexedDB }) => {
              saveSolfaTextToIndexedDB(projectId, backendVersion.notationContent).catch(error => {
                console.error('Failed to update IndexedDB with backend content:', error);
              });
            });
          }
        }
      } catch (error) {
        console.error("Failed to load project:", error);
        // If project not found, redirect to 404 page
        if ((error as any).isNotFound || error instanceof Error && error.message === "Project not found") {
          router.push('/not-found');
          return;
        }
        // For other errors, set error state but don't redirect
        setError("Failed to load project. Please try again.");
      }

      setIsLoading(false);
    };

    initialize();
  }, [projectId, dispatch, createInitialEditorState, loadProject, loadProjectFromSession, setError, setIsLoading, setLastVersionContent, setSessionStartTime, router]);

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