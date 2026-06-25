"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const mockHistory = [
  { id: 1, name: "MSA_Global_Tech_Corp_2026.pdf", date: "Jun 24, 2026", status: "Completed", type: "Master Service Agreement", locked: false },
  { id: 2, name: "NDA_Stark_Industries.docx", date: "Jun 22, 2026", status: "Completed", type: "Non-Disclosure", locked: false },
  { id: 3, name: "Vendor_Contract_XYZ.pdf", date: "Jun 15, 2026", status: "Completed", type: "Vendor Agreement", locked: true },
  { id: 4, name: "Employment_Agreement_Doe.pdf", date: "Jun 10, 2026", status: "Completed", type: "Employment", locked: true },
];

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<"premium" | "locked" | "export">("premium");

  return (
    <div className="flex-1 bg-surface-hover/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Activity Hub</h1>
            <p className="text-slate-600">Your editorial dashboard of past document scans.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "premium" ? "primary" : "outline"} 
              size="sm"
              onClick={() => setViewMode("premium")}
            >
              Premium View
            </Button>
            <Button 
              variant={viewMode === "locked" ? "primary" : "outline"} 
              size="sm"
              onClick={() => setViewMode("locked")}
            >
              Freemium (Locked)
            </Button>
            <Button 
              variant={viewMode === "export" ? "primary" : "outline"} 
              size="sm"
              onClick={() => setViewMode("export")}
            >
              Bulk Export Mode
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider text-slate-500 font-semibold">
                {viewMode === "export" && <th className="p-4 w-12"><input type="checkbox" className="rounded" /></th>}
                <th className="p-4">Document Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockHistory.map((doc) => {
                const isLocked = viewMode === "locked" && doc.locked;
                
                return (
                  <tr key={doc.id} className={`hover:bg-slate-50 transition-colors ${isLocked ? "bg-slate-50/50" : ""}`}>
                    {viewMode === "export" && (
                      <td className="p-4">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </td>
                    )}
                    <td className="p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className={`font-medium ${isLocked ? "text-slate-500" : "text-primary hover:underline cursor-pointer"}`}>
                          {doc.name}
                        </span>
                        {isLocked && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-600">
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{doc.type}</td>
                    <td className="p-4 text-slate-500">{doc.date}</td>
                    <td className="p-4 text-right">
                      {isLocked ? (
                        <Link href="/pricing">
                          <Button variant="accent" size="sm">Unlock Pro</Button>
                        </Link>
                      ) : (
                        <Link href={`/scan/${doc.id}`}>
                          <Button variant="outline" size="sm">View Report</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {viewMode === "export" && (
          <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
            <span className="text-sm font-medium text-slate-600">2 documents selected</span>
            <Button variant="primary">Export as ZIP</Button>
          </div>
        )}
      </div>
    </div>
  );
}
