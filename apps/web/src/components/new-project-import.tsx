'use client';

import { useRef, useState, DragEvent } from "react";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button"
import { xmlToSolfa } from "@repo/parsers/xml-to-solfa";
import { toast } from "sonner";
import { FileMusic, Upload } from "lucide-react";
import { Progress } from "@repo/ui/components/progress";
import { ProgressReport } from "@repo/parsers/types";

export default function ImportFromXMLOrMidi() {
  const musicXmlInputRef = useRef<HTMLInputElement>(null);
  const midiInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState<'musicxml' | 'midi' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressReport, setProgressReport] = useState<ProgressReport | null>(null);

  const handleFileSelect = async (file: File, type: "musicxml" | "midi") => {
    setIsLoading(true);
    setProgressReport({ message: 'Preparing to process file...', completedPercentage: 0 });

    const validExtensions = type === 'musicxml' ? ['xml', 'musicxml', 'mxl'] : ['mid', 'midi'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(fileExtension || '')) {
      toast.error(`Invalid file type. Please select a valid ${type.toUpperCase()} file.`);
      setIsLoading(false);
      setProgressReport(null);
      return;
    }

    if (type === 'musicxml') {
      await xmlToSolfa(file, (report) => {
        setProgressReport(report);
      });
    }
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

  const handleCancel = () => {
    setIsLoading(false);
    setProgressReport(null);
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="w-full max-w-md">
            <Progress value={progressReport?.completedPercentage} />
            <p className="mt-2 text-center text-sm text-gray-500">
              {progressReport?.message}
            </p>
            {progressReport?.error && (
              <div className="mt-4 text-center">
                <p className="text-sm text-red-500">{progressReport.error}</p>
                <Button onClick={handleCancel} className="mt-2">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}