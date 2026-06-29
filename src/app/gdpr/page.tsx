import Link from "next/link";

export default function GDPRCompliance() {
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

        <h1 className="text-4xl font-bold text-foreground mb-2">GDPR Compliance</h1>
        <p className="text-subtle text-sm mb-10">Last Updated: June 2026</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Data Controller</h2>
            <p>
              LeGuard AI acts as the data controller for the personal data you provide through the
              platform. Our registered office is located at 123 Innovation Drive, San Francisco,
              CA 94105, United States.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Legal Basis for Processing</h2>
            <p className="mb-3">
              We process personal data under the following legal bases as defined by the GDPR:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-subtle">
              <li><strong className="text-foreground">Consent:</strong> When you voluntarily provide information and agree to our processing.</li>
              <li><strong className="text-foreground">Contract Performance:</strong> Processing necessary to deliver our subscription and analysis services.</li>
              <li><strong className="text-foreground">Legitimate Interests:</strong> For security, fraud prevention, and platform improvement.</li>
              <li><strong className="text-foreground">Legal Obligation:</strong> When required to comply with applicable laws and regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Your GDPR Rights</h2>
            <p className="mb-3">
              As a data subject in the European Economic Area, you have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-subtle">
              <li><strong className="text-foreground">Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong className="text-foreground">Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong className="text-foreground">Right to Erasure:</strong> Request deletion of your personal data where applicable.</li>
              <li><strong className="text-foreground">Right to Restrict Processing:</strong> Request limitation of how we use your data.</li>
              <li><strong className="text-foreground">Right to Data Portability:</strong> Request transfer of your data to another service provider.</li>
              <li><strong className="text-foreground">Right to Object:</strong> Object to processing based on legitimate interests or direct marketing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. International Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside the EEA. We ensure
              adequate safeguards are in place through Standard Contractual Clauses and Data Processing
              Agreements with all sub-processors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Data Protection Officer</h2>
            <p>
              We have appointed a Data Protection Officer who can be contacted at
              <span className="text-primary"> dpo@leguard-ai.com</span>. Please direct all GDPR-related
              inquiries and requests to this address.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Complaints</h2>
            <p>
              If you believe our processing of your personal data violates GDPR, you have the right to
              lodge a complaint with your local data protection supervisory authority.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
