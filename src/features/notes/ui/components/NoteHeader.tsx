import { useNotifications } from '@/entities/notification';
import { useUploadFileMutation } from '@/shared/api';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react';
import type { AwarenessUser } from '@/shared/lib/react/collaboration';
import { ImageUploadModal } from '@/shared/ui';
import { memo, useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  canWrite?: boolean;
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
  canWrite = true,
}) {
  const { t } = useTranslation();
  const { openModalFromTrigger } = useModalActions();
  const { showError, showSuccess } = useNotifications();
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
        onUploadSuccess={showSuccess}
        onUploadError={showError}
      />,
      {
        title: t('notes:uploadImage') || 'Загрузить изображение',
        size: 'lg',
      }
    ),
    [onInsertImage, openModalFromTrigger, showError, showSuccess, t, uploadFile]
  );

  const handleOpenImport = useCallback(
    openModalFromTrigger(
      <MdImportModal onImported={(c: string) => onImport?.(c)} />,
      {
        title: t('notes:import'),
        size: MODAL_SIZE_PRESETS.noteImport,
      }
    ),
    [onImport, openModalFromTrigger, t]
  );

  const handleOpenHelp = useCallback(
    openModalFromTrigger(<MarkdownHelp />, {
      title: t('notes:markdownGuide'),
      size: MODAL_SIZE_PRESETS.noteMarkdownHelp,
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
        size: MODAL_SIZE_PRESETS.noteEditTitle,
      }
    ),
    [onSave, openModalFromTrigger, t, title]
  );

  const handleOpenCancelConfirmation = useCallback(
    openModalFromTrigger(
      <ConfirmationLeaveForm onConfirm={onDiscardConfirm} />,
      { title: t('notes:unsavedConfirmTitle'), size: 'lg' }
    ),
    [onDiscardConfirm, openModalFromTrigger, t]
  );

  const handleSave = useCallback(() => {
    onSave();
  }, [onSave]);

  return (
    <div className={cn('panel-header')}>
      <NoteTitle
        title={title}
        onEdit={handleOpenEditTitle}
        canWrite={canWrite}
      />

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
        canWrite={canWrite}
        t={t}
      />
    </div>
  );
});
