import React from "react";
import { IIconsProps } from "../icons.interface";

const TransparentBellIcon: React.FC<IIconsProps> = ({ className }) => {
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.23 21C14.0542 21.3031 13.8018 21.5547 13.4982 21.7295C13.1946 21.9044 12.8504 21.9965 12.5 21.9965C12.1496 21.9965 11.8054 21.9044 11.5018 21.7295C11.1982 21.5547 10.9458 21.3031 10.77 21M18.5 8.4C18.5 6.703 17.868 5.075 16.743 3.875C15.618 2.675 14.09 2 12.5 2C10.91 2 9.383 2.674 8.257 3.875C7.132 5.075 6.5 6.703 6.5 8.4C6.5 15.867 3.5 18 3.5 18H21.5C21.5 18 18.5 15.867 18.5 8.4Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default TransparentBellIcon;
