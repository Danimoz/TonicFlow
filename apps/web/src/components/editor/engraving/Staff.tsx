import React from 'react';
import { NoteGroup } from './NoteGroup';

interface StaffProps {
  staff: any;
  isFirstSystem: boolean;
  layout: any;
  systemIndex: number;
  partIndex: number;
}

export const Staff: React.FC<StaffProps> = ({ staff, isFirstSystem, layout, systemIndex, partIndex }) => {
  const { longToShortPartMap } = layout;

  return (
    <g className="staff">
      <text
        className="part-name"
        x={staff.startX}
        y={staff.y}
        textAnchor="start"
      >
        {isFirstSystem
          ? staff.partName.charAt(0).toUpperCase() + staff.partName.slice(1)
          : longToShortPartMap[staff.partName] || staff.partName}
      </text>

      {staff.measures.map((measure: any, index: number) => (
        <g key={index}>
          <line
            x1={measure.startX}
            y1={staff.y - 20}
            x2={measure.startX}
            y2={staff.y + 20}
            className="bar-line"
          />
          <NoteGroup measure={measure} systemIndex={systemIndex} measureIndex={index} partIndex={partIndex} />
        </g>
      ))}
      <line
        x1={staff.endX}
        y1={staff.y - 20}
        x2={staff.endX}
        y2={staff.y + 20}
        className="bar-line"
      />
    </g>
  );
};
