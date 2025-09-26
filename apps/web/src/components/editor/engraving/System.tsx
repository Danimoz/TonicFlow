import React from 'react';
import { Staff } from './Staff';

interface SystemProps {
  system: any;
  systemIndex: number;
  layout: any;
}

export const System: React.FC<SystemProps> = ({ system, systemIndex, layout }) => {
  return (
    <g className="system">
      {system.staves.map((staff: any, index: number) => (
        <Staff
          key={index}
          staff={staff}
          isFirstSystem={systemIndex === 0}
          layout={layout}
          systemIndex={systemIndex}
          partIndex={index}
        />
      ))}
    </g>
  );
};
