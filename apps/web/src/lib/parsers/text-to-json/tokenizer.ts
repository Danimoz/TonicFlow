import { Token } from "../interfaces";

const ARTICULATIONS = ['decresc', 'cresc', 'dim', 'accel', 'rit'];
const DYNAMICS = ['ppp', 'pp', 'p', 'mp', 'mf', 'fp', 'sfz', 'f', 'ff', 'fff'];
const NOTES = ['de', 'ra', 're', 'ma', 'fe', 'ba', 'sa', 'se', 'la', 'le', 'ta', 'd', 'r', 'm', 'f', 's', 'l', 't'];

function getLongestMatch(substring: string, options: string[]): string | null {
  let longest: string | null = null;
  for (const option of options) {
    if (substring.toLowerCase().startsWith(option)) {
      if (!longest || option.length > longest.length) {
        longest = option;
      }
    }
  }
  return longest;
}

/**
 * Converts a raw tonic solfa string into an array of typed tokens.
 * @param partContent The notation string for a single part (e.g., "[mf]d(see){m}").
 * @returns An array of Token objects.
 */
export function tokenize(partContent: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  let parenDepth = 0;
  let bracketDepth = 0;

  while (cursor < partContent.length) {
    let char = partContent[cursor];

    // Skip whitespace
    if (char && /\s/.test(char)) {
      cursor++;
      continue;
    }

    const remaining = partContent.substring(cursor);

    if (char && /\d/.test(char)) {
      const match = remaining.match(/^\d+/);
      if (match) {
        tokens.push({ type: 'NUMBER', value: match[0], position: cursor });
        cursor += match[0].length;
        continue;
      }
    }

    // Longer patterns first
    if (remaining.startsWith('||')) {
      tokens.push({ type: 'DOUBLE_BARLINE', value: '||', position: cursor });
      cursor += 2;
      continue;
    }

    const articulationMatch = getLongestMatch(remaining, ARTICULATIONS);
    if (articulationMatch) {
      tokens.push({ type: 'ARTICULATION', value: partContent.substring(cursor, cursor + articulationMatch.length), position: cursor });
      cursor += articulationMatch.length;
      continue;
    }

    if (remaining.toUpperCase().startsWith('DC')) {
      tokens.push({ type: 'DAL_CAPO', value: 'DC', position: cursor });
      cursor += 2;
      continue;
    }

    if (remaining.startsWith('&1')) {
      tokens.push({ type: 'FIRST_ENDING', value: '&1', position: cursor });
      cursor += 2;
      continue;
    }

    if (remaining.startsWith('&2')) {
      tokens.push({ type: 'SECOND_ENDING', value: '&2', position: cursor });
      cursor += 2;
      continue;
    }

    if (char === '#') {
      const match = remaining.match(/^#\d+\/\d+/);
      if (match) {
        tokens.push({ type: 'METER_CHANGE', value: match[0], position: cursor });
        cursor += match[0].length;
        continue;
      }
    }

    if (char === '@') {
      const match = remaining.match(/^@[A-Ga-g][#b]?/);
      if (match) {
        tokens.push({ type: 'KEY_SIGNATURE', value: match[0], position: cursor });
        cursor += match[0].length;
        continue;
      }
    }

    if (char === '*') {
      const endIndex = remaining.indexOf('*', 1);
      if (endIndex !== -1) {
        const value = remaining.substring(0, endIndex + 1);
        tokens.push({ type: 'KEY_MODULATION', value, position: cursor });
        cursor += value.length;
        continue;
      }
    }

    if (char && char.toUpperCase() === 'R') {
      const match = remaining.match(/^R\d+/i);
      if (match) {
        tokens.push({ type: 'MULTI_BAR_REST', value: match[0], position: cursor });
        cursor += match[0].length;
        continue;
      }
    }

    if (char && char.toUpperCase() === 'T') {
      const match = remaining.match(/^T\d+/i);
      if (match) {
        tokens.push({ type: 'TEMPO_CHANGE', value: match[0], position: cursor });
        cursor += match[0].length;
        continue;
      }
    }

    const dynamicMatch = getLongestMatch(remaining, DYNAMICS);
    if (bracketDepth > 0 && dynamicMatch) {
      tokens.push({ type: 'DYNAMIC', value: partContent.substring(cursor, cursor + dynamicMatch.length), position: cursor });
      cursor += dynamicMatch.length;
      continue;
    }

    // Prioritize WORD inside parens - find closing paren and capture everything in between
    if (parenDepth > 0 && char && /[a-zA-Z]/.test(char)) {
      const closingParenIndex = remaining.indexOf(')');
      if (closingParenIndex !== -1) {
        const wordContent = remaining.substring(0, closingParenIndex);
        tokens.push({ type: 'WORD', value: wordContent, position: cursor });
        cursor += wordContent.length;
        continue;
      }
    }

    const noteMatch = getLongestMatch(remaining, NOTES);
    if (noteMatch) {
      const nextChar = partContent[cursor + noteMatch.length];
      if (!nextChar || !/[a-zA-Z]/.test(nextChar)) {
        let noteValue = partContent.substring(cursor, cursor + noteMatch.length);
        let lookaheadCursor = cursor + noteValue.length;
        if (lookaheadCursor < partContent.length) {
          const octaveChar = partContent[lookaheadCursor];
          if (octaveChar && ["'", "’", "²", "ₗ", "₂"].includes(octaveChar)) {
            noteValue += octaveChar;
          }
        }
        tokens.push({ type: 'NOTE', value: noteValue, position: cursor });
        cursor += noteValue.length;
        continue;
      }
    }

    // Single-character tokens
    const singleCharTokens: { [key: string]: Token['type'] } = {
      '(': 'LPAREN', ')': 'RPAREN', '[': 'LBRACKET', ']': 'RBRACKET', '{': 'LBRACE', '}': 'RBRACE',
      '<': 'LANGLE', '>': 'RANGLE', 'g': 'GRACE_NOTE',
      '~': 'SLUR', '.': 'DOT', ':': 'COLON', ',': 'COMMA', '-': 'DASH', '/': 'SLASH', '|': 'BARLINE',
      'x': 'WHOLE_REST', '^': 'FERMATA', '$': 'SEGNO'
    };

    if (char && singleCharTokens[char]) {
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
      if (char === '[') bracketDepth++;
      if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);
      tokens.push({ type: singleCharTokens[char], value: char, position: cursor });
      cursor++;
      continue;
    }

    if (char && /[a-zA-Z]/.test(char)) {
      const match = remaining.match(/^[a-zA-Z,]+-?/);
      if (match) {
        tokens.push({ type: 'WORD', value: match[0], position: cursor });
        cursor += match[0].length;
        continue;
      }
    }

    // If no token matches, it's an unrecognized character.
    if (char) {
      tokens.push({ type: 'OTHER', value: char, position: cursor });
    }
    cursor++;
  }

  return tokens;
}