import React, { useCallback } from 'react';
import { useExportLayoutMutation } from 'app/store/api';
import { Button } from 'shared/ui';
import { useLocalization } from 'widgets/hooks';
import { useAppSelector } from 'widgets/hooks/redux';
import { useNotifications } from 'widgets/hooks/useNotifications';
import cn from 'shared/lib/cn';

export const ExportDataButton: React.FC = () => {
  const { t } = useLocalization();
  const { profile } = useAppSelector(state => state.user);
  const { showError, showSuccess } = useNotifications();
  const [exportLayout, { isLoading }] = useExportLayoutMutation();

  // Используем userId из Redux store
  const userId = profile?.id || '';

  const buildFileName = useCallback(() => {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    return `walrus_notes_${date}_${time}.json`;
  }, []);

  const downloadFile = useCallback(
    (data: unknown) => {
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
    },
    [buildFileName]
  );

  const handleExport = async () => {
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
  };

  return (
    <Button
      onClick={handleExport}
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
      title={t('settings:backup.export.button')}
    >
      {isLoading
        ? t('settings:backup.export.loading')
        : t('settings:backup.export.button')}
    </Button>
  );
};
