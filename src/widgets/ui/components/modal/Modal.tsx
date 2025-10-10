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
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className={`
          relative w-full ${sizeClass} max-h-[90vh] overflow-hidden
          bg-white dark:bg-dark-bg
          border border-border dark:border-dark-border
          rounded-xl shadow-2xl
          transform transition-all duration-300 ease-out
          animate-in fade-in-0 zoom-in-95
          ${options.className || ''}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(options.title || options.showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-border">
            {options.title && (
              <h2 className="text-xl font-bold text-text dark:text-dark-text">
                {options.title}
              </h2>
            )}
            {options.showCloseButton && (
              <button
                onClick={onClose}
                className="
                  p-2 rounded-lg
                  text-secondary dark:text-dark-secondary
                  hover:text-text dark:hover:text-dark-text
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary
                "
                aria-label={t('common:modal.close')}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {content}
        </div>
      </div>
    </div>
  );
};
