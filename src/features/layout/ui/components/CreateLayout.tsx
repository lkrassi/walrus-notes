import { Button } from 'shared';
import { useModalContext, useLocalization } from 'widgets';
import { CreateLayoutForm } from './CreateLayoutForm';

export const CreateLayout = () => {
  const { t } = useLocalization();
  const { openModal } = useModalContext();

  const handleCreateLayout = () => {
    openModal(
      <CreateLayoutForm />,
      {
        title: t('layout:createNewLayout'),
        size: 'md',
      }
    );
  };

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
};
