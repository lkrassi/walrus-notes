import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState, type ReactNode } from 'react';
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
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [chosenPosition, setChosenPosition] = useState<
    'top' | 'bottom' | 'left' | 'right'
  >(
    position === 'auto'
      ? 'bottom'
      : (position as 'top' | 'bottom' | 'left' | 'right')
  );

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (disabled) return;

    const newState = !isOpen;
    if (newState && position === 'auto' && triggerRef.current) {
      try {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 200 && spaceAbove > spaceBelow) {
          setChosenPosition('top');
        } else {
          setChosenPosition('bottom');
        }
      } catch (_e) {
        setChosenPosition('bottom');
      }
    } else if (position !== 'auto') {
      setChosenPosition(position as 'top' | 'bottom' | 'left' | 'right');
    }
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(newState);
    }
    onOpenChange?.(newState);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      if (controlledIsOpen === undefined) {
        setInternalIsOpen(false);
      }
      onOpenChange?.(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const positionClasses = {
    top: 'bottom-full mb-1',
    bottom: 'top-full mt-1',
    left: 'right-full mr-1',
    right: 'left-full ml-1',
  };

  const triggerClassName = cn(
    'cursor-pointer',
    disabled ? 'cursor-not-allowed' : ''
  );
  const triggerHasGroup =
    React.isValidElement(trigger) &&
    String(
      ((trigger as React.ReactElement).props as Record<string, unknown>)
        ?.className || ''
    )
      .split(/\s+/)
      .includes('group');
  const outerClassName = cn(
    'relative',
    triggerHasGroup ||
      String(className || '')
        .split(/\s+/)
        .includes('group')
      ? 'group'
      : '',
    className || ''
  );
  const contentClassNameFull = cn(
    'absolute',
    'rounded-lg',
    'shadow-lg',
    'backdrop-blur-sm',
    positionClasses[chosenPosition],
    contentClassName || ''
  );

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
    <div ref={dropdownRef} className={outerClassName}>
      <div onClick={handleToggle} ref={triggerRef} className={triggerClassName}>
        {renderTrigger()}
      </div>

      <div className={contentClassNameFull} aria-hidden={!isOpen}>
        {children}
      </div>
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
