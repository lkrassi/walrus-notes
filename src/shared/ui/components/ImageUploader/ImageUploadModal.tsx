import { useCallback, useRef, useState } from 'react';
import { cn } from 'shared/lib/cn';
import { Button } from 'shared/ui/components/Button';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';

type UploadFn = (file: File) => Promise<string>;

type Props = {
  uploadFn: UploadFn;
  onUploaded?: (url: string) => void;
  accept?: string;
  maxSizeBytes?: number;
};

export const ImageUploadModal: React.FC<Props> = ({
  uploadFn,
  onUploaded,
  accept = 'image/*',
  maxSizeBytes = 5 * 1024 * 1024,
}) => {
  const { closeModal } = useModalContentContext();
  const { t } = useLocalization();
  const { showError, showSuccess } = useNotifications();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const onSelectFile = useCallback(
    (f?: File | null) => {
      if (!f) return;
      if (!f.type.startsWith('image/')) {
        showError(t('profile:pleaseSelectImage') || 'Please select an image');
        return;
      }
      if (f.size > maxSizeBytes) {
        showError(t('profile:fileTooLarge') || 'File too large');
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    },
    [maxSizeBytes, showError, t]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onSelectFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onSelectFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFn(file);
      showSuccess(t('notes:addedSuccess'));
      onUploaded?.(url);
      closeModal();
    } catch (_e) {
      showError(t('profile:uploadError') || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

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
        onClick={() => fileInputRef.current?.click()}
        role='button'
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept={accept}
          onChange={handleInputChange}
          className={cn('hidden')}
          autoFocus
        />

        {!preview ? (
          <div className={cn('text-sm', 'text-gray-600', 'dark:text-gray-400')}>
            {t('profile:dropOrClick') ||
              'Drop an image here or click to select'}
          </div>
        ) : (
          <div className={cn('flex', 'justify-center')}>
            <img
              src={preview}
              alt='preview'
              className={cn('h-40', 'object-contain')}
            />
          </div>
        )}
      </div>

      <div className={cn('flex', 'gap-3', 'justify-center')}>
        <Button
          onClick={() => closeModal()}
          variant='escape'
          className={cn('btn')}
        >
          {t('profile:cancel') || 'Cancel'}
        </Button>
        <Button
          onClick={handleUpload}
          variant={file ? 'submit' : 'disabled'}
          className={cn('btn')}
          disabled={!file || isUploading}
        >
          {isUploading
            ? t('profile:uploading') || 'Uploading...'
            : t('profile:upload') || 'Upload'}
        </Button>
      </div>
    </div>
  );
};
