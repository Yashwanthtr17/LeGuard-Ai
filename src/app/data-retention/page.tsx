import Link from "next/link";

export default function DataRetention() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="glass-strong rounded-2xl p-8 sm:p-12 shadow-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-subtle hover:text-foreground transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Legal Information
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-2">Data Retention Policy</h1>
        <p className="text-subtle text-sm mb-10">Last Updated: June 2026</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Overview</h2>
            <p>
              LeGuard AI is committed to protecting your data and being transparent about how long we
              retain it. This Data Retention Policy explains our retention periods for different
              categories of data collected through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Document Retention</h2>
            <p className="mb-3">Retention periods vary by account tier:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-subtle">
              <li><strong className="text-foreground">Free Tier:</strong> Uploaded documents are automatically deleted 7 days after analysis.</li>
              <li><strong className="text-foreground">Premium Tier:</strong> Documents are retained for 90 days unless manually deleted by the user.</li>
              <li><strong className="text-foreground">Pro Tier:</strong> Documents are retained for 365 days. Extended retention options available upon request.</li>
              <li><strong className="text-foreground">Enterprise:</strong> Custom retention periods as defined in your enterprise agreement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Account Data</h2>
            <p>
              Account information (name, email, billing details) is retained for the duration of your
              account. After account deletion, personally identifiable information is purged within
              30 days, while anonymised usage statistics may be retained for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Analysis Results</h2>
            <p>
              Generated reports and analysis results are stored securely and accessible via your
              Activity Hub. You may export or delete your reports at any time. Reports associated with
              deleted accounts are permanently removed within 30 days of account closure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Security Logs</h2>
            <p>
              Security and access logs are retained for a minimum of 90 days and a maximum of 12 months
              to ensure compliance with regulatory requirements and to support forensic investigations
              if necessary.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Data Deletion Requests</h2>
            <p>
              To request deletion of your data, please contact
              <span className="text-primary"> privacy@leguard-ai.com</span>. We will process your request
              within 30 days and provide confirmation once the deletion is complete.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
