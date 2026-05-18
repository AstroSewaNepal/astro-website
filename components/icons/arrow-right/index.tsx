import React from 'react';
import { IIconsProps } from '../icons.interface';

const ArrowRight: React.FC<IIconsProps> = ({
  className = 'w-[5.87px] h-[11.73px] text-[#5B5B5B]',
}) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 12.033H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 5.03296L19 12.033L12 19.033"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowRight;
