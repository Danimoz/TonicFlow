import { Project } from "@/app/(dashboard)/types";
import { DEFAULT_EDITOR_PREFERENCES, EditorPreferences, KeySignature, TimeSignature } from "@/contexts/types";

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