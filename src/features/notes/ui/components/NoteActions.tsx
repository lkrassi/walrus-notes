import { cn } from '@/shared/lib/core';
import {
  CircleQuestionMark,
  Download,
  Edit3,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Save,
  Upload,
  X,
} from 'lucide-react';
import { memo, type FC, type MouseEvent, type ReactNode } from 'react';

interface NoteActionsProps {
  noteId?: string;
  isEditing: boolean;
  isLoading: boolean;
  isFullscreen?: boolean;
  hasLocalChanges?: boolean;
  hasServerDraft?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onOpenImageUpload: (e: MouseEvent<HTMLElement>) => void;
  onOpenImport: (e: MouseEvent<HTMLElement>) => void;
  onOpenHelp: (e: MouseEvent<HTMLElement>) => void;
  onOpenCancelConfirmation: (e: MouseEvent<HTMLElement>) => void;
  onExport?: () => void;
  onToggleFullscreen?: () => void;
  canWrite?: boolean;
  t: (key: string) => string;
}

interface ActionIconButtonProps {
  title: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  icon: ReactNode;
  disabled?: boolean;
  tone?: 'default' | 'success' | 'danger';
}

const ActionIconButton: FC<ActionIconButtonProps> = ({
  title,
  onClick,
  icon,
  disabled = false,
  tone = 'default',
}) => {
  const toneClass =
    tone === 'success'
      ? cn(
          'text-green-800',
          'hover:bg-green-500/15',
          'dark:text-green-300',
          'dark:hover:bg-green-400/20'
        )
      : tone === 'danger'
        ? cn(
            'text-red-800',
            'hover:bg-red-500/15',
            'dark:text-red-300',
            'dark:hover:bg-red-400/20'
          )
        : cn(
            'text-text',
            'hover:bg-secondary/15',
            'hover:text-text',
            'dark:text-dark-secondary',
            'dark:hover:bg-dark-secondary/20',
            'dark:hover:text-dark-text'
          );

  return (
    <button
      type='button'
      aria-label={title}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex',
        'h-8',
        'w-8',
        'items-center',
        'justify-center',
        'border',
        'border-border',
        'bg-bg',
        'focus-visible:ring-ring',
        'focus-visible:ring-2',
        'focus-visible:outline-none',
        'dark:border-dark-border/70',
        'dark:bg-dark-bg/95',
        'disabled:cursor-not-allowed',
        'disabled:opacity-50',
        toneClass
      )}
    >
      {icon}
    </button>
  );
};

export const NoteActions: FC<NoteActionsProps> = memo(function NoteActions({
  isEditing,
  isLoading,
  isFullscreen,
  hasLocalChanges,
  hasServerDraft,
  onSave,
  onCancel,
  onEdit,
  onOpenImageUpload,
  onOpenImport,
  onOpenHelp,
  onOpenCancelConfirmation,
  onExport,
  onToggleFullscreen,
  canWrite = true,
  t,
}) {
  const hasUnsaved = !!hasLocalChanges || !!hasServerDraft;
  const isBusy = isLoading;

  return (
    <div
      className={cn(
        'flex',
        'items-center',
        'gap-1.5',
        'overflow-x-auto',
        'pb-0.5',
        'pr-0.5',
        'sm:overflow-visible'
      )}
    >
      {canWrite &&
        (isEditing ? (
          <div className={cn('flex', 'items-center', 'gap-1')}>
            <ActionIconButton
              title={t('notes:save')}
              tone='success'
              disabled={isBusy}
              onClick={() => {
                if (isBusy) return;
                onSave();
              }}
              icon={<Save className={cn('h-4', 'w-4')} />}
            />

            <ActionIconButton
              title={t('notes:cancel')}
              tone='danger'
              disabled={isBusy}
              onClick={e => {
                if (isBusy) return;
                if (hasUnsaved) {
                  onOpenCancelConfirmation(e as MouseEvent<HTMLElement>);
                  return;
                }

                onCancel();
              }}
              icon={<X className={cn('h-4', 'w-4')} />}
            />

            <ActionIconButton
              title={t('notes:uploadImage') || 'Upload image'}
              disabled={isBusy}
              onClick={e => {
                if (isBusy) return;
                onOpenImageUpload(e as MouseEvent<HTMLElement>);
              }}
              icon={<ImageIcon className={cn('h-4', 'w-4')} />}
            />
          </div>
        ) : (
          <ActionIconButton
            title={t('notes:edit')}
            onClick={() => {
              onEdit();
            }}
            icon={<Edit3 className={cn('h-4', 'w-4')} />}
          />
        ))}

      {canWrite && onExport && (
        <ActionIconButton
          title={t('notes:export')}
          onClick={() => {
            onExport();
          }}
          icon={<Upload className={cn('h-4', 'w-4')} />}
        />
      )}

      {canWrite && (
        <ActionIconButton
          title={t('notes:import')}
          onClick={e => {
            onOpenImport(e as MouseEvent<HTMLElement>);
          }}
          icon={<Download className={cn('h-4', 'w-4')} />}
        />
      )}

      {canWrite && (
        <ActionIconButton
          title={t('notes:editorHelp')}
          onClick={e => {
            onOpenHelp(e as MouseEvent<HTMLElement>);
          }}
          icon={<CircleQuestionMark className={cn('h-4', 'w-4')} />}
        />
      )}

      {onToggleFullscreen && (
        <ActionIconButton
          title={
            isFullscreen ? t('notes:exitFullscreen') : t('notes:fullscreen')
          }
          onClick={() => {
            onToggleFullscreen();
          }}
          icon={
            isFullscreen ? (
              <Minimize2 className={cn('h-4', 'w-4')} />
            ) : (
              <Maximize2 className={cn('h-4', 'w-4')} />
            )
          }
        />
      )}
    </div>
  );
});
