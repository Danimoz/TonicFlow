import { Project } from "@/app/(dashboard)/types";
import { DEFAULT_EDITOR_PREFERENCES, EditorLayoutSettings, EditorPreferences, KeySignature, TimeSignature } from "@/contexts/types";
import { diffArrays } from "diff";

export function getPreferencesFromProject(project: Project): EditorPreferences {
  return {
    sidebarCollapsed: DEFAULT_EDITOR_PREFERENCES.sidebarCollapsed,
    bpm: parseBPM(project.tempo),
    keySignature: parseKeySignature(project.keySignature),
    timeSignature: parseTimeSignature(project.timeSignature),
    viewMode: project.preferences?.viewMode || DEFAULT_EDITOR_PREFERENCES.viewMode,
    pageLayout: project.preferences?.pageLayout || DEFAULT_EDITOR_PREFERENCES.pageLayout
  };
}

function parseKeySignature(keySignature?: string): KeySignature {
  if (!keySignature) return DEFAULT_EDITOR_PREFERENCES.keySignature || { key: "C", mode: "major" };
  const normalized = keySignature.trim();

  if (normalized.toLowerCase().includes('major') || normalized.toLowerCase().includes('maj')) {
    const key = normalized.replace(/major|maj/i, '').trim();
    return { key: key || 'C', mode: 'major' };
  }
  if (normalized.toLowerCase().includes('minor') || normalized.toLowerCase().includes('min')) {
    const key = normalized.replace(/minor|min/i, '').trim();
    return { key: key || 'A', mode: 'minor' };
  }
  if (normalized.endsWith('m') && normalized.length > 1) {
    const key = normalized.slice(0, -1).trim();
    return { key, mode: 'minor' };
  }
  return { key: normalized, mode: 'major' };
}

function parseTimeSignature(timeSignature?: string): TimeSignature {
  if (!timeSignature) return { numerator: 4, denominator: 4 };

  const parts = timeSignature.split('/');
  if (parts.length !== 2) return { numerator: 4, denominator: 4 };

  const numerator = parseInt(parts[0]!, 10);
  const denominator = parseInt(parts[1]!, 10);

  if (isNaN(numerator) || isNaN(denominator) || numerator <= 0 || denominator <= 0) {
    return { numerator: 4, denominator: 4 };
  }

  return { numerator, denominator };
}

function parseBPM(bpm?: string | number): number {
  if (typeof bpm === 'undefined' || bpm === null) return DEFAULT_EDITOR_PREFERENCES.bpm || 120;
  if (typeof bpm === 'number') return bpm;

  if (typeof bpm === 'string') {
    // First try to parse as a number
    const parsed = parseInt(bpm, 10);
    if (!isNaN(parsed)) return parsed;

    // Handle musical tempo markings
    const tempoMarkings: Record<string, number> = {
      'largo': 50,
      'larghetto': 65,
      'adagio': 75,
      'andante': 90,
      'andantino': 105,
      'moderato': 115,
      'allegretto': 125,
      'allegro': 140,
      'vivace': 165,
      'presto': 185,
      'prestissimo': 200
    };

    const normalizedTempo = bpm.toLowerCase().trim();
    return tempoMarkings[normalizedTempo] || DEFAULT_EDITOR_PREFERENCES.bpm || 120;
  }
  return DEFAULT_EDITOR_PREFERENCES.bpm || 120;
}

export function tokenizeSolfa(notation: string): string[] {
  const tokenRegex =
    /~?[a-zA-Zₗ²′″]+(?:\([^)]*\))?(?:\{[^}]*\})?(?:~)?|\|\||\||:|\.|-|\^[ ]?|@[\w#b]+|#\d+\/\d+|R\d+|\*[^\*]+\*|\&\d+|DS|DC|\$|\[[^\]]+\]|\+/g;
  return notation.match(tokenRegex) || [];
}

export function generateSolfaDiff(oldNotation: string, newNotation: string) {
  const oldTokens = tokenizeSolfa(oldNotation);
  const newTokens = tokenizeSolfa(newNotation);

  const changes = diffArrays(oldTokens, newTokens);
  let changedItems = 0;
  for (const part of changes) {
    if (part.added || part.removed) {
      changedItems += part.count;
    }
  }

  const totalTokens = Math.max(oldTokens.length, newTokens.length);
  const changePercentage = totalTokens > 0 ? (changedItems / totalTokens) * 100 : 0;
  return changePercentage;
}

export const defaultEditorLayoutSettings: EditorLayoutSettings = {
  page: {
    width: 900,
    height: 1200,
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  },
  systemSpacing: 100,
  measureSpacing: 20,
  noteSpacingMultiplier: 1.0,
  pageGap: 40,
};