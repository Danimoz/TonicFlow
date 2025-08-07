import React from "react";
import ProjectLayout from "./editor-layout";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = await params

  return (
    <ProjectLayout projectId={id}>
      <div>
        <main>
          <h1>Project ID: {id}</h1>
        </main>
      </div>
    </ProjectLayout>
  )
}
