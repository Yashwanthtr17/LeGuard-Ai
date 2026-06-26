"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dropzone } from "@/components/ui/Dropzone";

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeLayer, setActiveLayer] = useState("Initializing...");
  const [fileName, setFileName] = useState<string | null>(null);
  const router = useRouter();

  // Simulate scanning process
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => router.push("/scan/123"), 500);
            return 100;
          }
          
          if (prev < 30) setActiveLayer("Statutory Layer: Cross-referencing jurisdictions...");
          else if (prev < 60) setActiveLayer("Commercial Layer: Extracting obligations...");
          else if (prev < 90) setActiveLayer("Semantic Layer: Analyzing intent...");
          else setActiveLayer("Finalizing editorial report...");
          
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isScanning, router]);

  const handleFileSelect = (file: File) => {
    setFileName(file.name);
    setIsScanning(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-surface-hover/30">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 text-center">New Analysis</h1>
        <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl">
          Upload your document to initiate the multi-layered review process.
        </p>

        {!isScanning ? (
          <div className="w-full">
            <Dropzone onFileSelect={handleFileSelect} />
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white p-12 rounded-3xl shadow-xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Curating your document...</h2>
            {fileName && <p className="text-sm text-slate-500 text-center mb-6">{fileName}</p>}
            
            <div className="space-y-8">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                  <span>{activeLayer}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Layer Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className={`p-4 rounded-xl border ${progress >= 30 ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}>
                  <div className={`text-sm font-semibold ${progress >= 30 ? 'text-primary' : 'text-slate-400'}`}>Statutory</div>
                  <div className="text-xs text-slate-500 mt-1">{progress >= 30 ? 'Complete ✓' : 'Pending...'}</div>
                </div>
                <div className={`p-4 rounded-xl border ${progress >= 60 ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}>
                  <div className={`text-sm font-semibold ${progress >= 60 ? 'text-primary' : 'text-slate-400'}`}>Commercial</div>
                  <div className="text-xs text-slate-500 mt-1">{progress >= 60 ? 'Complete ✓' : 'Pending...'}</div>
                </div>
                <div className={`p-4 rounded-xl border ${progress >= 90 ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}>
                  <div className={`text-sm font-semibold ${progress >= 90 ? 'text-primary' : 'text-slate-400'}`}>Semantic</div>
                  <div className="text-xs text-slate-500 mt-1">{progress >= 90 ? 'Complete ✓' : 'Pending...'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
