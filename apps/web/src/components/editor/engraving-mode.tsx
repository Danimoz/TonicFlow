'use client';
// ...existing code...
import { Card } from "@repo/ui/components/card";
import { getSvgStyles } from "@/lib/engraving/styles";
import { useScoreLayout } from "@/hooks/useScoreLayout";
import { ScoreMetadata } from "./engraving/ScoreMetadata";
import { System } from "./engraving/System";
import { Slurs } from "./engraving/Slurs";
import { useEditor } from "@/contexts/editor-context";
import ProjectLoading from "@/app/(dashboard)/project/[id]/loading";
import EngravingToolbar from "./engraving/engraving-toolbar";
import { Input } from "@repo/ui/components/input";

export default function EngravingMode() {
  const layout = useScoreLayout();
  const { setSelection } = useEditor();
  // ...existing code...

  if (!layout) return <ProjectLoading />;

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
      setSelection(undefined);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <EngravingToolbar />

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
                    systemIndex={index}
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
    </div>
  );
}