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
    'mt-4 bg-primary font-mukta font-semibold text-[16px] leading-[28px] tracking-[0px] text-center text-secondary opacity-100 inline-flex items-center justify-center',
    'w-[134px] h-[28px] min-w-[84px] max-w-[480px] rounded-[24px] px-4',
    'md:text-[18px] md:leading-[30px] md:tracking-normal md:w-full md:max-w-[425px] md:h-[48px]',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={[
        'h-full min-w-0 rounded-[12px] border border-[#b8b0a8] bg-transparent shadow-[0_6px_18px_rgba(0,0,0,0.04)]',
        mobileHorizontal
          ? 'snap-start w-[332px] min-w-[332px] h-[184px] rounded-[12px] border border-[#79787A] bg-transparent px-4 py-2 opacity-100 overflow-hidden md:w-auto md:min-w-0 md:h-auto md:px-6 md:pt-10 md:pb-6'
          : 'min-w-0 px-6 pt-10 pb-6',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'h-full justify-between',
          mobileHorizontal
            ? 'flex flex-col text-left md:text-center'
            : 'flex flex-col text-center',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={mobileHorizontal ? 'flex items-start gap-4 md:block' : ''}>
          <div
            className={[
              'flex items-center justify-center',
              mobileHorizontal
                ? 'flex-shrink-0 h-[130px] w-[128px] md:h-[140px] md:w-full md:mb-4'
                : 'h-[120px] w-full mb-4',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {icon}
          </div>

          <div className={mobileHorizontal ? 'min-w-0 flex-1 md:min-w-0' : ''}>
            <h3
              className={[
                'font-sahitya font-bold text-[15px] md:text-[17px] lg:text-[19px] text-primary',
                titleClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {title}
            </h3>
            <p
              className={[
                'mt-2 font-mukta text-[12px] md:text-[14px] lg:text-[15px] leading-[1.6] text-[#6d6d6d]',
                mobileHorizontal
                  ? 'max-w-full md:max-w-[320px] lg:max-w-[380px] md:mx-auto'
                  : 'max-w-full md:max-w-[320px] lg:max-w-[380px] mx-auto',
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
