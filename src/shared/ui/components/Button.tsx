import React from 'react';
import type { ButtonProps } from 'shared/model';

export const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  to,
}: ButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (onClick) {
      onClick(e);
    }
    if (to) {
      window.location.href = to;
    }
  };

  const getVariantClasses = () => {
    return `
      relative
      text-white
      text-base
      font-semibold
      cursor-pointer
      transition-all
      duration-200
      transform
      translate-y-0
      shadow-[0_8px_0_0_#6f46d0]

      active:shadow-[0_1px_0_0_#9d7ee4]
      active:translate-y-1.5
      disabled:bg-[#a0a0a0]
      disabled:shadow-[0_8px_0_0_#7a7a7a]
      disabled:hover:bg-[#a0a0a0]
      disabled:active:shadow-[0_8px_0_0_#7a7a7a]
      disabled:active:translate-y-0
    `;
  };

  const baseClasses = getVariantClasses();

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
