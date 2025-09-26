import { getStartingMeasureNumber, parseNotationToJSON } from "@/lib/parsers/text-to-json";
import { parse } from "@/lib/parsers/text-to-json/parser";
import { tokenize } from "@/lib/parsers/text-to-json/tokenizer";
import { Note } from "@/lib/parsers/interfaces";

describe('Parser Tests', () => {
  it('should parse a sequence of tokens into musical events', () => {
    // Test input: [mf]d(see) : ~r(the) : m(sun)~ | f(and) : -.[fp]m(smile) : [p]s : - | l : t : d ||
    // This contains: dynamics, notes with lyrics, slurs, barlines, note extensions, and measure changes
    const input = '[mf]d(see) : ~r(the) : m(sun)~ | f(and) : -.[fp]m(smile) : [p]s : - | l : t : d ||';
    const tokens = tokenize(input);

    const { events } = parse(tokens, 1, 'Soprano');

    // Verify we have the expected number of events
    expect(events.length).toBeGreaterThan(0);

    // Check that we have notes with lyrics (d(see), r(the), m(sun), f(and), m(smile))
    const notesWithLyrics = events.filter(event =>
      event.type === 'note' && 'lyric' in event && event.lyric
    );
    expect(notesWithLyrics.length).toBe(5);

    // Verify the first note has correct properties (dynamics, lyrics, measure)
    const firstNote = events.find(event => event.type === 'note') as any;
    expect(firstNote).toBeDefined();
    expect(firstNote.noteName).toBe('d');
    expect(firstNote.lyric).toEqual({ '1': 'see' });
    expect(firstNote.dynamic).toBe('mf');
    expect(firstNote.measureNumber).toBe(1);

    // Check for slur markings (~r(the) : m(sun)~)
    const slurStartNote = events.find(event =>
      event.type === 'note' && 'slur' in event && event.slur === 'start'
    ) as any;
    expect(slurStartNote).toBeDefined();
    expect(slurStartNote.noteName).toBe('r');

    // Check for barlines indicating measure changes (| and ||)
    const barlines = events.filter(event =>
      event.type === 'delimiter' && ((event.value as any) === '|' || (event.value as any) === '||')
    );
    expect(barlines.length).toBe(3); // Two single barlines and one double barline

    // Verify events span multiple measures
    const measureNumbers = [...new Set(events.map(event => event.measureNumber))];
    expect(measureNumbers).toContain(1);
    expect(measureNumbers).toContain(2);
    expect(measureNumbers).toContain(3);

    // Check for dynamic changes ([fp]m(smile))
    const dynamicNote = events.find(event =>
      event.type === 'note' && 'dynamic' in event && event.dynamic === 'fp'
    ) as any;
    expect(dynamicNote).toBeDefined();
    expect(dynamicNote.noteName).toBe('m');
  });

  it('should correctly parse tuplets with complex content', () => {
    const input = 'd : 3<r(stew){r} : ~d: m~> | 5<d : - : d : d : d> ||';
    const tokens = tokenize(input);
    const { events } = parse(tokens, 1, 'Soprano');
    console.log(events);
    const notes = events.filter(e => e.type === 'note') as Note[];
    expect(notes.length).toBe(8);

    expect(notes[0]?.duration).toBe(1);

    // 3<r(stew){r} : ~d: m~>
    const tupletNote1 = notes[1];
    expect(tupletNote1?.duration).toBeCloseTo(1 / 3);
    expect(tupletNote1?.lyric).toEqual({ '1': 'stew' });
    expect(tupletNote1?.divisi).toEqual({ '1': { noteName: 'r', octave: 0 } });

    const tupletNote2 = notes[2];
    expect(tupletNote2?.duration).toBeCloseTo(1 / 3);
    expect(tupletNote2?.slur).toBe('start');

    const tupletNote3 = notes[3];
    expect(tupletNote3?.duration).toBeCloseTo(1 / 3);
    expect(tupletNote3?.slur).toBe('end');

    // 5<d : - : d : d : d>
    const quintupletNotes = notes.slice(4);
    expect(quintupletNotes.length).toBe(4);
    expect(quintupletNotes[0]?.duration).toBeCloseTo(0.4); // d : -
    expect(quintupletNotes[1]?.duration).toBe(0.2); // d
    expect(quintupletNotes[2]?.duration).toBe(0.2); // d
    expect(quintupletNotes[3]?.duration).toBe(0.2); // d
  });

  it('Should handle multiple parts correctly', () => {
    const input = `
    S.m(Jin) : m(go) : m(lo) / m(bell,) : - : - | m(Jin) : m(go) : m(lo) / m(bell,) : - : - | m(Jin) : m(go -) : s(lo) / d(all) : - : r(the) | m(way) : - : - / - : - : -|f(make) : - : f(all)/f(of) : f(u -): f(na) | m(come) : - : m(fol) / m(low) : m(us) : - |
    A.d : d: d / d : - : - | tₗ : tₗ: tₗ / tₗ : - : - | taₗ : taₗ: taₗ / lₗ : - : laₗ | sₗ : - : - / taₗ: - : -| lₗ : - : lₗ / lₗ: lₗ: tₗ | d : d: - / sₗ : - : - |
    T.s(Jin) : s: (go) : s(lo) / s(bell,) : - : - | se(Jin) : se: (go) : se(lo) / se(bell,) : - : - | s(Jin) : s(go -) : s(lo) / f(all) : - : f(the) | s(way) : - : - / - : -: -| f(make) : -:f(all)/f(of): d(u -): r(na) | m(fol -): m(low) : - / d(us) : - : - |
    B.d(Jin) : d: (go) : d(lo) / d(bell,) : - : - | r(Jin) : r: (go) : r(lo) / r(bell,) : - : - | d(Jin) : d(go -) : d(lo) / lₗ(all) : - : tₗ(the) | d(way) : - : - /dₗ : - : - |r(make) : - : - /d(u -) : - : tₗ(na) | lₗ(fol -) : lₗ(low) : - / sₗ(us) : - : - |
    `;

    const result = parseNotationToJSON(input, { numerator: 6, denominator: 8 });

    // Verify that all parts are parsed correctly
    expect(result).toBeDefined();
    expect(result!.measures.size).toBe(6);

    // Check that all measures contain all 4 parts
    for (let i = 1; i <= 6; i++) {
      const measure = result!.measures.get(i);
      expect(measure).toBeDefined();
      expect(Object.keys(measure!.parts)).toEqual(['Soprano', 'Alto', 'Tenor', 'Bass']);
    }
  });

  it('Should handle grace notes', () => {
    const input = 'g<m,r>d:';
    const tokens = tokenize(input);
    console.log(tokens);
    const { events } = parse(tokens, 1, 'Soprano');
    console.log(JSON.stringify(events, null, 2));
    // const graceNotes = events.filter(e => e.type === 'note' && e.graceNotes);
    // expect(graceNotes.length).toBe(1);
    // expect(graceNotes[0].graceNotes).toEqual([{ noteName: 'm', octave: 0 }, { noteName: 'r', octave: 0 }]);
  });
});