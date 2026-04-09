import { cn } from '@/shared/lib/core';
import { CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import { memo, useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';

type DraftSyncBadgeProps = {
  isEditing: boolean;
  canWrite: boolean;
  hasLocalChanges?: boolean;
  hasServerDraft?: boolean;
  isSaving?: boolean;
  isPending?: boolean;
  isSynced?: boolean;
  lastSavedAt?: string | null;
};

export const DraftSyncBadge: FC<DraftSyncBadgeProps> = memo(
  function DraftSyncBadge({
    isEditing,
    canWrite,
    hasLocalChanges,
    hasServerDraft,
    isSaving,
    isPending,
    isSynced,
    lastSavedAt,
  }) {
    const { t, i18n } = useTranslation();

    const status = useMemo(() => {
      if (!canWrite || !isEditing) {
        return null;
      }

      if (isSaving || isPending) {
        return 'saving' as const;
      }

      // If data is already synced or persisted as server draft, user-visible
      // status should be "saved" (data won't be lost).
      if (isSynced || hasServerDraft || lastSavedAt) {
        return 'saved' as const;
      }

      if (hasLocalChanges) {
        return 'unsaved' as const;
      }

      return null;
    }, [
      canWrite,
      isEditing,
      isSaving,
      isPending,
      hasLocalChanges,
      hasServerDraft,
      isSynced,
      lastSavedAt,
    ]);

    if (!status) {
      return null;
    }

    const savedTimeLabel =
      status === 'saved' && lastSavedAt
        ? new Intl.DateTimeFormat(i18n.language, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(new Date(lastSavedAt))
        : null;

    if (status === 'saving') {
      return (
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
            'bg-amber-100 text-amber-900',
            'dark:bg-amber-500/20 dark:text-amber-200'
          )}
        >
          <Loader2 className='h-3.5 w-3.5 animate-spin' />
          <span>{t('notes:draftStatusSaving')}</span>
        </div>
      );
    }

    if (status === 'unsaved') {
      return (
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
            'bg-red-100 text-red-900',
            'dark:bg-red-500/20 dark:text-red-200'
          )}
        >
          <Clock3 className='h-3.5 w-3.5' />
          <span>{t('notes:draftStatusUnsaved')}</span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
          'bg-emerald-100 text-emerald-900',
          'dark:bg-emerald-500/20 dark:text-emerald-200'
        )}
      >
        <CheckCircle2 className='h-3.5 w-3.5' />
        <span>
          {savedTimeLabel
            ? t('notes:draftStatusSavedAt', { time: savedTimeLabel })
            : t('notes:draftStatusSaved')}
        </span>
      </div>
    );
  }
);
