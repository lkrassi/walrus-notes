import React, { useEffect } from 'react';
import { useLocalization } from 'widgets/hooks';
import type { ModalState } from 'widgets/hooks/useModal';

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (options.closeOnEscape && e.key === 'Escape') {
        onClose();
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
  }, [isOpen, options.closeOnEscape, onClose]);

  if (!isOpen || !content) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (options.closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClass = SIZE_CLASSES[options.size || 'md'];

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm'
      onClick={handleOverlayClick}
    >
      <div
        className={`relative w-full ${sizeClass} dark:bg-dark-bg border-border dark:border-dark-border animate-in fade-in-0 zoom-in-95 max-h-[90vh] transform overflow-hidden rounded-xl border bg-white shadow-2xl transition-all duration-300 ease-out ${options.className || ''} `}
        onClick={e => e.stopPropagation()}
      >
        {(options.title || options.showCloseButton) && (
          <div className='border-border dark:border-dark-border flex items-center justify-between border-b p-6'>
            {options.title && (
              <h2 className='text-text dark:text-dark-text text-xl font-bold'>
                {options.title}
              </h2>
            )}
            {options.showCloseButton && (
              <button
                onClick={onClose}
                className='text-secondary dark:text-dark-secondary hover:text-text dark:hover:text-dark-text focus:ring-primary dark:focus:ring-dark-primary rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100 focus:ring-2 focus:outline-none dark:hover:bg-gray-800'
                aria-label={t('common:modal.close')}
              >
                <svg
                  className='h-5 w-5'
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

        <div className='max-h-[calc(90vh-120px)] overflow-y-auto'>
          {content}
        </div>
      </div>
    </div>
  );
};
