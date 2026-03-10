import { cn } from '@/shared/lib/core';
import { ChevronDown } from 'lucide-react';
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (disabled) return;

    const newState = !isOpen;

    if (controlledIsOpen === undefined) {
      setInternalIsOpen(newState);
    }
    onOpenChange?.(newState);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      handleClose();
    }
  };

  const handleClose = useCallback(() => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(false);
    }
    onOpenChange?.(false);
  }, [controlledIsOpen, onOpenChange]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (!rootRef.current || !target) {
        return;
      }

      if (!rootRef.current.contains(target)) {
        handleClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', onClickOutside as never);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onClickOutside as never);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [handleClose]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 mb-1 -translate-x-1/2';
      case 'bottom':
        return 'top-full left-1/2 mt-1 -translate-x-1/2';
      case 'left':
        return 'right-full top-1/2 mr-1 -translate-y-1/2';
      case 'right':
        return 'left-full top-1/2 ml-1 -translate-y-1/2';
      default:
        return 'top-full left-1/2 mt-1 -translate-x-1/2';
    }
  };

  const renderTrigger = () => {
    if (showArrow && isValidElement(trigger)) {
      return cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        isOpen,
      });
    }
    return trigger;
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role='button'
        tabIndex={disabled ? -1 : 0}
        aria-haspopup='menu'
        aria-expanded={isOpen}
        className={cn(
          'focus-visible:ring-ring rounded-md outline-none focus-visible:ring-2',
          'cursor-pointer',
          disabled ? 'cursor-not-allowed opacity-60' : ''
        )}
      >
        {renderTrigger()}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 rounded-lg shadow-lg backdrop-blur-sm',
            'border-border bg-surface/95 border',
            getPositionClasses(),
            contentClassName
          )}
        >
          {children}
        </div>
      )}
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
              'text-muted-foreground',
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
