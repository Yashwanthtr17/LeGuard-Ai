import Link from "next/link";

export default function CookiePolicy() {
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

        <h1 className="text-4xl font-bold text-foreground mb-2">Cookie Policy</h1>
        <p className="text-subtle text-sm mb-10">Last Updated: June 2026</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help us
              remember your preferences, analyse how you use our platform, and improve your overall
              experience with LeGuard AI.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. How We Use Cookies</h2>
            <p className="mb-3">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-subtle">
              <li><strong className="text-foreground">Essential Cookies:</strong> Required for the platform to function, including authentication and session management.</li>
              <li><strong className="text-foreground">Analytics Cookies:</strong> Help us understand usage patterns so we can improve our document analysis features.</li>
              <li><strong className="text-foreground">Preference Cookies:</strong> Remember your settings, theme choices, and dashboard layout.</li>
              <li><strong className="text-foreground">Security Cookies:</strong> Detect suspicious activity and protect your account and documents.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Third-Party Cookies</h2>
            <p>
              We partner with analytics and payment processing providers who may place cookies on your
              device. These third parties have their own cookie policies and are contractually bound to
              handle your data securely and in compliance with applicable privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Managing Cookies</h2>
            <p>
              You can control and delete cookies through your browser settings. Please note that
              disabling essential cookies may affect the performance and functionality of LeGuard AI.
              Most browsers provide instructions on how to manage cookies in their Help section.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on this
              page with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please reach out to our support team at
              <span className="text-primary"> support@leguard-ai.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
