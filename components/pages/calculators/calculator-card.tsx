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
  const desktopCalculateClassName =
    'mt-4 w-full max-w-[425px] min-w-[84px] h-[48px] rounded-[24px] px-4 bg-primary font-mukta text-[18px] leading-[30px] font-semibold text-center text-secondary opacity-100 inline-flex items-center justify-center';
  const mobileCalculateClassName =
    'w-[134px] h-[28px] min-w-[84px] max-w-[480px] rounded-[24px] px-[16px] bg-primary font-mukta font-semibold text-[16px] leading-[28px] tracking-[0] text-center text-secondary opacity-100 inline-flex items-center justify-center';

  return (
    <article
      className={[
        'h-full rounded-[22px] border border-[#b8b0a8] bg-transparent shadow-[0_6px_18px_rgba(0,0,0,0.04)]',
        mobileHorizontal
          ? 'snap-start w-[332px] min-w-[332px] h-[184.0032px] rounded-[12px] border-[1px] pt-[8px] pr-[16px] pb-[8px] pl-[16px] opacity-100 overflow-hidden shadow-none md:w-auto md:min-w-0 md:h-full md:rounded-[22px] md:px-6 md:pt-10 md:pb-6 md:shadow-[0_6px_18px_rgba(0,0,0,0.04)]'
          : 'px-6 pt-10 pb-6',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={
          mobileHorizontal
            ? 'hidden md:flex flex-col items-center text-center'
            : 'flex flex-col items-center text-center'
        }
      >
        <div className="h-[120px] flex items-start justify-center">{icon}</div>

        <h3
          className={[
            'mt-4 font-sahitya font-bold text-[14px] md:text-[15px] text-primary',
            titleClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {title}
        </h3>
        <p
          className={[
            'mt-2 font-mukta text-[12px] md:text-[13px] leading-[1.6] text-[#6d6d6d] max-w-[220px]',
            descriptionClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {description}
        </p>

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

      {mobileHorizontal ? (
        <div className="md:hidden grid grid-cols-[128.2434px_1fr] gap-[16px] items-start">
          <div className="h-[168.0032px] flex flex-col items-center justify-between">
            <div className="h-[130.0032px] w-[128.2434px] flex items-center justify-center">
              {icon}
            </div>
            {calculateHref ? (
              <Link href={calculateHref} className={mobileCalculateClassName}>
                Calculate
              </Link>
            ) : (
              <button type="button" className={mobileCalculateClassName}>
                Calculate
              </button>
            )}
          </div>

          <div className="w-[134px] h-[140px] flex flex-col gap-[16px] opacity-100 mt-[8px]">
            <h3
              className={[
                'font-sahitya font-normal text-[20px] leading-[32px] tracking-[0] text-primary text-left',
                titleClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {title}
            </h3>
            <p
              className={[
                'font-mukta font-medium text-[14px] leading-[140%] tracking-[0] text-[#2f2f2f] text-left',
                'line-clamp-4',
                descriptionClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {description}
            </p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
