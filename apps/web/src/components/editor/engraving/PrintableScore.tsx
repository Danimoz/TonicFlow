import React, { forwardRef } from 'react';
import { getSvgStyles } from "@/lib/engraving/styles";
import { ScoreMetadata } from "./ScoreMetadata";
import { System } from "./System";
import { Slurs } from "./Slurs";

interface PrintableScoreProps {
  layout: any;
}

export const PrintableScore = forwardRef<HTMLDivElement, PrintableScoreProps>(
  ({ layout }, ref) => {
    if (!layout) return null;

    const { svgWidth, svgHeight, systems, slurPaths } = layout;

    // Group systems by page
    const pages = systems.reduce((acc: Record<number, any[]>, system: any) => {
      const pageNum = system.page || 1;
      if (!acc[pageNum]) {
        acc[pageNum] = [];
      }
      acc[pageNum].push(system);
      return acc;
    }, {});

    const totalPages = Object.keys(pages).length;

    return (
      <div ref={ref} className="print-container">
        {Object.keys(pages).map(pageNum => {
          const pageNumber = parseInt(pageNum, 10);
          const pageSystems = pages[pageNumber];
          const pageSlurs = slurPaths[pageNumber] || [];
          
          return (
            <div
              key={pageNumber}
              className="print-page"
              style={{
                width: '794px',
                height: '1123px',
                margin: '0',
                padding: '0',
                background: 'white',
                pageBreakAfter: pageNumber < totalPages ? 'always' : 'avoid',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width="794px"
                height="1123px"
                style={{ 
                  display: 'block',
                  background: 'white',
                }}
                preserveAspectRatio="xMidYMid meet"
              >
                <style>{getSvgStyles()}</style>
                
                {/* Only show metadata on first page */}
                {pageNumber === 1 && <ScoreMetadata layout={layout} />}
                
                {/* Render systems for this page */}
                {pageSystems?.map((system: any, index: number) => (
                  <System
                    key={index}
                    system={system}
                    systemIndex={index}
                    layout={layout}
                  />
                ))}
                
                {/* Render slurs for this page */}
                <Slurs paths={pageSlurs} />
                
                {/* Page number */}
                <text
                  x={svgWidth / 2}
                  y={svgHeight - 30}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#666"
                  fontFamily="Arial, sans-serif"
                >
                  {pageNumber}
                </text>
              </svg>
            </div>
          );
        })}
      </div>
    );
  }
);

PrintableScore.displayName = 'PrintableScore';