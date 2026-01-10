import { ChevronDown } from 'lucide-react';
import React, { type ReactNode } from 'react';
import Popover from '@mui/material/Popover';
import cn from 'shared/lib/cn';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  showArrow?: boolean;
}

export const Dropdown = ({
  trigger,
  children,
  className,
  contentClassName,
  position = 'bottom',
  isOpen: controlledIsOpen,
  onOpenChange,
  disabled = false,
  showArrow = true,
}: DropdownProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;

    const newState = !isOpen;

    if (newState) {
      setAnchorEl(event.currentTarget);
    } else {
      setAnchorEl(null);
    }

    if (controlledIsOpen === undefined) {
      setInternalIsOpen(newState);
    }
    onOpenChange?.(newState);
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(false);
    }
    onOpenChange?.(false);
  };

  // Преобразуем position в anchorOrigin и transformOrigin для MUI
  const getAnchorOrigin = () => {
    switch (position) {
      case 'top':
        return { vertical: 'top' as const, horizontal: 'center' as const };
      case 'bottom':
        return { vertical: 'bottom' as const, horizontal: 'center' as const };
      case 'left':
        return { vertical: 'center' as const, horizontal: 'left' as const };
      case 'right':
        return { vertical: 'center' as const, horizontal: 'right' as const };
      default:
        return { vertical: 'bottom' as const, horizontal: 'center' as const };
    }
  };

  const getTransformOrigin = () => {
    switch (position) {
      case 'top':
        return { vertical: 'bottom' as const, horizontal: 'center' as const };
      case 'bottom':
        return { vertical: 'top' as const, horizontal: 'center' as const };
      case 'left':
        return { vertical: 'center' as const, horizontal: 'right' as const };
      case 'right':
        return { vertical: 'center' as const, horizontal: 'left' as const };
      default:
        return { vertical: 'top' as const, horizontal: 'center' as const };
    }
  };

  const renderTrigger = () => {
    if (showArrow && React.isValidElement(trigger)) {
      return React.cloneElement(
        trigger as React.ReactElement<Record<string, unknown>>,
        {
          isOpen,
        }
      );
    }
    return trigger;
  };

  return (
    <div className={cn('relative', className)}>
      <div
        onClick={handleToggle}
        className={cn('cursor-pointer', disabled ? 'cursor-not-allowed' : '')}
      >
        {renderTrigger()}
      </div>

      <Popover
        open={isOpen && anchorEl !== null}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={getAnchorOrigin()}
        transformOrigin={getTransformOrigin()}
        slotProps={{
          paper: {
            className: cn(
              'rounded-lg shadow-lg backdrop-blur-sm',
              contentClassName
            ),
            sx: {
              marginTop: position === 'bottom' ? '4px' : undefined,
              marginBottom: position === 'top' ? '4px' : undefined,
              marginLeft: position === 'right' ? '4px' : undefined,
              marginRight: position === 'left' ? '4px' : undefined,
              minWidth: anchorEl?.offsetWidth || 'auto',
              width: anchorEl?.offsetWidth || 'auto',
            },
          },
        }}
      >
        {children}
      </Popover>
    </div>
  );
};

interface DropdownTriggerProps {
  children: ReactNode;
  isOpen?: boolean;
  className?: string;
  showArrow?: boolean;
}

export const DropdownTrigger = ({
  children,
  isOpen,
  className,
  showArrow = true,
}: DropdownTriggerProps) => {
  return (
    <div
      className={cn(
        'flex',
        'w-full',
        'items-center',
        'justify-between',
        className || ''
      )}
    >
      {children}
      {showArrow && (
        <div
          className={cn(
            'flex',
            'items-center',
            'transition-transform',
            'duration-200'
          )}
        >
          <ChevronDown
            className={cn(
              'h-3',
              'w-3',
              'text-gray-500',
              'transition-transform',
              'duration-200',
              isOpen ? 'rotate-0' : '-rotate-90'
            )}
          />
        </div>
      )}
    </div>
  );
};
