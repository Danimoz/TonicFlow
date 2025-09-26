import React from 'react';

interface ScoreMetadataProps {
  layout: any;
}

export const ScoreMetadata: React.FC<ScoreMetadataProps> = ({ layout }) => {
  if (!layout) return null;

  const { metadataLayout, svgWidth, layoutSettings, state, project } = layout;

  return (
    <>
      <text
        className="title"
        x={metadataLayout.title.x}
        y={metadataLayout.title.y}
        textAnchor="middle"
      >
        {metadataLayout.title.text}
      </text>
      {metadataLayout.subtitle && (
        <text
          className="subtitle"
          x={metadataLayout.subtitle.x}
          y={metadataLayout.subtitle.y}
          textAnchor="middle"
        >
          {metadataLayout.subtitle.text}
        </text>
      )}
      {metadataLayout.composer && (
        <text
          className="lyrics"
          x={metadataLayout.composer.x}
          y={metadataLayout.composer.y}
          textAnchor="end"
        >
          {metadataLayout.composer.text}
        </text>
      )}
      {metadataLayout.arranger && (
        <text
          className="lyrics"
          x={metadataLayout.arranger.x}
          y={metadataLayout.arranger.y}
          textAnchor="end"
        >
          {metadataLayout.arranger.text}
        </text>
      )}
      {metadataLayout.keySignature && (
        <text
          x={metadataLayout.keySignature.x}
          y={metadataLayout.keySignature.y}
          textAnchor="start"
        >
          <tspan className="time-signature">{metadataLayout.keySignature.key}</tspan>
          <tspan className="lyrics" dx="5">{metadataLayout.keySignature.mode}</tspan>
        </text>
      )}
      {metadataLayout.timeSignature && (
        <text
          className="time-signature"
          x={metadataLayout.timeSignature.x}
          y={metadataLayout.timeSignature.y}
          textAnchor="start"
        >
          {metadataLayout.timeSignature.text}
        </text>
      )}
    </>
  );
};
