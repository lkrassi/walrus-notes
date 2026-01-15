import { useDeleteNoteMutation } from 'app/store/api';
import { closeTabsByItemId } from 'app/store/slices/tabsSlice';
import React from 'react';
import { Button } from 'shared';
import cn from 'shared/lib/cn';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useAppDispatch } from 'widgets/hooks/redux';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';
import { Trash2 } from 'lucide-react';

interface DeleteNoteFormProps {
  noteId: string;
  noteTitle: string;
  onNoteDeleted?: (noteId: string) => void;
}

export const DeleteNoteForm = ({
  noteId,
  noteTitle,
  onNoteDeleted,
}: DeleteNoteFormProps) => {
  const { t } = useLocalization();
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const dispatch = useAppDispatch();
  const [deleteNote, { isLoading }] = useDeleteNoteMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await deleteNote({
        noteId,
      }).unwrap();

      dispatch(closeTabsByItemId({ itemId: noteId, itemType: 'note' }));

      if (onNoteDeleted) {
        onNoteDeleted(noteId);
      }

      closeModal();
    } catch {
      showError(t('notes:noteDeletionError'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', 'p-6')}>
      <div className={cn('text-center')}>
        <div
          className={cn(
            'mx-auto',
            'mb-4',
            'flex',
            'h-12',
            'w-12',
            'items-center',
            'justify-center',
            'rounded-full',
            'bg-red-100',
            'dark:bg-red-900/20'
          )}
        >
          <Trash2
            className={cn('h-6', 'w-6', 'text-red-600', 'dark:text-red-400')}
          />
        </div>

        <p className={cn('muted-text mt-2 text-sm')}>
          {t('notes:deleteNoteConfirmation', { title: noteTitle })}
        </p>

        <p className={cn('muted-text mt-1 text-xs')}>
          {t('notes:deleteNoteWarning')}
        </p>
      </div>

      <div className={cn('flex', 'justify-center', 'gap-3')}>
        <Button
          type='button'
          onClick={closeModal}
          variant='default'
          className={cn('btn')}
          disabled={isLoading}
        >
          {t('notes:cancel')}
        </Button>
        <Button
          type='submit'
          variant='escape'
          className={cn('btn')}
          disabled={isLoading}
        >
          {isLoading ? t('notes:deleting') : t('notes:delete')}
        </Button>
      </div>
    </form>
  );
};
