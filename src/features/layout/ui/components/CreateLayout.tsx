import { memo, useCallback } from 'react';
import { Button } from 'shared';
import { useLocalization } from 'widgets';
import { useModalContext } from 'widgets/ui';
import { CreateLayoutForm } from './CreateLayoutForm';

export const CreateLayout = memo(() => {
  const { t } = useLocalization();
  const { openModal } = useModalContext();

  const handleCreateLayout = useCallback(() => {
    openModal(<CreateLayoutForm />, {
      title: t('layout:createNewLayout'),
      size: 'md',
    });
  }, [openModal, t]);

  return (
    <div className='space-y-4'>
      <Button
        onClick={handleCreateLayout}
        variant='default'
        className='px-8 py-3'
      >
        {t('common:createLayout')}
      </Button>
    </div>
  );
});
