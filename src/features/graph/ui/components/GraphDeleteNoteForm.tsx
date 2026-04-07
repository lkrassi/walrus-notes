import { useDeleteNoteMutation } from '@/entities/note';
import { closeTabsByItemId } from '@/entities/tab';
import { Button } from '@/shared';
import { cn } from '@/shared/lib/core';
import { useModalContentContext } from '@/shared/lib/react/modal';
import { Trash2 } from 'lucide-react';
import { type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

interface GraphDeleteNoteFormProps {
  noteId: string;
  noteTitle: string;
}

export const GraphDeleteNoteForm = ({
  noteId,
  noteTitle,
}: GraphDeleteNoteFormProps) => {
  const { t } = useTranslation();
  const { closeModal } = useModalContentContext();
  const dispatch = useDispatch();
  const [deleteNote, { isLoading }] = useDeleteNoteMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await deleteNote({ noteId }).unwrap();
      dispatch(closeTabsByItemId({ itemId: noteId, itemType: 'note' }));
      closeModal();
    } catch (_e) {}
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', 'p-6')}>
      <div className={cn('text-center')}>
        <div
          className={cn(
            'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full',
            'bg-red-100 dark:bg-red-900/20'
          )}
        >
          <Trash2 className={cn('h-6 w-6 text-red-600 dark:text-red-400')} />
        </div>

        <p className={cn('muted-text mt-2 text-sm')}>
          {t('notes:deleteNoteConfirmation', { title: noteTitle })}
        </p>

        <p className={cn('muted-text mt-1 text-xs')}>
          {t('notes:deleteNoteWarning')}
        </p>
      </div>

      <div className={cn('flex justify-center gap-3')}>
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
