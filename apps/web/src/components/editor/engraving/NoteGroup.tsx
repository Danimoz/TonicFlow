'use client';

import { useEditor } from '@/contexts/editor-context';
import React from 'react';
import { Tuplet } from './Tuplet';

interface NoteGroupProps {
  measure: any;
  systemIndex: number;
  measureIndex: number;
  partIndex: number;
}

export const NoteGroup: React.FC<NoteGroupProps> = ({ measure, systemIndex, measureIndex, partIndex }) => {
  const { state, setSelection } = useEditor();
  const selection = state?.selection;

  // Spacing constants (SVG units)
  const DYNAMIC_ABOVE_OFFSET = 12; // distance dynamic sits above note head baseline
  const LYRIC_BASE_OFFSET = 18; // base distance lyrics sit below note
  const LYRIC_LINE_GAP = 16; // per verse vertical gap

  const tupletGroups: any[] = [];
  let currentTuplet: any = null;

  measure.events.forEach((event: any, index: number) => {
    if (event.type === 'note' && event.tuplet === 'start') {
      currentTuplet = {
        startIndex: index,
        startEvent: event,
        tupletNumber: event.tupletNumber,
        endIndex: -1,
        endEvent: null,
      };
    }

    if (currentTuplet && event.type === 'note' && event.tuplet === 'stop') {
      currentTuplet.endIndex = index;
      currentTuplet.endEvent = event;
      tupletGroups.push(currentTuplet);
      currentTuplet = null;
    }
  });

  return (
    <g>
      {tupletGroups.map((tuplet, i) => (
        <Tuplet
          key={`tuplet-${i}`}
          startNote={tuplet.startEvent}
          endNote={tuplet.endEvent}
          tupletNumber={tuplet.tupletNumber}
        />
      ))}
      {measure.events.map((event: any, index: number) => {
        if (event.type === 'note') {
          const isSelected = selection?.element === 'note' &&
            selection.systemIndex === systemIndex &&
            selection.measureIndex === measureIndex &&
            selection.partIndex === partIndex &&
            selection.noteIndex === index;

          const hasLyric = !!event.lyric && Object.keys(event.lyric).length > 0;

          const noteHeadWidth = (event.noteName.length + 0.25) * 8; // A rough approximation
          const noteHeadX = event.x + noteHeadWidth / 2;

          return (
            <g
              key={index}
              onClick={() => setSelection({ systemIndex, measureIndex, partIndex, noteIndex: index, element: 'note' })}
              className={`note-group ${isSelected ? 'selected' : ''}`}
            >
              {/* Dynamic above note (centered) */}
              {event.dynamic && (
                <text
                  className="dynamic"
                  x={noteHeadX}
                  y={event.y - DYNAMIC_ABOVE_OFFSET}
                  textAnchor="middle"
                >
                  {event.dynamic}
                </text>
              )}
              
              {/* Note */}
              <text x={event.x} y={event.y} className="note">
                {event.graceNotes && (
                  <tspan fontSize="12" baselineShift="super" className="grace-note">{event.graceNotes?.map((note: any) => note.noteName).join(', ')}</tspan>
                )}
                {event.noteChange && (
                  <tspan fontSize="14" className="note-change" x={event.x - 18}>{`[${event.noteChange}]`}</tspan>
                )}
                {event.noteName}
              </text>

              {/* Lyrics below note with per-verse offset */}
              {hasLyric && Object.entries(event.lyric).map(([verse, text]) => {
                const verseIndex = parseInt(verse, 10) - 1; // verses 1-based
                const isLyricSelected = selection?.element === 'lyric' &&
                  selection.systemIndex === systemIndex &&
                  selection.measureIndex === measureIndex &&
                  selection.partIndex === partIndex &&
                  selection.noteIndex === index;
                return (
                  <text
                    key={verse}
                    className={`lyric ${isLyricSelected ? 'selected' : ''}`}
                    x={noteHeadX}
                    y={event.y + LYRIC_BASE_OFFSET + verseIndex * LYRIC_LINE_GAP}
                    textAnchor="middle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelection({ systemIndex, measureIndex, partIndex, noteIndex: index, element: 'lyric' })
                    }}
                  >
                    {text as string}
                  </text>
                )
              })}
            </g>
          );
        } else if (event.type === 'rest') {
          return (
            <text key={index} x={event.x} y={event.y}>
              {event.duration === 1 ? 'X' : event.duration === 0.5 ? '.' : ','}
            </text>
          );
        } else if (event.type === 'note_extension') {
          let x = event.x;
          if (index > 0 && measure.events[index - 1]?.type === 'delimiter') {
            const minOffset = 15;
            x = measure.events[index - 1].x + minOffset;
          }
          return (
            <text key={index} x={x} y={event.y} textAnchor="middle">
              {event.value}
            </text>
          );
        } else if (event.type === 'delimiter') {
          const filteredDelims = ['barline', 'double_barline'];
          if (filteredDelims.includes(event.value)) return null;
          // Improved offset: use minimum for single-letter notes, larger for octave markings
          let x = event.x;
          if (index > 0 && measure.events[index - 1]?.type === 'note') {
            const prevNote = measure.events[index - 1];
            const offset = 18; // Minimum space for single-letter notes
            x = prevNote.x + offset;
          }


          return (
            <text key={index} x={x} y={event.y}>
              {event.value}
            </text>
          );
        }
        return null;
      })}
    </g>
  );
};
