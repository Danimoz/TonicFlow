import React from 'react';

interface SlursProps {
  paths: string[];
}

export const Slurs: React.FC<SlursProps> = ({ paths }) => {
  return (
    <g className="slurs">
      {paths.map((path, index) => (
        <path
          key={index}
          d={path}
          fill="none"
          stroke="black"
          strokeWidth="1"
        />
      ))}
    </g>
  );
};
