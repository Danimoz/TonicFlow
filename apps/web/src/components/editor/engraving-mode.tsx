'use client';

import { useRef } from "react";
import { Card } from "@repo/ui/components/card";
import { getSvgStyles } from "@/lib/engraving/styles";
import { useScoreLayout } from "@/hooks/useScoreLayout";
import { ScoreMetadata } from "./engraving/ScoreMetadata";
import { System } from "./engraving/System";
import { Slurs } from "./engraving/Slurs";
import { useEditor } from "@/contexts/editor-context";
import ProjectLoading from "@/app/(dashboard)/project/[id]/loading";
import EngravingToolbar from "./engraving/engraving-toolbar";

export default function EngravingMode() {
  const layout = useScoreLayout();
  const svgRef = useRef<SVGSVGElement>(null);
  const { setSelection } = useEditor();

  if (!layout) return <ProjectLoading />;

  const { svgWidth, systems, slurPaths } = layout;
  // console.log('Layout:', systems);
  const handleBackgroundClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current) {
      setSelection(undefined);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <EngravingToolbar />
      <Card className="flex-grow w-full overflow-auto mt-20">
        <svg
          ref={svgRef}
          className="engraving-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${svgWidth} 1056`}
          onClick={handleBackgroundClick}
        >
          <style>{getSvgStyles()}</style>
          <ScoreMetadata layout={layout} />
          {systems.map((system, index) => (
            <System
              key={index}
              system={system}
              systemIndex={index}
              layout={layout}
            />
          ))}
          <Slurs paths={slurPaths} />
        </svg>
      </Card>
    </div>
  );
}