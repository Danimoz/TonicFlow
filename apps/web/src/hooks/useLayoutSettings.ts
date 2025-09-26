'use client';

import { useEffect, useState } from "react";
import { defaultEditorLayoutSettings } from "@/lib/editorUtils";
import { availableFonts, loadFont } from "@/lib/engraving/styles";

export function useLayoutSettings() {
  const [layoutSettings, setLayoutSettings] = useState(defaultEditorLayoutSettings);
  const [selectedElement, setSelectedElement] = useState<{ element: SVGElement; type: string } | null>(null);

  useEffect(() => {
    const loadAllFonts = async () => {
      const fontsToLoad = availableFonts.filter(font => font.url);
      await Promise.all(fontsToLoad.map(font => loadFont(font)));
    }
    loadAllFonts();
  }, [])

  return {
    layoutSettings,
    setLayoutSettings
  };
}