"use client";

import { DOCUMENT_TYPES, FOCUS_AREAS, SENSITIVITY_LEVELS } from "@/lib/ai";
import { CountrySelect } from "@/components/CountrySelect";

interface ConfigurationFormProps {
  documentType: string;
  country: string;
  focusAreas: string[];
  sensitivity: string;
  onDocumentTypeChange: (v: string) => void;
  onCountryChange: (v: string) => void;
  onToggleFocus: (area: string) => void;
  onSensitivityChange: (v: string) => void;
  onBack: () => void;
  onAnalyse: () => void;
}

export function ConfigurationForm({
  documentType,
  country,
  focusAreas,
  sensitivity,
  onDocumentTypeChange,
  onCountryChange,
  onToggleFocus,
  onSensitivityChange,
  onBack,
  onAnalyse,
}: ConfigurationFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Configure analysis</h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5" id="doc-type-label">Document Type</label>
          <select
            value={documentType}
            onChange={(e) => onDocumentTypeChange(e.target.value)}
            aria-labelledby="doc-type-label"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white"
          >
            {DOCUMENT_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5" id="country-label">Country / Jurisdiction</label>
          <CountrySelect value={country} onChange={onCountryChange} />
          <p className="text-xs text-slate-400 mt-1.5">Determines which legal framework the AI applies</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2" id="focus-label">Analysis Focus</label>
          <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="focus-label">
            {FOCUS_AREAS.map((area) => (
              <label
                key={area.value}
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  focusAreas.includes(area.value)
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <input type="checkbox" checked={focusAreas.includes(area.value)}
                  onChange={() => onToggleFocus(area.value)} className="sr-only" />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  focusAreas.includes(area.value) ? "border-primary bg-primary" : "border-slate-300"
                }`}>
                  {focusAreas.includes(area.value) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">{area.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2" id="sensitivity-label">Risk Sensitivity</label>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="sensitivity-label">
            {SENSITIVITY_LEVELS.map((level) => (
              <button key={level.value} onClick={() => onSensitivityChange(level.value)}
                className={`p-3 rounded-xl border text-sm text-left transition-all ${
                  sensitivity === level.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
                role="radio"
                aria-checked={sensitivity === level.value}
              >
                <span className="font-semibold block">{level.label}</span>
                <span className="text-xs text-slate-400 mt-1 block">{level.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm" type="button">
          Back
        </button>
        <button onClick={onAnalyse} className="flex-[2] py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm" type="button">
          Analyse Document →
        </button>
      </div>
    </div>
  );
}
