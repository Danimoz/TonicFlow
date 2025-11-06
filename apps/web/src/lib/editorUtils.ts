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
      top: 72,
      bottom: 40,
      left: 45,
      right: 45,
    },
  },
  systemSpacing: 100,
  measureSpacing: 20,
  noteSpacingMultiplier: 1.0,
  pageGap: 40,
};


/**
 * Aligns tonic solfa notation by ensuring colons (:) are vertically aligned on the tonic solfa editor.
 * The function preserves the original structure while improving readability through alignment.
 * 
 * @param notation - The tonic solfa notation string to be aligned.
 * @returns The aligned tonic solfa notation string.
 */
export function alignTonicSolfa(notation: string) {
  const lines = notation.trim().split(/\n{2,}/);
  const processedLines: string[] = [];

  for (const line of lines) {
    const parts = line.split('\n').filter(line => line.trim() !== '');
    if (parts.length === 0) continue;

    // Split each part into measures
    const measuresByPart = parts.map(part => part.split('|').map(measure => measure.trim()));
    const numMeasures = Math.max(...measuresByPart.map(measures => measures.length));
    
    // For each measure, we need to analyze the colon positions and align them
    const alignedParts: string[][] = [];

    for (let measureIndex = 0; measureIndex < numMeasures; measureIndex++) {
      // Get all measures at this index from all parts
      const measuresAtIndex = measuresByPart.map(measures => measures[measureIndex] || '');
      
      // Parse each measure to find colon positions and segments
      const parsedMeasures = measuresAtIndex.map(measure => parseMeasureSegments(measure));
      
      // Find the maximum number of segments across all parts for this measure
      const maxSegments = Math.max(...parsedMeasures.map(parsed => parsed.segments.length));
      
      // First pass: calculate aligned segments for all measures
      const tempAlignedMeasures: string[] = [];
      
      for (let partIndex = 0; partIndex < parsedMeasures.length; partIndex++) {
        if (!measuresAtIndex[partIndex] || (measuresAtIndex[partIndex] ?? '').trim() === '') {
          tempAlignedMeasures.push('');
          continue;
        }

        const parsedMeasure = parsedMeasures[partIndex];
        if (parsedMeasure && parsedMeasure.segments.length === 1 && parsedMeasure.segments[0] === '') {
          tempAlignedMeasures.push('');
          continue;
        }

        if (maxSegments === 1) {
          // If all measures have only one segment, no colon alignment needed
          const segment = parsedMeasure?.segments[0] || '';
          const maxWidth = Math.max(...parsedMeasures.map(parsed => getSegmentVisualWidth(parsed.segments[0] || '')));
          const paddedSegment = segment.padEnd(maxWidth, ' ');
          
          // Preserve any trailing colon from the original
          let alignedMeasure = paddedSegment;
          if (parsedMeasure && (parsedMeasure.originalStructure.endsWith(' :') || parsedMeasure.originalStructure.endsWith(':'))) {
            alignedMeasure += ' :';
          }
          
          tempAlignedMeasures.push(alignedMeasure);
          continue;
        }

        // For measures with multiple segments, align them
        const segments = parsedMeasure?.segments ?? [];
        const hasColons = parsedMeasure?.hasColons ?? [];
        const alignedSegments: string[] = [];
        
        for (let segmentIndex = 0; segmentIndex < maxSegments; segmentIndex++) {
          const segment = segments[segmentIndex] || '';
          
          // Find the maximum width needed for this segment position across all parts
          const maxSegmentWidth = Math.max(
            ...parsedMeasures.map(parsed => getSegmentVisualWidth(parsed?.segments[segmentIndex] || ''))
          );
          
          // Pad the segment to match the maximum width
          const paddedSegment = segment.padEnd(maxSegmentWidth, ' ');
          alignedSegments.push(paddedSegment);
        }
        
        // Reconstruct the measure preserving original colon structure
        let alignedMeasure = '';
        for (let i = 0; i < alignedSegments.length; i++) {
          alignedMeasure += alignedSegments[i];
          
          // Only add colon if it existed in the original structure
          if (i < hasColons.length && hasColons[i]) {
            alignedMeasure += ' : ';
          }
        }
        
        // Clean up any trailing spaces
        alignedMeasure = alignedMeasure.replace(/\s+$/, '');
        
        // Handle cases where the original measure ended with specific patterns
        const originalMeasure = measuresAtIndex[partIndex];
        if (originalMeasure && (originalMeasure.endsWith(' :') || originalMeasure.endsWith(':'))) {
          alignedMeasure += ' :';
        }
        
        tempAlignedMeasures.push(alignedMeasure);
      }
      
      // Second pass: ensure all measures have the same total width for barline alignment
      const maxMeasureWidth = Math.max(...tempAlignedMeasures.map(measure => measure.length));
      const alignedMeasures = tempAlignedMeasures.map(measure => 
        measure.padEnd(maxMeasureWidth, ' ')
      );
      
      // Store aligned measures for this measure index
      for (let partIndex = 0; partIndex < alignedMeasures.length; partIndex++) {
        let partMeasures = alignedParts[partIndex];
        if (!Array.isArray(partMeasures)) {
          partMeasures = [];
          alignedParts[partIndex] = partMeasures;
        }
        partMeasures[measureIndex] = alignedMeasures[partIndex] ?? '';
      }
    }

    // Join measures with proper barline spacing and parts with newlines
    const alignedLine = alignedParts.map(partMeasures => joinMeasuresWithBarlines(partMeasures)).join('\n');
    processedLines.push(alignedLine);
  }

  return processedLines.join('\n\n');
}

// Helper function to join measures with proper barline spacing
function joinMeasuresWithBarlines(measures: string[]): string {
  if (measures.length === 0) return '';
  if (measures.length === 1) return measures[0] ?? '';
  
  let result = measures[0] ?? '';
  
  for (let i = 1; i < measures.length; i++) {
    const currentMeasure = measures[i] ?? '';
    
    // Check if current measure is empty (which indicates a double barline ||)
    // When splitting by '|', an empty string between two '|' characters means we had '||'
    const isDoubleBarline = currentMeasure.trim() === '';
    
    if (isDoubleBarline) {
      // For double barlines, don't add spaces: || instead of | |
      result += '|';
      // Don't add the empty measure content
    } else {
      // For regular barlines, add spaces: | content |
      result += ' | ' + currentMeasure;
    }
  }
  
  return result;
}

// Helper function to calculate the visual width of a segment (accounting for display formatting)
function getSegmentVisualWidth(segment: string): number {
  if (!segment || segment.trim() === '') return 0;
  // For segments with special notation like ~l(pil-), the visual width is the full string length. This ensures proper alignment when segments contain bracketed content.
  return segment.length;
}

// Helper function to parse measure segments and track colon positions
function parseMeasureSegments(measure: string): { segments: string[], hasColons: boolean[], originalStructure: string } {
  if (!measure || measure.trim() === '') return { segments: [''], hasColons: [], originalStructure: measure };
  
  // Smart splitting that respects bracketed content and complex notation
  const segments: string[] = [];
  const hasColons: boolean[] = []; // Track where colons existed
  let currentSegment = '';
  let bracketDepth = 0;
  let angleDepth = 0;
  let parenDepth = 0;
  
  for (let i = 0; i < measure.length; i++) {
    const char = measure[i];
    
    // Track bracket depths to avoid splitting inside bracketed content
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;
    else if (char === '[') bracketDepth++;
    else if (char === ']') bracketDepth--;
    else if (char === '<') angleDepth++;
    else if (char === '>') angleDepth--;
    
    // Only split on colons when we're not inside any brackets
    if (char === ':' && bracketDepth === 0 && angleDepth === 0 && parenDepth === 0) {
      segments.push(currentSegment.trim());
      hasColons.push(true); // Mark that there was a colon after this segment
      currentSegment = '';
    } else {
      currentSegment += char;
    }
  }
  
  // Add the last segment
  segments.push(currentSegment.trim());
  
  // Handle edge cases where measure starts with colon
  if (measure.startsWith(':') && segments.length > 0 && segments[0] !== '') {
    segments.unshift('');
    hasColons.unshift(true);
  }
  
  // Ensure we have at least one segment
  if (segments.length === 0) return { segments: [''], hasColons: [], originalStructure: measure };
  return { segments, hasColons, originalStructure: measure };
}