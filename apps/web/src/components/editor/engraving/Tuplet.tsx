interface TupletProps {
  startNote: any;
  endNote: any;
  tupletNumber: number;
}

// Spacing constants (SVG units)
const TUPLET_HOOK_HEIGHT = 3; // height of the hooks on the tuplet bracket
const TUPLET_OFFSET = 20; // distance tuplet bracket sits above note


export const Tuplet: React.FC<TupletProps> = ({ startNote, endNote, tupletNumber }) => {
  if (!startNote || !endNote) return null;

  const noteHeadWidth = startNote.noteName.length * 8; // A rough approximation
  const startX = startNote.x + noteHeadWidth / 2;
  const endX = endNote.x + noteHeadWidth / 2;
  const yPos = Math.min(startNote.y, endNote.y) - TUPLET_OFFSET;

  // Calculate gap for the number
  const numberStr = String(tupletNumber);
  const numberWidth = numberStr.length * 8; // Approximate width per character
  const gapPadding = 6; // Extra space around the number
  const gapWidth = numberWidth + gapPadding;
  const centerX = (startX + endX) / 2;
  const leftGapEnd = centerX - gapWidth / 2;
  const rightGapStart = centerX + gapWidth / 2;

  return (
    <g className="tuplet">
      {/* Left bracket to left of number */}
      <path
        d={`M ${startX} ${yPos + TUPLET_HOOK_HEIGHT} L ${startX} ${yPos} L ${leftGapEnd} ${yPos}`}
        stroke="black"
        fill="none"
      />
      {/* Right bracket to right of number */}
      <path
        d={`M ${rightGapStart} ${yPos} L ${endX} ${yPos} L ${endX} ${yPos + TUPLET_HOOK_HEIGHT}`}
        stroke="black"
        fill="none"
      />
      {/* Tuplet number centered in the gap */}
      <text
        x={centerX}
        y={yPos + 0.5 * TUPLET_HOOK_HEIGHT}
        textAnchor="middle"
        alignmentBaseline="middle"
        dominantBaseline="middle"
        className="tuplet-number"
      >
        {tupletNumber}
      </text>
    </g>
  );
};
