import { cn } from '@/shared/lib/core';
import { useId, type FC, type ReactNode } from 'react';

interface TooltipProps {
  title: string;
  children: ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
}

const placementClasses: Record<
  NonNullable<TooltipProps['placement']>,
  string
> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
};

export const Tooltip: FC<TooltipProps> = ({
  title,
  children,
  placement = 'top',
  disabled = false,
}) => {
  const tooltipId = useId();

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <span className='group relative inline-flex' aria-describedby={tooltipId}>
      {children}
      <span
        id={tooltipId}
        role='tooltip'
        className={cn(
          'pointer-events-none absolute z-200 rounded-md px-2 py-1 text-xs whitespace-nowrap',
          'bg-text text-bg opacity-0 shadow-md transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100',
          'dark:bg-dark-text dark:text-dark-bg',
          placementClasses[placement]
        )}
      >
        {title}
      </span>
    </span>
  );
};
