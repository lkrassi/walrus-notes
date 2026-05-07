import { UpdateLayoutForm } from '@/features/layout';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react';
import { IconButton } from '@/shared/ui';
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
    <div className='panel-header-surface'>
      <div className='min-w-0 flex-1'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <div className='flex-center bg-primary/12 text-primary h-6 w-6 shrink-0 rounded-md'>
            <Network className='h-4 w-4' />
          </div>
          <button
            onClick={handleOpenEditLayout}
            disabled={isMain || isAllNotes || !layoutId}
            className={cn(
              'ghost-link-btn',
              'flex',
              'items-center',
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
        <IconButton
          size='md'
          variant='outline'
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
          icon={
            isFullscreen ? (
              <Minimize2 className='h-4 w-4' />
            ) : (
              <Maximize2 className='h-4 w-4' />
            )
          }
          className='btn-icon-tone-default shrink-0'
        />
      )}
    </div>
  );
});
