import React, { useRef } from 'react';
import { useImportLayoutMutation } from 'app/store/api';
import { Button } from 'shared/ui';
import { useLocalization } from 'widgets/hooks';
import { useNotifications } from 'widgets/hooks/useNotifications';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';
import cn from 'shared/lib/cn';

const ImportWarning: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => {
  const { t } = useLocalization();
  const { closeModal } = useModalContentContext();

  const handleConfirm = () => {
    closeModal();
    setTimeout(() => {
      onConfirm();
    }, 80);
  };

  return (
    <div className='space-y-4 text-center'>
      <div className='space-y-2'>
        <p className='text-sm text-secondary dark:text-dark-secondary text-center'>
          {t('settings:backup.import.warningText')}
        </p>
      </div>
      <div className='flex justify-center gap-3'>
        <Button
          variant='escape'
          onClick={closeModal}
          className='px-4 py-2'
        >
          {t('settings:backup.import.cancel')}
        </Button>
        <Button
          variant='submit'
          onClick={handleConfirm}
          className='px-4 py-2'
        >
          {t('settings:backup.import.confirm')}
        </Button>
      </div>
    </div>
  );
};

export const ImportDataButton: React.FC = () => {
  const { t } = useLocalization();
  const { showError, showSuccess } = useNotifications();
  const [importLayout, { isLoading }] = useImportLayoutMutation();
  const { openModalFromTrigger } = useModalActions();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      const info = parsed?.info ?? parsed?.data ?? parsed;

      if (!info) {
        throw new Error('invalid_file');
      }

      await importLayout({ info }).unwrap();
      showSuccess(t('settings:backup.import.success'));
    } catch (error) {
      console.error(error);
      showError(t('settings:backup.import.error'));
    } finally {
      event.target.value = '';
    }
  };

  const handleButtonClick = openModalFromTrigger(
    <ImportWarning onConfirm={() => fileInputRef.current?.click()} />,
    {
      title: t('settings:backup.import.modalTitle'),
      size: 'md',
      closeOnOverlayClick: true,
      showCloseButton: true,
    }
  );

  return (
    <>
      <input
        type='file'
        accept='application/json'
        ref={fileInputRef}
        onChange={handleFileChange}
        className='hidden'
      />
      <Button
        onClick={handleButtonClick}
        disabled={isLoading}
        className={cn(
          'flex',
          'h-10',
          'w-30',
          'items-center',
          'justify-center',
          'px-7',
          'py-2'
        )}
        title={t('settings:backup.import.helper')}
      >
        {isLoading
          ? t('settings:backup.import.loading')
          : t('settings:backup.import.button')}
      </Button>
    </>
  );
};
