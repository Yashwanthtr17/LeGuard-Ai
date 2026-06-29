import Link from "next/link";

export default function SecurityPolicy() {
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

        <h1 className="text-4xl font-bold text-foreground mb-2">Security Policy</h1>
        <p className="text-subtle text-sm mb-10">Last Updated: June 2026</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Our Commitment</h2>
            <p>
              LeGuard AI takes the security of your data seriously. We implement industry-standard
              technical and organisational measures to protect your information from unauthorised
              access, disclosure, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Encryption</h2>
            <p className="mb-3">
              All data transmitted between your browser and our servers is encrypted using TLS 1.3
              protocol. Data stored on our servers is encrypted at rest using AES-256 encryption.
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-subtle">
              <li>In-transit encryption: TLS 1.3 for all API and web traffic.</li>
              <li>At-rest encryption: AES-256 for databases and file storage.</li>
              <li>Document encryption: Each uploaded document is encrypted with a unique key.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Access Controls</h2>
            <p>
              Access to production systems is restricted to authorised personnel only. We enforce
              multi-factor authentication, principle of least privilege, and maintain detailed audit
              logs of all access to sensitive systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Infrastructure Security</h2>
            <p>
              Our infrastructure is hosted on trusted cloud providers with ISO 27001 and SOC 2
              certifications. We perform regular vulnerability assessments, penetration testing, and
              security reviews to identify and address potential risks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Incident Response</h2>
            <p>
              We have a documented incident response plan that includes timely detection, containment,
              eradication, and recovery. In the event of a data breach, affected users will be notified
              within 72 hours in accordance with applicable regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Reporting Vulnerabilities</h2>
            <p>
              If you discover a security vulnerability, please disclose it responsibly by emailing
              <span className="text-primary"> security@leguard-ai.com</span>. We recognise and appreciate
              responsible disclosure and will acknowledge your report promptly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
