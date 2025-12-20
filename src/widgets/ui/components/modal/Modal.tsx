import React, { useEffect, useRef, useState } from 'react';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';
import type { ModalState } from 'widgets/hooks/useModal';
import { ModalContentContext } from './ModalContentContext';

interface ModalProps {
  modalState: ModalState;
  onClose: () => void;
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export const Modal: React.FC<ModalProps> = ({ modalState, onClose }) => {
  const { t } = useLocalization();
  const { isOpen, content, options } = modalState;
  const [animationState, setAnimationState] = useState<
    'entering' | 'open' | 'exiting'
  >('entering');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering');
      const timer = setTimeout(() => setAnimationState('open'), 0);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (options.closeOnEscape && e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, options.closeOnEscape]);

  const handleClose = () => {
    setAnimationState('exiting');
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (options.closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getModalTransform = () => {
    if (!options.triggerPosition) {
      return animationState === 'open' ? 'scale(1)' : 'scale(0.8)';
    }

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const triggerCenterX = options.triggerPosition.x + scrollX;
    const triggerCenterY = options.triggerPosition.y + scrollY;
    const deltaX = triggerCenterX - viewportCenterX;
    const deltaY = triggerCenterY - viewportCenterY;

    switch (animationState) {
      case 'entering':
        return `translate(${deltaX}px, ${deltaY}px) scale(0.1)`;
      case 'open':
        return 'translate(0, 0) scale(1)';
      case 'exiting':
        return `translate(${deltaX}px, ${deltaY}px) scale(0.1)`;
      default:
        return 'translate(0, 0) scale(1)';
    }
  };

  const getModalOpacity = () => {
    switch (animationState) {
      case 'entering':
        return 0;
      case 'open':
        return 1;
      case 'exiting':
        return 0;
      default:
        return 1;
    }
  };

  if (!isOpen || !content) {
    return null;
  }

  const sizeClass = SIZE_CLASSES[options.size || 'md'];

  return (
    <div
      className={cn(
        'fixed',
        'inset-0',
        'overflow-hidden',
        'flex',
        'items-center',
        'justify-center',
        'bg-black/50',
        'backdrop-blur-sm',
        'transition-opacity',
        'duration-300',
        'z-120'
      )}
      style={{
        opacity: animationState === 'entering' ? 0 : 1,
      }}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative',
          'w-full',
          sizeClass,
          'dark:bg-dark-bg',
          'border-border',
          'dark:border-dark-border',
          'max-h-[90vh]',
          'overflow-hidden',
          'rounded-xl',
          'border',
          'bg-white',
          'shadow-2xl',
          'transition-all',
          'duration-300',
          'ease-out',
          'text-text',
          'dark:text-dark-text',
          'flex',
          'flex-col',
          options.className || ''
        )}
        style={{
          transform: getModalTransform(),
          opacity: getModalOpacity(),
        }}
        onClick={e => e.stopPropagation()}
      >
        {(options.title || options.showCloseButton) && (
          <div className={cn('modal-header')}>
            {options.title && (
              <h2 className={cn('modal-title')}>{options.title}</h2>
            )}
            {options.showCloseButton && (
              <button
                onClick={handleClose}
                className={cn('icon-btn', 'text-text', 'dark:text-dark-text')}
                aria-label={t('common:modal.close')}
              >
                <svg
                  className={cn('h-5', 'w-5')}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className={cn('flex-1', 'overflow-auto', 'p-4')}>
          <ModalContentContext.Provider value={{ closeModal: handleClose }}>
            {content}
          </ModalContentContext.Provider>
        </div>
      </div>
    </div>
  );
};
