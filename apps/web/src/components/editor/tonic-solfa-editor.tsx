'use client'

import { useEditor } from "@/contexts/editor-context"
import { useCallback, useRef } from "react";
import { Textarea } from "@repo/ui/components/textarea";
import EditorToolbar from "./editor-toolbar";

export default function TonicSolfaEditor() {
  const { state, setSolfaText } = useEditor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentText = state?.solfaText || '';

  const insertSymbol = useCallback((symbol: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = currentText.slice(0, start) + symbol + currentText.slice(end);
    setSolfaText(newText);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
      textarea.focus();
    }, 0);
  }, [currentText, setSolfaText]);

  return (
    <div className="flex flex-col h-full max-w-full">
      <EditorToolbar insertSymbol={insertSymbol} />
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={currentText}
          onChange={(e) => setSolfaText(e.target.value)}
          placeholder="Enter tonic solfa notation...&#10;Example: S. d : - .r : m | f : - : s ||"
          className="w-full min-h-[600px] p-4 resize-none bg-transparent font-mono text-lg leading-relaxed focus:outline-none focus:ring-0"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}