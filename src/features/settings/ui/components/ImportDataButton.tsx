import { cn } from '@/shared/lib/core';
import {
  MODAL_SIZE_PRESETS,
  useModalActions,
  useModalContentContext,
} from '@/shared/lib/react';
import { Button } from '@/shared/ui';
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FC,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useImportDataAction } from '../../model/useImportDataAction';

export const ImportDataButton: FC = () => {
  const { t } = useTranslation();
  const { isLoading, handleFile } = useImportDataAction();

  const DropZone: FC = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const { closeModal } = useModalContentContext();

    const handleDropZoneFile = async (file: File | undefined) => {
      const isSuccess = await handleFile(file);
      if (isSuccess) {
        closeModal();
      }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDropZoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInputRef.current?.click();
      }
    };

    const handleDropInModal = async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      await handleDropZoneFile(e.dataTransfer.files?.[0]);
    };

    const handleFileChangeInModal = async (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      await handleDropZoneFile(event.target.files?.[0]);
      event.target.value = '';
    };

    return (
      <div className='space-y-4 p-4'>
        <div
          className={cn(
            'focus-ring cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200',
            isDragOver
              ? cn(
                  'border-primary',
                  'bg-primary/5',
                  'dark:border-primary-dark',
                  'dark:bg-primary-dark/5'
                )
              : 'hover:border-primary hover:bg-primary/3 dark:hover:border-primary-dark dark:hover:bg-primary-dark/3 border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
          )}
          onDrop={handleDropInModal}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleDropZoneKeyDown}
          role='button'
          tabIndex={0}
        >
          <input
            ref={fileInputRef}
            type='file'
            accept='application/json'
            onChange={handleFileChangeInModal}
            className='hidden'
            disabled={isLoading}
          />
          <div className='text-sm text-gray-600 dark:text-gray-400'>
            {isLoading
              ? t('settings:backup.import.loading')
              : t('settings:backup.import.dropOrClick') ||
                'Drop a JSON file here or click to select'}
          </div>
        </div>

        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950'>
          <p className='text-center text-sm text-yellow-800 dark:text-yellow-200'>
            {t('settings:backup.import.warningText')}
          </p>
        </div>
      </div>
    );
  };

  const openModal = useModalActions().openModalFromTrigger(<DropZone />, {
    title: t('settings:backup.import.modalTitle'),
    size: MODAL_SIZE_PRESETS.dataImport,
    closeOnOverlayClick: true,
    showCloseButton: true,
  });

  return (
    <Button
      onClick={openModal}
      disabled={isLoading}
      className='flex-center h-10 w-30 px-7 py-2'
      title={t('settings:backup.import.helper')}
    >
      {isLoading
        ? t('settings:backup.import.loading')
        : t('settings:backup.import.button')}
    </Button>
  );
};
