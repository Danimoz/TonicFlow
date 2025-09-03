import React from "react";
import ProjectLayout from "./editor-layout";
import EditorMode from "@/components/editor/editor-mode";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = await params

  return (
    <ProjectLayout projectId={id}>
      <div>
        <main>
          <EditorMode />
        </main>
      </div>
    </ProjectLayout>
  )
}
