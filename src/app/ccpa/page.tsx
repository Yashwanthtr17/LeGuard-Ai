import Link from "next/link";

export default function CCPACompliance() {
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

        <h1 className="text-4xl font-bold text-foreground mb-2">CCPA Compliance</h1>
        <p className="text-subtle text-sm mb-10">Last Updated: June 2026</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Your California Privacy Rights</h2>
            <p>
              This notice supplements the LeGuard AI Privacy Policy and applies solely to California
              residents as defined by the California Consumer Privacy Act (CCPA) and the California
              Privacy Rights Act (CPRA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Categories of Personal Information Collected</h2>
            <p className="mb-3">
              In the past 12 months, we have collected the following categories of personal information:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-subtle">
              <li><strong className="text-foreground">Identifiers:</strong> Name, email address, billing address, and account credentials.</li>
              <li><strong className="text-foreground">Commercial Information:</strong> Subscription tier, payment history, and transaction records.</li>
              <li><strong className="text-foreground">Internet Activity:</strong> Usage data, device information, and interaction with our platform.</li>
              <li><strong className="text-foreground">Professional Information:</strong> Job title, organisation name, and industry.</li>
              <li><strong className="text-foreground">Inferences:</strong> Risk assessment preferences and document analysis trends.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Your CCPA Rights</h2>
            <p className="mb-3">
              California residents are entitled to the following rights under the CCPA:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-subtle">
              <li><strong className="text-foreground">Right to Know:</strong> Request disclosure of personal information collected, used, disclosed, or sold.</li>
              <li><strong className="text-foreground">Right to Delete:</strong> Request deletion of personal information we have collected from you.</li>
              <li><strong className="text-foreground">Right to Correct:</strong> Request correction of inaccurate personal information.</li>
              <li><strong className="text-foreground">Right to Opt-Out:</strong> Opt out of the sale or sharing of your personal information.</li>
              <li><strong className="text-foreground">Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any CCPA rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Notice at Collection</h2>
            <p>
              At the point of collection, we inform you of the categories of personal information being
              collected and the purposes for which they will be used. We do not sell your personal
              information to third parties for monetary or other valuable consideration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Authorised Agent</h2>
            <p>
              You may designate an authorised agent to submit a request on your behalf. We will require
              verification of your identity and the agent&rsquo;s authority before processing such requests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Contact for CCPA Requests</h2>
            <p>
              To exercise your CCPA rights, please contact us at
              <span className="text-primary"> privacy@leguard-ai.com</span> or call
              <span className="text-primary"> +1 (555) 123-4567</span>. We will verify your identity and
              respond within the timeframes required by law.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
