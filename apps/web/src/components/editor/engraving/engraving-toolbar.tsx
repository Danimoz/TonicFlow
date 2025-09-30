import { useEditor } from "@/contexts/editor-context";
import { addDynamicToNote } from "@/lib/parsers/text-to-json";
import { useScoreLayout } from "@/hooks/useScoreLayout";
import { Button } from "@repo/ui/components/button";
import { Printer } from "lucide-react";

interface EngravingToolbarProps {
  onPrint?: () => void;
}

export default function EngravingToolbar({ onPrint }: EngravingToolbarProps) {
  const { state, setSolfaText } = useEditor();
  const layout = useScoreLayout();

  const getSelectedNote = () => {
    if (!state?.selection || !layout) return null;
    const { systemIndex, measureIndex, partIndex, noteIndex } = state.selection;
    const system = layout.systems[systemIndex];
    if (!system) return null;
    const staff = system.staves[partIndex];
    if (!staff) return null;
    const measure = staff.measures[measureIndex];
    if (!measure) return null;
    const event = measure.events[noteIndex];
    if (!event || event.type !== 'note') return null;

    // Find the index of the current event in the measure
    const eventIndexInMeasure = measure.events.findIndex((e: any) => e === event);

    // Calculate beat position by accumulating durations of all previous events
    let cumulativeBeat = 1; // Start at beat 1

    for (let i = 0; i < eventIndexInMeasure; i++) {
      const previousEvent = measure.events[i];
      if (previousEvent && (previousEvent.type === 'note' || previousEvent.type === 'rest')) {
        cumulativeBeat += previousEvent.duration;
      }
    }

    // Round to the nearest sixteenth note (1/16 = 0.0625) to avoid floating point precision issues
    // but preserve decimal values like 3.875
    const roundedBeat = Math.round(cumulativeBeat * 16) / 16;

    return {
      ...event,
      measureNumber: event.measureNumber,
      beat: roundedBeat,
      partName: staff.partName
    };
  }

  const handleDynamicClick = (dynamic: string) => {
    if (!state?.selection || !state.solfaText) return;

    const timeSignature = state?.preferences?.timeSignature ?? { numerator: 4, denominator: 4 };
    const newSolfaText = addDynamicToNote(state.solfaText, state.selection, dynamic, timeSignature);
    setSolfaText(newSolfaText);
  };

  const selectedNote = getSelectedNote();

  const toolbarItems = [
    {
      id: 'dynamic-p',
      label: 'p',
      onClick: () => handleDynamicClick('p'),
      disabled: false
    },
    {
      id: 'dynamic-mf',
      label: 'mf',
      onClick: () => handleDynamicClick('mf'),
      disabled: false
    },
    {
      id: 'dynamic-f',
      label: 'f',
      onClick: () => handleDynamicClick('f'),
      disabled: false
    },
    {
      id: 'lyric-size-increase',
      label: 'A+',
      onClick: () => console.log('Increase lyric font size'),
    },
    {
      id: 'lyric-size-decrease',
      label: 'A-',
      onClick: () => console.log('Decrease lyric font size'),
    },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-1">
          <div className="text-sm font-medium text-gray-700 mr-4">Engraving Tools</div>
          <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-lg border border-gray-200/50">
            <div className="text-xs text-gray-500 font-medium px-2">Dynamics</div>
            {toolbarItems.slice(0, 3).map(item => (
              <Button
                key={item.id}
                onClick={item.onClick}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-white hover:shadow-sm border-0 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                title={item.label}
                disabled={!state?.selection || item.disabled}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-lg border border-gray-200/50 ml-2">
            <div className="text-xs text-gray-500 font-medium px-2">Text</div>
            {toolbarItems.slice(3).map(item => (
              <Button
                key={item.id}
                onClick={item.onClick}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-white hover:shadow-sm border-0 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                title={item.label}
                disabled={!state?.selection || item.disabled}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedNote && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                Part: {selectedNote.partName}
              </div>
              <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Note: {selectedNote.noteName}
              </div>
              <div className="text-xs text-gray-500 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                Measure: {selectedNote.measureNumber}
              </div>
              <div className="text-xs text-gray-500 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Beat: {selectedNote.beat}
              </div>
            </div>
          )}
          
          {/* Print Button */}
          <Button
            onClick={onPrint}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-gray-50 border border-gray-300 rounded-md flex items-center gap-2"
            title="Print Score"
            disabled={!onPrint}
          >
            <Printer size={14} />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
