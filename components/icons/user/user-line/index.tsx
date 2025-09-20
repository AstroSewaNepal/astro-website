import React from 'react';
import { IIconsProps } from '../../icons.interface';

const UserLineIcon: React.FC<IIconsProps> = ({ className }) => {
  return (
    <svg
      width="23"
      height="22"
      viewBox="0 0 23 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11.5007 9.16671C13.5257 9.16671 15.1673 7.52508 15.1673 5.50004C15.1673 3.475 13.5257 1.83337 11.5007 1.83337C9.47561 1.83337 7.83398 3.475 7.83398 5.50004C7.83398 7.52508 9.47561 9.16671 11.5007 9.16671Z"
        stroke="currentColor"
        strokeWidth="1.375"
      />
      <path
        d="M18.8337 16.0417C18.8337 18.3197 18.8337 20.1667 11.5003 20.1667C4.16699 20.1667 4.16699 18.3197 4.16699 16.0417C4.16699 13.7638 7.45049 11.9167 11.5003 11.9167C15.5502 11.9167 18.8337 13.7638 18.8337 16.0417Z"
        stroke="currentColor"
        strokeWidth="1.375"
      />
    </svg>
  );
};

export default UserLineIcon;
