import { IconButton } from '@/shared/ui';
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
      ? 'btn-icon-tone-success'
      : tone === 'danger'
        ? 'btn-icon-tone-danger'
        : 'btn-icon-tone-default';

  return (
    <IconButton
      icon={icon}
      size='md'
      variant='outline'
      aria-label={title}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={toneClass}
    />
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
    <div className='flex items-center gap-1.5 overflow-x-auto pr-0.5 pb-0.5 sm:overflow-visible'>
      {canWrite &&
        (isEditing ? (
          <div className='flex items-center gap-1'>
            <ActionIconButton
              title={t('notes:save')}
              tone='success'
              disabled={isBusy}
              onClick={() => {
                if (isBusy) return;
                onSave();
              }}
              icon={<Save className='h-4 w-4' />}
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
              icon={<X className='h-4 w-4' />}
            />

            <ActionIconButton
              title={t('notes:uploadImage') || 'Upload image'}
              disabled={isBusy}
              onClick={e => {
                if (isBusy) return;
                onOpenImageUpload(e as MouseEvent<HTMLElement>);
              }}
              icon={<ImageIcon className='h-4 w-4' />}
            />
          </div>
        ) : (
          <ActionIconButton
            title={t('notes:edit')}
            onClick={() => {
              onEdit();
            }}
            icon={<Edit3 className='h-4 w-4' />}
          />
        ))}

      {canWrite && onExport && (
        <ActionIconButton
          title={t('notes:export')}
          onClick={() => {
            onExport();
          }}
          icon={<Upload className='h-4 w-4' />}
        />
      )}

      {canWrite && (
        <ActionIconButton
          title={t('notes:import')}
          onClick={e => {
            onOpenImport(e as MouseEvent<HTMLElement>);
          }}
          icon={<Download className='h-4 w-4' />}
        />
      )}

      {canWrite && (
        <ActionIconButton
          title={t('notes:editorHelp')}
          onClick={e => {
            onOpenHelp(e as MouseEvent<HTMLElement>);
          }}
          icon={<CircleQuestionMark className='h-4 w-4' />}
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
              <Minimize2 className='h-4 w-4' />
            ) : (
              <Maximize2 className='h-4 w-4' />
            )
          }
        />
      )}
    </div>
  );
});
