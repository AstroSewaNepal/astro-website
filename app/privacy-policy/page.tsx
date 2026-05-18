import type { Metadata } from 'next';
import React from 'react';
import clsx from 'clsx';
import LandingPageCSS from '../landing-page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy – AstroSewa',
  description:
    'Learn how AstroSewa collects, uses, stores, and protects your personal information when you use our mobile application and website.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

const PrivacyPolicyPage = () => {
  return (
    <main className={clsx('min-h-screen', LandingPageCSS.background)}>
      {/* <div>
        <LandingHeader />
      </div> */}

      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-8 sm:py-16">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 md:p-12 prose prose-lg max-w-none">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 font-sahitya">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-moonlight-500 mb-6 sm:mb-8 font-mukta">
            Effective Date: May 8, 2026 &nbsp;|&nbsp; Last Updated: May 8, 2026
          </p>

          <div className="text-moonlight-800 leading-relaxed font-mukta">
            {/* Intro */}
            <div className="mb-6 sm:mb-8 bg-sindoor-50 border-l-4 border-sindoor-500 p-3 sm:p-4">
              <p className="font-bold text-sm sm:text-base text-sindoor-800 mb-2">
                At <strong>AstroSewa</strong>, we take your privacy seriously. This Privacy Policy
                explains how we collect, use, store, share, and protect your personal information
                when you use our mobile application and website (<strong>astrosewa.com</strong>). By
                using AstroSewa, you agree to the practices described in this policy. Please read it
                carefully.
              </p>
            </div>

            <hr className="my-8 border-moonlight-300" />

            {/* Section 01 */}
            <section className="mb-6 sm:mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 01
              </p>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 font-sahitya">
                About AstroSewa
              </h2>
              <p>
                AstroSewa is an astrology platform that connects clients with professional
                astrologers. Our services include horoscope generation, kundali creation,
                matchmaking, birth chart calculators, and one-on-one consultations via text chat,
                audio call, and video call. We operate primarily in Nepal and India and their global
                diaspora.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            {/* Section 02 */}
            <section className="mb-6 sm:mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 02
              </p>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 font-sahitya">
                Data We Collect
              </h2>
              <p>
                We collect the following personal information when you register and use AstroSewa:
              </p>

              <div className="overflow-x-auto my-3 sm:my-4 -mx-4 sm:mx-0 sm:rounded">
                <table className="w-full border-collapse text-xs sm:text-sm not-prose">
                  <thead>
                    <tr>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-2.5 bg-primary text-white font-mukta font-medium tracking-wide">
                        Data Type
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-2.5 bg-primary text-white font-mukta font-medium tracking-wide">
                        Who It Applies To
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-2.5 bg-primary text-white font-mukta font-medium tracking-wide">
                        Why We Collect It
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        <strong>Full Name</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        Clients &amp; Astrologers
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        To create your profile, generate kundali/horoscope/matchmaking reports,
                        display in astrologer listings, and facilitate consultations and chats
                      </td>
                    </tr>
                    <tr className="bg-moonlight-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        <strong>Date &amp; Place of Birth</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        Clients &amp; Astrologers
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        Required to generate kundali, birth charts, and horoscope calculations
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        <strong>Email Address</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        Clients &amp; Astrologers
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        To send booking confirmations, consultation notifications, astrologer
                        approval/rejection emails, and important account communications
                      </td>
                    </tr>
                    <tr className="bg-moonlight-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        <strong>Phone Number</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        Astrologers
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        To contact astrologers during the interview/onboarding process when email
                        contact is not possible
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        <strong>Profile Image</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        Clients &amp; Astrologers
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        To display your profile photo to the other party during consultations and in
                        astrologer listings
                      </td>
                    </tr>
                    <tr className="bg-moonlight-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        <strong>Timezone</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        Clients &amp; Astrologers
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        To manage astrologer availability schedules and to accurately convert
                        consultation times and pricing for users across different time zones
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 align-top">
                        <strong>Google Account Data</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 align-top">
                        Clients &amp; Astrologers
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 align-top">
                        We use Google Sign-In for authentication. We receive your name and email
                        address from Google solely to create and manage your account
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-primary mt-6 mb-3 font-sahitya">
                Device Permissions We Request
              </h3>

              <div className="overflow-x-auto my-3 sm:my-4 -mx-4 sm:mx-0 sm:rounded">
                <table className="w-full border-collapse text-xs sm:text-sm not-prose">
                  <thead>
                    <tr>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-2.5 bg-primary text-white font-mukta font-medium tracking-wide">
                        Permission
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-2.5 bg-primary text-white font-mukta font-medium tracking-wide">
                        Purpose
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        <strong>Camera</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        To enable video calls between clients and astrologers, and to allow profile
                        photo uploads
                      </td>
                    </tr>
                    <tr className="bg-moonlight-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        <strong>Microphone</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        To enable audio and video calls between clients and astrologers
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        <strong>Gallery / Photo Library</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        To allow clients and astrologers to upload profile photos from their device
                      </td>
                    </tr>
                    <tr className="bg-moonlight-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        <strong>Foreground Service (Android)</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 border-b border-moonlight-300 align-top">
                        To keep audio and video calls running in the background while using other
                        apps on Android devices
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 align-top">
                        <strong>Notifications</strong>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-2.5 align-top">
                        To send reminders for upcoming consultations, rescheduling alerts, call
                        start/end alerts, and payment confirmations
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <hr className="my-6 sm:my-8 border-moonlight-300" />

            {/* Section 03 */}
            <section className="mb-6 sm:mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 03
              </p>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 font-sahitya">
                How We Use Your Data
              </h2>
              <p>
                We use your data only for the purposes listed below. We do not use your personal
                data for advertising or marketing without your explicit consent.
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-sm sm:text-base">
                <li>To create and manage your user or astrologer account</li>
                <li>
                  To generate kundali, horoscope, matchmaking reports, and birth chart calculations
                </li>
                <li>
                  To connect clients with astrologers for consultations via chat, audio, or video
                </li>
                <li>To manage astrologer scheduling, availability, and time zone conversion</li>
                <li>To process payments and display transaction history within the app</li>
                <li>
                  To send booking confirmations, reminders, and notifications related to your
                  consultations
                </li>
                <li>To review and approve or reject astrologer applications</li>
                <li>To improve our platform, features, and user experience</li>
                <li>To comply with applicable laws and regulations</li>
              </ul>
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-moonlight-50 border border-moonlight-300 rounded">
                <p className="m-0 text-xs sm:text-sm">
                  <strong className="text-primary">Google User Data:</strong> Data obtained through
                  Google Sign-In (your name and email) is used solely to create and authenticate
                  your AstroSewa account. We do not use your Google data for any purpose beyond what
                  is necessary to operate the app, and we do not share it with any unauthorized
                  third parties.
                </p>
              </div>
            </section>

            <hr className="my-8 border-moonlight-300" />

            {/* Section 04 */}
            <section className="mb-6 sm:mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 04
              </p>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 font-sahitya">
                Data Sharing with Third Parties
              </h2>
              <p>
                We do not sell, rent, or trade your personal information. We share your data only in
                the limited circumstances described below:
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-primary mt-5 mb-2 font-sahitya">
                VedAstro.org — Astrology Calculations
              </h3>
              <p>
                To generate kundali, horoscope, matchmaking reports, and astrological calculators,
                we send relevant user-provided information (such as name, date of birth, and birth
                details) to the VedAstro.org API. This data is used solely for the purpose of
                generating astrological content and is not used by VedAstro for any other purpose.
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-primary mt-5 mb-2 font-sahitya">
                Khalti &amp; Payment Providers — Payment Processing
              </h3>
              <p>
                When you make a payment, you will be redirected to a third-party payment provider
                (such as Khalti). The payment provider will process your payment independently. Any
                information you provide to the payment provider is governed by their own privacy
                policy. We record the transaction result (success or failure) in our system for your
                booking records.
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-primary mt-5 mb-2 font-sahitya">
                Legal Requirements
              </h3>
              <p>
                We may disclose your information if required to do so by law or in response to valid
                legal processes such as a court order or government request.
              </p>

              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-moonlight-50 border border-moonlight-300 rounded">
                <p className="m-0 text-xs sm:text-sm">
                  <strong className="text-primary">No other sharing:</strong> We do not currently
                  share your data with any other third parties beyond those listed above.
                </p>
              </div>
            </section>

            <hr className="my-6 sm:my-8 border-moonlight-300" />

            {/* Section 05 */}
            <section className="mb-6 sm:mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 05
              </p>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 font-sahitya">
                Data Storage &amp; Security
              </h2>
              <p>
                Your data is stored securely on cloud infrastructure provided by{' '}
                <strong>Amazon Web Services (AWS)</strong> in the{' '}
                <strong>Mumbai region (ap-south-1)</strong>, chosen to ensure low latency and
                compliance for our primary markets of Nepal and India. We use{' '}
                <strong>MongoDB</strong> as our database, hosted within this infrastructure.
              </p>
              <p>We implement the following security measures to protect your data:</p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-sm sm:text-base">
                <li>
                  <strong>Encryption in Transit:</strong> All data transmitted between your device
                  and our servers is encrypted using industry-standard SSL/TLS protocols
                </li>
                <li>
                  <strong>Encryption at Rest:</strong> Data stored in our databases is encrypted at
                  rest
                </li>
                <li>
                  <strong>Access Control:</strong> Access to user data is restricted to authorized
                  personnel only, on a need-to-know basis
                </li>
                <li>
                  <strong>Secure Infrastructure:</strong> Our servers are managed through AWS, which
                  maintains internationally recognized security certifications and practices
                </li>
              </ul>
              <p>
                While we take all reasonable steps to protect your data, no system is 100% secure.
                We encourage you to use a strong password and keep your account credentials
                confidential.
              </p>
            </section>

            <hr className="my-6 sm:my-8 border-moonlight-300" />

            {/* Section 06 */}
            <section className="mb-6 sm:mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 06
              </p>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 font-sahitya">
                Data Retention &amp; Deletion
              </h2>
              <p>
                We retain your personal data for as long as your account is active or as needed to
                provide our services.
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-primary mt-5 mb-2 font-sahitya">
                Account Deletion
              </h3>
              <p>
                You may delete your account at any time from within the AstroSewa app. Upon account
                deletion:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  All personally identifiable information (name, email, phone number, profile image)
                  will be permanently deleted from our systems within <strong>30 days</strong>
                </li>
                <li>Your account and login access will be immediately deactivated</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-bold text-primary mt-5 mb-2 font-sahitya">
                Anonymized Data
              </h3>
              <p>
                After your personal information is deleted, certain non-identifiable, anonymized
                data (such as aggregated usage patterns, consultation history records with all
                personal identifiers removed and replaced with anonymous identifiers) may be
                retained. This anonymized data cannot be linked back to you in any way and is used
                solely for service improvement and analytical purposes.
              </p>

              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-moonlight-50 border border-moonlight-300 rounded">
                <p className="m-0 text-xs sm:text-sm">
                  <strong className="text-primary">To request account deletion:</strong> Go to{' '}
                  <strong>Profile → Settings → Delete Account</strong> within the app, or contact us
                  at{' '}
                  <a href="mailto:privacy@astrosewa.com" className="text-primary hover:underline">
                    privacy@astrosewa.com
                  </a>
                  .
                </p>
              </div>
            </section>

            <hr className="my-6 sm:my-8 border-moonlight-300" />

            {/* Section 07 */}
            <section className="mb-6 sm:mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 07
              </p>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 font-sahitya">
                Children&apos;s Privacy
              </h2>
              <p>
                AstroSewa is not intended for use by children under the age of 13. We do not
                knowingly collect personal information from children under 13. If we become aware
                that a child under 13 has provided us with personal information, we will take steps
                to delete such information immediately.
              </p>
            </section>

            <hr className="my-6 sm:my-8 border-moonlight-300" />

            {/* Section 08 */}
            <section className="mb-6 sm:mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 08
              </p>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 font-sahitya">
                Your Rights
              </h2>
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Right to Access:</strong> You can request a copy of the personal data we
                  hold about you
                </li>
                <li>
                  <strong>Right to Correction:</strong> You can update or correct your personal
                  information from your profile settings
                </li>
                <li>
                  <strong>Right to Deletion:</strong> You can delete your account and personal data
                  at any time
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> You can withdraw consent for optional
                  data uses at any time
                </li>
                <li>
                  <strong>Right to Object:</strong> You can object to certain types of data
                  processing by contacting us
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:privacy@astrosewa.com" className="text-primary hover:underline">
                  privacy@astrosewa.com
                </a>
                .
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            {/* Section 09 */}
            <section className="mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 09
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                Google API Services — User Data Policy Compliance
              </h2>
              <p>
                AstroSewa&apos;s use of information received from Google APIs adheres to the{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
              <p>Specifically:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  We only use Google user data (name and email) to provide and improve our
                  app&apos;s features directly to the user
                </li>
                <li>We do not use Google user data to serve advertisements</li>
                <li>
                  We do not allow humans to read your Google user data unless you have given us
                  explicit permission or it is necessary for security purposes
                </li>
                <li>
                  We do not transfer Google user data to third parties except as necessary to
                  provide our services, as described in this policy
                </li>
              </ul>
            </section>

            <hr className="my-8 border-moonlight-300" />

            {/* Section 10 */}
            <section className="mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 10
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our
                services or legal obligations. When we make significant changes, we will notify you
                via email or a prominent notice within the app. The &quot;Last Updated&quot; date at
                the top of this page will always reflect the most recent version.
              </p>
              <p>
                Continued use of AstroSewa after any changes constitutes your acceptance of the
                updated policy.
              </p>
            </section>

            <hr className="my-8 border-moonlight-300" />

            {/* Section 11 */}
            <section className="mb-8">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 font-mukta">
                Section 11
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                Contact Us
              </h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or
                your personal data, please contact us:
              </p>
              <div className="mt-4 p-4 bg-moonlight-50 border border-moonlight-300 rounded">
                <p className="m-0 text-sm">
                  <strong className="text-primary">AstroSewa</strong>
                  <br />
                  Email:{' '}
                  <a
                    href="mailto:privacy@astrosewa.com"
                    className="text-primary hover:underline font-bold"
                  >
                    privacy@astrosewa.com
                  </a>
                  <br />
                  Website:{' '}
                  <a
                    href="https://www.astrosewa.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold"
                  >
                    www.astrosewa.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
