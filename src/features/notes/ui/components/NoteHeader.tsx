import { Button } from 'shared';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets';
import {
  Maximize2,
  Minimize2,
  Edit3,
  Save,
  X,
  Image as ImageIcon,
  Download,
  Upload,
  CircleQuestionMark,
} from 'lucide-react';
import { useModalActions } from 'widgets/hooks/useModalActions';
import ImageUploadModal from 'shared/ui/components/ImageUploader';
import MdImportModal from './MdImportModal';
import { MarkdownHelp } from './MarkdownHelp';
import { ConfirmationLeaveForm } from './ConfirmationLeaveForm';
import { useUploadFileMutation } from 'app/store/api';
import EditNoteModal from './EditNoteModal';

interface NoteHeaderProps {
  isEditing: boolean;
  title: string;
  isLoading: boolean;
  hasLocalChanges?: boolean;
  hasServerDraft?: boolean;
  isSaving?: boolean;
  isPending?: boolean;
  isFullscreen?: boolean;
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
        <div className={cn('flex', 'items-center', 'gap-3')}>
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
              'padding-0'
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
              className={cn('px-2', 'py-2', 'sm:px-3')}
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
              className={cn('px-2', 'py-2', 'sm:px-3')}
              disabled={isLoading}
              title={t('notes:cancel')}
              variant='escape'
            >
              <X className={cn('h-4', 'w-4')} />
            </Button>

            <Button
              onClick={handleOpenImageUpload}
              className={cn(
                'px-2',
                'py-2',
                'sm:px-3',
                'hidden',
                'sm:inline-flex'
              )}
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
            className={cn('px-2', 'py-2', 'sm:px-3')}
            title={t('notes:edit')}
            variant='default'
          >
            <Edit3 className={cn('h-4', 'w-4')} />
          </Button>
        )}

        {onExport && (
          <Button
            onClick={onExport}
            className={cn(
              'px-2',
              'py-2',
              'sm:px-3',
              'hidden',
              'md:inline-flex'
            )}
            title={t('notes:export')}
            variant='default'
          >
            <Download className={cn('h-4', 'w-4')} />
          </Button>
        )}

        {onImport && (
          <Button
            onClick={handleOpenImport}
            className={cn(
              'px-2',
              'py-2',
              'sm:px-3',
              'hidden',
              'sm:inline-flex'
            )}
            title={t('notes:import')}
            variant='default'
          >
            <Upload className={cn('h-4', 'w-4')} />
          </Button>
        )}

        <Button
          onClick={handleOpenHelp}
          className={cn('px-2', 'py-2', 'sm:px-3', 'hidden', 'sm:inline-flex')}
          title={t('notes:editorHelp')}
          variant='default'
        >
          <CircleQuestionMark className={cn('h-4', 'w-4')} />
        </Button>

        {onToggleFullscreen && (
          <Button
            onClick={onToggleFullscreen}
            className={cn('px-2', 'py-2', 'sm:px-3')}
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
