'use client';

import { useState } from "react";
import { defaultEditorLayoutSettings } from "@/lib/editorUtils";

export function useLayoutSettings() {
  const [layoutSettings, setLayoutSettings] = useState(defaultEditorLayoutSettings);
  const [selectedElement, setSelectedElement] = useState<{ element: SVGElement; type: string } | null>(null);

  return {
    layoutSettings,
    setLayoutSettings
  };
}