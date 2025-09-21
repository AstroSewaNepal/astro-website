import React from 'react';

import { IIconsProps } from '../icons.interface';

const CalendarIcon: React.FC<IIconsProps> = ({ className = 'w-6 h-6 text-[#F8F3DF]' }) => {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M17.9167 3.97046H5.08333C4.07081 3.97046 3.25 4.79127 3.25 5.80379V18.6371C3.25 19.6496 4.07081 20.4705 5.08333 20.4705H17.9167C18.9292 20.4705 19.75 19.6496 19.75 18.6371V5.80379C19.75 4.79127 18.9292 3.97046 17.9167 3.97046Z"
        stroke="currentColor"
        strokeWidth="0.916667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.167 2.13696V5.80363"
        stroke="currentColor"
        strokeWidth="0.916667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.83301 2.13696V5.80363"
        stroke="currentColor"
        strokeWidth="0.916667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.25 9.47046H19.75"
        stroke="currentColor"
        strokeWidth="0.916667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CalendarIcon;
