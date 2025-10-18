import React, { useRef, useState } from 'react';
import { Button } from 'shared/ui/components/Button';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useChangeProfilePictureMutation } from 'widgets/model/stores/api';
import { useModalContext } from 'widgets/ui/components/modal/ModalProvider';

export const ChangeProfilePictureForm: React.FC = () => {
  const { t } = useLocalization();
  const { closeModal } = useModalContext();
  const { showSuccess, showError } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [changeProfilePicture, { isLoading }] =
    useChangeProfilePictureMutation();
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
    } catch (error: any) {
      const message =
        error.data?.meta?.message || error.message || t('profile:uploadError');
      showError(message);
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <div className='space-y-6 p-6'>
      <div className='space-y-4'>
        <div>
          <label className='text-text dark:text-dark-text mb-2 block text-sm font-medium'>
            {t('profile:selectFile')}
          </label>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileSelect}
            className='hidden'
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className='w-full px-4 py-2'
            variant='default'
          >
            {selectedFile ? t('profile:selectedFile') : t('profile:selectFile')}
          </Button>
          {previewUrl && (
            <div className='mt-4 flex justify-center'>
              <img
                src={previewUrl}
                alt='Предпросмотр'
                className='h-24 w-24 rounded-full object-cover'
              />
            </div>
          )}
        </div>
      </div>

      <div className='flex gap-3'>
        <Button
          onClick={handleCancel}
          variant='escape'
          className='flex-1 px-4 py-2'
        >
          {t('profile:cancel')}
        </Button>
        <Button
          onClick={handleUpload}
          className='flex-1 px-4 py-2'
          variant={selectedFile ? 'submit' : 'disabled'}
        >
          {t('profile:upload')}
        </Button>
      </div>
    </div>
  );
};
