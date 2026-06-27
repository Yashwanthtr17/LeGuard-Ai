"use client";

import { useRef, useState } from "react";

interface UploadZoneProps {
  onFileAccepted: (file: File) => void;
  onFileRejected: (reason: string) => void;
  file: File | null;
}

export function UploadZone({ onFileAccepted, onFileRejected, file }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndSet(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    const allowed = ["pdf", "docx", "doc", "txt", "png", "jpg", "jpeg"];
    if (!allowed.includes(ext || "")) {
      onFileRejected("This file type isn't supported. Please upload PDF, DOCX, or image.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      onFileRejected("File exceeds 10MB limit.");
      return;
    }
    onFileAccepted(f);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) validateAndSet(f); }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      role="button"
      tabIndex={0}
      aria-label="Upload a document"
      className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
        isDragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-slate-300 hover:border-primary/40 hover:bg-slate-50/50"
      }`}
    >
      {file ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-semibold text-slate-900">{file.name}</p>
          <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          <button
            onClick={(e) => { e.stopPropagation(); onFileAccepted(null as unknown as File); }}
            className="text-sm text-danger font-semibold hover:underline"
            type="button"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">Drag & drop your document here</p>
            <p className="text-sm text-slate-500 mt-1">or click to browse</p>
          </div>
          <label
            onClick={(e) => e.stopPropagation()}
            className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-light text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer text-sm"
          >
            Browse Files
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSet(f); }}
              className="hidden"
              aria-hidden="true"
            />
          </label>
          <p className="text-xs text-slate-400">Supported: PDF, DOCX, DOC, TXT, PNG, JPG (max 10 MB)</p>
        </div>
      )}
    </div>
  );
}
