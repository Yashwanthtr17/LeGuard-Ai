export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
          <p className="text-lg">Last Updated: June 2026</p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>
            At LeGuard AI, the &ldquo;Digital Curator&rdquo;, we prioritize the confidentiality of your documents. 
            We collect basic account information and the documents you upload solely for the purpose of analysis.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">2. Document Security</h2>
          <p>
            Documents processed through our Statutory, Commercial, and Semantic layers are encrypted at rest and in transit. 
            We do not use your proprietary contracts to train our base foundation models without explicit consent.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">3. Data Retention</h2>
          <p>
            Free tier documents are deleted after 7 days. Premium and Pro users can manage their data retention policies via the Activity Hub.
          </p>
        </div>
      </div>
    </div>
  );
}
