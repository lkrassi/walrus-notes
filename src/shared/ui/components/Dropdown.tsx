import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState, type ReactNode } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
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

  const triggerClassName = `cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`;
  const contentClassNameFull = `absolute z-50 rounded-lg border border-gray-200 shadow-lg backdrop-blur-sm ${positionClasses[position]} ${contentClassName || ''}`;

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
    <div ref={dropdownRef} className={`relative ${className || ''}`}>
      <div onClick={handleToggle} className={triggerClassName}>
        {renderTrigger()}
      </div>

      {isOpen && <div className={contentClassNameFull}>{children}</div>}
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
      className={`flex w-full items-center justify-between ${className || ''}`}
    >
      {children}
      {showArrow && (
        <div className='flex items-center transition-transform duration-200'>
          <ChevronDown
            className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-0' : '-rotate-90'
            }`}
          />
        </div>
      )}
    </div>
  );
};
