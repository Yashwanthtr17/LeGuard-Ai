import { Dropzone } from "../components/ui/Dropzone";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-40">
          <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
            The Digital <span className="text-primary italic">Curator</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            A scholarly, premium, and authoritative editorial experience for legal document review. 
            Multi-layered analysis through Statutory, Commercial, and Semantic lenses.
          </p>
          
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40">
            <Dropzone />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface-hover/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Statutory */}
            <div className="group p-8 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Statutory Layer</h3>
              <p className="text-slate-600 leading-relaxed">Cross-references against jurisdictional law globally (India, US, UK).</p>
            </div>
            
            {/* Commercial */}
            <div className="group p-8 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Commercial Layer</h3>
              <p className="text-slate-600 leading-relaxed">Extracts financial obligations, dates, liabilities, and core business terms.</p>
            </div>

            {/* Semantic */}
            <div className="group p-8 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Semantic Layer</h3>
              <p className="text-slate-600 leading-relaxed">Analyzes underlying intent, detects contradictory statements, and suggests rewordings.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
