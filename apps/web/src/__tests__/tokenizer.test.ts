import { tokenize } from '@/lib/parsers/text-to-json/tokenizer';

describe('Tokenizer Tests', () => {
  it('should handle edge cases', () => {
    const input = '&1 r(make) : - : r(we)/r(go) : r(ce-) : r(le-) | d(brate.) : - : / : lₗ(N) : sₗ(gwa)| m(flex) : tₗ(the) : - / tₗ(har-) : tₗ(ma-) : - | d(ttan-) :-: sₗ(nu) / - : sₗ(with) : sₗ(your)'
    const expectedOutput = [
      { type: 'FIRST_ENDING', value: '&1', position: 0 },
      { type: 'NOTE', value: 'r', position: 3 },
      { type: 'LPAREN', value: '(', position: 4 },
      { type: 'WORD', value: 'make', position: 5 },
      { type: 'RPAREN', value: ')', position: 9 },
      { type: 'COLON', value: ':', position: 11 },
      { type: 'DASH', value: '-', position: 13 },
      { type: 'COLON', value: ':', position: 15 },
      { type: 'NOTE', value: 'r', position: 17 },
      { type: 'LPAREN', value: '(', position: 18 },
      { type: 'WORD', value: 'we', position: 19 },
      { type: 'RPAREN', value: ')', position: 21 },
      { type: 'SLASH', value: '/', position: 22 },
      { type: 'NOTE', value: 'r', position: 23 },
      { type: 'LPAREN', value: '(', position: 24 },
      { type: 'WORD', value: 'go', position: 25 },
      { type: 'RPAREN', value: ')', position: 27 },
      { type: 'COLON', value: ':', position: 29 },
      { type: 'NOTE', value: 'r', position: 31 },
      { type: 'LPAREN', value: '(', position: 32 },
      { type: 'WORD', value: 'ce-', position: 33 },
      { type: 'RPAREN', value: ')', position: 36 },
      { type: 'COLON', value: ':', position: 38 },
      { type: 'NOTE', value: 'r', position: 40 },
      { type: 'LPAREN', value: '(', position: 41 },
      { type: 'WORD', value: 'le-', position: 42 },
      { type: 'RPAREN', value: ')', position: 45 },
      { type: 'BARLINE', value: '|', position: 47 },
      { type: 'NOTE', value: 'd', position: 49 },
      { type: 'LPAREN', value: '(', position: 50 },
      { type: 'WORD', value: 'brate.', position: 51 },
      { type: 'RPAREN', value: ')', position: 57 },
      { type: 'COLON', value: ':', position: 59 },
      { type: 'DASH', value: '-', position: 61 },
      { type: 'COLON', value: ':', position: 63 },
      { type: 'SLASH', value: '/', position: 65 },
      { type: 'COLON', value: ':', position: 67 },
      { type: 'NOTE', value: 'lₗ', position: 69 },
      { type: 'LPAREN', value: '(', position: 71 },
      { type: 'WORD', value: 'N', position: 72 },
      { type: 'RPAREN', value: ')', position: 73 },
      { type: 'COLON', value: ':', position: 75 },
      { type: 'NOTE', value: 'sₗ', position: 77 },
      { type: 'LPAREN', value: '(', position: 79 },
      { type: 'WORD', value: 'gwa', position: 80 },
      { type: 'RPAREN', value: ')', position: 83 },
      { type: 'BARLINE', value: '|', position: 84 },
      { type: 'NOTE', value: 'm', position: 86 },
      { type: 'LPAREN', value: '(', position: 87 },
      { type: 'WORD', value: 'flex', position: 88 },
      { type: 'RPAREN', value: ')', position: 92 },
      { type: 'COLON', value: ':', position: 94 },
      { type: 'NOTE', value: 'tₗ', position: 96 },
      { type: 'LPAREN', value: '(', position: 98 },
      { type: 'WORD', value: 'the', position: 99 },
      { type: 'RPAREN', value: ')', position: 102 },
      { type: 'COLON', value: ':', position: 104 },
      { type: 'DASH', value: '-', position: 106 },
      { type: 'SLASH', value: '/', position: 108 },
      { type: 'NOTE', value: 'tₗ', position: 110 },
      { type: 'LPAREN', value: '(', position: 112 },
      { type: 'WORD', value: 'har-', position: 113 },
      { type: 'RPAREN', value: ')', position: 117 },
      { type: 'COLON', value: ':', position: 119 },
      { type: 'NOTE', value: 'tₗ', position: 121 },
      { type: 'LPAREN', value: '(', position: 123 },
      { type: 'WORD', value: 'ma-', position: 124 },
      { type: 'RPAREN', value: ')', position: 127 },
      { type: 'COLON', value: ':', position: 129 },
      { type: 'DASH', value: '-', position: 131 },
      { type: 'BARLINE', value: '|', position: 133 },
      { type: 'NOTE', value: 'd', position: 135 },
      { type: 'LPAREN', value: '(', position: 136 },
      { type: 'WORD', value: 'ttan-', position: 137 },
      { type: 'RPAREN', value: ')', position: 142 },
      { type: 'COLON', value: ':', position: 144 },
      { type: 'DASH', value: '-', position: 145 },
      { type: 'COLON', value: ':', position: 146 },
      { type: 'NOTE', value: 'sₗ', position: 148 },
      { type: 'LPAREN', value: '(', position: 150 },
      { type: 'WORD', value: 'nu', position: 151 },
      { type: 'RPAREN', value: ')', position: 153 },
      { type: 'SLASH', value: '/', position: 155 },
      { type: 'DASH', value: '-', position: 157 },
      { type: 'COLON', value: ':', position: 159 },
      { type: 'NOTE', value: 'sₗ', position: 161 },
      { type: 'LPAREN', value: '(', position: 163 },
      { type: 'WORD', value: 'with', position: 164 },
      { type: 'RPAREN', value: ')', position: 168 },
      { type: 'COLON', value: ':', position: 170 },
      { type: 'NOTE', value: 'sₗ', position: 172 },
      { type: 'LPAREN', value: '(', position: 174 },
      { type: 'WORD', value: 'your', position: 175 },
      { type: 'RPAREN', value: ')', position: 179 }
    ]
    const tokens = tokenize(input);
    expect(tokens).toEqual(expectedOutput);
  });

  it('should tokenize grace notes', () => {
    const input = 'g<m,r>d';
    const tokens = tokenize(input);
    const expectedOutput = [
      { type: 'GRACE_NOTE', value: 'g', position: 0 },
      { type: 'LANGLE', value: '<', position: 1 },
      { type: 'NOTE', value: 'm', position: 2 },
      { type: 'COMMA', value: ',', position: 3 },
      { type: 'NOTE', value: 'r', position: 4 },
      { type: 'RANGLE', value: '>', position: 5 },
      { type: 'NOTE', value: 'd', position: 6 },
      { type: 'COLON', value: ':', position: 7 }
    ];
    expect(tokens).toEqual(expectedOutput);
  });

  it('should tokenize key modulations', () => {
    const input = '*s*m : - : ma . r'
    const tokens = tokenize(input);
    const expectedOutput = [
      { type: 'KEY_MODULATION', value: '*s*', position: 0 },
      { type: 'NOTE', value: 'm', position: 3 },
      { type: 'COLON', value: ':', position: 5 },
      { type: 'DASH', value: '-', position: 7 },
      { type: 'COLON', value: ':', position: 9 },
      { type: 'NOTE', value: 'ma', position: 11 },
      { type: 'DOT', value: '.', position: 14 },
      { type: 'NOTE', value: 'r', position: 16 }
    ];
    expect(tokens).toEqual(expectedOutput);
  })
});
