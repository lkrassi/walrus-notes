import { DoorOpen } from 'lucide-react';
import { Button } from 'shared';
import { cn } from 'shared/lib/cn';
import { useLocalization } from 'widgets';
import { useModalContentContext } from 'widgets/ui';

export const ConfirmationLeaveForm: React.FC<{ onConfirm?: () => void }> = ({
  onConfirm,
}) => {
  const { t } = useLocalization();
  const { closeModal } = useModalContentContext();

  return (
    <div className={cn('p-6')}>
      <div
        className={cn(
          'mx-auto',
          'mb-4',
          'flex',
          'h-12',
          'w-12',
          'items-center',
          'justify-center',
          'rounded-full',
          'bg-red-100',
          'dark:bg-red-900/20'
        )}
      >
        <DoorOpen
          className={cn('h-6', 'w-6', 'text-red-600', 'dark:text-red-400')}
        />
      </div>

      <p className={cn('text-secondary', 'mb-6', 'text-center')}>
        {t('notes:unsavedConfirmDescription')}
      </p>
      <div className={cn('flex', 'justify-center', 'gap-3')}>
        <Button onClick={closeModal} className={cn('px-6', 'py-3')}>
          {t('notes:unsavedCancelButton')}
        </Button>
        <Button
          onClick={() => {
            try {
              onConfirm?.();
              closeModal();
            } catch (_e) {}
          }}
          className={cn('px-6', 'py-3')}
          variant='escape'
        >
          {t('notes:unsavedConfirmButton')}
        </Button>
      </div>
    </div>
  );
};
