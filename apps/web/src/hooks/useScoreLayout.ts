'use client';

import { useEffect, useMemo, useRef } from 'react';
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
  let width = 0;
  
  if (event.type === 'note') {
    width += NOTE_WIDTH;
    if (event.articulation && event.articulation.length > 0) {
      width += ARTICULATION_WIDTH * event.articulation.length;
    }
    if (event.dynamics && event.dynamics.length > 0) {
      width += DYNAMIC_WIDTH * event.dynamics.length;
    }
  } else if (event.type === 'rest') {
    width += REST_WIDTH;
  } else if (event.type === 'delimiter') {
    width += DELIMITER_WIDTH;
  }
  
  return width;
};

const calculateMeasureWidth = (measure: Measure): number => {
  let maxPartWidth = 0;

  for (const [, events] of Object.entries(measure.parts)) {
    let eventsWidth = 0;
    let lyricWidth = 0;

    for (const event of events) {
      eventsWidth += calculateEventWidth(event);
      if (event.type === 'note' && event.lyric) {
        const lyricText = Object.values(event.lyric).join(' ');
        lyricWidth += lyricText.length * LYRIC_CHAR_WIDTH;
      }
    }

    const partWidth = Math.max(eventsWidth, lyricWidth);
    if (partWidth > maxPartWidth) maxPartWidth = partWidth;
  }

  return Math.max(maxPartWidth + PADDING, MIN_MEASURE_WIDTH);
};

export function useScoreLayout() {
  const { state, project } = useEditor();
  const { layoutSettings } = useLayoutSettings();
  
  // Cache for parsed notes - only updates when switching to engrave mode
  const cachedParsedNotesRef = useRef<any>(null);
  const lastCachedSolfaTextRef = useRef<string>('');
  const lastCachedTimeSignatureRef = useRef<any>(null);

  // Update cache when switching to engrave mode
  useEffect(() => {
    if (state?.preferences?.viewMode === 'engrave' && state?.solfaText) {
      const currentTimeSignature = state?.preferences.timeSignature ?? { numerator: 4, denominator: 4 };
      
      // Only update cache if solfa text or time signature has changed
      if (
        lastCachedSolfaTextRef.current !== state.solfaText ||
        JSON.stringify(lastCachedTimeSignatureRef.current) !== JSON.stringify(currentTimeSignature)
      ) {
        cachedParsedNotesRef.current = parseNotationToJSON(state.solfaText, currentTimeSignature);
        lastCachedSolfaTextRef.current = state.solfaText;
        lastCachedTimeSignatureRef.current = currentTimeSignature;
      }
    }
  }, [state?.preferences?.viewMode, state?.solfaText, state?.preferences.timeSignature]);

  // Initialize cache on first load if we're already in engrave mode
  useEffect(() => {
    if (
      state?.preferences?.viewMode === 'engrave' && 
      state?.solfaText && 
      !cachedParsedNotesRef.current
    ) {
      const currentTimeSignature = state?.preferences.timeSignature ?? { numerator: 4, denominator: 4 };
      cachedParsedNotesRef.current = parseNotationToJSON(state.solfaText, currentTimeSignature);
      lastCachedSolfaTextRef.current = state.solfaText;
      lastCachedTimeSignatureRef.current = currentTimeSignature;
    }
  }, [state?.preferences?.viewMode, state?.solfaText, state?.preferences.timeSignature]);

  const longToShortPartMap = useMemo(() => {
    return Object.entries(partMap).reduce((acc, [, value]) => {
      acc[value.long] = value.short;
      return acc;
    }, {} as Record<string, string>);
  }, []);

  const layout = useMemo(() => {
    // Only use cached parsed notes in engrave mode
    const parsedNotes = state?.preferences?.viewMode === 'engrave' 
      ? cachedParsedNotesRef.current 
      : null;

    if (!parsedNotes) return null;

    // Use A4 paper dimensions for consistent printing layout
    // A4 width: 210mm = 8.27 inches = 794 pixels at 96 DPI. 96 DPI is a CSS/web standard (logical pixels
    const svgWidth = 794; // Fixed A4 width for proper printing
    const svgHeight = 1123; // A4 height: 297mm = 11.69 inches = 1123 pixels at 96 DPI
    const partNameGutter = 80;
    const staffHeight = 40;

    // Helper function to detect lyric-tuplet conflicts and calculate part spacing adjustments
    const calculatePartSpacingAdjustments = (system: any[], partNames: string[]) => {
      const adjustments: number[] = new Array(partNames.length).fill(0);
      
      // For each measure in the system
      system.forEach(measure => {
        // For each part (except the last one)
        for (let partIndex = 0; partIndex < partNames.length - 1; partIndex++) {
          const currentPartName = partNames[partIndex];
          const nextPartName = partNames[partIndex + 1];
          
          const currentPartEvents = currentPartName ? measure.parts[currentPartName] || [] : [];
          const nextPartEvents = nextPartName ? measure.parts[nextPartName] || [] : [];
          
          // Check if current part has lyrics and next part has tuplets
          const currentPartHasLyrics = currentPartEvents.some((event: any) => 
            event.type === 'note' && event.lyric
          );
          const nextPartHasTuplets = nextPartEvents.some((event: any) => 
            event.type === 'note' && event.tuplet
          );
          const nextPartHasDynamics = nextPartEvents.some((event: any) => 
            event.type === 'note' && event.dynamics && event.dynamics.length > 0
          );
          
          // If conflict detected, add spacing adjustment for the next part
          if (currentPartHasLyrics && nextPartHasTuplets) {
            adjustments[partIndex + 1] = Math.max(adjustments[partIndex + 1] ?? 0, 6);
          }
          
          // If conflict detected, add spacing adjustment for the next part
          if (currentPartHasLyrics && nextPartHasDynamics) {
            adjustments[partIndex + 1] = Math.max(adjustments[partIndex + 1] ?? 0, 6);
          }
        }
      });
      
      return adjustments;
    };

    const systemSpacing = 60;

    const allPartNames = new Set<string>();
    const measuresArray = Array.from(parsedNotes.measures.values()) as Measure[];

    measuresArray.forEach((measure: Measure) => {
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

    let currentPage = 1;
    let currentSystemY = yOffset;
    
    // Calculate system height including potential lyric-tuplet spacing adjustments
    const calculateSystemHeight = (system: any[]) => {
      const spacingAdjustments = calculatePartSpacingAdjustments(system, partNames);
      const totalAdjustments = spacingAdjustments.reduce((sum, adj) => sum + adj, 0);
      return numParts * staffHeight + systemSpacing + totalAdjustments;
    };

    const layoutSystems = systems.map((system, line) => {
      const systemHeight = calculateSystemHeight(system)
      if (currentSystemY + systemHeight > svgHeight - layoutSettings.page.margins.bottom && line > 0) {
        currentPage++;
        currentSystemY = layoutSettings.page.margins.top;
      }
      const systemYOffset = currentSystemY;
      currentSystemY += systemHeight;
      const isLastLine = line === systems.length - 1;

      // Calculate spacing adjustments for lyric-tuplet conflicts
      const spacingAdjustments = calculatePartSpacingAdjustments(system, partNames);

      const staves = partNames.map((partName, partIndex) => {
        // Calculate cumulative spacing adjustments up to this part
        const cumulativeAdjustment = spacingAdjustments.slice(0, partIndex + 1).reduce((sum, adj) => sum + adj, 0);
        const staffY = systemYOffset + partIndex * staffHeight + cumulativeAdjustment;
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
        page: currentPage,
        spacingAdjustments,
        globalSystemIndex: line // Add global system index
      };
    });

    const slurPaths: { [page: number]: string[] } = {};
    const openSlurs: { [key: string]: any } = {};

    layoutSystems.forEach(system => {
      const page = system.page;
      if (!slurPaths[page]) {
        slurPaths[page] = [];
      }
      system.staves.forEach(staff => {
        staff.measures.forEach(measure => {
          measure.events.forEach((event: any) => {
            if (event.type === 'note') {
              if (event.slur === 'start') {
                openSlurs[staff.partName] = { ...event, page };
              } else if (event.slur === 'end' && openSlurs[staff.partName]) {
                const startNote = openSlurs[staff.partName];
                // Assuming slurs do not cross pages for now.
                if (startNote.page === page) {
                  const endNote = event;

                  const startX = startNote.x + 5;
                  const startY = startNote.y + 5;
                  const endX = endNote.x;
                  const endY = endNote.y + 5;

                  const controlX1 = startX;
                  const controlY1 = startY + 5;
                  const controlX2 = endX;
                  const controlY2 = endY + 5;

                  const path = `M ${startX},${startY} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`;
                  if (!slurPaths[page]) {
                    slurPaths[page] = [];
                  }
                  slurPaths[page].push(path);

                  delete openSlurs[staff.partName];
                }
              }
            }
          });
        });
      });
    });

    return {
      svgWidth,
      svgHeight,
      systems: layoutSystems,
      metadataLayout,
      longToShortPartMap,
      layoutSettings,
      slurPaths,
    };
  }, [cachedParsedNotesRef.current, layoutSettings, longToShortPartMap, project, state?.preferences?.viewMode]);

  return layout;
}