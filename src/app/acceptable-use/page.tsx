import Link from "next/link";

export default function AcceptableUse() {
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

        <h1 className="text-4xl font-bold text-foreground mb-2">Acceptable Use Policy</h1>
        <p className="text-subtle text-sm mb-10">Last Updated: June 2026</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Purpose</h2>
            <p>
              This Acceptable Use Policy governs the use of LeGuard AI&rsquo;s platform, including all
              features, APIs, and associated services. By using our platform, you agree to comply with
              this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Prohibited Activities</h2>
            <p className="mb-3">You may not use LeGuard AI to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-subtle">
              <li>Upload, analyse, or distribute content that violates any applicable law or regulation.</li>
              <li>Attempt to reverse engineer, decompile, or extract the source code of our AI models.</li>
              <li>Use automated scripts, bots, or scrapers to access the platform without prior written consent.</li>
              <li>Submit knowingly false or misleading documents to manipulate analysis outcomes.</li>
              <li>Infringe upon the intellectual property rights of any third party.</li>
              <li>Interfere with or disrupt the integrity or performance of the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. User Content</h2>
            <p>
              You retain all rights to the documents you upload. However, you grant LeGuard AI a
              limited licence to process, store, and analyse your content solely for the purpose of
              providing our services. You represent that you have the necessary rights and permissions
              to upload and analyse any content submitted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Fair Usage</h2>
            <p>
              Free and trial accounts are subject to reasonable usage limits. Excessive or abusive
              usage that degrades platform performance for other users may result in throttling or
              suspension. Premium and Pro tiers enjoy higher limits as detailed on our Pricing page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Reporting Violations</h2>
            <p>
              If you become aware of any violation of this policy, please report it to
              <span className="text-primary"> abuse@leguard-ai.com</span>. We take all reports seriously
              and will investigate promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Enforcement</h2>
            <p>
              Violation of this policy may result in immediate suspension or termination of your
              account, restriction of access to certain features, and legal action where warranted.
              We reserve the right to modify this policy at any time with reasonable notice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
