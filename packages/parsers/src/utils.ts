import { KeySignature, TimeSignature } from "./interfaces.js";
import { MeasureAttributes, TempoInfo, TextArray, XMLNote, XMLNoteLyric, XMLNotePitch } from "./types.js";

interface ProcessedEvent {
  symbol: string;
  durationInBeats: number;
  beatStartsOn: number;
  originalEvent: XMLNote;
}

export const partMap: { [key: string]: { long: string; short: string } } = {
  S: { long: "Soprano", short: "S" },
  A: { long: "Alto", short: "A" },
  T: { long: "Tenor", short: "T" },
  B: { long: "Bass", short: "B" },
  'S I': { long: "Soprano I", short: "S I" },
  'S II': { long: "Soprano II", short: "S II" },
  'S III': { long: "Soprano III", short: "S III" },
  MS: { long: "Mezzo-Soprano", short: "MS" },
  'A I': { long: "Alto I", short: "A I" },
  'A II': { long: "Alto II", short: "A II" },
  'A III': { long: "Alto III", short: "A III" },
  'T I': { long: "Tenor I", short: "T I" },
  'T II': { long: "Tenor II", short: "T II" },
  'T III': { long: "Tenor III", short: "T III" },
  'B I': { long: "Bass I", short: "B I" },
  'B II': { long: "Bass II", short: "B II" },
  'B III': { long: "Bass III", short: "B III" },
  Bar: { long: "Baritone", short: "Bar" },
  Vln: { long: "Violin", short: "Vln." },
  Vln1: { long: "Violin 1", short: "Vln I." },
  Vln2: { long: "Violin 2", short: "Vln II." },
  Vla: { long: "Viola", short: "Vla." },
  Vc: { long: "Cello", short: "Vc." },
  Cb: { long: "Contrabass", short: "Cb." },
  Db: { long: "Doublebass", short: "Db." },
  Fl: { long: "Flute", short: "Fl." },
  Ob: { long: "Oboe", short: "Ob." },
  Cl: { long: "Clarinet", short: "Cl." },
  Bsn: { long: "Bassoon", short: "Bsn." },
  Hn: { long: "Horn", short: "Hn." },
  Tpt: { long: "Trumpet", short: "Tpt." },
  Tbn: { long: "Trombone", short: "Tbn." },
  Euph: { long: "Euphonium", short: "Euph." },
  Tuba: { long: "Tuba", short: "Tuba." },
  Perc: { long: "Percussion", short: "Perc." },
  Hp: { long: "Harp", short: "Hp." },
  Pno: { long: "Piano", short: "Pno." },
  Org: { long: "Organ", short: "Org." },
  Gtr: { long: "Guitar", short: "Gtr." },
  ElGtr: { long: "Electric Guitar", short: "ElGtr." },
  BsGtr: { long: "Bass Guitar", short: "BsGtr." },
  Drms: { long: "Drums", short: "Drms." }
}

const solfaNoteKeyMap: { [key: string]: Record<string, string> } = {
  C: { C: 'd', 'C#': 'de', Db: 'ra', D: 'r', 'D#': 're', Eb: 'ma', E: 'm', F: 'f', 'F#': 'fe', Gb: 'fe', G: 's', 'G#': 'se', Ab: 'la', A: 'l', 'A#': 'le', Bb: 'ta', B: 't' },
  'C#': { 'C#': 'd', D: 'de', 'D#': 'r', E: 're', Fb: 'ma', F: 'm', 'F#': 'f', G: 'fe', 'G#': 's', A: 'se', 'A#': 'l', B: 'ta', C: 't' },
  Db: { Db: 'd', D: 'de', Eb: 'r', E: 're', Fb: 'ma', F: 'm', Gb: 'f', 'G': 'fe', Ab: 's', A: 'se', Bb: 'l', B: 'ta', C: 't' },
  D: { D: 'd', 'D#': 'de', Eb: 'ra', E: 'r', 'E#': 're', F: 'ma', 'F#': 'm', 'Gb': 'm', G: 'f', 'G#': 'fe', Ab: 'fe', A: 's', 'A#': 'se', Bb: 'la', B: 'l', 'B#': 'le', C: 'ta', 'C#': 't' },
  Eb: { Eb: 'd', E: 'de', Fb: 'ra', F: 'r', 'F#': 're', Gb: 'ma', G: 'm', Ab: 'f', 'G#': 'f', A: 'fe', 'A#': 's', Bb: 's', B: 'se', Cb: 'la', C: 'l', 'C#': 'le', Db: 'ta', D: 't' },
  E: { E: 'd', 'E#': 'ra', F: 'de', 'F#': 'r', G: 're', 'G#': 'm', A: 'f', 'A#': 'fe', Bb: 'fe', B: 's', C: 'se', 'C#': 'l', D: 'ta', 'D#': 't' },
  F: { F: 'd', 'F#': 'de', Gb: 'ra', G: 'r', 'G#': 're', Ab: 'ma', A: 'm', Bb: 'f', B: 'fe', C: 's', 'C#': 'se', Db: 'la', D: 'l', 'D#': 'le', Eb: 'ta', E: 't' },
  'F#': { 'F#': 'd', G: 'de', 'G#': 'r', A: 're', 'A#': 'm', B: 'f', 'B#': 'fe', C: 'fe', 'C#': 's', D: 'se', 'D#': 'l', E: 'ta', F: 't' },
  'Gb': { Gb: 'd', G: 'de', Ab: 'r', A: 're', Bb: 'm', B: 'f', C: 'fe', Db: 's', D: 'se', Eb: 'l', E: 'ta', F: 't' },
  G: { G: 'd', 'G#': 'de', Ab: 'ra', A: 'r', 'A#': 're', Bb: 'ma', B: 'm', C: 'f', 'C#': 'fe', D: 's', 'D#': 'se', Eb: 'la', E: 'l', 'E#': 'le', F: 'ta', 'F#': 't' },
}

export const getOctaveNumber = (note: string): number => {
  let octave = 0
  const octaveChar = note.slice(-1);
  if (["″", "²"].includes(octaveChar)) octave = 2;
  else if (["'", "’"].includes(octaveChar)) octave = 1;
  else if (["ₗ"].includes(octaveChar)) octave = -1;
  else if (["₂"].includes(octaveChar)) octave = -2;

  return octave;
}

export const getKeyFromXML = (
  fifth: number,
  mode: string
): { key: string; mode: string } => {
  const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
  const sharpKeys = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];

  if (fifth === 0) {
    return { key: mode === 'minor' ? 'A' : 'C', mode };
  }

  const keyList = fifth < 0 ? flatKeys : sharpKeys;
  const index = Math.abs(fifth) - 1;

  const key = keyList[index] ?? 'C';
  return { key, mode };
};

export function parseXMLMeasureAttributes(raw: unknown): MeasureAttributes {
  if (!raw || typeof raw !== "object") return {}
  const obj = raw as Record<string, any>;

  let key: KeySignature | undefined
  const rawKey = obj['key'];
  if (rawKey && typeof rawKey === 'object') {
    const fifths = Number(rawKey['fifths'])
    const mode = String(rawKey["mode"] ?? "").toLowerCase();
    const { key: k, mode: m } = getKeyFromXML(fifths, mode)
    key = { key: k, mode: m }
  }

  let time: TimeSignature | undefined;
  const rawTime = obj["time"];
  if (rawTime && typeof rawTime === 'object') {
    const beats = Number(rawTime["beats"])
    const beatType = Number(rawTime["beat-type"]);
    if (Number.isFinite(beats) && Number.isFinite(beatType)) {
      time = { numerator: beats, denominator: beatType }
    }
  }

  let division: number | undefined;
  const rawDiv = obj["divisions"];
  if (rawDiv && !isNaN(Number(rawDiv))) {
    division = Number(rawDiv)
  }

  return { key, time, division }
}

export function updateAttributeSnapshot(
  snapshot: { initialKey?: KeySignature, initialTime?: TimeSignature, currentKey?: KeySignature, currentTime?: TimeSignature, currentDivision?: number },
  attrs: MeasureAttributes,
  seenFirstAttributes: { value: boolean }
) {
  if (attrs.key) {
    snapshot.currentKey = attrs.key;
    if (!seenFirstAttributes.value && !snapshot.initialKey) {
      snapshot.initialKey = attrs.key;
    }
  }
  if (attrs.time) {
    snapshot.currentTime = attrs.time;
    if (!seenFirstAttributes.value && !snapshot.initialTime) {
      snapshot.initialTime = attrs.time;
      seenFirstAttributes.value = true
    }
  }
  if (attrs.division) {
    snapshot.currentDivision = attrs.division;
  }
}

export function hasChanged<T extends object, K extends keyof T>(a: T | undefined, b: T | undefined, keys: K[]): boolean {
  if (!a || !b) return !!a !== !!b;
  return keys.some(key => a[key] !== b[key]);
}

export function detectClosedScore(partName: string) {
  const validVocalParts = ['Soprano', 'Alto', 'Tenor', 'Baritone', 'Bass', 'S', 'A', 'T', 'B'];

  const singlePattern = /^(Soprano|Alto|Tenor|Baritone|Bass|S|A|T|B)(\s+[IVX\d]+)?$/i;
  if (singlePattern.test(partName.trim())) {
    return partName
  }

  const parts = partName.split(/[,\s]+/).filter(p => p.trim().length > 0);
  const allValid = parts.every(part => {
    const partName = part.replace(/\s*[IVX\d]+$/i, '').trim();
    return validVocalParts.some(valid => valid.toLowerCase() === partName.toLowerCase());
  })
  if (!allValid) return null;
  return parts
}

export function parseXMLNotes(
  notes: XMLNote[],
  currentKey: KeySignature,
  currentTime: TimeSignature,
  division: number,
  part: string,
  slurState: boolean,
  isTieActive: boolean,
  timeChanged: boolean,
  keyChanged: boolean,
  barNumber: number
): { solfaString: string, newSlurState: boolean, newTieState: boolean } {
  const keyMap = getKeyMap(currentKey);
  if (!keyMap) {
    throw new Error(`No solfa key map found for key: ${currentKey.key}`);
  }

  const processedEvents: ProcessedEvent[] = []
  let currentBeat = 1

  // --- PASS 1: Convert event to symbols and store beat info ---
  const beatScale = currentTime.denominator === 8 ? 2 : 1;

  let n = 0;
  while (n < notes.length) {
    const note = notes[n] as XMLNote;
    const nextNote = n < notes.length - 1 ? notes[n + 1] : null;

    let symbol = '';
    const beatValue = (note?.duration ? note.duration / division : 0) * beatScale;

    if (note?.rest !== undefined) {
      symbol = getRestNotation(note, currentTime) || '';
    } else if (note?.pitch) {
      symbol = getXMLSolfaNote(note.pitch, currentKey, keyMap, part);
      if (nextNote?.pitch && nextNote.chord !== undefined) {
        const chordNote = getXMLSolfaNote(nextNote.pitch, currentKey, keyMap, part)
        let lyricText = '';
        if (note.lyric) {
          if (Array.isArray(note.lyric)) {
            note.lyric.forEach((line, idx) => {
              const isLast = idx === (note.lyric as XMLNoteLyric[]).length - 1;
              if (isLast) lyricText += line.text;
              else lyricText += `${line.text} +`;
            })
          } else {
            lyricText = note.lyric.text;
          }
          lyricText = `(${lyricText})`;
        }
        symbol = `${chordNote}${lyricText}{${symbol}}`;
        n++; // Skip the chord note
      } else {
        if (note.lyric) {
          if (Array.isArray(note.lyric)) {
            let lyricText = '';
            note.lyric.forEach((line, idx) => {
              const isLast = idx === (note.lyric as XMLNoteLyric[]).length - 1;
              if (isLast) lyricText += line.text;
              else lyricText += `${line.text} +`;
            })
            symbol += `(${lyricText})`;
          } else {
            symbol += `(${note.lyric.text})`;
          }
        }
      }

      if (note.dynamic) {
        symbol = `[${note.dynamic}]${symbol}`;
      }
      if (note.directionText) {
        symbol = `"${note.directionText}"${symbol}`;
      }
      if (note.tempo && barNumber > 0) {
        symbol = `{${formatTempoInfo(note.tempo)}}${symbol}`;
      }
    }

    processedEvents.push({
      beatStartsOn: currentBeat,
      symbol,
      durationInBeats: beatValue,
      originalEvent: note
    });
    currentBeat += beatValue;
    n++;
  }


  // --- PASS 2: Build final string with contextual separators ---
  let finalString = '';
  let currentMeasureSlurState = slurState;
  let currentMeasureTieState = isTieActive;

  // --- Detect Key or Time Changes ---
  if (barNumber > 0) {
    if (keyChanged) {
      finalString += `@${currentKey.key}${currentKey.mode === "minor" ? "m" : ""} `;
    }

    if (timeChanged) {
      const { numerator, denominator } = currentTime;
      finalString += `#${numerator}/${denominator} `;
    }
  }

  for (let i = 0; i < processedEvents.length; i++) {
    const currentEvent = processedEvents[i];
    const previousEvent = i > 0 ? processedEvents[i - 1] : undefined;
    const nextEvent = i < processedEvents.length - 1 ? processedEvents[i + 1] : undefined;

    let separator = "";
    let prefix = "";
    let suffix = "";
    let symbolToPrint = currentEvent?.symbol || "";

    // --- 1. Determine if this note should be replaced by a tie  ---
    const currentIsTied = isTiedNote(currentEvent?.originalEvent);
    if (currentIsTied && currentMeasureTieState) {
      symbolToPrint = '-';
    }
    currentMeasureTieState = currentIsTied;

    // ---2. Determine separators (added before the note) ---
    if (previousEvent) {
      const currentEventStartBeat = currentEvent?.beatStartsOn || 0;
      const prevEventStartBeat = previousEvent?.beatStartsOn || 0;
      const prevEventEndBeat = prevEventStartBeat + (previousEvent?.durationInBeats || 0);

      // --- A. Extend/ Hold Logic (for long notes) ---
      const prevIsTupletForHold = !!previousEvent?.originalEvent["time-modification"];
      if (previousEvent?.originalEvent.pitch && !prevIsTupletForHold) {
        const firstBeatToCheck = Math.floor((previousEvent?.beatStartsOn || 0) + 1)
        const lastBeatToCheck = Math.floor(prevEventEndBeat);

        for (let b = firstBeatToCheck; b <= lastBeatToCheck; b++) {
          if (b < prevEventEndBeat) {
            separator += getBeatSeparator(b, currentTime) + " -";
          }
        }

        const prevIsTuplet = !!previousEvent?.originalEvent["time-modification"];
        if (!prevIsTuplet) {
          const prevStartedOnBeat = Number.isInteger(prevEventStartBeat);
          if (prevStartedOnBeat) {
            const lastIntegerBeat = Math.floor(prevEventStartBeat);
            const lastEighthBoundary = Math.floor(prevEventEndBeat * 2) / 2;

            if (lastEighthBoundary > lastIntegerBeat && lastEighthBoundary < prevEventEndBeat) {
              separator += " . -";
            }
          }
        }
      }

      // --- B. Note-to-note Separator Logic ---
      const isTuplet = !!currentEvent?.originalEvent["time-modification"];
      const prevIsTuplet = !!previousEvent?.originalEvent["time-modification"];

      if (isTuplet && prevIsTuplet) {
        if (previousEvent.originalEvent.type === 'eighth') {
          separator += "."
        } else {
          separator += ":"
        }
      } else {
        const isNotStartBeat = !Number.isInteger(currentEventStartBeat)
        if (isNotStartBeat && previousEvent?.originalEvent.pitch) {
          if (currentEventStartBeat % 0.5 === 0) {
            // If there is an extension and it gives a dot (an eighth rest), we don't need the separator
            if (symbolToPrint !== '.') {
              separator += " .";
            }
          } else if (currentEventStartBeat % 0.25 === 0) {
            separator += " ,";
          } else if (currentEventStartBeat % 0.125 === 0) {
            separator += " ⹁";
          }
        } else if (!isNotStartBeat) {
          if (currentEventStartBeat > 1) {
            separator += getBeatSeparator(currentEventStartBeat, currentTime);
          }
        }
      }
    }

    // --- 3. Suffix Logic Prefix/Suffix  ---
    const currentHasSlur = hasSlur(currentEvent?.originalEvent);

    if (currentHasSlur) {
      if (currentMeasureSlurState) {
        suffix = '~';
        currentMeasureSlurState = false;
      } else {
        prefix = '~';
        currentMeasureSlurState = true;
      }
    }

    // --- 4. Tuplet Logic Prefix/Suffix ---
    const currentIsTuplet = !!currentEvent?.originalEvent["time-modification"];
    if (currentIsTuplet) {
      const prevIsTuplet = !!previousEvent?.originalEvent["time-modification"];
      const nextIsTuplet = !!nextEvent?.originalEvent["time-modification"];

      if (!prevIsTuplet) {
        const tupletNumber = currentEvent?.originalEvent["time-modification"]?.["actual-notes"]
        prefix += `${tupletNumber}<`;
      }
      if (!nextIsTuplet) {
        suffix += `>`;
      }
    }

    // --- 5. Combine all parts ---
    if (symbolToPrint === '-') {
      finalString += suffix;
      finalString += separator + symbolToPrint;
    } else {
      finalString += separator + prefix + symbolToPrint + suffix;
    }
  }

  // --- PASS 3: Add any final holds for the last note ---
  if (processedEvents.length > 0) {
    const lastEvent = processedEvents[processedEvents.length - 1];

    const lastIsTuplet = !!lastEvent?.originalEvent["time-modification"];
    if (lastEvent?.originalEvent.pitch && !lastIsTuplet) {
      const lastEventEndBeat = (lastEvent?.durationInBeats || 0) + (lastEvent?.beatStartsOn || 0);

      const firstBeatToCheck = Math.floor((lastEvent?.beatStartsOn || 0) + 1)
      const lastBeatToCheck = Math.floor(lastEventEndBeat);
      for (let b = firstBeatToCheck; b <= lastBeatToCheck; b++) {
        if (b < lastEventEndBeat) {
          finalString += getBeatSeparator(b, currentTime) + " -";
        }
      }

      // check for half-beat holds
      const lastEventStartBeat = Math.floor(lastEvent?.beatStartsOn || 0);
      const lastNoteStartedOnBeat = Number.isInteger(lastEventStartBeat);

      if (lastNoteStartedOnBeat) {
        const lastIntegerBeat = Math.floor(lastEventStartBeat);
        const lastEighthBoundary = Math.floor(lastEventEndBeat * 2) / 2;

        if (lastEighthBoundary > lastIntegerBeat && lastEighthBoundary < lastEventEndBeat) {
          finalString += " . -";
        }
      }
    }
  }

  return {
    solfaString: finalString.trim(),
    newSlurState: currentMeasureSlurState,
    newTieState: currentMeasureTieState
  }
}

function pitchToNoteName(pitch: XMLNotePitch): string {
  let noteName = pitch.step;

  if (pitch.alter === -1) {
    noteName += 'b';
  } else if (pitch.alter === 1) {
    noteName += '#';
  }

  return noteName;
}

function getRestNotation(note: XMLNote, time: TimeSignature) {
  const { type, dot } = note;
  const isDotted = dot !== undefined;

  const table4 = {
    whole: 'x : x / x : x',
    half: 'x:x',
    quarter: 'x',
    eighth: '.',
    '16th': ','
  } as Record<string, string>;

  const table8 = {
    whole: 'x : x : x / x : x : x / x : x : x / x : x : x',
    half: isDotted ? 'x : x : x : x : x : x' : 'x : x : x : x',
    quarter: isDotted ? 'x : x : x' : 'x : x',
    eighth: 'x',
    '16th': '.',
    '32nd': ','
  } as Record<string, string>;

  if (time.denominator === 4) {
    return table4[type] ?? '';
  }

  if (time.denominator === 8) {
    return table8[type] ?? '';
  }

  return '';
}

function getKeyMap(currentKey: KeySignature): Record<string, string> {
  const mainKey = currentKey.mode === 'minor' ? getRelativeKeys(currentKey.key) : currentKey.key;
  return solfaNoteKeyMap[mainKey] || {};
}

function getRelativeKeys(key: string): string {
  const relativeKeysMap: Record<string, string> = {
    A: 'C',
    D: 'F',
    E: 'G',
    G: 'Bb',
    B: 'D',
    C: 'Eb',
    'F#': 'A',
    F: 'Ab',
    'C#': 'E',
    Db: 'E',
    'G#': 'B',
    Ab: 'B',
    Bb: 'Db',
    'D#': 'F#',
    Eb: 'Gb',
  }
  return relativeKeysMap[key] || key;
}

function getBeatSeparator(beat: number, timeSignature: TimeSignature): string {
  if (beat === 1) return '';
  return " :"
}

function getXMLSolfaNote(pitch: XMLNotePitch, key: KeySignature, keyMap: Record<string, string>, part: string) {
  const noteName = pitchToNoteName(pitch);
  let solfaNote = keyMap[noteName];
  const mainKey = key.mode === 'minor' ? getRelativeKeys(key.key) : key.key;

  const noteOrder = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const enharmonicMap: Record<string, string> = {
    'C#': 'Db',
    'D#': 'Eb',
    'Gb': 'F#',
    'G#': 'Ab',
    'A#': 'Bb'
  };

  const normalizeNote = (n: string) => {
    if (noteOrder.includes(n)) return n;
    const alt = enharmonicMap[n];
    return alt && noteOrder.includes(alt) ? alt : n;
  }
  const normalizedNoteName = normalizeNote(noteName);
  const normalizedKey = normalizeNote(mainKey);

  const noteIndex = noteOrder.indexOf(normalizedNoteName);
  const keyIndex = noteOrder.indexOf(normalizedKey);
  noteOrder[noteIndex] = solfaNote || '?';

  let octaveModifier = '';
  const femaleParts = ['S', 'A', 'MS', 'S I', 'S II', 'S III', 'A I', 'A II', 'A III'];
  const maleParts = ['T', 'B', 'Bar', 'T I', 'T II', 'T III', 'B I', 'B II', 'B III'];

  const referenceOctave = part && femaleParts.includes(part) ? 4 : 3;
  if (femaleParts.includes(part) || maleParts.includes(part)) {
    const octaveDiff = pitch.octave - referenceOctave;

    if (octaveDiff > 0) {
      if (noteIndex >= keyIndex) {
        octaveModifier = octaveDiff > 1 ? "″" : "'";
      }
    } else if (pitch.octave === referenceOctave) {
      if (noteIndex < keyIndex) {
        octaveModifier = 'ₗ';
      }
    } else {
      if (noteIndex >= keyIndex) {
        octaveModifier = octaveDiff === -1 ? 'ₗ' : '₂'
      } else {
        octaveModifier = octaveDiff === -1 ? 'ₗ' : '₂'
      }
    }
  }

  return solfaNote ? solfaNote + octaveModifier : '?';
}

/**
 * Checks if a note has a slur notation.
 * @param note 
 */
function hasSlur(note: XMLNote | undefined): boolean {
  if (!note) return false;
  if (!note.notations) return false;

  if (Array.isArray(note.notations)) {
    return note.notations.some(n => n.slur !== undefined);
  }
  return note.notations.slur !== undefined;
}

function isTiedNote(note: XMLNote | undefined): boolean {
  if (!note) return false;
  if (!note.notations) return false;

  if (note.tie !== undefined) return true;

  if (Array.isArray(note.notations)) {
    return note.notations.some(n => n.tied !== undefined);
  }
  return note.notations.tied !== undefined;
}

/**
 * Helper function to extract the first "#text" value from a TextArray.
 * @param data The array to extract from (e.g., workData?.['work-title'])
 * @returns The text string or undefined if not found.
 */
export const getText = (data: TextArray | undefined): string | undefined => {
  return data?.[0]?.['#text'];
};

/**
 * Helper function to extract all "#text" values from a TextArray.
 * @param data The array to extract from (e.g., identification?.['creator'])
 * @returns An array of strings.
 */
export const getTextArray = (data: TextArray | undefined): string[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(item => item?.['#text'])
    .filter((text): text is string => !!text); // Filter out any undefined/null
};

function formatTempoInfo(tempo: TempoInfo): string {
  let tempoString = 'T'
  const unitMap: Record<string, number> = {
    'half': 2,
    'quarter': 4,
    'eighth': 8,
    '16th': 16
  };

  const tempoType = unitMap[tempo.beatUnit!]
  tempoString += tempoType + (tempo.beatUnitDot ? '.' : '') + '=' + tempo.perMinute;

  return tempoString;
}

export function simplifyNode(node: any): any {
  if (Array.isArray(node)) {
    const simplified: any = {}
    let hasText = false
    let textValue = null

    for (const item of node) {
      if (item.hasOwnProperty('#text')) {
        hasText = true
        textValue = item['#text']
        continue;
      }

      const keys = Object.keys(item)
      if (keys.length > 0) {
        const key = keys[0]
        const value = simplifyNode(item[key!])

        if (simplified.hasOwnProperty(key)) {
          if (Array.isArray(simplified[key!])) {
            simplified[key!].push(value)
          } else {
            simplified[key!] = [simplified[key!], value]
          }
        } else {
          simplified[key!] = value
        }
      }
    }

    if (hasText && Object.keys(simplified).length === 0) {
      return textValue
    }

    return simplified
  }

  return node
}