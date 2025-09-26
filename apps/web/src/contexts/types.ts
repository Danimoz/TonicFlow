import { Project } from "@/app/(dashboard)/types";

export interface EditorContextValue {
  state: EditorState | null;
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  layoutSettings: any; // Add proper type if available
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSolfaText: (text: string) => void;
  updatePreferences: (preferences: Partial<EditorPreferences>) => void;
  setPlaying: (isPlaying: boolean) => void;
  togglePlaying: () => void;
  stopPlayback: () => void;
  setViewMode: (mode: 'engrave' | 'write') => void;
  setPageLayout: (layout: 'horizontal' | 'vertical') => void;
  setSelection: (selection: ScoreElementReference | undefined) => void;
}

export interface EditorPreferences {
  sidebarCollapsed: boolean;
  bpm: number;
  keySignature: KeySignature;
  timeSignature: TimeSignature;
  viewMode: 'engrave' | 'write';
  pageLayout: 'horizontal' | 'vertical';
}

export interface KeySignature {
  key: string;
  mode: string;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface ScoreElementReference {
  systemIndex: number;
  measureIndex: number;
  partIndex: number;
  noteIndex: number;
  element: 'note' | 'lyric';
}

export interface EditorState {
  projectId: string;
  preferences: EditorPreferences;
  solfaText?: string;
  isPlaying: boolean;
  selection?: ScoreElementReference;
}

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  sidebarCollapsed: false,
  bpm: 100,
  keySignature: { key: "C", mode: "major" },
  timeSignature: { numerator: 4, denominator: 4 },
  viewMode: 'write',
  pageLayout: 'horizontal'
};

export type EditorAction =
  | { type: 'SET_EDITOR_STATE'; payload: EditorState }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR_COLLAPSED' }
  | { type: 'SET_SOLFA_TEXT'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<EditorPreferences> }
  | { type: 'SET_VIEW_MODE'; payload: 'engrave' | 'write' }
  | { type: 'SET_PAGE_LAYOUT'; payload: 'horizontal' | 'vertical' }
  | { type: 'SET_IS_PLAYING'; payload: boolean }
  | { type: 'TOGGLE_PLAYING' }
  | { type: 'STOP_PLAYING' }
  | { type: 'SET_SELECTION'; payload: ScoreElementReference | undefined };

export interface EditorLayoutSettings {
  page: {
    width: number;
    height: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  noteSpacingMultiplier: number;
  measureSpacing: number;
  systemSpacing: number;
  pageGap: number
}