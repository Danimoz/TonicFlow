'use client'

import { useEditor } from "@/contexts/editor-context"
import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@repo/ui/components/textarea";
import EditorToolbar from "./editor-toolbar";
import { alignTonicSolfa } from "@/lib/editorUtils";

export default function TonicSolfaEditor() {
  const { state, setSolfaText } = useEditor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Undo/Redo history management
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  const currentText = state?.solfaText || '';

  // Add current text to history when it changes (but not during undo/redo)
  useEffect(() => {
    if (!isUndoRedo && currentText !== '') {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        // Only add if it's different from the last entry
        if (newHistory[newHistory.length - 1] !== currentText) {
          newHistory.push(currentText);
          setHistoryIndex(newHistory.length - 1);
          // Limit history to 50 entries
          if (newHistory.length > 50) {
            newHistory.shift();
            setHistoryIndex(newHistory.length - 1);
          }
          return newHistory;
        }
        return prev;
      });
    }
    setIsUndoRedo(false);
  }, [currentText, historyIndex, isUndoRedo]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedo(true);
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSolfaText(history[newIndex] ?? '');
    }
  }, [history, historyIndex, setSolfaText]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedo(true);
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSolfaText(history[newIndex] ?? '');
    }
  }, [history, historyIndex, setSolfaText]);

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle undo/redo shortcuts
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    
    if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
      return;
    }

    if (e.key === '|') {
      // Allow the character to be typed first
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const currentValue = textarea.value;
        const cursorPosition = textarea.selectionStart;
        
        // Only trigger alignment if we're at the end of a measure or line
        // This prevents unwanted reformatting when inserting | in the middle of content
        const textBeforeCursor = currentValue.slice(0, cursorPosition);
        const textAfterCursor = currentValue.slice(cursorPosition);
        
        // Check if we're in a good position to align (end of line, after whitespace, or completing a measure)
        const shouldAlign = (
          // At the end of the text
          textAfterCursor.trim() === '' ||
          // After whitespace or at the start of a new line
          /\s$/.test(textBeforeCursor) ||
          // The character before the cursor suggests end of a measure
          /[\s\|\:]$/.test(textBeforeCursor) ||
          // We're starting a new line
          textBeforeCursor.endsWith('\n') ||
          // The text after cursor starts with whitespace or newline (suggesting we're between measures)
          /^[\s\n]/.test(textAfterCursor)
        );
        
        if (!shouldAlign) {
          return; // Don't align if we're in the middle of content
        }
        
        try {
          // Apply alignment to the current text
          const alignedText = alignTonicSolfa(currentValue);
          
          // Only update if the alignment actually changed something meaningfully
          if (alignedText && alignedText !== currentValue && alignedText.trim() !== currentValue.trim()) {
            setSolfaText(alignedText);
            
            // Try to maintain cursor position after alignment
            setTimeout(() => {
              if (textarea) {
                // Calculate a better cursor position based on the changes
                const newCursorPosition = Math.min(cursorPosition + (alignedText.length - currentValue.length), alignedText.length);
                textarea.selectionStart = textarea.selectionEnd = Math.max(0, newCursorPosition);
                textarea.focus();
              }
            }, 0);
          }
        } catch (error) {
          console.error('Error aligning tonic solfa:', error);
        }
      }, 0);
    }
  }, [setSolfaText, undo, redo]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Get the pasted text
    const pastedText = e.clipboardData.getData('text');
    
    // Allow the paste to happen first, then format
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      try {
        // Apply alignment to the current text (which now includes the pasted content)
        const alignedText = alignTonicSolfa(textarea.value);
        
        // Only update if the alignment actually changed something
        if (alignedText && alignedText !== textarea.value) {
          setSolfaText(alignedText);
          
          // Try to maintain cursor position after alignment
          setTimeout(() => {
            if (textarea) {
              textarea.focus();
            }
          }, 0);
        }
      } catch (error) {
        console.error('Error aligning pasted tonic solfa:', error);
      }
    }, 0);
  }, [setSolfaText]);

  return (
    <div className="flex flex-col h-full max-w-full">
      <EditorToolbar insertSymbol={insertSymbol} />
      <div className="relative flex-1 pt-[4.5rem]">
        <Textarea
          ref={textareaRef}
          value={currentText}
          onChange={(e) => setSolfaText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Enter tonic solfa notation...&#10;Example: S. d : - .r : m | f : - : s ||"
          className={` w-full min-h-[660px] p-4 resize-none bg-transparent font-jetbrains-mono text-lg leading-relaxed overflow-x-auto whitespace-nowrap`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}