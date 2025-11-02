import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

export type DropdownContentState = 'loading' | 'content' | 'empty' | 'error';

interface DropdownContentProps {
  isOpen: boolean;
  state: DropdownContentState;
  children: React.ReactNode;
  loadingContent?: React.ReactNode;
  emptyContent?: React.ReactNode;
  errorContent?: React.ReactNode;
  className?: string;
  animationDuration?: number;
}

export const DropdownContent: React.FC<DropdownContentProps> = ({
  isOpen,
  state,
  children,
  loadingContent,
  emptyContent,
  errorContent,
  className = '',
  animationDuration = 0.2,
}) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          loadingContent || (
            <div className='text-sm text-gray-500'>Загрузка...</div>
          )
        );
      case 'empty':
        return (
          emptyContent || <div className='text-sm text-gray-500'>Пусто</div>
        );
      case 'error':
        return (
          errorContent || <div className='text-sm text-red-500'>Ошибка</div>
        );
      case 'content':
        return children;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={state}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: animationDuration, ease: 'easeOut' }}
        className={`overflow-hidden ${className}`}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
};
