import React from 'react';
import { IconProps } from '../icons.interface';

const ArrowLeft: React.FC<IconProps> = ({
  width = 6.14,
  height = 12.27,
  className = '',
  stroke = '#5B5B5B',
  strokeWidth = 1.27,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 6.14 12.27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.5 1L1 6.135L5.5 11.27"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowLeft;
