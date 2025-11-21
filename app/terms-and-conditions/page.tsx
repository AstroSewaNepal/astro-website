import React from 'react';

import clsx from 'clsx';

import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';

import LandingPageCSS from '../landing-page.module.css';

const TermsAndConditionsPage = () => {
  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      <div>
        <LandingHeader />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 prose prose-lg max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-sahitya">
            TERMS & CONDITIONS OF USAGE
          </h1>

          <p className="text-moonlight-700 mb-8 font-mukta">
            <strong>Last updated:</strong> 29 Oct 2025
          </p>

          <div className="text-moonlight-800 leading-relaxed font-mukta">
            <p className="mb-6">
              This website, mobile application and related services (the &apos;Platform&apos; or the
              &apos;Service&apos;) are owned and operated by <strong>Astro Sewa Pvt. Ltd.</strong>{' '}
              (&apos;Astro Sewa&apos;, &apos;we&apos;, &apos;us&apos;, or &apos;our&apos;). These
              Terms & Conditions of Usage (the &apos;Agreement&apos; or &apos;Terms&apos;) govern
              your access to and use of the Platform, including any websites, mobile apps, APIs and
              other interfaces through which we provide astrological, spiritual advisory and related
              services (collectively, the &apos;Services&apos;).
            </p>

            <p className="mb-8">
              Please read these Terms carefully. By accessing or using the Platform you acknowledge
              that you have read, understand and agree to be bound by these Terms and by the Privacy
              Policy. If you do not agree to these Terms, do not access or use the Platform.
            </p>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                1. IMPORTANT SAFETY NOTICE
              </h2>
              <div className="bg-sindoor-50 border-l-4 border-sindoor-500 p-4 mb-4">
                <p className="font-bold text-sindoor-800 mb-2">
                  IF YOU ARE THINKING ABOUT HARMING YOURSELF OR OTHERS, OR IF A PERSON IS IN
                  IMMEDIATE DANGER OR REQUIRES MEDICAL ASSISTANCE, CONTACT LOCAL EMERGENCY SERVICES
                  OR A SUICIDE PREVENTION HELPLINE IMMEDIATELY. THE PLATFORM IS NOT INTENDED FOR
                  EMERGENCY ASSISTANCE. IF YOU CONTINUE TO USE THE PLATFORM IN SUCH CIRCUMSTANCES,
                  YOU DO SO ENTIRELY AT YOUR OWN RISK.
                </p>
              </div>
              <p>
                The Service is <strong>not</strong> a substitute for professional medical, legal,
                financial, psychiatric or other expert advice. Do not delay or discontinue seeking
                in-person professional help because of information obtained via this Platform.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                2. UPDATES TO THESE TERMS
              </h2>
              <p>
                We may update, amend or modify these Terms from time to time. Updated Terms will be
                posted on the Platform with a revised &apos;Last updated&apos; date. It is your
                responsibility to review the Terms periodically. Continued use of the Platform after
                an update constitutes acceptance of the revised Terms.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                3. USER CONSENT
              </h2>
              <p>
                By accessing, downloading, registering for or using the Platform you (the
                &apos;User&apos;, &apos;you&apos;, &apos;your&apos;) expressly consent to these
                Terms and to the collection, use and disclosure of information as described in our
                Privacy Policy. If you do not agree, do not click &apos;I Accept&apos; and do not
                use the Platform.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                4. WHAT THE PLATFORM IS / GENERAL DESCRIPTION
              </h2>
              <p>
                The Platform is an online marketplace and informational portal providing
                astrological content, reports, horoscopes, system-generated readings,
                chat/telephone/video/email consultations and a marketplace for remedies and related
                products (collectively, &apos;Content&apos; or &apos;Services&apos;). Content may be
                offered as free Content (&apos;Free Services&apos;), paid Content (&apos;Paid
                Services&apos;), or a combination.
              </p>
              <p className="mt-4">
                Personalised Consultations and many Marketplace offerings require registration as a
                User. Use of Paid Services is subject to payment and these Terms.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                5. REGISTRATION, ELIGIBILITY & ACCOUNT SECURITY
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You must be at least 18 years old (or the age of majority where you live) and
                  legally capable of entering a binding contract to use Paid Services.
                </li>
                <li>
                  When registering you must provide current, accurate and complete Registration Data
                  and keep it up to date. &apos;Registration Data&apos; means any information you
                  provide to create or maintain an account (phone number, email, profile details,
                  payment details, etc.).
                </li>
                <li>
                  You are solely responsible for safeguarding your account credentials and for all
                  activity under your account. Notify us immediately of any unauthorized use. We are
                  not liable for losses resulting from your failure to keep credentials secure.
                </li>
                <li>
                  You may not create or maintain multiple active user accounts without our prior
                  written consent.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                6. INDEPENDENT PROVIDERS (ASTROLOGERS & SELLERS)
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  The Platform lists independent astrologers, readers, consultants and third-party
                  sellers (each a &apos;Provider&apos;). Providers are independent contractors and
                  NOT employees, agents or partners of Astro Sewa.
                </li>
                <li>
                  Contracts for Consultations, remedies or other third-party products are primarily
                  between the User and the Provider (unless we explicitly state otherwise). Astro
                  Sewa acts as a marketplace and facilitator only.
                </li>
                <li>
                  Providers set their own prices, content and methods of delivery (subject to
                  Platform rules). Astro Sewa does not guarantee the results or effectiveness of any
                  Consultation, remedies or products.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                7. CALL/CHAT FEATURES & DND CONSENT
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  The Platform may offer a feature to connect you by phone, chat or video to a
                  Provider. By using the call/connection feature you consent to being contacted on
                  the phone number you provided, even if you are registered on a DND
                  (do-not-disturb) list, to the extent permitted by local law.
                </li>
                <li>
                  The Platform may offer a <strong>first free chat/call</strong> to new Users; the
                  availability, duration (e.g., up to 1–5 minutes) and eligibility for any free
                  trial are subject to change and at our discretion.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                8. CONTENT & PLATFORM USE
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You must not post or transmit any content that is unlawful, defamatory, abusive,
                  obscene, invasive of privacy, hateful, threatening, pornographic, or otherwise
                  objectionable.
                </li>
                <li>
                  You agree not to use the Platform to encourage, plan or commit unlawful acts,
                  including but not limited to solicitation of illegal goods or services.
                </li>
                <li>
                  We may remove or disable access to Content or suspend Users who violate these
                  Terms or applicable laws.
                </li>
                <li>
                  Educational or informational Content and system-generated outputs are for general
                  guidance only and are not professional advice.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                9. USER ACCOUNT ACCESS BY ASTRO SEWA
              </h2>
              <p>
                For quality assurance and support purposes, Astro Sewa and its authorised
                employees/agents may access certain account records, chat transcripts and
                recordings. By using the Platform you consent to such access for legitimate
                operational reasons and investigations of complaints or abuse (see Privacy Policy
                for details).
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                10. PRIVACY & DATA PROTECTION
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Our Privacy Policy explains how we collect, use, store and share your personal
                  information. By using the Platform you consent to the Privacy Policy.
                </li>
                <li>
                  If you provide sensitive personal data (for example, birth details, health
                  information), you consent to its use for the purpose of delivering the Services.
                  Providers and Astro Sewa must handle such data in accordance with the Privacy
                  Policy and applicable law.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                11. RECORDING CONSULTATIONS
              </h2>
              <p>
                Consultations may only be recorded where required by law or after explicit consent
                of all parties via an in-app consent mechanism. Recordings, when permitted, may be
                used for quality audits, dispute resolution or safety investigations and will be
                retained and handled in accordance with our Privacy Policy.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                12. PAYMENTS, CANCELLATIONS, REFUNDS & WALLET
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Prices are shown at checkout in the applicable currency; final charges may include
                  taxes, conversion fees or payment processor fees.
                </li>
                <li>
                  Payments are processed by third-party payment providers. By making a payment you
                  authorise charging your selected payment method.
                </li>
                <li>
                  Refunds are governed by the refund policy presented at purchase and by applicable
                  consumer law. Unless otherwise required by law, refunds for Consultations or
                  orders processed/delivered may be limited. Users should check the refund policy at
                  the time of purchase.
                </li>
                <li>
                  Where applicable, refunds may be credited to an in-app wallet. Processing times
                  vary. We reserve the right to deduct transaction fees, shipping/courier costs and
                  customs duties where applicable.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                13. DELIVERY; TECHNICAL ISSUES; MULTIPLE PAYMENTS
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  If a Provider is unable to deliver a paid service or a Marketplace order must be
                  cancelled, we will notify you and attempt to refund amounts due in accordance with
                  the refund policy.
                </li>
                <li>
                  If a payment fails or times out, check whether your account was debited before
                  re-attempting payment and contact support if necessary. For duplicate payments we
                  will refund excess amounts after verification.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                14. USER OBLIGATIONS; PROHIBITED ACTIVITIES
              </h2>
              <p className="mb-4">You must not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Post content you are not authorised to post or that infringes another&apos;s
                  rights;
                </li>
                <li>
                  Send spam, unsolicited communications or collect other Users&apos; contact
                  information for marketing;
                </li>
                <li>Upload malicious code, viruses or otherwise attempt to harm the Platform;</li>
                <li>
                  Interfere with the operation of the Platform or attempt to access other accounts
                  without authorization;
                </li>
                <li>
                  Solicit payments or bookings with Providers outside the Platform to evade fees;
                </li>
                <li>
                  Create fake reviews or false complaints; you agree to provide genuine feedback and
                  accept liability for abusive false complaints.
                </li>
              </ul>
              <p className="mt-4">
                Treat Providers and other Users with respect; discriminatory, harassing or abusive
                behaviour will lead to suspension/termination.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                15. BANK, CARD & PAYMENT INFORMATION
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You warrant that any payment method you use is authorised and legally yours. You
                  are responsible for ensuring sufficient funds/credit at the time of payment.
                </li>
                <li>
                  We are not responsible for card/bank fraud arising from your negligence. Always
                  follow safe payment practices.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                16. WARRANTY DISCLAIMER & LIMITATION OF LIABILITY
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE PLATFORM, ALL CONTENT, CONSULTATIONS
                  AND PRODUCTS ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
                  WARRANTIES OF ANY KIND. ASTRO SEWA MAKES NO WARRANTIES THAT SERVICES WILL MEET
                  YOUR REQUIREMENTS, WILL BE UNINTERRUPTED, TIMELY, SECURE, ERROR-FREE, OR THAT
                  RESULTS OR OUTCOMES ARE GUARANTEED.
                </li>
                <li>
                  ASTRO SEWA SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR
                  PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, BUSINESS OR GOODWILL), ARISING
                  OUT OF OR RELATING TO THE PLATFORM, WHETHER IN CONTRACT, TORT, NEGLIGENCE, OR
                  OTHERWISE.
                </li>
                <li>
                  TO THE EXTENT PERMITTED BY APPLICABLE LAW, ASTRO SEWA&apos;S AGGREGATE LIABILITY
                  SHALL BE LIMITED TO THE AMOUNT PAID BY YOU TO ASTRO SEWA FOR THE RELEVANT SERVICE
                  IN THE 12 MONTHS PRECEDING THE CLAIM (OR A NOMINAL AMOUNT IF NONE). LOCAL
                  MANDATORY CONSUMER RIGHTS MAY SUPERSEDE THESE LIMITS.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                17. INDEMNIFICATION
              </h2>
              <p>
                You agree to indemnify, defend and hold Astro Sewa, its affiliates, officers,
                directors, employees and agents harmless from any claims, losses, liabilities,
                damages and expenses (including legal fees) arising out of your breach of these
                Terms, your use of the Platform, your User Content, or your violation of law.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                18. MODERATION, SUSPENSION & TERMINATION
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  We may suspend or terminate your account and access for violations, fraud, abuse,
                  illegal activity, or as otherwise permitted. We may remove Content that violates
                  these Terms. We may do so with or without prior notice.
                </li>
                <li>
                  Termination does not relieve payment obligations or other accrued
                  responsibilities. We will provide an appeal process for certain suspensions —
                  contact support to request details.
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                19. RESTRICTED & PROHIBITED CONTENT (HIGHLIGHTS)
              </h2>
              <p className="mb-4 font-bold text-sindoor-700">We have ZERO tolerance for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>
                    Child sexual abuse, exploitation or any content endangering minors
                  </strong>{' '}
                  — immediate removal and reporting to authorities;
                </li>
                <li>
                  <strong>
                    Sexual exploitation, prostitution, paid sexual services, or non-consensual
                    sexual content
                  </strong>
                  ;
                </li>
                <li>
                  <strong>Hate speech, incitement to violence, terrorist content</strong>;
                </li>
                <li>
                  <strong>
                    Graphic violence, instructions for illegal or dangerous activities (weapons,
                    explosives, restricted drugs)
                  </strong>
                  ;
                </li>
                <li>
                  <strong>
                    Content promoting black magic/witchcraft/voodoo or other harmful occult
                    practices
                  </strong>
                  where illegal or harmful.
                </li>
              </ul>
              <p className="mt-4">
                Violations will result in removal, account termination and, where appropriate,
                reporting to law enforcement.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                20. THIRD-PARTY LINKS & SERVICES
              </h2>
              <p>
                The Platform may contain links to third-party websites, services and products. We do
                not control and are not responsible for third-party content, privacy practices or
                terms. Review third-party policies before transacting.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                21. ERRORS, CORRECTIONS & CHANGES TO SERVICE
              </h2>
              <p>
                We do not warrant that the Platform is error-free or will always be available. We
                may correct errors, change or remove features, or suspend the Platform temporarily
                or permanently. We are not liable for any modification, suspension or
                discontinuation.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                22. INTELLECTUAL PROPERTY
              </h2>
              <p>
                All Platform content (text, graphics, logos, software, designs, images, videos) is
                owned by or licensed to Astro Sewa and protected by intellectual property laws. You
                may not reproduce, distribute or create derivative works without our prior written
                consent.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                23. NOTICES
              </h2>
              <p className="mb-4">
                Notices to Users will be sent to the email address on file or as an in-app message.
                Notices to us should be sent to:
              </p>
              <div className="bg-moonlight-50 p-4 rounded border-l-4 border-primary">
                <p className="font-bold mb-2">Astro Sewa Pvt. Ltd.</p>
                <p>Shankhamul 10, New Baneshwor, Kathmandu, Nepal</p>
                <p>
                  Email:{' '}
                  <a href="mailto:support@astrosewa.com" className="text-primary hover:underline">
                    support@astrosewa.com
                  </a>
                </p>
                <p>
                  Phone:{' '}
                  <a href="tel:+9779818080676" className="text-primary hover:underline">
                    +9779818080676
                  </a>
                </p>
              </div>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                24. GOVERNING LAW & DISPUTE RESOLUTION
              </h2>
              <p>
                These Terms are governed by the laws of <strong>Nepal</strong>. Disputes should
                first be attempted to be resolved in good faith between the parties. If unresolved,
                disputes may be submitted to the courts of <strong>Kathmandu, Nepal</strong>, or to
                arbitration in Kathmandu where both parties agree. Local mandatory consumer
                protections applicable to Users in other jurisdictions shall apply where required by
                law.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                25. FORCE MAJEURE
              </h2>
              <p>
                Astro Sewa will not be liable for failure or delay caused by events beyond
                reasonable control (natural disasters, government action, strikes, pandemic,
                cyberattacks, telecom outages).
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                26. SEVERABILITY; WAIVER; ENTIRE AGREEMENT
              </h2>
              <p>
                If any provision is unlawful or unenforceable it will be severed and the remainder
                will continue. Failure to enforce any right is not a waiver. These Terms, together
                with the Privacy Policy and any policies posted on the Platform, constitute the
                entire agreement between you and Astro Sewa.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                27. CONTACT & REPORTING
              </h2>
              <p className="mb-4">
                For support, complaints, content takedown or to report abuse or illegal conduct,
                contact:
              </p>
              <div className="bg-moonlight-50 p-4 rounded border-l-4 border-primary">
                <p>
                  <strong>support@astrosewa.com</strong>
                </p>
                <p className="mt-2">
                  Please include account details and a clear description of the issue.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default TermsAndConditionsPage;
