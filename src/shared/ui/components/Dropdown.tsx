import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect, type ReactNode } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
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
}: DropdownProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (disabled) return;

    const newState = !isOpen;
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(newState);
    }
    onOpenChange?.(newState);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const triggerClassName = `cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`;
  const contentClassNameFull = `absolute z-50 rounded-lg border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm ${positionClasses[position]} ${contentClassName || ''}`;

  return (
    <div ref={dropdownRef} className={`relative ${className || ''}`}>
      <div onClick={handleToggle} className={triggerClassName}>
        {trigger}
      </div>

      {isOpen && (
        <div className={contentClassNameFull}>
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

export const DropdownTrigger = ({ children, isOpen, className, showArrow = true }: DropdownTriggerProps) => {
  return (
    <div className={`flex w-full items-center justify-between ${className || ''}`}>
      {children}
      {showArrow && (
        <div className='flex items-center'>
          {isOpen ? (
            <ChevronDown className='h-3 w-3 text-gray-500' />
          ) : (
            <ChevronRight className='h-3 w-3 text-gray-500' />
          )}
        </div>
      )}
    </div>
  );
};

interface DropdownContentProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
}

export const DropdownContent = ({ children, className, maxHeight = 'max-h-48' }: DropdownContentProps) => {
  return (
    <div className={`overflow-y-auto border-t border-gray-100 ${maxHeight} ${className || ''}`}>
      {children}
    </div>
  );
};

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const DropdownItem = ({ children, onClick, className, disabled = false }: DropdownItemProps) => {
  const itemClassName = `cursor-pointer p-2 transition-colors hover:bg-gray-50 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className || ''}`;

  return (
    <div onClick={disabled ? undefined : onClick} className={itemClassName}>
      {children}
    </div>
  );
};
