import React from 'react';

import { IIconsProps } from '../icons.interface';

const ArrowLeft: React.FC<IIconsProps> = ({
  className = 'w-[5.87px] h-[11.73px] text-[#5B5B5B]',
}) => {
  return (
    <svg
      width={'5.87'}
      height={'11.73'}
      viewBox="0 0 6.14 12.27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.5 1L1 6.135L5.5 11.27"
        stroke={'currentColor'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowLeft;
