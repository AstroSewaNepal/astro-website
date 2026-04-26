import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';

import { AstrologyPrimaryColor } from '@/components/images';

export type KundaliCardProps = {
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  href: string;
  imageAlt: string;
  imageSrc: StaticImageData;
  imageWidth?: number;
  imageHeight?: number;
  imageGap?: number;
  imageOpacity?: number;
  imageRotation?: number;
  imageClassName?: string;
  imageContainerClassName?: string;
  descriptionWidth?: number;
  descriptionHeight?: number;
  descriptionGap?: number;
  descriptionOpacity?: number;
  descriptionRotation?: number;
};

export default function KundaliCard({
  title,
  subtitle,
  description,
  cta,
  href,
  imageAlt,
  imageSrc,
  imageWidth,
  imageHeight,
  imageGap,
  imageOpacity,
  imageRotation,
  imageClassName,
  imageContainerClassName,
  descriptionWidth,
  descriptionHeight,
  descriptionGap,
  descriptionOpacity,
  descriptionRotation,
}: KundaliCardProps) {
  return (
    <article className="flex h-full flex-col">
      <header>
        <h2 className="font-sahitya font-bold text-[20px] leading-[38px] md:text-[28px] text-primary">
          {title}
        </h2>
        <p className="font-mukta font-medium text-[16px] leading-[30px] tracking-[0] md:text-[24px] text-[#141414] mt-1">
          {subtitle}
        </p>
      </header>

      <div
        className={['mt-5 flex justify-center', imageContainerClassName].filter(Boolean).join(' ')}
        style={{ gap: imageGap ?? 12.64 }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth ?? 463}
          height={imageHeight ?? 379}
          className={imageClassName}
          style={{
            width: imageClassName ? undefined : '100%',
            maxWidth: imageClassName ? undefined : (imageWidth ?? 463),
            height: imageClassName ? undefined : (imageHeight ?? 379),
            opacity: imageOpacity ?? 1,
            transform: `rotate(${imageRotation ?? 0}deg)`,
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 630px, 630px"
        />
      </div>

      <div
        className="mt-5 flex flex-col"
        style={{
          width: '100%',
          maxWidth: descriptionWidth ?? undefined,
          minHeight: descriptionHeight ?? undefined,
          gap: descriptionGap ?? undefined,
          opacity: descriptionOpacity ?? undefined,
          transform: `rotate(${descriptionRotation ?? 0}deg)`,
        }}
      >
        <p className="font-mukta font-normal text-[16px] leading-6 tracking-[0] md:text-[24px] md:leading-[34px] text-Paragraph text-justify">
          {description}
        </p>
      </div>

      <div className="mt-auto pt-2 md:pt-6">
        <Link
          href={href}
          className="inline-flex w-full max-w-[380px] md:max-w-[673px] h-[60px] gap-[32px] items-center justify-center rounded-full bg-primary px-6 font-mukta text-[18px] font-semibold leading-[30px] text-secondary shadow-[0_10px_26px_rgba(97,21,8,0.18)] transition-colors hover:bg-[#8e2f27] opacity-100"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
