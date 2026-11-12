import React from 'react';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';

import PhoneIcon from '@/components/icons/phone-icon';
import {
  AppleDownloadImage,
  AstroSewaTransparentLogo,
  GoogleDownloadImage,
  FBLogo,
  InstagramLogo,
  TiktokLogo,
  YoutubeLogo,
  XLogo,
  LinkedinLogo,
} from '@/components/images';
import { PLAY_STORE_URL } from '@/lib/constants/app-store';

const WHATSAPP_URL =
  'https://wa.me/9779818080676?text=Hello%20AstroSewa%20team%2C%20I%20would%20like%20to%20discuss%20your%20services%20and%20need%20some%20assistance%20with%20my%20astrology%20requirements.%20Please%20let%20me%20know%20the%20best%20way%20to%20proceed.';

const SOCIALS: { href: string; label: string; alt: string; logo: StaticImageData }[] = [
  {
    href: 'https://www.facebook.com/astrosewaofficial',
    label: 'Astro Sewa on Facebook',
    alt: 'Facebook',
    logo: FBLogo,
  },
  {
    href: 'https://www.instagram.com/astrosewaofficial/',
    label: 'Astro Sewa on Instagram',
    alt: 'Instagram',
    logo: InstagramLogo,
  },
  {
    href: 'https://www.tiktok.com/@astrosewaofficial',
    label: 'Astro Sewa on TikTok',
    alt: 'TikTok',
    logo: TiktokLogo,
  },
  {
    href: 'https://www.youtube.com/@astrosewaofficial',
    label: 'Astro Sewa on YouTube',
    alt: 'YouTube',
    logo: YoutubeLogo,
  },
  { href: 'https://x.com/astro_sewa', label: 'Astro Sewa on X', alt: 'X', logo: XLogo },
  {
    href: 'https://www.linkedin.com/company/astrosewa/',
    label: 'Astro Sewa on LinkedIn',
    alt: 'LinkedIn',
    logo: LinkedinLogo,
  },
];

/** `external` links open a new tab (WhatsApp) or the mail app; the rest are site pages. */
type FooterLink = { href: string; label: string; external?: 'tab' | 'mail' };

const QUICK_LINKS: FooterLink[] = [
  { href: '/free-kundali', label: 'Free Kundali' },
  { href: '/kundali-matching', label: 'Free Kundali Matching' },
  { href: '/horoscope', label: 'Horoscope' },
  { href: '/', label: 'Talk to Astrologer' },
  { href: '/puja-bidhi', label: 'Puja Bidhi' },
  { href: '/blogs', label: 'Blog' },
];

const USEFUL_LINKS: FooterLink[] = [
  { href: '/about-us', label: 'About Us' },
  { href: WHATSAPP_URL, label: 'Contact Us', external: 'tab' },
  {
    href: 'mailto:support@astrosewa.com?subject=Astrologer%20Registration',
    label: 'Astrologer Registration',
    external: 'mail',
  },
  { href: '/zodiac-sign', label: 'Zodiac Sign' },
  { href: '/calculators', label: 'Calculator' },
];

const LEGAL_LINKS: FooterLink[] = [
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/pricing-policy', label: 'Pricing Policy' },
  { href: '/child-safety', label: 'Child Safety' },
];

const linkClass =
  'font-mukta text-[15px] lg:text-[18px] font-medium text-[#F8F3DF] opacity-75 hover:opacity-100 transition-opacity';
const headingClass = 'text-[17px] lg:text-[22px] font-normal mb-1 lg:mb-3';

function FooterAnchor({ link, className }: { link: FooterLink; className: string }) {
  if (link.external === 'tab') {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    );
  }
  if (link.external === 'mail') {
    return (
      <a href={link.href} className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="flex flex-col gap-2 lg:gap-3">
      <h4 className={headingClass}>{title}</h4>
      <div className="flex flex-col gap-1.5 lg:gap-2">
        {links.map(link => (
          <FooterAnchor key={link.label} link={link} className={linkClass} />
        ))}
      </div>
    </div>
  );
}

/**
 * Site footer. Desktop (lg): logo + apps + socials on the left, three link columns on the right. Phones and tablets:
 * the same content packed tighter (badges side by side, Quick/Useful Links as two columns, smaller type) so it stays
 * about a screen tall instead of two.
 */
const Footer: React.FC = () => {
  return (
    // Maroon continues under the iPhone home bar (viewport-fit=cover)
    <footer className="bg-[#5F1508] pb-[env(safe-area-inset-bottom)] text-[#F8F3DF]">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-0 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-32 items-center lg:items-start text-center lg:text-left">
          {/* Left Section - Logo and Download */}
          <div className="flex flex-col gap-5 lg:gap-14 max-w-[300px] w-full lg:max-w-[278px] lg:w-auto mx-auto lg:mx-0 items-center lg:items-start text-center lg:text-left">
            <div className="w-[150px] h-[46px] lg:w-[187px] lg:h-[58px] rounded-lg flex items-center justify-center mx-auto lg:mx-0">
              <Image
                src={AstroSewaTransparentLogo}
                alt="Astro Sewa Logo"
                width={187}
                height={58}
                className="h-full w-full"
              />
            </div>

            {/* Mobile Apps Section */}
            <div className="flex flex-col gap-3 lg:gap-6 w-full">
              <h3 className="font-sahitya text-[17px] lg:text-[22px] font-normal">
                Astro Sewa Mobile Apps
              </h3>

              {/* Download Buttons: side by side on phones too */}
              <div className="flex flex-row items-center justify-center lg:justify-start gap-3 lg:gap-4">
                <div className="w-[133px] h-[44px] bg-black rounded-lg flex items-center justify-center">
                  <Image src={AppleDownloadImage} alt="Apple Download" width={133} height={44} />
                </div>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download AstroSewa from Google Play"
                  className="w-[133px] h-[44px] bg-black rounded-lg flex items-center justify-center"
                >
                  <Image src={GoogleDownloadImage} alt="Google Download" width={133} height={44} />
                </a>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex justify-center gap-3">
              {SOCIALS.map(s => (
                <a
                  key={s.alt}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-[34px] h-[34px] lg:w-[40px] lg:h-[40px] flex items-center justify-center hover:opacity-85 transition-opacity"
                  aria-label={s.label}
                >
                  <Image
                    src={s.logo}
                    alt={s.alt}
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Right Section - Links and Contact */}
          <div className="w-full">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-30 flex-1 justify-center">
              {/* Phones: Quick and Useful Links side by side. Desktop: the wrapper steps aside (contents) and they sit
                  in the row with Contact, as before. */}
              <div className="mx-auto grid w-full max-w-[340px] grid-cols-2 gap-x-4 text-left lg:contents">
                <LinkColumn title="Quick Links" links={QUICK_LINKS} />
                <LinkColumn title="Useful Links" links={USEFUL_LINKS} />
              </div>

              {/* Contact Us */}
              <div className="flex flex-col gap-2 lg:gap-3 max-w-[243px] w-full mx-auto lg:mx-0">
                <h4 className={headingClass}>Contact Us</h4>
                <div className="flex flex-col gap-2 lg:gap-6">
                  {/* Phone */}
                  <div className="flex items-center justify-center gap-3 lg:justify-start">
                    <div className="flex h-[18px] w-[18px] lg:h-[22px] lg:w-[22px] items-center justify-center rounded">
                      <PhoneIcon className="h-full w-full text-[#F8F3DF]" />
                    </div>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mukta text-[15px] lg:text-[18px] font-medium text-[#F8F3DF] hover:opacity-75 transition-opacity"
                    >
                      +977 9818080676
                    </a>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-center gap-3 lg:justify-start">
                    <div className="flex h-[18px] w-[18px] lg:h-[22px] lg:w-[22px] items-center justify-center rounded">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-full w-full text-[#F8F3DF] opacity-100"
                      >
                        <path
                          d="M20 6H4C2.9 6 2 6.9 2 8V16C2 17.1 2.9 18 4 18H20C21.1 18 22 17.1 22 16V8C22 6.9 21.1 6 20 6Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path d="M22 8L12 13L2 8" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <a
                      href="mailto:support@astrosewa.com"
                      className="font-mukta text-[15px] lg:text-[18px] font-medium text-[#F8F3DF] hover:opacity-75 transition-opacity"
                    >
                      support@astrosewa.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 lg:gap-8 mt-8">
              {/* Dividers only on desktop: on a wrapping phone row they dangle at line ends. */}
              {LEGAL_LINKS.map((link, i) => (
                <React.Fragment key={link.href}>
                  {i > 0 ? <div className="hidden w-px h-6 bg-[#F8F3DF] lg:block" /> : null}
                  <Link
                    href={link.href}
                    className="font-mukta text-[14px] lg:text-[20px] font-normal text-[#F8F3DF] hover:opacity-75 transition-opacity underline"
                  >
                    {link.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#F8F3DF] border-opacity-20"></div>

      {/* Bottom Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-0 py-4 lg:py-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* Copyright */}
          <div className="flex flex-wrap items-center justify-center gap-1">
            <span className="font-mukta text-[13px] lg:text-[18px] font-normal">
              Copyright © 2025 AstroSewa
            </span>
            <span className="font-mukta text-[13px] lg:text-[18px] font-normal">
              || All Rights Reserved
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
