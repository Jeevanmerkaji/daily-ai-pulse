// app/terms/page.js

import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "The terms for using Daily AI Pulse and the Pro plan subscription.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: August 15, 2026</p>

      <div className="mt-8 space-y-8 text-zinc-700 [&_h2]:mt-2 [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
        <section>
          <h2>1. Who we are</h2>
          <p>
            Daily AI Pulse (&quot;we&quot;, &quot;us&quot;) is operated by Jeevan Merkaji
            Somanna, an individual based in Germany. Full contact details are on the{" "}
            <Link href="/impressum" className="underline underline-offset-4">
              Impressum
            </Link>{" "}
            page. By using getdailyaipulse.com or subscribing to our emails, you agree to
            these terms.
          </p>
        </section>

        <section>
          <h2>2. The service</h2>
          <p>
            Daily AI Pulse sends a short, plain-English AI news summary by email.
          </p>
          <ul>
            <li>
              <strong>Free plan</strong> — one daily story on the topic of your choice, at no
              cost.
            </li>
            <li>
              <strong>Pro plan</strong> — a paid subscription (currently €5/month) that adds a
              multi-topic daily digest and full archive access across all topics.
            </li>
          </ul>
          <p>
            The content is generated with the help of AI (Anthropic&apos;s Claude) based on
            news headlines from third-party sources. We aim for accuracy but don&apos;t
            guarantee it — the summaries are provided for general information only and
            aren&apos;t financial, legal, or professional advice. Always verify anything
            important before acting on it.
          </p>
        </section>

        <section>
          <h2>3. Your account</h2>
          <p>
            We use passwordless (&quot;magic link&quot;) login. You&apos;re responsible for
            keeping access to the email address on your account secure, since anyone with
            access to your inbox can sign in as you.
          </p>
        </section>

        <section>
          <h2>4. Pro plan billing</h2>
          <ul>
            <li>Pro plan payments are processed by Stripe and billed on a recurring monthly basis until you cancel.</li>
            <li>
              You can cancel anytime from the{" "}
              <Link href="/account" className="underline underline-offset-4">
                My Account
              </Link>{" "}
              page (&quot;Manage billing&quot;). Cancellation takes effect at the end of your
              current billing period — you keep Pro access until then, and we don&apos;t
              provide partial-period refunds except where required by law (see Section 5).
            </li>
            <li>Prices may change for future billing periods; we&apos;ll give you reasonable notice before any change takes effect.</li>
          </ul>
        </section>

        <section>
          <h2>5. Your right of withdrawal (EU/EEA customers)</h2>
          <p>
            As a consumer in the EU/EEA, you have the right to withdraw from your Pro plan
            purchase within 14 days without giving any reason.
          </p>
          <p>
            The withdrawal period expires 14 days after the day you subscribed. To exercise
            your right of withdrawal, you must inform us of your decision by a clear
            statement (e.g. an email to{" "}
            <a href="mailto:hello@getdailyaipulse.com" className="underline underline-offset-4">
              hello@getdailyaipulse.com
            </a>
            ) before the withdrawal period expires.
          </p>
          <p>
            If you expressly asked us to begin providing Pro features immediately, rather
            than waiting until the withdrawal period ends, you acknowledge that:
          </p>
          <ul>
            <li>
              you will owe us an amount proportional to what was supplied up to the point you
              tell us you wish to withdraw, compared with the full scope of the contract, and
            </li>
            <li>your right of withdrawal ends once the contract has been fully performed on both sides (i.e. at the end of the billing period you paid for) — otherwise, you may withdraw at any point within the 14 days as described above.</li>
          </ul>
          <p>
            If you withdraw, we&apos;ll reimburse any amount owed to you within 14 days of
            being informed of your decision, using the same payment method you used
            originally.
          </p>
        </section>

        <section>
          <h2>6. Acceptable use</h2>
          <p>
            Please don&apos;t use the service to do anything illegal, to abuse or interfere
            with the site, or to attempt to access other users&apos; accounts.
          </p>
        </section>

        <section>
          <h2>7. Content and intellectual property</h2>
          <p>
            The Daily AI Pulse name, website, and the story summaries we write belong to us.
            Underlying news is sourced from third-party publications and remains the
            property of its original authors — we link to or credit sources where
            applicable.
          </p>
        </section>

        <section>
          <h2>8. Termination</h2>
          <p>
            You can stop using the service anytime by unsubscribing or canceling your Pro
            plan. We may suspend or terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2>9. Liability</h2>
          <p>
            We&apos;re liable without limitation for intent and gross negligence, and for
            injury to life, body, or health. For ordinary negligence, we&apos;re only liable
            for breach of a material contractual obligation, and only for damage that was
            foreseeable at the time the contract was formed. This doesn&apos;t affect any
            liability that can&apos;t be excluded under German law (e.g. under the Product
            Liability Act).
          </p>
        </section>

        <section>
          <h2>10. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. If we make material changes,
            we&apos;ll update the date at the top of this page and notify active
            subscribers by email.
          </p>
        </section>

        <section>
          <h2>11. Governing law</h2>
          <p>
            These terms are governed by German law. If you&apos;re a consumer, this doesn&apos;t
            deprive you of any mandatory consumer-protection rights under the law of your
            country of residence.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Questions about these terms?{" "}
            <a href="mailto:hello@getdailyaipulse.com" className="underline underline-offset-4">
              hello@getdailyaipulse.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
