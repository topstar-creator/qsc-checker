"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, X } from "lucide-react";

interface MediaUploaderProps {
  files: { type: "photo" | "video"; url: string; name: string }[];
  onChange: (files: { type: "photo" | "video"; url: string; name: string }[]) => void;
}

export function MediaUploader({ files, onChange }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).map((f) => ({
      type: f.type.startsWith("video/") ? ("video" as const) : ("photo" as const),
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    onChange([...files, ...newFiles]);
  };

  const remove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="h-4 w-4 mr-1" />
          写真
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.accept = "video/*";
              inputRef.current.click();
            }
          }}
        >
          <Video className="h-4 w-4 mr-1" />
          動画
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative aspect-square rounded-md overflow-hidden border">
              {f.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt={f.name} className="object-cover w-full h-full" />
              ) : (
                <video src={f.url} className="object-cover w-full h-full" />
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
