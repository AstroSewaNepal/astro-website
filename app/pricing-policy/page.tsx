import React from 'react';

const PricingPolicyPage = () => {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 prose prose-lg max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8 font-sahitya">
            Pricing Policy
          </h1>

          <div className="text-moonlight-800 leading-relaxed font-mukta">
            <p className="mb-8 text-lg">
              Astro Sewa connects you with professional astrologers for chat, audio, and video
              consultations, reports, and remedies. We believe pricing should be simple and honest:
              the price you see is the price you pay.
            </p>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                How Pricing Works
              </h2>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Astrologer-set rates:</strong> Astrologers set their own session fees
                  based on experience, format (chat/voice/video), and service length. Astro Sewa
                  displays final prices to customers and collects a platform fee that is included in
                  the checkout total.
                </li>
                <li>
                  <strong>All charges shown upfront:</strong> At checkout you&apos;ll see the full
                  amount, including any applicable taxes and clearly disclosed service fees. No
                  hidden charges after payment.
                </li>
                <li>
                  <strong>Multi-product pricing:</strong> Consultations, personalized reports, and
                  marketplace remedies may each have different prices. Every product page shows the
                  exact price before you pay.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                Typical Price Ranges (at Launch)
              </h2>
              <p>
                Prices vary by astrologer and service. At launch in Nepal (NPR), you can expect a
                broad range depending on session length and astrologer seniority. When we expand
                internationally we will show prices in your chosen currency (USD, GBP, INR, AED,
                etc.) and clearly display conversion details.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                Payment Schedules & Fixed-Duration Services
              </h2>
              <p>
                Some services are sold for fixed durations (for example subscription plans or
                multi-session packages). The duration and payment terms for those services are
                described on the product page before you confirm payment.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                Discounts, Promotions & Price-Match
              </h2>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  We run occasional promotions (first-time offers, festival discounts, referral
                  credits). Promo terms and expiry are displayed at checkout.
                </li>
                <li>
                  If you find a directly comparable paid service from another verified provider,
                  contact support and we&apos;ll review it — we aim to offer competitive value.
                  Promotional or special pricing may be limited and subject to verification.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                Sale Adjustments & Price Changes
              </h2>
              <p>
                If a price for a service is reduced after you&apos;ve made a booking, we generally
                do not adjust your already-confirmed booking to the new sale price. If you need to
                change a booking date or cancel, cancellation rules (shown on each product) apply.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                Pricing Errors & Cancellations
              </h2>
              <p>
                We strive for accuracy; if a pricing error occurs we will notify you and may cancel
                the order and refund any payments made. For cancellation, refund windows and
                conditions are clearly displayed on each booking page and in our Refund Policy.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                Recordings & Privacy
              </h2>
              <p>
                Some live sessions may be recorded with consent for quality and dispute resolution.
                See our{' '}
                <a href="/disclaimer" className="text-primary hover:underline">
                  Recordings & Retention
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>{' '}
                for details.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                Questions or Concerns?
              </h2>
              <p>
                Email our support team at{' '}
                <a
                  href="mailto:support@astrosewa.com"
                  className="text-primary hover:underline font-bold"
                >
                  support@astrosewa.com
                </a>{' '}
                or visit the Help Center. We&apos;re here to help — and to keep pricing simple,
                transparent, and trustworthy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PricingPolicyPage;
