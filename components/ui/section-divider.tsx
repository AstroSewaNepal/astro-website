import React from 'react';

type SectionDividerProps = {
  className?: string;
};

const SectionDivider: React.FC<SectionDividerProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <div className="w-full border-t border-[#79787A] opacity-70" />
    </div>
  );
};

export default SectionDivider;
