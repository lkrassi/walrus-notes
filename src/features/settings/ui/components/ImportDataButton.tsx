import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react';
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
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

  const DropZone: FC = () => (
    <div className={cn('p-4', 'space-y-4')}>
      <div
        className={cn(
          'border-2',
          'border-dashed',
          'rounded-lg',
          'p-8',
          'text-center',
          'cursor-pointer',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
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
        onKeyDown={handleDropZoneKeyDown}
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
    size: MODAL_SIZE_PRESETS.dataImport,
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
