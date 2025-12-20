import { useChangeProfilePictureMutation } from 'app/store/api';
import React, { useRef, useState } from 'react';
import cn from 'shared/lib/cn';
import { Button } from 'shared/ui/components/Button';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';

export const ChangeProfilePictureForm: React.FC = () => {
  const { t } = useLocalization();
  const { closeModal } = useModalContentContext();
  const { showSuccess, showError } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [changeProfilePicture] = useChangeProfilePictureMutation();
  const userId = localStorage.getItem('userId');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Пожалуйста, выберите изображение');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError('Размер файла не должен превышать 5MB');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    try {
      await changeProfilePicture({ file: selectedFile, userId });
      setTimeout(() => {
        showSuccess(t('profile:uploadSuccess'));
        closeModal();
      }, 1000);
    } catch (_error: unknown) {
      const err = _error as Record<string, unknown>;
      let message = t('profile:uploadError');

      if (err && typeof err === 'object') {
        const data = err['data'];
        if (data && typeof data === 'object') {
          const meta = (data as Record<string, unknown>)['meta'];
          if (meta && typeof meta === 'object') {
            const m = (meta as Record<string, unknown>)['message'];
            if (typeof m === 'string') message = m;
          }
        }

        const msg = err['message'];
        if (typeof msg === 'string') message = msg;
      }

      showError(message);
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <div className={cn('space-y-6', 'p-6')}>
      <div className={cn('space-y-4')}>
        <div>
          <label className={cn('tw-label')}>{t('profile:selectFile')}</label>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileSelect}
            className={cn('hidden')}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className={cn('btn', 'w-full')}
            variant='default'
          >
            {selectedFile ? t('profile:selectedFile') : t('profile:selectFile')}
          </Button>
          {previewUrl && (
            <div className={cn('mt-4', 'flex', 'justify-center')}>
              <img
                src={previewUrl}
                alt='Предпросмотр'
                className={cn('h-24', 'w-24', 'rounded-full', 'object-cover')}
              />
            </div>
          )}
        </div>
      </div>

      <div className={cn('flex', 'gap-3')}>
        <Button onClick={handleCancel} variant='escape' className={cn('btn')}>
          {t('profile:cancel')}
        </Button>
        <Button
          onClick={handleUpload}
          className={cn('btn')}
          variant={selectedFile ? 'default' : 'disabled'}
          disabled={!selectedFile}
        >
          {t('profile:upload')}
        </Button>
      </div>
    </div>
  );
};
