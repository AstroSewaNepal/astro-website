import type { Metadata } from 'next';
import { Tiro_Devanagari_Sanskrit, Sahitya, Mukta } from 'next/font/google';

import './globals.css';
import clsx from 'clsx';

const tiroDevanagari = Tiro_Devanagari_Sanskrit({
  variable: '--font-tiro-devanagari',
  subsets: ['latin', 'devanagari'],
  weight: '400',
});

const sahitya = Sahitya({
  variable: '--font-sahitya',
  subsets: ['latin', 'devanagari'],
  weight: ['400', '700'],
});

const mukta = Mukta({
  variable: '--font-mukta',
  subsets: ['latin', 'devanagari'],
  weight: '400',
});

export const metadata: Metadata = {
  title: {
    default: "Astro Sewa - Nepal's Trusted Online Astrology Platform",
    template: '%s | Astro Sewa',
  },
  description:
    "Astro Sewa is Nepal's most trusted online astrology platform, connecting you with over 1000+ verified and experienced astrologers. Get personalized Vedic astrology guidance, daily horoscopes, birth chart readings, and expert consultations for love, career, health, and finances.",
  keywords: [
    'astrology',
    'vedic astrology',
    'online astrology',
    'astrologer consultation',
    'horoscope',
    'birth chart',
    'Nepal astrology',
    'astrology Nepal',
    'astrologer Nepal',
    'daily horoscope',
    'astrology reading',
    'puja bidhi',
    'Astro Sewa',
  ],
  authors: [{ name: 'Astro Sewa Pvt. Ltd.' }],
  creator: 'Astro Sewa Pvt. Ltd.',
  publisher: 'Astro Sewa Pvt. Ltd.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://astrosewa.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Astro Sewa',
    title: "Astro Sewa - Nepal's Trusted Online Astrology Platform",
    description:
      'Connect with 1000+ verified astrologers for personalized Vedic astrology guidance, daily horoscopes, and expert consultations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Astro Sewa - Nepal's Trusted Online Astrology Platform",
    description:
      'Connect with 1000+ verified astrologers for personalized Vedic astrology guidance, daily horoscopes, and expert consultations.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(tiroDevanagari.variable, sahitya.variable, mukta.variable, `antialiased`)}
      >
        {children}
      </body>
    </html>
  );
}
