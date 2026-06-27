"use client";

import React, { useState, useRef } from "react";
import { Button } from "./Button";

interface DropzoneProps {
  onFileSelect?: (file: File) => void;
}

export function Dropzone({ onFileSelect }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    onFileSelect?.(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center transition-all duration-300 ease-out cursor-pointer overflow-hidden ${
          isDragging
            ? "border-primary bg-gradient-to-br from-primary/5 via-primary/[0.02] to-accent/5 scale-[1.01] shadow-lg shadow-primary/10"
            : "border-slate-300 bg-white/80 hover:border-primary/40 hover:bg-slate-50/50 hover:shadow-md"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-accent/5 animate-gradient-shift pointer-events-none" />
        )}
        <div className="relative flex flex-col items-center justify-center space-y-3 sm:space-y-4">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDragging ? "bg-primary/15 scale-110" : "bg-slate-100"
          }`}>
            <svg className={`w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300 ${
              isDragging ? "text-primary" : "text-slate-400"
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">
              {isDragging ? "Drop your file here" : "Upload your legal document"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isDragging ? "We'll handle the rest" : "Drag and drop your PDF, DOCX, or TXT file here"}
            </p>
          </div>
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <Button variant="premium" size="sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
              Browse Files
            </Button>
            <span className="text-xs sm:text-sm text-slate-400">or paste text directly</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
