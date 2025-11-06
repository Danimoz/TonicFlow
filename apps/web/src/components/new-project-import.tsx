'use client';

import { useRef, useState, DragEvent } from "react";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button"
import { toast } from "sonner";
import { FileMusic, Upload } from "lucide-react";

export default function ImportFromXMLOrMidi() {
  const musicXmlInputRef = useRef<HTMLInputElement>(null);
  const midiInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState<'musicxml' | 'midi' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  

  function handleFileSelect(file: File, type: 'musicxml' | 'midi') {
    const validExtensions = type === 'musicxml' ? ['xml', 'musicxml', 'mxl'] : ['mid', 'midi'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(fileExtension || '')) {
      toast.error(`Invalid file type. Please select a valid ${type.toUpperCase()} file.`);
      return;
    }
    // Process the file (e.g., read its content, upload it, etc.)
  }

  const handleDrop = (e: DragEvent, type: "musicxml" | "midi") => {
    e.preventDefault();
    setDragOver(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file, type);
    }
  };

  const handleDragOver = (e: DragEvent, type: "musicxml" | "midi") => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <Input
        type="file"
        ref={musicXmlInputRef}
        accept=".xml,.musicxml,.mxl"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, 'musicxml')
        }}
      />
      <Button
        variant="outline"
        className={`
          ${dragOver === 'musicxml' ? 'scale-105 border-primary bg-secondary/60' : ''}
          h-12 border-2 border-dashed border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/50 text-foreground transition-all
        `}
        onClick={() => musicXmlInputRef.current?.click()}
        onDrop={(e) => handleDrop(e, 'musicxml')}
        onDragOver={(e) => handleDragOver(e, 'musicxml')}
        onDragLeave={handleDragLeave}
        disabled={isLoading}
      >
        <Upload />
        Import MusicXML
      </Button>

      <Input
        type="file"
        ref={midiInputRef}
        accept=".mid,.midi"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, 'midi')
        }}
      />
      <Button
        variant="outline"
        className={`
          ${dragOver === 'midi' ? 'scale-105 border-primary bg-secondary/60' : ''}
          h-12 border-2 border-dashed border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/50 text-foreground transition-all
        `}
        onClick={() => midiInputRef.current?.click()}
        onDrop={(e) => handleDrop(e, 'midi')}
        onDragOver={(e) => handleDragOver(e, 'midi')}
        onDragLeave={handleDragLeave}
        disabled={isLoading}
      >
        <FileMusic />
        Import MIDI
      </Button>
    </div>
  )
}