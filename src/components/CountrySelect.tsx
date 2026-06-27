"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRIES } from "@/lib/ai";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? COUNTRIES.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={open ? query : value}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); setQuery(""); }}
        placeholder="Search country..."
        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white cursor-pointer"
      />
      {open && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-400">No countries found</li>
          ) : (
            filtered.map((country) => (
              <li
                key={country}
                onClick={() => {
                  onChange(country);
                  setOpen(false);
                  setQuery("");
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/5 transition-colors ${
                  country === value ? "bg-primary/10 font-semibold text-primary" : "text-slate-700"
                }`}
              >
                {country}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
