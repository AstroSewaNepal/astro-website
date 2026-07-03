import Link from 'next/link';
import { ReactNode } from 'react';

type CalculatorCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  mobileHorizontal?: boolean;
  calculateHref?: string;
};

export default function CalculatorCard({
  title,
  description,
  icon,
  titleClassName,
  descriptionClassName,
  mobileHorizontal = false,
  calculateHref,
}: CalculatorCardProps) {
  const desktopCalculateClassName = [
    'mt-4 bg-primary font-mukta font-semibold text-[14px] leading-[24px] tracking-[0px] text-center text-secondary opacity-100 inline-flex items-center justify-center',
    'w-[124px] h-[26px] min-w-[84px] max-w-[460px] rounded-[22px] px-3',
    'md:text-[16px] md:leading-[26px] md:tracking-normal md:w-full md:max-w-[400px] md:h-[42px]',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={[
        'h-full min-w-0 rounded-[12px] border border-[#b8b0a8] bg-transparent shadow-[0_6px_18px_rgba(0,0,0,0.04)]',
        mobileHorizontal
          ? 'snap-start w-[332px] min-w-[332px] min-h-[184px] rounded-[12px] border border-[#79787A] bg-transparent px-3 py-2 opacity-100 overflow-hidden md:w-auto md:min-w-0 md:h-auto md:px-5 md:pt-8 md:pb-5'
          : 'min-w-0 px-5 pt-8 pb-5',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'h-full justify-between',
          mobileHorizontal ? 'flex flex-col text-left md:text-center' : 'flex flex-col text-center',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={mobileHorizontal ? 'flex items-start gap-4 md:block' : ''}>
          <div
            className={[
              'flex items-center justify-center',
              mobileHorizontal
                ? 'flex-shrink-0 h-[110px] w-[110px] md:h-[120px] md:w-full md:mb-4'
                : 'h-[100px] w-full mb-4',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {icon}
          </div>

          <div className={mobileHorizontal ? 'min-w-0 flex-1 md:min-w-0' : ''}>
            <h3
              className={[
                'font-tiro-devanagari font-bold text-[14px] md:text-[16px] lg:text-[18px] max-[1279px]:text-[16px] text-primary leading-[1.2]',
                titleClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {title}
            </h3>
            <p
              className={[
                'mt-2 font-mukta text-[11px] md:text-[12px] lg:text-[13px] max-[1279px]:text-[12px] leading-[1.4] text-[#6d6d6d]',
                mobileHorizontal
                  ? 'max-w-full md:max-w-full md:mx-auto'
                  : 'max-w-full md:max-w-full mx-auto',
                descriptionClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {description}
            </p>
          </div>
        </div>

        {calculateHref ? (
          <Link href={calculateHref} className={desktopCalculateClassName}>
            Calculate
          </Link>
        ) : (
          <button type="button" className={desktopCalculateClassName}>
            Calculate
          </button>
        )}
      </div>
    </article>
  );
}
