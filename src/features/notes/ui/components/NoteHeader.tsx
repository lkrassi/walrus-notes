import { useUploadFileMutation } from 'app/store/api';
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
import { Button } from 'shared';
import { cn } from 'shared/lib/cn';
import { ImageUploadModal } from 'shared/ui/components/ImageUploader';
import { useLocalization } from 'widgets';
import { useModalActions } from 'widgets/hooks/useModalActions';
import type { AwarenessUser } from '../../model/useYjsCollaboration';
import { ConfirmationLeaveForm } from './ConfirmationLeaveForm';
import { EditNoteModal } from './EditNoteModal';
import { MarkdownHelp } from './MarkdownHelp';
import { MdImportModal } from './MdImportModal';

interface NoteHeaderProps {
  isEditing: boolean;
  title: string;
  isLoading: boolean;
  hasLocalChanges?: boolean;
  hasServerDraft?: boolean;
  isSaving?: boolean;
  isPending?: boolean;
  isFullscreen?: boolean;
  onlineUsers?: Map<number, AwarenessUser>;
  currentUserId?: string;
  onEdit: () => void;
  onSave: (overrideTitle?: string) => Promise<void> | void;
  onCancel: () => void;
  onDiscardConfirm?: () => void;
  onInsertImage?: (url: string) => void;
  onExport?: () => void;
  onImport?: (content: string) => void;
  onToggleFullscreen?: () => void;
}

export const NoteHeader: React.FC<NoteHeaderProps> = ({
  isEditing,
  title,
  isLoading,
  hasLocalChanges: _hasLocalChanges,
  hasServerDraft: _hasServerDraft,
  isSaving: _isSaving,
  isPending: _isPending,
  isFullscreen,
  onEdit,
  onSave,
  onCancel,
  onDiscardConfirm,
  onInsertImage,
  onExport,
  onImport,
  onToggleFullscreen,
}) => {
  const { t } = useLocalization();
  const { openModalFromTrigger } = useModalActions();
  const [uploadFile] = useUploadFileMutation();

  const handleOpenImageUpload = openModalFromTrigger(
    <ImageUploadModal
      uploadFn={async (file: File) => {
        const res = await uploadFile({ file }).unwrap();
        return res?.data?.imgUrl ?? '';
      }}
      onUploaded={url => {
        if (url && onInsertImage) {
          const normalized = url.startsWith('http') ? url : `https://${url}`;
          onInsertImage(normalized);
        }
      }}
    />,
    {
      title: t('notes:uploadImage') || 'Загрузить изображение',
      size: 'md',
    }
  );

  const handleOpenImport = openModalFromTrigger(
    <MdImportModal onImported={(c: string) => onImport?.(c)} />,
    {
      title: t('notes:import'),
      size: 'md',
    }
  );

  const handleOpenHelp = openModalFromTrigger(<MarkdownHelp />, {
    title: t('notes:markdownGuide'),
    size: 'lg',
  });

  const handleOpenEditTitle = openModalFromTrigger(
    <EditNoteModal
      title={title}
      onSaved={async (newTitle: string) => {
        if (newTitle !== title) {
          await onSave(newTitle);
        }
      }}
    />,
    {
      title: t('notes:editTitle') || 'Edit title',
      size: 'md',
    }
  );

  return (
    <div className={cn('panel-header')}>
      <div className={cn('min-w-0', 'flex-1')}>
        <div
          className={cn(
            'flex',
            'items-center',
            'justify-between',
            'gap-3',
            'flex-wrap'
          )}
        >
          <button
            onClick={handleOpenEditTitle}
            className={cn(
              'note-title',
              'flex',
              'items-center',
              'gap-2',
              'text-left',
              'hover:opacity-75',
              'transition-opacity',
              'cursor-pointer',
              'bg-transparent',
              'border-none',
              'padding-0',
              'min-w-0'
            )}
          >
            {title}
          </button>
        </div>
      </div>

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
              onClick={() => onSave()}
              className={cn('flex', 'h-8', 'items-center', 'justify-center')}
              disabled={isLoading}
              title={t('notes:save')}
              variant='submit'
            >
              <Save className={cn('h-4', 'w-4')} />
            </Button>

            <Button
              onClick={e => {
                if (!_hasLocalChanges) {
                  if (onCancel) onCancel();
                  return;
                }
                const open = openModalFromTrigger(
                  <ConfirmationLeaveForm onConfirm={onDiscardConfirm} />,
                  { title: t('notes:unsavedConfirmTitle'), size: 'sm' }
                );
                open(e as React.MouseEvent<HTMLElement>);
              }}
              className={cn('flex', 'h-8', 'items-center', 'justify-center')}
              disabled={isLoading}
              title={t('notes:cancel')}
              variant='escape'
            >
              <X className={cn('h-4', 'w-4')} />
            </Button>

            <Button
              onClick={handleOpenImageUpload}
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

        {onImport && (
          <Button
            onClick={handleOpenImport}
            className={cn('flex', 'h-8', 'items-center', 'justify-center')}
            title={t('notes:import')}
            variant='default'
          >
            <Upload className={cn('h-4', 'w-4')} />
          </Button>
        )}

        <Button
          onClick={handleOpenHelp}
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
    </div>
  );
};
