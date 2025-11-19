import { KeySignature, TimeSignature } from "../../src/interfaces.js";
import { XMLNote, XMLNoteType } from "../../src/types.js";
import { parseXMLNotes } from "../../src/utils.js";

// -- Mocks & Helpers For Testing --
const mockKey: KeySignature = { key: 'C', mode: 'major' };
const mockTime: TimeSignature = { numerator: 4, denominator: 4 };
const mockDivision = 4;

const createNote = (
  step: string | null,
  duration: number,
  type: XMLNoteType,
  props: Partial<XMLNote> = {}
): XMLNote => {
  const note = { duration, type, voice: 1, ...props }
  if (step) {
    note.pitch = { step, octave: 4 };
  } else {
    note.rest = '';
  }
  return note;
}

describe('Parse Music XML to Solfa', () => {
  describe('1. Basic Separator Logic', () => {
    test('Quarter notes on-beat should use ":"', () => {
      const notes = [
        createNote('C', 4, 'quarter'),
        createNote('D', 4, 'quarter'),
        createNote('E', 4, 'quarter'),
        createNote('F', 4, 'quarter'),
      ]

      const result = parseXMLNotes(notes, mockKey, mockTime, mockDivision, 'S', false, false, false, false, 0);
      expect(result.solfaString).toBe('d :r :m :f');
    });

    test('Eighth notes (off-beat) should use "."', () => {
      // | d . r : m . f |
      const notes = [
        createNote('C', 2, 'eighth'), // 1.0
        createNote('D', 2, 'eighth'), // 1.5 (off-beat)
        createNote('E', 2, 'eighth'), // 2.0
        createNote('F', 2, 'eighth'), // 2.5 (off-beat)
      ];
      const result = parseXMLNotes(notes, mockKey, mockTime, mockDivision, 'S', false, false, false, false, 0);
      expect(result.solfaString).toBe('d .r :m .f');
    });

    test('16th notes should use "," at 0.25/0.75 boundaries', () => {
      // | d , r . m , f |
      const notes = [
        createNote('C', 1, '16th'), // 1.0
        createNote('D', 1, '16th'), // 1.25 -> ,
        createNote('E', 1, '16th'), // 1.50 -> .
        createNote('F', 1, '16th'), // 1.75 -> ,
      ];
      const result = parseXMLNotes(notes, mockKey, mockTime, mockDivision, 'S', false, false, false, false, 0);
      expect(result.solfaString).toBe('d ,r .m ,f');
    });

    test('Double Dot Collision: Eighth Rest on off-beat should NOT add an extra "." separator', () => {
      // Scenario: 
      // 1. A Note starting on beat 1.5 (duration 0.5) -> Ends at 3.5
      // 2. An Eighth Rest (symbol ".") starting at 3.5
      //
      // Expected: "note : ." (Space for beat 3, then "." for the rest)

      const div12 = 12; // Division 12
      const notes = [
        createNote('E', 6, 'eighth'),
        createNote('C', 24, 'half'),
        createNote(null, 6, 'eighth'),
        createNote('D', 12, 'quarter'),
      ];

      const result = parseXMLNotes(notes, mockKey, mockTime, div12, 'S', false, false, false, false, 0);
      expect(result.solfaString).toBe('m .d : - : -. :r');
    });
  })

  describe('2. Hold/Extensions Logic', () => {
    test('Standard on-beat hold (Half note)', () => {
      const notes = [
        createNote('C', 8, 'half'), // 2 beats
        createNote('D', 8, 'half'), // 2 beats
      ];
      const result = parseXMLNotes(notes, mockKey, mockTime, mockDivision, 'S', false, false, false, false, 0);
      expect(result.solfaString).toBe('d : - :r : -');
    });

    test('Off-beat hold (Dotted 8th)', () => {
      // | s .-, m | (s=0.75, m=0.25)
      const notes = [
        createNote('G', 3, 'eighth', { dot: '' }), // 0.75 beats
        createNote('E', 1, '16th'),               // 0.25 beats
      ];
      const result = parseXMLNotes(notes, mockKey, mockTime, mockDivision, 'S', false, false, false, false, 0);
      expect(result.solfaString).toBe('s . - ,m');
    });

    test('Complex Hold (Case - 1.75 beats)', () => {
      // A double dotted quarter note (1.75 beats)

      const notes = [
        createNote('D', 8, 'half'), // 1.0 -> 3.0
        createNote('C', 7, 'quarter', { dot: '' }), // 3.0 -> 4.75 (1.75 beats)
        createNote('D', 1, '16th')  // 4.75 -> 5.0
      ];
      const result = parseXMLNotes(notes, mockKey, mockTime, mockDivision, 'S', false, false, false, false, 0);
      expect(result.solfaString).toBe('r : - :d : - . - ,r');
    });

    test('Hold Logic should skip Notes starting Off-Beat', () => {
      // a dotted crotchet and two 16th notes
      const notes = [
        createNote('G', 6, 'quarter', { dot: '' }), // 1.5 beats (1.0 -> 2.5)
        createNote('E', 1, '16th'), // 0.25 beats (2.5 -> 2.75)
        createNote('F', 1, '16th'), // 0.25 beats (2.75 -> 3.0)
      ];
      const result = parseXMLNotes(notes, mockKey, mockTime, mockDivision, 'S', false, false, false, false, 0);
      expect(result.solfaString).toBe('s : - .m ,f');
    });
  })

  describe('3. Tuplet Handling', () => {
    test('Eighth Note Triplets (3 in 1 beat) should use "."', () => {
      // 3<d.r.m>
      const timeMod = { "actual-notes": 3, "normal-notes": 2 };
      // Duration for 8th triplet = 2/3 of a beat = 4 * (2/3) = 2.66? 
      // Usually division is higher for tuplets, e.g. 12.
      // Let's just assume division 12 for this test to avoid floats.
      const div12 = 12; // Q=12

      const notes = [
        createNote('C', 4, 'eighth', { "time-modification": timeMod }),
        createNote('D', 4, 'eighth', { "time-modification": timeMod }),
        createNote('E', 4, 'eighth', { "time-modification": timeMod }),
      ];

      const result = parseXMLNotes(notes, mockKey, mockTime, div12, 'S', false, false, false, false, 0);
      expect(result.solfaString).toBe('3<d.r.m>');
    });

    test('Quarter Note Triplets (3 in 2 beats) should use ":"', () => {
      // 3<d:r:m>
      const timeMod = { "actual-notes": 3, "normal-notes": 2 };
      const div12 = 12;
      // Quarter triplet = 2 beats / 3 = 24 / 3 = 8 duration

      const notes = [
        createNote('C', 8, 'quarter', { "time-modification": timeMod }),
        createNote('D', 8, 'quarter', { "time-modification": timeMod }),
        createNote('E', 8, 'quarter', { "time-modification": timeMod }),
      ];

      const result = parseXMLNotes(notes, mockKey, mockTime, div12, 'S', false, false, false, false, 0);
      expect(result.solfaString).toBe('3<d:r:m>');
    });

    test('Tuplets should NOT trigger off-beat holds', () => {
      // 8th triplet (duration 4/12 = 0.33 beat)
      // Start 1.0. End 1.33. Should NOT produce ".-"

      const timeMod = { "actual-notes": 3, "normal-notes": 2 };
      const div12 = 12;
      const notes = [
        createNote('C', 4, 'eighth', { "time-modification": timeMod }), // 1.0 -> 1.33
        createNote('D', 4, 'eighth', { "time-modification": timeMod }), // 1.33 -> 1.66
      ];

      const result = parseXMLNotes(notes, mockKey, mockTime, div12, 'S', false, false, false, false, 0);
      // Should be 3<d.r>, NOT 3<d.-r>
      expect(result.solfaString).toBe('3<d.r>');
    });
  });

  describe('4. Ties and Slurs', () => {
    test('Ties should replace 2nd note with "-" and preserve suffixes', () => {
      const note1 = createNote('C', 4, 'quarter', { notations: { tied: '' } }); // Start tie & slur
      const note2 = createNote('C', 4, 'quarter', { notations: { tied: '' } }); // End tie, End slur (implied logic)

      // Pass isTieActive=false initially
      let res = parseXMLNotes([note1, note2], mockKey, mockTime, mockDivision, 'S', false, false, false, false, 0);
      expect(res.newTieState).toBe(true);
      expect(res.solfaString).toBe('d :-');
    });

    test('Tied note at end of measure should NOT get extra holds in Pass 3', () => {
      // Measure ends with a tied note. Should just be "-"
      const note1 = createNote('C', 4, 'quarter', { notations: { tied: '' } });
      // Assume previous measure started the tie
      const result = parseXMLNotes([note1], mockKey, mockTime, mockDivision, 'S', false, true, false, false, 0);
      expect(result.solfaString).toBe('-');
    });

    test('12/8 time: Tied dotted half notes should show full duration holds', () => {
      // Issue: In 12/8 time, a dotted half note (6 eighth notes = 768 duration with division 128)
      // tied to another dotted half note should display all holds

      const mockTime12_8: TimeSignature = { numerator: 12, denominator: 8 };
      const division128 = 128; // Common division for 12/8

      const notes = [
        createNote('D', 768, 'half', {
          dot: '',
          tie: '',
          notations: { tied: '' },
        }), // First tied note: 768/128 = 6 beats in 12/8
        createNote('D', 768, 'half', {
          dot: '',
          tie: '',
          notations: { tied: '' }
        }), // Second tied note: another 6 beats
      ];

      const result = parseXMLNotes(notes, mockKey, mockTime12_8, division128, 'A', false, false, false, false, 0);
      console.log(result)
      // In 12/8, beatScale = 2, so 768/128 * 2 = 12 beats
      // First note: beat 1 to 13 (12 beats), should have holds at beats 2,3,4,5,6,7,8,9,10,11,12
      // Second note: beat 13 to 25 (12 beats), should show as "-" and have holds at beats 14,15,16,17,18,19,20,21,22,23,24
      expect(result.solfaString).toBe('r : - : - : - : - : - : - : - : - : - : - : - :- : - : - : - : - : - : - : - : - : - : - : -');
    });
  });

  describe('5. Prefixes', () => {
    test('Should add Time and Key prefixes when flags are true', () => {
      const notes = [createNote('C', 4, 'quarter')];
      const result = parseXMLNotes(notes, mockKey, mockTime, mockDivision, 'S', false, false, true, true, 1);
      // Assuming Key C -> @C, Time 4/4 -> #4/4
      expect(result.solfaString).toContain('@C');
      expect(result.solfaString).toContain('#4/4');
      expect(result.solfaString).toContain('d');
    });
  });
})