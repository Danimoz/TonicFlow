export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface KeySignature {
  key: string;
  mode: string
}

export interface ScoreElementReference {
  systemIndex: number;
  measureIndex: number;
  partIndex: number;
  noteIndex: number;
  element: 'note' | 'lyric';
}

/** A structure for reporting errors during parsing. */
export interface ParsingError {
  message: string;
  column?: number;
  partName?: string;
  measureNumber?: string;
  originalText: string;
  position: number;
}

/** A token representing a musical element in the notation. */
export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

/** The type of a token in the musical notation. */
type TokenType =
  | 'NOTE'
  | 'DOT'
  | 'COMMA'
  | 'COLON'
  | 'SLASH'
  | 'BARLINE'
  | 'DOUBLE_BARLINE'
  | 'DASH'
  | 'DYNAMIC'
  | 'ARTICULATION'
  | 'KEY_MODULATION' // *G*
  | 'METER_CHANGE' // #3/4
  | 'KEY_SIGNATURE' // @F
  | 'TEMPO_CHANGE' // T120
  | 'PART_LABEL' // S., A., T., B.
  | 'LPAREN' // (
  | 'RPAREN' // )
  | 'LBRACKET' // [
  | 'RBRACKET' // ]
  | 'LBRACE' // {
  | 'RBRACE' // }
  | 'WORD' // for lyrics, dynamics
  | 'SLUR'
  | 'GRACE_NOTE'
  | 'FERMATA' // ^
  | 'SEGNO' // $
  | 'FIRST_ENDING' // &1
  | 'SECOND_ENDING' // &2
  | 'MULTI_BAR_REST' // R8
  | 'WHOLE_REST' // x
  | 'DAL_CAPO' // DC
  | 'DAL_SEGNO' // DS
  | 'NUMBER'
  | 'LANGLE' // <
  | 'RANGLE' // >
  | 'OTHER'
  | '32ND_NOTE';


export type DelimiterType =
  | 'dot'
  | 'comma'
  | 'colon'
  | 'barline'
  | 'double_barline'

export type ProjectMetaType =
  | 'meter_change'
  | 'key_change'
  | 'tempo_change'
  | 'dal_capo'
  | 'dal_segno'
  | 'segno'
  | 'first_ending'
  | 'second_ending'

export interface Note {
  type: 'note';
  noteName: string;
  pitch: string; // e.g., "C", "D#", "Eb"
  octave: number; // e.g., 0 for normal, 1 for high, -1 for low
  duration: number; // in beats
  position: number;
  measureNumber: number;
  lyric?: { [key: string]: string };
  slur?: 'start' | 'end';
  dynamics?: string[];
  articulation?: string;
  divisi?: { [part: string]: Partial<Note> };
  tuplet?: 'start' | 'stop';
  tupletNumber?: number;
  graceNotes?: Note[];
  noteChange?: string
}

interface NoteExtension {
  type: 'note_extension';
  value: '-';
  measureNumber: number
  position: number; // Character position in the original text
}

interface ProjectMeta {
  type: 'meta';
  title: ProjectMetaType;
  value: string;
  position: number;
  measureNumber: number;
}

export interface Lyric {
  [line: string]: string;
}

export interface Rest {
  type: 'rest';
  measureNumber: number;
  duration: number; // e.g., 1 for whole rest, 0.5 for half rest
  position: number; // Character position in the original text
}

export interface Delimiter {
  type: 'delimiter';
  value: DelimiterType;
  measureNumber: number;
  position: number; // Character position in the original text
}

export type MusicalEvent = Note | NoteExtension | Rest | Delimiter | ProjectMeta;

export interface Measure {
  number: number;
  isPickup?: boolean;
  parts: {
    [partName: string]: MusicalEvent[];
  },
  timeSignature?: TimeSignature;
  keySignature?: string;
  barlineType?: 'single' | 'double' | 'repeat_start' | 'repeat_end' | 'final';
  segno?: boolean;
  tempoChange?: string;
}