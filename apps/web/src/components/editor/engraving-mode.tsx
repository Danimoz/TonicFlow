'use client';


import { Card } from "@repo/ui/components/card";
import { getSvgStyles } from "@/lib/engraving/styles";
import { useScoreLayout } from "@/hooks/useScoreLayout";
import { ScoreMetadata } from "./engraving/ScoreMetadata";
import { System } from "./engraving/System";
import { Slurs } from "./engraving/Slurs";
import { useEditor } from "@/contexts/editor-context";
import ProjectLoading from "@/app/(dashboard)/project/[id]/loading";
import EngravingToolbar from "./engraving/engraving-toolbar";
import { PrintableScore } from "./engraving/PrintableScore";
import { usePrint } from "@/hooks/usePrint";

export default function EngravingMode() {
  const { state } = useEditor();
  const { layout, isParsingLoading } = useScoreLayout();
  const { setSelection } = useEditor();
  const { printRef, handlePrint } = usePrint();

  if (!state?.solfaText) return <ProjectLoading />;
  if (isParsingLoading || !layout) return <ProjectLoading />;

  const { svgWidth, svgHeight, systems, slurPaths } = layout;

  const pages = systems.reduce((acc, system) => {
    const pageNum = system.page || 1;
    if (!acc[pageNum]) {
      acc[pageNum] = [];
    }
    acc[pageNum].push(system);
    return acc;
  }, {} as Record<number, any[]>);

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelection?.(undefined); // Use optional chaining in case it's undefined
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <EngravingToolbar onPrint={handlePrint} />

      <Card className="flex-grow w-full mt-20 overflow-auto bg-accent/10">
        {Object.keys(pages).map(pageNum => {
          const pageNumber = parseInt(pageNum, 10);
          const pageSystems = pages[pageNumber];
          const pageSlurs = slurPaths[pageNumber] || [];
          return (
            <div
              key={pageNumber}
              onClick={handleBackgroundClick}
              style={{
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                width: '794px', // Fixed A4 width
                display: 'flex',
                justifyContent: 'center',
                minHeight: 'fit-content',
                margin: '0 auto', // Center the A4 container
                marginBottom: '20px', // Fixed margin
              }}
            >
              <svg
                className="engraving-svg bg-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width="100%"
                style={{ maxWidth: '100%', height: 'auto' }}
                preserveAspectRatio="xMidYMid meet"
              >
                <style>{getSvgStyles()}</style>
                {pageNumber === 1 && <ScoreMetadata layout={layout} />}
                {pageSystems?.map((system, index) => (
                  <System
                    key={index}
                    system={system}
                    systemIndex={system.globalSystemIndex}
                    layout={layout}
                  />
                ))}
                <Slurs paths={pageSlurs} />
                {/* Page Number */}
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
      </Card>
      
      {/* Hidden printable score for printing */}
      <div style={{ 
        position: 'absolute', 
        left: '-9999px', 
        top: '-9999px',
        width: '794px',
        height: 'auto',
        overflow: 'hidden'
      }}>
        <PrintableScore ref={printRef} layout={layout} />
      </div>
    </div>
  );
}