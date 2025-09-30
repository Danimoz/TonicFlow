'use client';

import { useEditor } from "@/contexts/editor-context";
import { Button } from "@repo/ui/components/button";
import { Save } from "lucide-react";

interface ToolbarItem {
  id: string;
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  content?: React.ReactNode;
}

interface EditorToolbarProps {
  insertSymbol: (symbol: string) => void;
}

export default function EditorToolbar({ insertSymbol }: EditorToolbarProps) {
  const toolbarItems: ToolbarItem[] = [
    {
      id: 'save-project',
      icon: Save,
      label: 'Save Project',
      onClick: () => {}
    },
    {
      id: 'insert-high-octave-marking',
      label: "1 Octave Higher",
      content: <span className="text-lg">′</span>,
      onClick: () => insertSymbol("'")
    },
    {
      id: 'insert-double-high-octave-marking',
      label: "2 Octaves Higher",
      content: <span className="text-lg">″</span>,
      onClick: () =>  insertSymbol("″")
    },
    {
      id: 'insert-low-octave-marking',
      label: "1 octave lower",
      content: <span className="text-lg">ₗ</span>,
      onClick: () => insertSymbol("ₗ")
    },
    {
      id: 'insert-double-low-octave-marking',
      label: "2 Octaves Lower",
      content: <span className="text-lg">₂</span>,
      onClick: () => insertSymbol("₂")
    },
    {
      id: 'insert-32nd-note',
      onClick: () => insertSymbol('⹁'),
      label: '32nd Note',
      content: <span className="text-lg">⹁</span>
    }
  ]

  return (
    <div className="fixed top-3 left-9 right-0 z-30 flex items-center gap-2 p-3 border-b bg-background/95 backdrop-blur-sm shadow-sm">
      {toolbarItems.map(item => (
        <Button
          key={item.id}
          onClick={item.onClick}
          variant="ghost"
          size="icon"
          className="w-10 h-10 flex items-center justify-center rounded border border-primary hover:bg-muted/50"
          title={item.label}
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          {item.content && item.content}
          {!item.icon && !item.content && <span className="text-sm">{item.label}</span>}
        </Button>
      ))}
    </div>
  )
}