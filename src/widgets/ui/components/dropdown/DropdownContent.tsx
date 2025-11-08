import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import cn from '../../../../shared/lib/cn';

export type DropdownContentState = 'loading' | 'content' | 'empty' | 'error';

interface DropdownContentProps {
  isOpen: boolean;
  state: DropdownContentState;
  children: React.ReactNode;
  emptyContent?: React.ReactNode;
  errorContent?: React.ReactNode;
  className?: string;
  animationDuration?: number;
  maxHeight?: string;
}

export const DropdownContent: React.FC<DropdownContentProps> = ({
  isOpen,
  state,
  children,
  emptyContent,
  errorContent,
  className = '',
  animationDuration = 0.2,
  maxHeight = 'max-h-full',
}) => {
  const renderContent = () => {
    switch (state) {
      case 'empty':
        return (
          emptyContent || (
            <div className={cn('text-sm', 'text-gray-500')}>Пусто</div>
          )
        );
      case 'error':
        return (
          errorContent || (
            <div className={cn('text-sm', 'text-red-500')}>Ошибка</div>
          )
        );
      case 'content':
        return (
          <div className={cn('overflow-y-auto', maxHeight)}>{children}</div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <motion.div
          key={state}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: animationDuration, ease: 'easeOut' }}
          className={cn(className, 'w-full')}
        >
          {renderContent()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
