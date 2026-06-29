import Link from "next/link";

export default function RefundPolicy() {
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

        <h1 className="text-4xl font-bold text-foreground mb-2">Refund Policy</h1>
        <p className="text-subtle text-sm mb-10">Last Updated: June 2026</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Overview</h2>
            <p>
              At LeGuard AI, we are committed to your satisfaction. This Refund Policy outlines the
              terms under which you may request a refund for subscriptions or payments made on our
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Subscription Refunds</h2>
            <p className="mb-3">
              You may request a full refund within 14 days of your initial subscription purchase, provided
              you have not exceeded the usage limits defined in our Fair Use Policy. After 14 days,
              refunds are evaluated on a case-by-case basis.
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-subtle">
              <li>Monthly plans: refunded pro-rata for unused days beyond the 14-day window.</li>
              <li>Annual plans: refunded pro-rata less any applicable processing fees.</li>
              <li>Enterprise plans: governed by your signed agreement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. One-Time Payments</h2>
            <p>
              One-time payments for add-on services or pay-per-analysis features are non-refundable
              once the analysis has been generated. If a technical error prevented you from receiving
              your results, please contact support for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. How to Request a Refund</h2>
            <p>
              To initiate a refund, please email <span className="text-primary">billing@leguard-ai.com</span> with
              your registered email address, order ID, and reason for the request. We aim to process
              all refund requests within 5–10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Exceptions</h2>
            <p>
              Refunds are not available for accounts terminated due to violation of our Terms of Service
              or Acceptable Use Policy. Promotional or discounted purchases may be subject to special
              refund conditions as stated at the time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Chargebacks</h2>
            <p>
              If you believe a charge was made in error, please contact us before initiating a
              chargeback. Unnecessary chargebacks may result in account suspension and additional fees
              to recover processing costs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
