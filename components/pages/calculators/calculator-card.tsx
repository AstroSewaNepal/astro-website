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

  return (
    <article
      className={[
        'h-full rounded-[22px] border border-[#b8b0a8] bg-transparent shadow-[0_6px_18px_rgba(0,0,0,0.04)]',
        mobileHorizontal
          ? 'snap-start w-[332px] min-w-[332px] min-h-[320px] rounded-[22px] px-4 py-4 opacity-100 overflow-hidden md:w-auto md:min-w-0 md:min-h-0 md:px-6 md:pt-10 md:pb-6'
          : 'px-6 pt-10 pb-6',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex h-full flex-col justify-between text-center">
        <div>
          <div className="h-[120px] flex items-center justify-center">{icon}</div>

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
              'mt-2 font-mukta text-[12px] md:text-[13px] leading-[1.6] text-[#6d6d6d] max-w-[220px] mx-auto',
              descriptionClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {description}
          </p>
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
