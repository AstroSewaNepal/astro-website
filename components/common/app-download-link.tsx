'use client';

import React from 'react';
import Link from 'next/link';

import { DOWNLOAD_APP_PAGE, getMobileStoreUrl } from '@/lib/constants/app-store';

type AppDownloadLinkProps = Omit<React.ComponentProps<typeof Link>, 'href'>;

/** Sends Android visitors straight to the Play Store; everyone else (and no-JS) lands on /download-app. */
const AppDownloadLink: React.FC<AppDownloadLinkProps> = ({ onClick, ...props }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const storeUrl = getMobileStoreUrl();
    if (storeUrl) {
      event.preventDefault();
      window.location.assign(storeUrl);
    }
  };

  return <Link href={DOWNLOAD_APP_PAGE} onClick={handleClick} {...props} />;
};

export default AppDownloadLink;
