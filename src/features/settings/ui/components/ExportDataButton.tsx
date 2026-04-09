import { cn } from '@/shared/lib/core';
import { Button } from '@/shared/ui';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useExportDataAction } from '../../model/useExportDataAction';

export const ExportDataButton: FC = () => {
  const { t } = useTranslation();
  const { isLoading, handleExport } = useExportDataAction();

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
