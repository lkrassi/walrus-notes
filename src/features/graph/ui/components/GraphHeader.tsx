import { UpdateLayoutForm } from '@/features/layout';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react';
import { Maximize2, Minimize2, Network } from 'lucide-react';
import { memo, useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';

interface GraphHeaderProps {
  layoutId?: string;
  layoutTitle?: string;
  layoutColor?: string;
  isAllNotes?: boolean;
  isMain?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onLayoutUpdated?: (
    layoutId: string,
    data?: { title?: string; color?: string }
  ) => void;
}

export const GraphHeader: FC<GraphHeaderProps> = memo(function GraphHeader({
  layoutId,
  layoutTitle,
  layoutColor,
  isAllNotes = false,
  isMain = false,
  isFullscreen = false,
  onToggleFullscreen,
  onLayoutUpdated,
}) {
  const { t } = useTranslation();
  const { openModalFromTrigger } = useModalActions();

  const displayTitle =
    layoutTitle ||
    (isMain ? t('graph:commonGraphTitle') || 'Общий граф' : 'Граф папки');

  const handleOpenEditLayout = useCallback(
    openModalFromTrigger(
      <UpdateLayoutForm
        layoutId={layoutId || ''}
        layoutTitle={layoutTitle}
        layoutColor={layoutColor}
        onLayoutUpdated={onLayoutUpdated}
      />,
      {
        title: t('layout:updateLayoutData') || 'Редактировать папку',
        size: MODAL_SIZE_PRESETS.layoutUpdate,
        showCloseButton: true,
      }
    ),
    [
      layoutId,
      layoutTitle,
      layoutColor,
      openModalFromTrigger,
      onLayoutUpdated,
      t,
    ]
  );

  return (
    <div
      className={cn(
        'flex',
        'min-h-12',
        'items-center',
        'justify-between',
        'gap-2',
        'border-b',
        'border-border',
        'bg-bg/90',
        'px-3',
        'py-1.5',
        'backdrop-blur-sm'
      )}
    >
      <div className={cn('min-w-0', 'flex-1')}>
        <div className={cn('flex', 'items-center', 'gap-2.5', 'min-w-0')}>
          <div
            className={cn(
              'inline-flex',
              'h-6',
              'w-6',
              'items-center',
              'justify-center',
              'rounded-md',
              'bg-primary/12',
              'text-primary',
              'shrink-0'
            )}
          >
            <Network className='h-4 w-4' />
          </div>
          <button
            onClick={handleOpenEditLayout}
            disabled={isMain || isAllNotes || !layoutId}
            className={cn(
              'flex',
              'items-center',
              'text-text',
              'dark:text-dark-text',
              'truncate',
              'text-base',
              'font-semibold',
              'leading-tight',
              'text-left',
              'transition-colors',
              'hover:text-primary',
              'dark:hover:text-dark-primary',
              isMain || isAllNotes || !layoutId
                ? 'cursor-default'
                : 'cursor-pointer',
              'bg-transparent',
              'border-none',
              'padding-0',
              'm-0',
              'min-w-0',
              'max-w-full'
            )}
            title={displayTitle}
          >
            {displayTitle}
          </button>
        </div>
      </div>

      {onToggleFullscreen && (
        <button
          type='button'
          onClick={onToggleFullscreen}
          title={
            isFullscreen
              ? t('common:exitFullscreen')
              : t('common:enterFullscreen')
          }
          aria-label={
            isFullscreen
              ? t('common:exitFullscreen')
              : t('common:enterFullscreen')
          }
          className={cn(
            'inline-flex',
            'h-8',
            'w-8',
            'items-center',
            'justify-center',
            'rounded-md',
            'border',
            'border-border',
            'bg-bg',
            'text-text',
            'hover:bg-secondary/15',
            'hover:text-text',
            'focus-visible:ring-ring',
            'focus-visible:ring-2',
            'focus-visible:outline-none',
            'dark:border-dark-border/70',
            'dark:bg-dark-bg/95',
            'dark:text-dark-secondary',
            'dark:hover:bg-dark-secondary/20',
            'dark:hover:text-dark-text',
            'shrink-0',
            'disabled:cursor-not-allowed',
            'disabled:opacity-50'
          )}
        >
          {isFullscreen ? (
            <Minimize2 className='h-4 w-4' />
          ) : (
            <Maximize2 className='h-4 w-4' />
          )}
        </button>
      )}
    </div>
  );
});
