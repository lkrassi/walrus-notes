import { useImportLayoutMutation } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useImportDataAction = () => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useNotifications();
  const [importLayout, { isLoading }] = useImportLayoutMutation();

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return false;

      try {
        const content = await file.text();
        const parsed = JSON.parse(content);
        const info = parsed?.info ?? parsed?.data ?? parsed;

        if (!info) {
          throw new Error('invalid_file');
        }

        await importLayout({ info }).unwrap();
        showSuccess(t('settings:backup.import.success'));
        return true;
      } catch {
        showError(t('settings:backup.import.error'));
        return false;
      }
    },
    [importLayout, showSuccess, t, showError]
  );

  return {
    isLoading,
    handleFile,
  };
};
