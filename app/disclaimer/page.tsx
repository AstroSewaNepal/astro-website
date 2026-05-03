import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Legal Disclaimer',
  description:
    'Read the full legal disclaimer for Astro Sewa. Understand the limitations, liability, refund policy, and terms of use for our astrology platform.',
  alternates: {
    canonical: '/disclaimer',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const DisclaimerPage = () => {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 prose prose-lg max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-sahitya">
            FULL LEGAL DISCLAIMER
          </h1>

          <p className="text-moonlight-700 mb-8 font-mukta">
            <strong>Last updated:</strong> October 29, 2025
          </p>

          <div className="text-moonlight-800 leading-relaxed font-mukta mb-4">
            <p>
              <strong>Company:</strong> Astro Sewa Pvt. Ltd. — Registered in Nepal.
              <strong> Contact:</strong>{' '}
              <a href="mailto:legal@astrosewa.com" className="text-primary hover:underline">
                legal@astrosewa.com
              </a>
            </p>
          </div>

          <div className="text-moonlight-800 leading-relaxed font-mukta">
            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                1. General
              </h2>
              <p>
                The information, reports, readings, and services provided on the Astro Sewa website,
                mobile application, and associated digital platforms (collectively, the
                &apos;Platform&apos;) are intended solely for general guidance, spiritual insight,
                awareness, and entertainment purposes. Any prediction, reading, or recommendation
                you receive from Astro Sewa is not a substitute for professional advice, diagnosis,
                or treatment from qualified professionals such as medical doctors, legal advisors,
                psychiatrists, psychologists, or financial advisors.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                2. No Guarantees / No Warranties
              </h2>
              <p>
                Astro Sewa Pvt. Ltd. (&apos;Astro Sewa&apos;, &apos;we&apos;, &apos;our&apos;, or
                &apos;us&apos;) provides content and services &apos;as is&apos; and makes no
                warranties, express or implied, about the accuracy, completeness, currency, or
                reliability of any information provided on the Platform. We do not guarantee
                outcomes or results from using our services.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                3. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, Astro Sewa shall not be liable
                for any direct, indirect, incidental, special, consequential, or exemplary damages
                (including loss of profits, goodwill, data, or other intangible losses) arising from
                or in connection with: (a) use of, or inability to use, the Platform; (b) reliance
                on any information or advice provided on the Platform; (c) actions taken or not
                taken based on Platform content; or (d) third-party services linked from our
                Platform.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                4. Not a Professional Relationship
              </h2>
              <p>
                Use of the Platform does not create a professional, fiduciary, or client
                relationship between you and our astrologers, representatives, or Astro Sewa.
                Communications (text, audio, video) are informational and spiritual guidance only.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                5. External Links
              </h2>
              <p>
                The Platform may include links to third-party websites, tools, or services. These
                are provided for convenience and do not imply endorsement. Astro Sewa does not
                control third-party content and is not responsible for their accuracy or privacy
                practices. Access third-party links at your own risk.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                6. Affiliate, Promotion & Marketplace
              </h2>
              <p>
                Astro Sewa may list or recommend products, remedies, or services via affiliate
                links, sponsorships, or partnerships. We may receive compensation from such
                promotions. Recommendations do not constitute guaranteed results. Users should
                verify product/service details independently and consult professionals where
                necessary.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                7. Payments, Refunds & Cancellations
              </h2>
              <p>
                Paid services (consultations, marketplace purchases) are processed through
                third-party payment processors. Refunds and cancellations are governed by our Refund
                & Cancellation Policy (see below). By booking or purchasing you agree to the
                applicable payment, refund, and cancellation terms and any fees charged by payment
                processors.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                7.A Refund & Cancellation
              </h2>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Consultation bookings:</strong> Full refunds will be issued if a booking
                  is canceled at least 24 hours prior to the scheduled session start time.
                  Cancellations made within 24 hours of the session may be eligible for a partial
                  refund or credit at Astro Sewa&apos;s discretion.
                </li>
                <li>
                  <strong>Marketplace purchases:</strong> Refunds for goods are subject to the
                  product&apos;s listing terms and any applicable return window. Digital products
                  and redeemed services are generally non-refundable unless otherwise stated.
                </li>
                <li>
                  <strong>Exceptions & third-party fees:</strong> Refunds may be reduced by payment
                  processing fees and may take up to 7–14 business days to appear on your statement
                  depending on your payment method and processor. Specific refunds and cancellation
                  rules may vary; always check the booking/checkout page or product listing for the
                  exact terms that apply.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                8. Recordings & Retention
              </h2>
              <p>
                Some interactions on the Platform (chat, audio, or video consultations) may be
                recorded or logged for quality assurance, training, verification, and dispute
                resolution purposes. Astro Sewa and its authorized service providers retain
                consultation recordings and related metadata for a period of{' '}
                <strong>90 days</strong> from the date of the session, after which recordings will
                be deleted or archived in accordance with our internal retention schedule, unless
                required to be retained longer for legal or regulatory reasons or upon active user
                request subject to verification.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                9. Recordings: User Rights & Requests
              </h2>
              <p>
                If you wish to request access to, download, or delete recordings relating to your
                sessions, please contact{' '}
                <a href="mailto:legal@astrosewa.com" className="text-primary hover:underline">
                  legal@astrosewa.com
                </a>{' '}
                with your request and any necessary verification. Requests will be processed in
                accordance with our Privacy Policy and applicable law. Note that in certain cases
                (disputes, legal holds, regulatory requirements) some recordings may be retained
                beyond the stated retention period.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                10. User Content; License
              </h2>
              <p>
                Users are responsible for any content they upload, submit, or share via the
                Platform. By submitting content, you grant Astro Sewa a non-exclusive, worldwide,
                royalty-free license to use, reproduce, modify, and display that content for the
                purpose of providing services, ensuring compliance, or promoting the Platform
                (subject to our Privacy Policy). You warrant that you own or have rights to any
                submitted content.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                11. Age Restriction
              </h2>
              <p>
                You must be at least 18 years old to use the paid services on the Platform. Minors
                may use the Platform only with legal guardian consent; however, Astro Sewa does not
                target minors.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                12. Changes to Services & Disclaimers
              </h2>
              <p>
                Astro Sewa reserves the right to modify or discontinue any part of the Platform at
                any time without notice. We may update this Disclaimer; the &apos;Last updated&apos;
                date above will reflect changes. Continued use constitutes acceptance of updates.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                13. Governing Law & Dispute Resolution
              </h2>
              <p>
                This Disclaimer and any disputes arising from the Platform shall be governed by and
                construed in accordance with the laws of <strong>Nepal</strong>. Any legal action or
                proceeding related to the Platform shall be brought in courts located in Nepal,
                unless otherwise agreed.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                14. Contact
              </h2>
              <p>
                If you have questions about this Disclaimer or related policies, contact:{' '}
                <a href="mailto:legal@astrosewa.com" className="text-primary hover:underline">
                  legal@astrosewa.com
                </a>
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <div className="bg-sindoor-50 border-l-4 border-sindoor-500 p-6 rounded">
                <p className="font-bold text-sindoor-800 text-lg font-sahitya text-center">
                  BY USING ASTRO SEWA&apos;S WEBSITE, APP, OR SERVICES YOU ACKNOWLEDGE THAT YOU HAVE
                  READ, UNDERSTOOD, AND AGREE TO THIS DISCLAIMER IN FULL.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DisclaimerPage;
