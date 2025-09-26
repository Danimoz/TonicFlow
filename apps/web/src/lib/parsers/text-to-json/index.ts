import { ScoreElementReference, TimeSignature } from "@/contexts/types";
import { Measure, ParsingError } from "../interfaces";
import { partMap } from "../parserUtils";
import { tokenize } from "./tokenizer";
import { parse } from "./parser";

const partKeys = Object.keys(partMap).sort((a, b) => b.length - a.length) // Sort by length descending to match longer keys first
const partRegex = new RegExp(`^(${partKeys.join('|')})\\.(.+)$`);

export function parseNotationToJSON(notation: string, timeSignature: TimeSignature) {
  const errors: ParsingError[] = [];
  const measures: Map<number, Measure> = new Map();
  const lines = notation.trim().split(/\n{2,}/);

  let globalPosition = 0;
  if (!lines[0]) return;

  const initialStartingMeasureNumber = getStartingMeasureNumber(lines[0], timeSignature);
  const partMeasureTrack: Map<string, number> = new Map();

  for (const line of lines) {
    const parts = line.split('\n');

    for (const part of parts) {
      const trimmedPart = part.trim();
      if (!trimmedPart) continue;
      const partData = getSongPartName(trimmedPart, globalPosition);
      if (!partData) continue;

      const { partName, partContent } = partData;
      globalPosition = partData.globalPosition;

      const startingMeasureForPart = partMeasureTrack.get(partName.long) ?? initialStartingMeasureNumber;

      const tokenForParts = tokenize(partContent as string)
      const { events, errors: partErrors, currentMeasure } = parse(tokenForParts, startingMeasureForPart, partName.long);
      partErrors.forEach(err => errors.push(err));

      partMeasureTrack.set(partName.long, currentMeasure);

      // Group events by measure number
      for (const event of events) {
        const measureNum = event.measureNumber
        let measure = measures.get(measureNum);
        if (!measure) {
          measure = { number: measureNum, parts: {} };
          if (measureNum === 0) {
            measure.isPickup = true;
          }
          measures.set(measureNum, measure);
        }
        (measure.parts[partName.long] ??= []).push(event);
      }
    }
  }
  return { measures, errors };
}

export function addDynamicToNote(solfaText: string, selection: ScoreElementReference, dynamic: string, timeSignature?: TimeSignature): string {
  const defaultTimeSignature: TimeSignature = { numerator: 4, denominator: 4 };
  const ts = timeSignature || defaultTimeSignature;

  // Parse the entire notation to get measure structure
  const parsed = parseNotationToJSON(solfaText, ts);
  if (!parsed) return solfaText;

  // Find the target measure by index from the parsed measures
  const measuresArray = Array.from(parsed.measures.values()).sort((a, b) => a.number - b.number);
  const targetMeasure = measuresArray[selection.measureIndex];
  if (!targetMeasure) return solfaText;

  // Split the text into systems
  const systemLines = solfaText.trim().split(/\n{2,}/);
  const targetSystem = systemLines[selection.systemIndex];
  if (!targetSystem) return solfaText;

  // Split system into part lines
  const partLines = targetSystem.split('\n');
  const targetPartLine = partLines[selection.partIndex];
  if (!targetPartLine) return solfaText;

  // Extract part label and content
  const partMatch = targetPartLine.match(partRegex);
  if (!partMatch) return solfaText;
  const partLabel = partMatch[1];
  const partContent = partMatch[2];
  if (!partLabel || !partContent) return solfaText;

  // Get the part name from the label
  const partName = partMap[partLabel as keyof typeof partMap];
  if (!partName) return solfaText;

  // Tokenize the part content to find all notes
  const tokens = tokenize(partContent);
  const noteTokens = tokens.filter(t => t && t.type === 'NOTE');

  if (selection.noteIndex >= noteTokens.length) return solfaText;

  // Get the target note token directly by index
  const targetNoteToken = noteTokens[selection.noteIndex];
  if (!targetNoteToken) return solfaText;

  let workingContent = partContent;

  // Look for existing dynamic before this note token
  const beforeNote = workingContent.substring(0, targetNoteToken.position);
  const afterNote = workingContent.substring(targetNoteToken.position);

  // Find the last dynamic bracket before this note
  const dynamicMatches = [...beforeNote.matchAll(/\[([^\]]+)\]/g)];
  const lastDynamicMatch = dynamicMatches[dynamicMatches.length - 1];

  let existingDynamic: string | null = null;
  let dynamicStartPos = -1;
  let dynamicEndPos = -1;

  if (lastDynamicMatch && lastDynamicMatch.index !== undefined && lastDynamicMatch[1]) {
    existingDynamic = lastDynamicMatch[1];
    dynamicStartPos = lastDynamicMatch.index;
    dynamicEndPos = lastDynamicMatch.index + lastDynamicMatch[0].length;
  }

  if (existingDynamic === dynamic) {
    // Toggle off - remove the existing dynamic
    workingContent = workingContent.substring(0, dynamicStartPos) + workingContent.substring(dynamicEndPos);
  } else {
    // Remove existing dynamic if present, then add new one
    if (existingDynamic) {
      workingContent = workingContent.substring(0, dynamicStartPos) + workingContent.substring(dynamicEndPos);
      // Recalculate target position after removal
      const adjustment = dynamicEndPos - dynamicStartPos;
      const newTargetPos = targetNoteToken.position - adjustment;
      workingContent = workingContent.substring(0, newTargetPos) + `[${dynamic}]` + workingContent.substring(newTargetPos);
    } else {
      // Just add the new dynamic before the note
      workingContent = beforeNote + `[${dynamic}]` + afterNote;
    }
  }

  // Rebuild the part line and system
  partLines[selection.partIndex] = `${partLabel}.${workingContent}`;
  systemLines[selection.systemIndex] = partLines.join('\n');

  return systemLines.join('\n\n');
}

function getSongPartName(partNotes: string, globalPosition: number) {
  const part = partNotes.match(partRegex);
  if (!part) {
    globalPosition += partNotes.length + 1;
    return null;
  }

  const [, partLabel, partContent] = part;
  const partName = partMap[partLabel as keyof typeof partMap];
  if (!partName) {
    globalPosition += (partLabel || partNotes).length + 1;
    return null;
  }
  return { partName, partContent, globalPosition };
}

/**
 * Determines if a musical part starts on measure 0 (pickup) or 1 (complete).
 * @param partContent The full notation string for a single part.
 * @param timeSignature The time signature for the piece.
 * @returns The starting measure number (0 or 1).
 */
export function getStartingMeasureNumber(partContent: string, timeSignature: TimeSignature) {
  const lines = partContent.split('\n');

  for (const line of lines) {
    const part = line.split(/\|\|?/)[0];
    if (!part) continue;

    const partData = getSongPartName(part, 0);
    if (!partData || !partData.partContent) continue;

    const { events } = parse(tokenize(partData.partContent), 1, partData.partName.long);
    const totalDuration = events.reduce((sum, event) => {
      if (event.type === 'note' || event.type === 'rest') return sum + (event.duration);
      return sum;
    }, 0);

    if (totalDuration == timeSignature.numerator) return 1; // short-circuit if full measure
  }
  return 0;
}