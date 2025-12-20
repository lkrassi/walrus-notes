import React, { useCallback, useRef, useState } from 'react';
import cn from 'shared/lib/cn';
import { Button } from 'shared';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';

type Props = {
  onImported: (content: string) => void;
  accept?: string;
  maxSizeBytes?: number;
};

export const MdImportModal: React.FC<Props> = ({
  onImported,
  accept = '.md,text/markdown',
  maxSizeBytes = 5 * 1024 * 1024,
}) => {
  const { closeModal } = useModalContentContext();
  const { t } = useLocalization();
  const { showError, showSuccess } = useNotifications();

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const readFile = useCallback(
    async (f: File) => {
      if (!f) return;
      if (!f.name.toLowerCase().endsWith('.md') && f.type !== 'text/markdown') {
        showError(t('notes:pleaseSelectMd') || 'Please select a markdown file');
        return;
      }
      if (f.size > maxSizeBytes) {
        showError(t('notes:fileTooLarge') || 'File too large');
        return;
      }

      const text = await f.text();
      onImported(text);
      showSuccess(t('notes:importSuccess') || 'Imported');
      closeModal();
    },
    [closeModal, maxSizeBytes, onImported, showError, showSuccess, t]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) readFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) readFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  return (
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
        onClick={() => fileRef.current?.click()}
        role='button'
        tabIndex={0}
      >
        <input
          ref={fileRef}
          type='file'
          accept={accept}
          onChange={handleInput}
          className={cn('hidden')}
        />

        <div className={cn('text-sm', 'text-gray-600', 'dark:text-gray-400')}>
          {t('notes:importDropOrClick') ||
            'Drop a markdown file here or click to select'}
        </div>
      </div>

      <div className={cn('flex', 'gap-3', 'justify-center')}>
        <Button
          onClick={() => closeModal()}
          variant='escape'
          className={cn('btn')}
        >
          {t('notes:cancel')}
        </Button>
      </div>
    </div>
  );
};

export default MdImportModal;
