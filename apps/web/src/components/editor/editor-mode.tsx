'use client';

import { useEditor } from "@/contexts/editor-context";
import TonicSolfaEditor from "./tonic-solfa-editor";
import EngravingMode from "./engraving-mode";

export default function EditorMode() {
  const { state } = useEditor();

  const viewMode = state?.preferences?.viewMode ?? 'engrave';
  const isCollapsed = state?.preferences?.sidebarCollapsed;

  return (
    <div className={`transition-all pl-10 duration-300 ease-in-out ${isCollapsed ? 'mr-20' : 'mr-80'} p-4`}>
      {viewMode === 'engrave' && <EngravingMode />}
      {viewMode === 'write' && <TonicSolfaEditor />}
    </div>
  )
}