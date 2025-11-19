import {
  MusicalEvent,
  Note,
  Token,
  DelimiterType,
  Lyric,
  ProjectMetaType,
  ParsingError
} from "../interfaces.js";
import { getOctaveNumber } from "../utils.js";

export function parse(tokens: Token[], startingMeasure: number = 1, partName: string): { events: MusicalEvent[]; errors: ParsingError[], currentMeasure: number } {
  const events: MusicalEvent[] = [];
  const errors: ParsingError[] = [];
  let currentMeasure = startingMeasure;

  let i = 0;

  // A temporary store for attributes that come BEFORE a note (e.g., dynamics, slur starts)
  let pendingAttributes: Partial<Note> = {};
  let pendingDynamics: string[] = [];

  const findLastNote = (): Note | null => {
    for (let j = events.length - 1; j >= 0; j--) {
      const event = events[j];
      if (event && event.type === 'note') return event as Note;
    }
    return null;
  }

  while (i < tokens.length) {
    const token = tokens[i];
    if (!token) break;

    switch (token.type) {
      case 'LBRACKET': {
        // Start of a dynamic marking
        if (tokens[i + 1]?.type === 'DYNAMIC' && tokens[i + 2]?.type === 'RBRACKET') {
          const dynamicToken = tokens[i + 1];
          if (dynamicToken) pendingDynamics.push(dynamicToken.value);
          i += 2; // Skip ahead to after the RBRACKET
          break;
        }
      }

      case 'SLUR': {
        // Start of a slur
        pendingAttributes.slur = 'start';
        break;
      }

      case 'DIRECTION_TEXT': {
        pendingAttributes.directionText = token.value;
        break;
      }

      case 'GRACE_NOTE': {
        const graceNotes: Note[] = [];
        if (tokens[i + 1]?.type === 'LANGLE') {
          let currentTokenIndex = i + 2;
          while (currentTokenIndex < tokens.length && tokens[currentTokenIndex]?.type !== 'RANGLE') {
            const graceToken = tokens[currentTokenIndex];
            if (graceToken && graceToken.type === 'NOTE') {
              graceNotes.push({
                type: 'note',
                noteName: graceToken.value as Note['noteName'],
                pitch: '',
                octave: getOctaveNumber(graceToken.value),
                duration: 0,
                position: graceToken.position,
                measureNumber: currentMeasure
              });
            }
            currentTokenIndex++;
          }
          i = currentTokenIndex; // Move the main index to the end of the grace notes
        }
        if (graceNotes.length > 0) pendingAttributes.graceNotes = graceNotes;
        break;
      }

      case 'NUMBER': {
        if (tokens[i + 1]?.type === 'LANGLE') {
          const tupletValue = parseInt(token.value, 10);
          let tupletContentTokens: Token[] = [];
          let RangleIndex = -1;

          // Find the closing RANGLE
          for (let j = i + 2; j < tokens.length; j++) {
            if (tokens[j]?.type === 'RANGLE') {
              RangleIndex = j;
              break;
            }
            const currentToken = tokens[j];
            if (currentToken) tupletContentTokens.push(currentToken);
          }

          if (RangleIndex !== -1) {
            const beatValue = 1 / tupletValue;
            const tupletNotes: Note[] = [];

            let currentTupletTokenIndex = 0;
            while (currentTupletTokenIndex < tupletContentTokens.length) {
              const tupletToken = tupletContentTokens[currentTupletTokenIndex];
              if (!tupletToken) {
                currentTupletTokenIndex++;
                continue;
              }

              // handle dynamics

              if (tupletToken.type === 'NOTE') {
                const { note, newIndex } = parseNote(tupletContentTokens, currentTupletTokenIndex, currentMeasure, pendingAttributes, pendingDynamics);
                if (note) {
                  note.duration = beatValue; // Base duration for a tuplet note
                  events.push(note);
                  tupletNotes.push(note);
                  pendingAttributes = {};
                  pendingDynamics = [];
                  // newIndex from parseNote is relative to tupletContentTokens, so we can use it directly
                  currentTupletTokenIndex = newIndex;
                  continue; // Continue to next token
                }
              } else if (tupletToken.type === 'DASH') {
                const lastNote = findLastNote();
                if (lastNote) {
                  lastNote.duration += beatValue;
                }
                events.push({
                  type: 'note_extension',
                  value: '-',
                  position: tupletToken.position,
                  measureNumber: currentMeasure
                });
              } else if (['COLON', 'SLASH', 'DOT', 'COMMA'].includes(tupletToken.type)) {
                events.push({
                  type: 'delimiter',
                  value: tupletToken.value as DelimiterType,
                  position: tupletToken.position,
                  measureNumber: currentMeasure
                });
              } else if (tupletToken.type === 'SLUR') {
                pendingAttributes.slur = 'start';
              }
              currentTupletTokenIndex++;
            }

            if (tupletNotes.length > 0) {
              const firstNote = tupletNotes[0];
              if (firstNote) {
                firstNote.tuplet = 'start';
                firstNote.tupletNumber = tupletValue;
              }
              const lastNote = tupletNotes[tupletNotes.length - 1];
              if (lastNote) {
                lastNote.tuplet = 'stop';
              }
            }

            i = RangleIndex; // Move parser past the tuplet
          } else {
            // Handle unclosed tuplet
            errors.push({
              message: `Unclosed tuplet starting at position ${token.position}`,
              position: token.position,
              originalText: token.value,
              partName: partName,
              measureNumber: currentMeasure.toString()
            });
          }
        }
        break;
      }

      case 'NOTE': {
        const { note, newIndex } = parseNote(tokens, i, currentMeasure, pendingAttributes, pendingDynamics);
        if (note) {
          events.push(note);
          pendingAttributes = {};
          pendingDynamics = [];
        }
        i = newIndex - 1;
        break;
      }

      case 'DOT':
      case '32ND_NOTE':
      case 'COMMA': {
        events.push({
          type: 'delimiter',
          value: token.value as DelimiterType,
          position: token.position,
          measureNumber: currentMeasure
        });

        let isPrecededByNoteOrDash = false;
        for (let j = i - 1; j >= 0; j--) {
          const prevToken = tokens[j];
          if (prevToken?.type === 'NOTE' || prevToken?.type === 'DASH') {
            isPrecededByNoteOrDash = true;
            break;
          }
          if (prevToken?.type === 'COLON' || prevToken?.type === 'BARLINE' || prevToken?.type === 'DOUBLE_BARLINE') {
            // We've hit the start of a beat group without finding a note
            break;
          }
        }

        if (!isPrecededByNoteOrDash) {
          events.push({
            type: 'rest',
            duration: token.type === 'DOT' ? 0.5 : token.type === 'COMMA' ? 0.25 : 0.125,
            position: token.position,
            measureNumber: currentMeasure
          })
        }
        break;
      }

      case 'WHOLE_REST': {
        events.push({
          type: 'rest',
          duration: 1,
          position: token.position,
          measureNumber: currentMeasure
        })
        break;
      }

      case 'KEY_MODULATION': {
        const noteChange = token.value.replace(/\*/g, '');
        pendingAttributes.noteChange = noteChange;
        break;
      }

      case 'DASH': {
        events.push({
          type: 'note_extension',
          value: token.value as '-',
          position: token.position,
          measureNumber: currentMeasure
        });

        const lastNote = findLastNote()
        if (lastNote) {
          let extensionValue = 1;
          let peekIndex = i + 1;
          while (peekIndex < tokens.length) {
            const peekToken = tokens[peekIndex]
            if (peekToken?.type === 'NOTE') {
              for (let k = peekIndex - 1; k > i; k--) {
                const prevPeekToken = tokens[k];
                if (prevPeekToken?.type === 'DOT') {
                  extensionValue = 0.5;
                  break;
                } else if (prevPeekToken?.type === 'COMMA') {
                  extensionValue = 0.25;
                  break;
                }
              }
            }
            if (peekToken?.type === 'COLON' || peekToken?.type === 'BARLINE' || peekToken?.type === 'DOUBLE_BARLINE') break;
            peekIndex++;
          }
          lastNote.duration += extensionValue;
        }
        break;
      }

      case 'COLON':
      case 'SLASH': {
        events.push({
          type: 'delimiter',
          value: token.value as DelimiterType,
          position: token.position,
          measureNumber: currentMeasure
        })
        break;
      }

      case 'BARLINE':
      case 'DOUBLE_BARLINE': {
        events.push({
          type: 'delimiter',
          value: token.value === '||' ? 'double_barline' : 'barline',
          position: token.position,
          measureNumber: currentMeasure
        });
        currentMeasure++;
        break;
      }

      case 'METER_CHANGE':
      case 'TEMPO_CHANGE':
      case 'FIRST_ENDING':
      case 'SECOND_ENDING':
      case 'DAL_CAPO':
      case 'DAL_SEGNO':
      case 'SEGNO':
      case 'KEY_SIGNATURE': {
        events.push({
          type: 'meta',
          title: token.type === 'KEY_SIGNATURE' ? 'key_change' : token.type.toLowerCase() as ProjectMetaType,
          value: token.value,
          position: token.position,
          measureNumber: currentMeasure
        })
      }

      case 'OTHER': {
        errors.push({
          message: `Unrecognized token: ${token.value}`,
          position: token.position,
          originalText: token.value,
          partName: partName,
          measureNumber: currentMeasure.toString()
        })
        break;
      }

      default: {
        errors.push({
          message: `Unhandled token type: ${token.type}`,
          position: token.position,
          originalText: token.value,
          partName: partName,
          measureNumber: currentMeasure.toString()
        })
        break;
      }
    }
    i++;
  }

  return { events, errors, currentMeasure };
}

function parseNote(tokens: Token[], index: number, currentMeasure: number, pendingAttributes: Partial<Note>, pendingDynamics: string[] = []): { note: Note | null, newIndex: number } {
  const baseNoteToken = tokens[index];
  if (!baseNoteToken || baseNoteToken.type !== 'NOTE') {
    return { note: null, newIndex: index };
  }

  let currentIndex = index + 1;

  // Determine base duration from the last significant delimiter
  let beatValue = 1;
  let j = index - 1;

  while(j >= 0) {
    const pToken = tokens[j];
    
    if (pToken?.type === 'RANGLE') {
      // Check if this is part of a grace note
      let depth = 1;
      let k = j - 1;

      while(depth > 0 && k >= 0) {
        const innerToken = tokens[k];
        if (innerToken?.type === 'GRACE_NOTE') depth--;
        else if (innerToken?.type === 'NUMBER') depth++;
        if (depth === 0) {
          j = k;
          break;
        } else if (depth > 0) break;
        
        if (innerToken && ['COLON', 'BARLINE', 'DOUBLE_BARLINE'].includes(innerToken.type)) break;
        k--;
      }
    }

    if (pToken?.type === 'DOT') {
      beatValue = 0.5;
      break;
    }
    if (pToken?.type === 'COMMA') {
      beatValue = 0.25;
      break;
    }
    if (pToken?.type === '32ND_NOTE') {
      beatValue = 0.125;
      break;
    }

    if (pToken && ['COLON', 'BARLINE', 'DOUBLE_BARLINE'].includes(pToken.type)) break;
    j--;
  }

  // Check Octave markers
  const octave = getOctaveNumber(baseNoteToken.value);

  // Look for Lyrics
  let lyrics: Lyric | undefined;
  if (tokens[currentIndex]?.type === 'LPAREN' && tokens[currentIndex + 1]?.type === 'WORD' && tokens[currentIndex + 2]?.type === 'RPAREN') {
    const wordToken = tokens[currentIndex + 1];
    lyrics = {};
    if (wordToken) {
      wordToken.value.split('+').forEach((lyricPart, index) => {
        lyrics![`${index + 1}`] = lyricPart;
      });
    }
    currentIndex += 3;
  }

  // Look for divisi
  let divisi: { [part: string]: Partial<Note> } | undefined;
  if (tokens[currentIndex]?.type === 'LBRACE' && (tokens[currentIndex + 1]?.type === 'NOTE' || tokens[currentIndex + 1]?.type === 'WORD') && tokens[currentIndex + 2]?.type === 'RBRACE') {
    const divisiNoteToken = tokens[currentIndex + 1];
    const divisiNotes = divisiNoteToken?.value.split('+');
    divisi = {};
    divisiNotes?.forEach((noteStr, index) => {
      const octave = getOctaveNumber(noteStr);
      divisi![`${index + 1}`] = { noteName: noteStr as Note['noteName'], octave };
    });
    currentIndex += 3;
  }

  // Handle Slur
  let slur = pendingAttributes.slur;
  if (tokens[currentIndex]?.type === 'SLUR') {
    slur = 'end';
    currentIndex++;
  }

  // Look for explicit duration
  let duration = beatValue;
  if (tokens[currentIndex]?.type === 'DOT') duration = 0.5;
  else if (tokens[currentIndex]?.type === 'COMMA') duration = 0.25;
  else if (tokens[currentIndex]?.type === '32ND_NOTE') duration = 0.125;

  const newNote: Note = {
    type: 'note',
    noteName: baseNoteToken.value as Note['noteName'],
    pitch: '', // Placeholder, actual pitch logic needed
    octave,
    duration,
    measureNumber: currentMeasure,
    position: baseNoteToken.position,
    ...(divisi ? { divisi } : {}),
    ...(slur ? { slur } : {}),
    ...(pendingDynamics.length > 0 ? { dynamics: [...pendingDynamics] } : {}),
    ...(pendingAttributes.articulation ? { articulation: pendingAttributes.articulation } : {}),
    ...(lyrics ? { lyric: lyrics } : {}),
    ...(pendingAttributes.graceNotes ? { graceNotes: pendingAttributes.graceNotes } : {}),
    ...(pendingAttributes.noteChange ? { noteChange: pendingAttributes.noteChange } : {}),
    ...(pendingAttributes.directionText ? { directionText: pendingAttributes.directionText } : {})
  };

  return { note: newNote, newIndex: currentIndex };
}
