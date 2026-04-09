import { useExportLayoutMutation, useUser } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const buildFileName = () => {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `walrus_notes_${date}_${time}.json`;
};

const downloadFile = (data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const useExportDataAction = () => {
  const { t } = useTranslation();
  const { userId } = useUser();
  const { showError, showSuccess } = useNotifications();
  const [exportLayout, { isLoading }] = useExportLayoutMutation();

  const handleExport = useCallback(async () => {
    if (!userId) {
      showError(t('settings:backup.common.noUser'));
      return;
    }

    try {
      const response = await exportLayout({ userId }).unwrap();
      if (!response?.data) {
        throw new Error('no_data');
      }

      downloadFile(response.data);
      showSuccess(t('settings:backup.export.success'));
    } catch {
      showError(t('settings:backup.export.error'));
    }
  }, [userId, showError, t, exportLayout, showSuccess]);

  return {
    isLoading,
    handleExport,
  };
};
