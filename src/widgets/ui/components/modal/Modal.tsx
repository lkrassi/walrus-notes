import React, { useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Zoom from '@mui/material/Zoom';
import type { TransitionProps } from '@mui/material/transitions';
import { X } from 'lucide-react';
import { useLocalization } from 'widgets/hooks';
import type { ModalState } from 'widgets/hooks/useModal';
import { ModalContentContext } from './ModalContentContext';

interface ModalProps {
  modalState: ModalState;
  onClose: () => void;
}

const SIZE_MAP = {
  sm: 'sm' as const,
  md: 'sm' as const,
  lg: 'md' as const,
  xl: 'lg' as const,
  full: 'xl' as const,
};

const CustomTransition = React.forwardRef<
  unknown,
  TransitionProps & {
    children: React.ReactElement;
    triggerPosition?: { x: number; y: number; width: number; height: number };
  }
>(function CustomTransition(props, ref) {
  const { triggerPosition, children, ...other } = props;

  if (!triggerPosition) {
    return (
      <Zoom ref={ref} {...other} timeout={400}>
        {children}
      </Zoom>
    );
  }

  const triggerCenterX = triggerPosition.x + triggerPosition.width / 2;
  const triggerCenterY = triggerPosition.y + triggerPosition.height / 2;

  return (
    <Zoom
      ref={ref}
      {...other}
      timeout={300}
      style={{
        transformOrigin: `${triggerCenterX}px ${triggerCenterY}px`,
      }}
    >
      {children}
    </Zoom>
  );
});

CustomTransition.displayName = 'CustomTransition';

export const Modal: React.FC<ModalProps> = ({ modalState, onClose }) => {
  const { t } = useLocalization();
  const { isOpen, content, options } = modalState;

  const handleClose = (_event: object, reason?: string) => {
    if (reason === 'backdropClick' && !options.closeOnOverlayClick) {
      return;
    }
    onClose();
  };

  if (!content) {
    return null;
  }

  const maxWidth = SIZE_MAP[options.size || 'md'];

  const TransitionComponent = useMemo(() => {
    const Component = React.forwardRef<
      unknown,
      TransitionProps & { children: React.ReactElement }
    >((props, ref) => (
      <CustomTransition
        {...props}
        ref={ref}
        triggerPosition={options.triggerPosition}
      />
    ));
    Component.displayName = 'MemoizedTransition';
    return Component;
  }, [options.triggerPosition]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      disableEscapeKeyDown={!options.closeOnEscape}
      slots={{
        transition: TransitionComponent,
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            maxHeight: '90vh',
          },
          className: options.className,
        },
      }}
    >
      {(options.title || options.showCloseButton) && (
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: options.showCloseButton ? 1 : 3,
          }}
        >
          {options.title && <span>{options.title}</span>}
          {options.showCloseButton && (
            <IconButton
              aria-label={t('common:modal.close')}
              onClick={onClose}
              size='small'
              sx={{ ml: 'auto' }}
            >
              <X size={20} />
            </IconButton>
          )}
        </DialogTitle>
      )}

      {(options.title || options.showCloseButton) && <Divider />}

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'auto',
          padding: '24px',
          '@media (max-width: 600px)': {
            padding: options.mobileContentPadding || '0',
          },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
          },
        }}
      >
        <ModalContentContext.Provider value={{ closeModal: onClose }}>
          {content}
        </ModalContentContext.Provider>
      </DialogContent>
    </Dialog>
  );
};
