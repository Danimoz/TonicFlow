import { KeySignature, TimeSignature } from "./interfaces.js";

export interface ProgressReport {
  message: string;
  completedPercentage: number;
  estimatedRemainingTime?: number; // in seconds
  error?: string;
}

export type DirectionType = {
  ['direction-type']: any;
  voice?: number;
  staff?: number;
};

export type TempoInfo = {
  beatUnit?: string;
  beatUnitDot?: boolean
  perMinute?: number;
};

export interface MeasureAttributes {
  key?: KeySignature;
  time?: TimeSignature
  division?: number;
}

export interface AttributeSnapshot {
  initialKey?: KeySignature;
  initialTime?: TimeSignature;
  currentKey?: KeySignature;
  currentTime?: TimeSignature;
  currentDivision?: number;
}

export type XMLNoteType = 'eighth' | 'quarter' | 'half' | 'whole' | '16th' | '32nd' | '64th' | '128th' | '256th' | '512th' | '1024th';
export type XMLNotePitch = {
  step: string;
  alter?: number;
  octave: number;
}

export type XMLNote = {
  accidental?: string
  dot?: string
  duration: number
  pitch?: XMLNotePitch
  rest?: string
  type: XMLNoteType
  voice: number
  staff?: number
  tie?: string 
  beam?: string | string[]
  lyric?: XMLNoteLyric | XMLNoteLyric[]
  stem?: 'up' | 'down'
  "time-modification"?: {
    "actual-notes": number;
    "normal-notes": number;
    "normal-type"?: XMLNoteType;
  }
  notations?: XMLNoteNotations | XMLNoteNotations[]
  dynamic?: string
  directionText?: string
  tempo?: TempoInfo
  chord?: object | string
}

export type XMLNoteLyric = {
  syllabic: string;
  text: string;
}

export type XMLNoteNotations = {
  tuplet?: {
    'tuplet-actual'?: {
      'tuplet-number': number;
      'tuplet-type': XMLNoteType;
    },
    'tuplet-normal'?: {
      'tuplet-number': number;
      'tuplet-type': XMLNoteType;
    }
  }
  slur?: string
  tied?: string
}

export type TextArray = Array<{ '#text': string }>;