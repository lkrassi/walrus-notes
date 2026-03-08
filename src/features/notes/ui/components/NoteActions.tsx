import { useShareModal } from '@/features/share';
import { Button } from '@/shared';
import { cn } from '@/shared/lib/core';
import {
  CircleQuestionMark,
  Download,
  Edit3,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Save,
  Share2,
  Upload,
  X,
} from 'lucide-react';
import { memo, type FC, type MouseEvent } from 'react';

interface NoteActionsProps {
  noteId?: string;
  isEditing: boolean;
  isLoading: boolean;
  isFullscreen?: boolean;
  hasLocalChanges?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onOpenImageUpload: (e: MouseEvent<HTMLElement>) => void;
  onOpenImport: (e: MouseEvent<HTMLElement>) => void;
  onOpenHelp: (e: MouseEvent<HTMLElement>) => void;
  onOpenCancelConfirmation: (e: MouseEvent<HTMLElement>) => void;
  onExport?: () => void;
  onToggleFullscreen?: () => void;
  t: (key: string) => string;
}

export const NoteActions: FC<NoteActionsProps> = memo(function NoteActions({
  noteId,
  isEditing,
  isLoading,
  isFullscreen,
  hasLocalChanges,
  onSave,
  onCancel,
  onEdit,
  onOpenImageUpload,
  onOpenImport,
  onOpenHelp,
  onOpenCancelConfirmation,
  onExport,
  onToggleFullscreen,
  t,
}) {
  const { openShareLinkModal } = useShareModal();
  return (
    <div
      className={cn(
        'flex',
        'items-center',
        'gap-2',
        'gap-y-4',
        'flex-wrap',
        'justify-center',
        'sm:justify-end',
        'sm:flex-nowrap'
      )}
    >
      {isEditing ? (
        <>
          <Button
            onClick={onSave}
            className={cn('flex', 'h-8', 'items-center', 'justify-center')}
            disabled={isLoading}
            title={t('notes:save')}
            variant='submit'
          >
            <Save className={cn('h-4', 'w-4')} />
          </Button>

          <Button
            onClick={e => {
              if (!hasLocalChanges) {
                onCancel();
                return;
              }
              onOpenCancelConfirmation(e as MouseEvent<HTMLElement>);
            }}
            className={cn('flex', 'h-8', 'items-center', 'justify-center')}
            disabled={isLoading}
            title={t('notes:cancel')}
            variant='escape'
          >
            <X className={cn('h-4', 'w-4')} />
          </Button>

          <Button
            onClick={onOpenImageUpload}
            className={cn('flex', 'h-8', 'items-center', 'justify-center')}
            disabled={isLoading}
            title={t('notes:uploadImage') || 'Upload image'}
            variant='default'
          >
            <ImageIcon className={cn('h-4', 'w-4')} />
          </Button>
        </>
      ) : (
        <Button
          onClick={onEdit}
          className={cn('flex', 'h-8', 'items-center', 'justify-center')}
          title={t('notes:edit')}
          variant='default'
        >
          <Edit3 className={cn('h-4', 'w-4')} />
        </Button>
      )}

      {onExport && (
        <Button
          onClick={onExport}
          className={cn('flex', 'h-8', 'items-center', 'justify-center')}
          title={t('notes:export')}
          variant='default'
        >
          <Download className={cn('h-4', 'w-4')} />
        </Button>
      )}

      {noteId && !isEditing && (
        <Button
          onClick={e => openShareLinkModal(noteId, 'NOTE')(e)}
          className={cn('flex', 'h-8', 'items-center', 'justify-center')}
          title={t('share:button.tooltip') || 'Share'}
          variant='default'
        >
          <Share2 className={cn('h-4', 'w-4')} />
        </Button>
      )}

      {isEditing && (
        <Button
          onClick={onOpenImport}
          className={cn('flex', 'h-8', 'items-center', 'justify-center')}
          title={t('notes:import')}
          variant='default'
        >
          <Upload className={cn('h-4', 'w-4')} />
        </Button>
      )}

      <Button
        onClick={onOpenHelp}
        className={cn(
          'flex',
          'h-8',
          'items-center',
          'justify-center',
          'py-2',
          'hidden',
          'sm:inline-flex'
        )}
        title={t('notes:editorHelp')}
        variant='default'
      >
        <CircleQuestionMark className={cn('h-4', 'w-4')} />
      </Button>

      {onToggleFullscreen && (
        <Button
          onClick={onToggleFullscreen}
          className={cn('flex', 'h-8', 'items-center', 'justify-center')}
          title={
            isFullscreen ? t('notes:exitFullscreen') : t('notes:fullscreen')
          }
          variant='default'
        >
          {isFullscreen ? (
            <Minimize2 className={cn('h-4', 'w-4')} />
          ) : (
            <Maximize2 className={cn('h-4', 'w-4')} />
          )}
        </Button>
      )}
    </div>
  );
});
