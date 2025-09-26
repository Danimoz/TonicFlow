'use client';

import { useMemo } from 'react';
import { useEditor } from '@/contexts/editor-context';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { parseNotationToJSON } from '@/lib/parsers/text-to-json';
import { partMap } from '@/lib/parsers/parserUtils';
import { Measure, MusicalEvent, Note } from '@/lib/parsers/interfaces';

const NOTE_WIDTH = 20;
const REST_WIDTH = 20;
const ARTICULATION_WIDTH = 10;
const DYNAMIC_WIDTH = 15;
const DELIMITER_WIDTH = 12;
const LYRIC_CHAR_WIDTH = 10;
const PADDING = 8;
const MIN_MEASURE_WIDTH = 50;

const calculateEventWidth = (event: MusicalEvent): number => {
  if (event.type === 'note') {
    let width = NOTE_WIDTH;
    if (event.octave !== 0) width += 8
    if (event.articulation) width += ARTICULATION_WIDTH;
    if (event.dynamic) width += DYNAMIC_WIDTH;
    if (event.graceNotes) width += event.graceNotes.length * 8;
    if (event.noteChange) width += (event.noteChange.length + 1.5) * 12;
    return width;
  }
  if (event.type === 'rest') return REST_WIDTH;
  if (event.type === 'note_extension') return 4;
  if (event.type === 'delimiter') {
    if (event.value === 'barline' || event.value === 'double_barline') return 5;
    return DELIMITER_WIDTH;
  }
  return 0;
};

const calculateMeasureWidth = (measure: Measure): number => {
  let maxPartWidth = 0;

  if (measure.isPickup) {
    return 80;
  }

  const partNames = Object.keys(measure.parts);

  for (const partName of partNames) {
    const partEvents = measure.parts[partName] || [];
    let eventsWidth = 0;
    let lyricWidth = 0;

    partEvents.forEach(event => {
      eventsWidth += calculateEventWidth(event);
      if (event.type === 'note' && event.lyric) {
        const lyricText = Object.values(event.lyric).join(' ');
        lyricWidth += lyricText.length * LYRIC_CHAR_WIDTH;
      }
    });

    const partWidth = Math.max(eventsWidth, lyricWidth);
    if (partWidth > maxPartWidth) maxPartWidth = partWidth;
  }

  return Math.max(maxPartWidth + PADDING, MIN_MEASURE_WIDTH);
};

export function useScoreLayout() {
  const { state, project } = useEditor();
  const { layoutSettings } = useLayoutSettings();

  const parsedNotes = useMemo(() => {
    return parseNotationToJSON(state?.solfaText ?? '', state?.preferences.timeSignature ?? { numerator: 4, denominator: 4 });
  }, [state?.solfaText, state?.preferences.timeSignature]);

  const longToShortPartMap = useMemo(() => {
    return Object.entries(partMap).reduce((acc, [, value]) => {
      acc[value.long] = value.short;
      return acc;
    }, {} as Record<string, string>);
  }, []);

  const layout = useMemo(() => {
    if (!parsedNotes) return null;

    const svgWidth = 816; // Standard page width
    const partNameGutter = 80;
    const staffHeight = 40;
    const systemSpacing = 60;

    const allPartNames = new Set<string>();
    const measuresArray = Array.from(parsedNotes.measures.values());

    measuresArray.forEach(measure => {
      Object.keys(measure.parts).forEach(partName => allPartNames.add(partName));
    });
    const partNames = Array.from(allPartNames);
    const numParts = partNames.length;

    const availableWidth = svgWidth - layoutSettings.page.margins.left - layoutSettings.page.margins.right;
    const availableWidthForMeasures = availableWidth - 80;

    let yOffset = layoutSettings.page.margins.top;

    // Metadata Layout
    const titleY = yOffset;
    const subtitleY = titleY + 20;
    const composerY = subtitleY + (project?.subTitle ? 20 : 0) + 20;

    const metadataLayout = {
      title: { x: '50%', y: titleY, text: project?.title || 'Untitled' },
      subtitle: project?.subTitle ? { x: '50%', y: subtitleY, text: project.subTitle } : null,
      composer: project?.composer
        ? {
          x: svgWidth - layoutSettings.page.margins.right,
          y: composerY,
          text: project.composer,
        }
        : null,
      arranger: project?.arranger
        ? {
          x: svgWidth - layoutSettings.page.margins.right,
          y: composerY + 20,
          text: `arr. ${project.arranger}`,
        }
        : null,
      keySignature: state?.preferences.keySignature
        ? {
          x: layoutSettings.page.margins.left,
          y: composerY,
          key: state.preferences.keySignature.key,
          mode: state.preferences.keySignature.mode,
        }
        : null,
      timeSignature: state?.preferences.timeSignature
        ? {
          x: layoutSettings.page.margins.left + 100,
          y: composerY,
          text: `${state.preferences.timeSignature.numerator}/${state.preferences.timeSignature.denominator}`,
        }
        : null,
    };
    yOffset = composerY + 40;

    // Systems Layout (Greedy Algorithm)
    const systems: Measure[][] = [];
    let currentLine: Measure[] = [];
    let currentLineWidth = 0;

    measuresArray.forEach((measure) => {
      const width = calculateMeasureWidth(measure);
      if (currentLineWidth + width > availableWidthForMeasures && currentLine.length > 0) {
        systems.push(currentLine);
        currentLine = [];
        currentLineWidth = 0;
      }
      currentLine.push(measure);
      currentLineWidth += width;
    });

    if (currentLine.length > 0) {
      systems.push(currentLine);
    }

    const layoutSystems = systems.map((system, line) => {
      const systemYOffset = yOffset + line * (numParts * staffHeight + systemSpacing);
      const isLastLine = line === systems.length - 1;

      const staves = partNames.map((partName, partIndex) => {
        const staffY = systemYOffset + partIndex * staffHeight;
        let currentX = layoutSettings.page.margins.left + partNameGutter;

        const measures = system.map(measure => {
          let measureWidth;
          if (isLastLine) {
            measureWidth = calculateMeasureWidth(measure);
          } else {
            const totalCustomWidth = system.reduce((sum, m) => sum + calculateMeasureWidth(m), 0);
            const stretchFactor = availableWidthForMeasures / totalCustomWidth;
            measureWidth = calculateMeasureWidth(measure) * stretchFactor;
          }

          const measureStartX = currentX;
          currentX += measureWidth;

          const partEvents = measure.parts[partName] || [];
          let events;

          if (measure.isPickup) {
            const totalEventsWidth = partEvents.reduce((sum, event) => sum + calculateEventWidth(event), 0);
            let currentEventX = measureStartX + measureWidth - totalEventsWidth;
            events = partEvents.map(event => {
              const eventWidth = calculateEventWidth(event);
              const eventX = currentEventX - 10 + eventWidth / 2;
              currentEventX += eventWidth;
              return { ...event, x: eventX, y: staffY };
            });
          } else {
            const eventCount = partEvents.length;
            const innerPadding = measureWidth * 0.15;
            const usableWidth = measureWidth - 2 * innerPadding;
            const elementSpacing = eventCount > 1 ? usableWidth / (eventCount - 1) : 0;
            events = partEvents.map((event, eventIndex) => {
              const elementX = measureStartX + innerPadding + eventIndex * elementSpacing;
              return { ...event, x: elementX, y: staffY };
            });
          }

          return {
            ...measure,
            width: measureWidth,
            startX: measureStartX,
            endX: currentX,
            events,
          };
        });

        return {
          partName,
          y: staffY,
          startX: layoutSettings.page.margins.left,
          endX: currentX,
          measures,
        };
      });

      return {
        y: systemYOffset,
        staves,
      };
    });

    const slurPaths: string[] = [];
    const openSlurs: { [key: string]: any } = {};

    layoutSystems.forEach(system => {
      system.staves.forEach(staff => {
        staff.measures.forEach(measure => {
          measure.events.forEach((event: any) => {
            if (event.type === 'note') {
              if (event.slur === 'start') {
                openSlurs[staff.partName] = event;
              } else if (event.slur === 'end' && openSlurs[staff.partName]) {
                const startNote = openSlurs[staff.partName];
                const endNote = event;

                const startX = startNote.x + 5; // Offset to start from the edge of the note
                const startY = startNote.y + 5; // Position below the note
                const endX = endNote.x;
                const endY = endNote.y + 5;

                const controlX1 = startX;
                const controlY1 = startY + 5; // Control point for downward curve
                const controlX2 = endX;
                const controlY2 = endY + 5; // Control point for downward curve

                const path = `M ${startX},${startY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`;
                slurPaths.push(path);

                delete openSlurs[staff.partName];
              }
            }
          });
        });
      });
    });

    return {
      svgWidth,
      systems: layoutSystems,
      metadataLayout,
      longToShortPartMap,
      layoutSettings,
      slurPaths,
    };
  }, [parsedNotes, project, state, layoutSettings, longToShortPartMap]);

  return layout;
}
