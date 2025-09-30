export type ViewMode = 'page' | 'scroll';

export interface FontDefinition {
  name: string;
  family: string;
  url?: string; // Optional URL to load the font from
  fallbacks: string[]; 
}

export const availableFonts: FontDefinition[] = [
  {
    name: 'System Serif',
    family: 'serif',
    fallbacks: ['Times New Roman', 'Times', 'serif']
  },
  {
    name: 'New Century Schoolbook',
    family: 'New Century Schoolbook, serif',
    url: '/fonts/NewCenturySchoolbook.woff2',
    fallbacks: ['serif']
  },
  {
    name: 'MusGlyphs',
    family: 'MusGlyphs',
    url: '/fonts/MusGlyphs.woff2',
    fallbacks: ['serif']
  },
  {
    name: 'Calendula',
    family: 'Calendula',
    url: '/fonts/Calendula.otf',
    fallbacks: ['serif']
  }
]

export interface LayoutSettings {
  page: {
    width: number;
    height: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  stave: {
    height: number;
    spacing: number;
    systemSpacing: number;
    lineThickness: number;
  };
  title: {
    y: number;
  };
  fonts: {
    title: {
      font: FontDefinition;
      size: number;
      weight: string;
    };
    subtitle: {
      font: FontDefinition;
      size: number;
      weight: string;
      style?: string;
    };
    timeSignature: {
      font: FontDefinition;
      size: number;
      weight: string;
    };
    lyrics: {
      font: FontDefinition;
      size: number;
      weight: string;
    };
    dynamics: {
      font: FontDefinition;
      size: number;
      weight?: string;
      style?: string;
    };
    notes: {
      font: FontDefinition;
      size: number;
      weight: string;
    }
    tuplet: {
      font: FontDefinition;
      size: number;
      weight?: string;
      style?: string;
    };
  };
  colors: {
    text: string;
    staveLines: string;
    notes: string;
    selection: string;
  };
}



export const defaultLayoutSettings: LayoutSettings = {
  page: {
    width: 980,
    height: 1100,
    margins: {
      top: 60,
      bottom: 60,
      left: 60,
      right: 60,
    },
  },
  stave: {
    height: 100,
    spacing: 12,
    systemSpacing: 100,
    lineThickness: 1,
  },
  title: {
    y: 40,
  },
  fonts: {
    title: {
      font: availableFonts[1]!,
      size: 24,
      weight: 'bold',
    },
    subtitle: {
      font: availableFonts[1]!,
      size: 16,
      weight: 'normal',
      style: 'italic',
    },
    timeSignature: {
      font: availableFonts[2]!,
      size: 18,
      weight: 'bold',
    },
    notes: {
      font: availableFonts[3]!,
      size: 14,
      weight: 'bold',
    },
    lyrics: {
      font: availableFonts[1]!,
      size: 14,
      weight: 'normal',
    },
    dynamics: {
      font: availableFonts[2]!,
      size: 16,
      style: 'normal',
    },
    tuplet: {
      font: availableFonts[2]!,
      size: 12,
      style: 'italic',
    },
  },
  colors: {
    text: '#000000',
    staveLines: '#000000',
    notes: '#000000',
    selection: '#007bff',
  },
};

export async function loadFont(font: FontDefinition): Promise<void> {
  if (!font.url) return;
  try {
    const fontFace = new FontFace(font.family, `url(${font.url})`, { style: 'normal', weight: '400' });
    await fontFace.load();
    document.fonts.add(fontFace);
    console.log(`Font ${font.name} loaded successfully.`);
  } catch (error) {
    console.error(`Failed to load font ${font.name} from ${font.url}:`, error);
  }
}

/**
 * Generates the CSS for the SVG based on the layout settings.
 * @param settings The layout settings to use.
 * @returns A string containing the CSS for the SVG.
 */
export function getSvgStyles(settings: LayoutSettings = defaultLayoutSettings): string {
  const getFontFamily = (fontDef: FontDefinition) => `${fontDef.family}, ${fontDef.fallbacks.join(', ')}`;
  return `
    .title {
      font-family: ${getFontFamily(settings.fonts.title.font)};
      font-size: ${settings.fonts.title.size}px;
      font-weight: ${settings.fonts.title.weight};
      text-anchor: middle;
      fill: ${settings.colors.text};
    }
    .subtitle {
      font-family: ${getFontFamily(settings.fonts.subtitle.font)};
      font-size: ${settings.fonts.subtitle.size}px;
      font-weight: ${settings.fonts.subtitle.weight};
      font-style: ${settings.fonts.subtitle.style};
      text-anchor: middle;
      fill: ${settings.colors.text};
    }
    .part-name {
      font-family: ${getFontFamily(settings.fonts.subtitle.font)};
      font-size: ${settings.fonts.subtitle.size}px;
      font-weight: ${settings.fonts.title.weight};
      fill: ${settings.colors.text};
    }
    .metadata {
      font-family: ${getFontFamily(settings.fonts.subtitle.font)};
      font-size: ${settings.fonts.subtitle.size - 2}px;
      font-weight: ${settings.fonts.subtitle.weight};
      font-style: ${settings.fonts.subtitle.style};
      fill: ${settings.colors.text};
    }
    .notes{
      font-family: ${getFontFamily(settings.fonts.notes.font)};
      font-size: ${settings.fonts.notes.size}px;
      font-weight: ${settings.fonts.notes.weight};
      fill: ${settings.colors.notes};
    }
    .time-signature {
      font-family: ${getFontFamily(settings.fonts.timeSignature.font)};
      font-size: ${settings.fonts.timeSignature.size}px;
      font-weight: ${settings.fonts.timeSignature.weight};
      fill: ${settings.colors.text};
    }
    .stave-line {
      stroke: ${settings.colors.staveLines};
      stroke-width: ${settings.stave.lineThickness}px;
    }
    .bar-line { 
      stroke: ${settings.colors.staveLines}; 
      stroke-width: 2; 
      stroke-linecap: round;
    }
    .note-head {
      fill: ${settings.colors.notes};
    }
    .lyric {
      font-size: ${defaultLayoutSettings.fonts.lyrics.size}px;
      font-family: '${defaultLayoutSettings.fonts.lyrics.font.family}';
    }
    .dynamic {
      font-size: ${defaultLayoutSettings.fonts.dynamics.size}px;
      font-family: '${defaultLayoutSettings.fonts.dynamics.font.family}';
      font-style: ${defaultLayoutSettings.fonts.dynamics.style};
    }
    .time-signature {
      font-size: ${defaultLayoutSettings.fonts.timeSignature.size}px;
      font-weight: ${defaultLayoutSettings.fonts.timeSignature.weight};
      fill: ${settings.colors.text};
    }
    .stave-line {
      stroke: ${settings.colors.staveLines};
      stroke-width: ${settings.stave.lineThickness}px;
    }
    .bar-line { 
      stroke: ${settings.colors.staveLines}; 
      stroke-width: 2; 
      stroke-linecap: round;
    }
    .note-head {
      fill: ${settings.colors.notes};
    }
    .lyric {
      font-size: ${defaultLayoutSettings.fonts.lyrics.size}px;
      font-family: '${defaultLayoutSettings.fonts.lyrics.font.family}';
    }
    .dynamic {
      font-size: ${defaultLayoutSettings.fonts.dynamics.size}px;
      font-family: '${defaultLayoutSettings.fonts.dynamics.font.family}';
      font-style: ${defaultLayoutSettings.fonts.dynamics.style};
    }
    .tuplet {
      font-family: ${getFontFamily(settings.fonts.tuplet.font)};
      font-size: ${settings.fonts.tuplet.size}px;
      font-style: ${settings.fonts.tuplet.style};
      text-anchor: middle;
      fill: ${settings.colors.text};
    }
    .barline {
      stroke: ${settings.colors.staveLines};
      stroke-width: ${settings.stave.lineThickness * 1.5}px;
    }
    .double-barline {
      stroke: ${settings.colors.staveLines};
      stroke-width: ${settings.stave.lineThickness * 2}px;
    }
    .slur, .tie {
      fill: none;
      stroke: ${settings.colors.notes};
      stroke-width: 2px;
    }
    .selected {
      fill: ${settings.colors.selection};
      cursor: pointer;
    }
    .note-group { cursor: pointer; }
    .note-group .dynamic { pointer-events: none; }
    .measure-number {
      font-family: ${getFontFamily(settings.fonts.subtitle.font)};
      font-size: ${settings.fonts.subtitle.size - 2}px;
      font-weight: bold;
      fill: ${settings.colors.text};
      opacity: 0.7;
    }
  `;
}
