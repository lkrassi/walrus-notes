import { useUploadFileMutation } from '@/shared/api';
import type { AwarenessUser } from '@/shared/lib/collaboration';
import { memo, useCallback, type FC } from 'react';
import { cn } from '@/shared/lib/cn';
import { ImageUploadModal } from '@/shared/ui/components/ImageUploader';
import { useLocalization } from 'widgets';
import { useModalActions } from '@/widgets/hooks/useModalActions';
import { ConfirmationLeaveForm } from './ConfirmationLeaveForm';
import { EditNoteModal } from './EditNoteModal';
import { MarkdownHelp } from './MarkdownHelp';
import { MdImportModal } from './MdImportModal';
import { NoteActions } from './NoteActions';
import { NoteTitle } from './NoteTitle';

interface NoteHeaderProps {
  noteId?: string;
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

export const NoteHeader: FC<NoteHeaderProps> = memo(function NoteHeader({
  noteId,
  isEditing,
  title,
  isLoading,
  hasLocalChanges,
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
}) {
  const { t } = useLocalization();
  const { openModalFromTrigger } = useModalActions();
  const [uploadFile] = useUploadFileMutation();

  const handleOpenImageUpload = useCallback(
    openModalFromTrigger(
      <ImageUploadModal
        uploadFn={async (file: File) => {
          const res = await uploadFile({ file }).unwrap();
          return res?.data?.imgUrl ?? '';
        }}
        onUploaded={(url: string) => {
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
    ),
    [onInsertImage, openModalFromTrigger, t, uploadFile]
  );

  const handleOpenImport = useCallback(
    openModalFromTrigger(
      <MdImportModal onImported={(c: string) => onImport?.(c)} />,
      {
        title: t('notes:import'),
        size: 'md',
      }
    ),
    [onImport, openModalFromTrigger, t]
  );

  const handleOpenHelp = useCallback(
    openModalFromTrigger(<MarkdownHelp />, {
      title: t('notes:markdownGuide'),
      size: 'lg',
    }),
    [openModalFromTrigger, t]
  );

  const handleOpenEditTitle = useCallback(
    openModalFromTrigger(
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
    ),
    [onSave, openModalFromTrigger, t, title]
  );

  const handleOpenCancelConfirmation = useCallback(
    openModalFromTrigger(
      <ConfirmationLeaveForm onConfirm={onDiscardConfirm} />,
      { title: t('notes:unsavedConfirmTitle'), size: 'sm' }
    ),
    [onDiscardConfirm, openModalFromTrigger, t]
  );

  const handleSave = useCallback(() => {
    onSave();
  }, [onSave]);

  return (
    <div className={cn('panel-header')}>
      <NoteTitle title={title} onEdit={handleOpenEditTitle} />

      <NoteActions
        noteId={noteId}
        isEditing={isEditing}
        isLoading={isLoading}
        isFullscreen={isFullscreen}
        hasLocalChanges={hasLocalChanges}
        onSave={handleSave}
        onCancel={onCancel}
        onEdit={onEdit}
        onOpenImageUpload={handleOpenImageUpload}
        onOpenImport={handleOpenImport}
        onOpenHelp={handleOpenHelp}
        onOpenCancelConfirmation={handleOpenCancelConfirmation}
        onExport={onExport}
        onToggleFullscreen={onToggleFullscreen}
        t={t}
      />
    </div>
  );
});
