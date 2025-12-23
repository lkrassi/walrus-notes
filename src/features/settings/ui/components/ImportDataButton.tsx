import React, { useRef } from 'react';
import { useImportLayoutMutation } from 'app/store/api';
import { Button } from 'shared/ui';
import { useLocalization } from 'widgets/hooks';
import { useNotifications } from 'widgets/hooks/useNotifications';
import { useModalActions } from 'widgets/hooks/useModalActions';
import cn from 'shared/lib/cn';

export const ImportDataButton: React.FC = () => {
  const { t } = useLocalization();
  const { showError, showSuccess } = useNotifications();
  const [importLayout, { isLoading }] = useImportLayoutMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleFile = async (file: File | undefined) => {
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
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    await handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const DropZone: React.FC = () => (
    <div className={cn('p-4', 'space-y-4')}>
      <div
        className={cn(
          'border-2',
          'border-dashed',
          'rounded-lg',
          'p-8',
          'text-center',
          'cursor-pointer',
          'transition-all',
          'duration-200',
          isDragOver
            ? cn(
                'border-primary',
                'bg-primary/5',
                'dark:border-primary-dark',
                'dark:bg-primary-dark/5'
              )
            : cn(
                'border-gray-300',
                'dark:border-gray-600',
                'bg-gray-50',
                'dark:bg-gray-800',
                'hover:border-primary',
                'dark:hover:border-primary-dark',
                'hover:bg-primary/3',
                'dark:hover:bg-primary-dark/3'
              )
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role='button'
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept='application/json'
          onChange={handleFileChange}
          className={cn('hidden')}
          disabled={isLoading}
        />
        <div className={cn('text-sm', 'text-gray-600', 'dark:text-gray-400')}>
          {isLoading
            ? t('settings:backup.import.loading')
            : t('settings:backup.import.dropOrClick') ||
              'Drop a JSON file here or click to select'}
        </div>
      </div>

      <div
        className={cn(
          'rounded-lg',
          'border',
          'border-yellow-200',
          'dark:border-yellow-900',
          'bg-yellow-50',
          'dark:bg-yellow-950',
          'p-3'
        )}
      >
        <p
          className={cn(
            'text-sm',
            'text-yellow-800',
            'dark:text-yellow-200',
            'text-center'
          )}
        >
          {t('settings:backup.import.warningText')}
        </p>
      </div>
    </div>
  );

  const openModal = useModalActions().openModalFromTrigger(<DropZone />, {
    title: t('settings:backup.import.modalTitle'),
    size: 'md',
    closeOnOverlayClick: true,
    showCloseButton: true,
  });

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
        onClick={openModal}
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
