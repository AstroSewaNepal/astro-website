'use client';

import React from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  className?: string;
};

export default function SignInButton({ children, icon, href, className = '', ...rest }: Props) {
  const { pending } = useFormStatus();

  const content = (
    <button
      {...rest}
      disabled={pending || rest.disabled}
      className={
        'inline-flex items-center justify-center flex-nowrap gap-[4px] min-w-[93.2794189453125px] h-[40px] px-[16px] py-[4px] rounded-[24px] border text-white bg-primary ' +
        'font-mukta font-normal text-[14px] leading-[24px] tracking-normal md:text-lg md:leading-7 lg:text-xl whitespace-nowrap ' +
        'lg:px-5 lg:py-2 lg:gap-1.5 lg:w-auto lg:h-auto lg:rounded-3xl disabled:opacity-70 disabled:cursor-not-allowed ' +
        className
      }
      style={{ borderWidth: '0.36px', ...(rest.style || {}) }}
    >
      {pending ? (
        <span style={{ display: 'block', width: '17.28px', height: '17.28px' }}>
          <Loader2 className="h-full w-full animate-spin" />
        </span>
      ) : icon ? (
        <span
          style={{
            display: 'block',
            width: '17.279422760009766px',
            height: '17.279422760009766px',
          }}
        >
          {icon}
        </span>
      ) : null}
      <span>{pending ? 'Signing in...' : children}</span>
    </button>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
