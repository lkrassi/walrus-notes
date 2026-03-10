import {
  MODAL_PANEL_BASE_CLASS,
  MODAL_SIZE_MAP,
  ModalContentContext,
  type ModalState,
} from '@/shared/lib/react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, type FC, type MouseEvent as ReactMouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  modalState: ModalState;
  onClose: () => void;
}

export const Modal: FC<ModalProps> = ({ modalState, onClose }) => {
  const { t } = useTranslation();
  const { isOpen, content, options } = modalState;

  useEffect(() => {
    if (!isOpen || !content) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && options.closeOnEscape !== false) {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [content, isOpen, onClose, options.closeOnEscape]);

  const handleClose = () => {
    if (!options.closeOnOverlayClick) {
      return;
    }
    onClose();
  };

  const handleContainerClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  if (!content) {
    return null;
  }

  const maxWidth = MODAL_SIZE_MAP[options.size || 'md'];
  const viewportCenterX =
    typeof window === 'undefined' ? 0 : window.innerWidth / 2;
  const viewportCenterY =
    typeof window === 'undefined' ? 0 : window.innerHeight / 2;

  const animationOffset = options.triggerPosition
    ? {
        x: options.triggerPosition.x - viewportCenterX,
        y: options.triggerPosition.y - viewportCenterY,
      }
    : {
        x: 0,
        y: 0,
      };

  const panelInitial = options.triggerPosition
    ? {
        scale: 0.2,
        x: animationOffset.x,
        y: animationOffset.y,
        opacity: 0,
      }
    : {
        scale: 0.95,
        x: 0,
        y: 0,
        opacity: 0,
      };

  const panelExit = options.triggerPosition
    ? {
        scale: 0.2,
        x: animationOffset.x,
        y: animationOffset.y,
        opacity: 0,
      }
    : {
        scale: 0.95,
        x: 0,
        y: 0,
        opacity: 0,
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          as='div'
          open={isOpen}
          className='relative z-200'
          onClose={() => {}}
        >
          <motion.div
            key='modal-overlay'
            className='bg-foreground/20 fixed inset-0 backdrop-blur-sm'
            onClick={handleClose}
            aria-hidden='true'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />

          <div
            className='fixed inset-0 flex items-center justify-center p-4'
            onClick={handleContainerClick}
          >
            <motion.div
              className={`w-full ${maxWidth}`}
              initial={panelInitial}
              animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              exit={panelExit}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              <DialogPanel
                className={`${MODAL_PANEL_BASE_CLASS} ${options.className || ''}`}
              >
                {(options.title || options.showCloseButton) && (
                  <div className='flex items-center justify-between px-6 py-4'>
                    {options.title && (
                      <DialogTitle className='text-lg font-semibold'>
                        {options.title}
                      </DialogTitle>
                    )}
                    {options.showCloseButton && (
                      <button
                        aria-label={t('common:modal.close')}
                        onClick={onClose}
                        className='text-foreground hover:bg-surface-3 ml-auto rounded-md p-1 transition-colors'
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                )}

                {(options.title || options.showCloseButton) && (
                  <div className='bg-border h-px w-full' />
                )}

                <div className='flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-6'>
                  <ModalContentContext.Provider value={{ closeModal: onClose }}>
                    {content}
                  </ModalContentContext.Provider>
                </div>
              </DialogPanel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
