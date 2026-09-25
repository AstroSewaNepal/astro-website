import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Child Safety Standards',
  description:
    'Astro Sewa standards against child sexual abuse and exploitation (CSAE): our zero-tolerance policy, how to report concerns, and how we respond.',
  alternates: {
    canonical: '/child-safety',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Zero-Tolerance Policy',
    body: (
      <p>
        Astro Sewa Pvt. Ltd. (&apos;Astro Sewa&apos;, &apos;we&apos;, &apos;our&apos;, or
        &apos;us&apos;) has zero tolerance for child sexual abuse and exploitation (CSAE) and child
        sexual abuse material (CSAM) anywhere on our website, mobile application, and associated
        services (collectively, the &apos;Platform&apos;). Any content, conduct, or communication
        that sexualises, exploits, grooms, or endangers a minor is strictly prohibited and will
        result in immediate action, including permanent account termination and referral to law
        enforcement.
      </p>
    ),
  },
  {
    title: '2. Prohibited Content and Conduct',
    body: (
      <>
        <p>
          The following are prohibited on the Platform, including in chat, voice calls, video calls,
          live streams, profile content, images, and any other user- or astrologer-generated
          content:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            Creating, uploading, sharing, requesting, or linking to child sexual abuse material in
            any form, including drawn, animated, or AI-generated imagery.
          </li>
          <li>
            Grooming, enticing, or soliciting a minor for sexual purposes, or attempting to
            establish contact with a minor for such purposes.
          </li>
          <li>Sexualised comments, messages, or imagery involving minors.</li>
          <li>Sextortion, trafficking, or any other exploitation of minors.</li>
          <li>Using the Platform to arrange offline contact with a minor for harmful purposes.</li>
        </ul>
      </>
    ),
  },
  {
    title: '3. Age Requirements',
    body: (
      <p>
        Astro Sewa is intended for adults. You must be at least 18 years old to use paid services on
        the Platform, and all astrologers must be adults who pass our onboarding and verification
        process. We do not target minors. Accounts found to belong to minors using the Platform in
        violation of our terms may be restricted or removed.
      </p>
    ),
  },
  {
    title: '4. How to Report',
    body: (
      <>
        <p>
          If you encounter content or behaviour on the Platform that may involve child sexual abuse
          or exploitation, please report it immediately:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong>In the app:</strong> open the <strong>Customer Support</strong> section and
            submit a report describing the issue, the account involved, and when it happened.
          </li>
          <li>
            <strong>By email:</strong>{' '}
            <a href="mailto:legal@astrosewa.com" className="text-primary hover:underline">
              legal@astrosewa.com
            </a>{' '}
            with the subject line &apos;Child Safety Report&apos;.
          </li>
        </ul>
        <p className="mt-3">
          Please do not download, screenshot, or forward suspected abuse material yourself; describe
          where it appears so our team can preserve and handle it appropriately. If a child is in
          immediate danger, contact your local police first. In Nepal, you can also call the Nepal
          Police (100) or the Child Helpline (1098).
        </p>
      </>
    ),
  },
  {
    title: '5. How We Respond',
    body: (
      <ul className="list-disc pl-6 space-y-2">
        <li>Reports of CSAE are prioritised and reviewed by our team as quickly as possible.</li>
        <li>
          Violating content is removed and the responsible accounts are suspended or permanently
          banned.
        </li>
        <li>
          Consultation recordings, messages, and account data related to the report may be preserved
          as evidence, beyond our normal retention period where required.
        </li>
        <li>
          Confirmed CSAM and exploitation are reported to the relevant authorities, including the
          Nepal Police and, where applicable, the National Center for Missing &amp; Exploited
          Children (NCMEC) or other regional authorities, in accordance with applicable law.
        </li>
        <li>We cooperate fully with law enforcement investigations and valid legal requests.</li>
      </ul>
    ),
  },
  {
    title: '6. Compliance with Child Safety Laws',
    body: (
      <p>
        Astro Sewa complies with applicable child safety laws, including the laws of Nepal such as
        the Act Relating to Children, 2075 (2018), and the child safety requirements of the app
        stores through which our app is distributed.
      </p>
    ),
  },
  {
    title: '7. Child Safety Point of Contact',
    body: (
      <p>
        Our designated point of contact for child safety matters, including questions about these
        standards and enquiries from app stores or authorities, can be reached at{' '}
        <a href="mailto:legal@astrosewa.com" className="text-primary hover:underline">
          legal@astrosewa.com
        </a>
        .
      </p>
    ),
  },
];

const ChildSafetyPage = () => {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 prose prose-lg max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-sahitya">
            CHILD SAFETY STANDARDS
          </h1>

          <p className="text-moonlight-700 mb-8 font-mukta">
            <strong>Last updated:</strong> September 26, 2026
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
            {sections.map(section => (
              <React.Fragment key={section.title}>
                <hr className="my-8 border-moonlight-300" />
                <section className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-sahitya">
                    {section.title}
                  </h2>
                  {section.body}
                </section>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChildSafetyPage;
