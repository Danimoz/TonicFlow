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
  const { longToShortPartMap, systems } = layout;

  // Calculate bar line heights based on system layout
  const currentSystem = systems[partIndex];
  const spacingAdjustments = currentSystem?.spacingAdjustments || [];
  const totalSpacingAdjustment = spacingAdjustments.reduce((sum: number, adj: number) => sum + adj, 0);

  // Get the part name text for width calculation
  const partNameText = isFirstSystem
    ? staff.partName.charAt(0).toUpperCase() + staff.partName.slice(1)
    : longToShortPartMap[staff.partName] || staff.partName;

  // Calculate measure number position (after part name, only for first staff)
  const measureNumber = staff.measures[0]?.number;
  const partNameWidth = partNameText.length * 8; // Approximate character width
  const measureNumberX = staff.startX + partNameWidth + 20; // 20px gap after part name

  return (
    <g className="staff">
      <text
        className="part-name"
        x={staff.startX}
        y={staff.y}
        textAnchor="start"
      >
        {partNameText}
      </text>

      {/* Render measure number after part name, only for first staff */}
      {partIndex === 0 && measureNumber && (
        <text
          className="measure-number"
          x={!isFirstSystem ? measureNumberX + 20 : measureNumberX}
          y={staff.y - 25}
          textAnchor="start"
        >
          {measureNumber}
        </text>
      )}

      {staff.measures.map((measure: any, index: number) => {
        // Find meter change in measure.events
        const meterChange = measure.events?.find((event: any) =>
          event.type === 'meta' && event.title === 'meter_change'
        );

        return (
          <g key={index}>
            <line
              x1={measure.startX}
              y1={staff.y - 20}
              x2={measure.startX}
              y2={staff.y + 20 + totalSpacingAdjustment}
              className="bar-line"
            />

            {/* Render meter change above the measure, only on first staff */}
            {partIndex === 0 && meterChange && (
              <text
                className="time-signature"
                x={measure.startX + 10}
                y={staff.y - 40}
                textAnchor="start"
              >
                {/* Display the value and remove the # */}
                {meterChange.value.slice(1)}
              </text>
            )}

            <NoteGroup measure={measure} systemIndex={systemIndex} measureIndex={index} partIndex={partIndex} />

            {/* Render double bar line at the end of the measure if barlineType is 'double' */}
            <g>
              {measure.barlineType === 'double' ? (
                <line
                  x1={measure.endX - 6}
                  y1={staff.y - 20}
                  x2={measure.endX - 6}
                  y2={staff.y + 20 + totalSpacingAdjustment}
                  className="bar-line"
                  strokeWidth="1"
                />
              ) : measure.barlineType === 'final' ? (
                <>
                  <line
                    x1={measure.endX - 6}
                    y1={staff.y - 20}
                    x2={measure.endX - 6}
                    y2={staff.y + 20 + totalSpacingAdjustment}
                    className="bar-line"
                    strokeWidth="1"
                  />
                  <line
                    x1={measure.endX - 1}
                    y1={staff.y - 20}
                    x2={measure.endX - 1}
                    y2={staff.y + 20 + totalSpacingAdjustment}
                    className="bar-line"
                    strokeWidth="1"
                  />
                </>
              ) : (
                <line
                  x1={staff.endX}
                  y1={staff.y - 20}
                  x2={staff.endX}
                  y2={staff.y + 20 + totalSpacingAdjustment}
                  className="bar-line"
                />
              )}
            </g>
          </g>
        );
      })}
    </g>
  );
};
