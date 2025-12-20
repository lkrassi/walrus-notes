import React from 'react';

const FolderIcon: React.FC<{
  fillColor?: string;
  strokeColor?: string;
  className?: string;
}> = ({ fillColor, strokeColor, className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill={fillColor || 'none'}
    stroke={strokeColor || 'currentColor'}
    className={className}
  >
    <path d='M3 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z' />
  </svg>
);

export default FolderIcon;
