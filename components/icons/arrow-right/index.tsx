import { IIconsProps } from '../icons.interface';

const ArrowRight: React.FC<IIconsProps> = ({ className = 'w-6 h-6 text-moonlight-600' }) => {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.50098 12.3713H19.501"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.501 5.37134L19.501 12.3713L12.501 19.3713"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowRight;
