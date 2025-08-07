'use client';

import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { EditorProvider } from "@/contexts/editor-context";

export default function ProjectLayout({ projectId, children }: { projectId: string; children: React.ReactNode }) {
  return (
    <EditorProvider projectId={projectId}>
      <div className="relative min-h-screen bg-background">
        {children}
        <EditorSidebar />
      </div>
    </EditorProvider>
  )
}