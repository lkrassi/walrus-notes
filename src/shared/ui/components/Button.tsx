import React from 'react';
import type { ButtonProps } from 'shared/model';

export const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'default',
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
    if (variant === 'outline') {
      return `
        relative
        text-text dark:text-dark-text
        text-base
        font-semibold
        cursor-pointer
        rounded-lg
        transition-all
        duration-200
        transform
        translate-y-0
        bg-transparent
        active:translate-y-0.5
        disabled:opacity-50
        disabled:cursor-not-allowed
      `;
    }

    return `
      relative
      text-white
      text-base
      font-semibold
      cursor-pointer
      rounded-lg
      transition-all
      duration-200
      transform
      translate-y-0
      shadow-[0_8px_0_0_#3d9ec4]
      bg-[#4bbce8]
      hover:bg-[#4bc7e8]
      active:shadow-[0_1px_0_0_#3d9ec4]
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
