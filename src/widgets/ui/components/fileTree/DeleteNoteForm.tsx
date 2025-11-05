import { useDeleteNoteMutation } from 'app/store/api';
import { closeTabsByItemId } from 'app/store/slices/tabsSlice';
import React from 'react';
import { Button } from 'shared';
import { useLocalization, useNotifications } from 'widgets/hooks';
import { useAppDispatch } from 'widgets/hooks/redux';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';

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
    <form onSubmit={handleSubmit} className='space-y-6 p-6'>
      <div className='text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
          <svg
            className='h-6 w-6 text-red-600 dark:text-red-400'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
            />
          </svg>
        </div>
        <h3 className='text-text dark:text-dark-text mt-4 text-lg font-semibold'>
          {t('notes:deleteNote')}
        </h3>

        <p className='text-text dark:text-dark-text mt-2 text-sm'>
          Вы уверены, что хотите удалить заметку «{noteTitle}»?
        </p>

        <p className='text-text dark:text-dark-text mt-1 text-xs'>
          {t('notes:deleteNoteWarning')}
        </p>
      </div>

      <div className='flex justify-center gap-3'>
        <Button
          type='button'
          onClick={closeModal}
          variant='default'
          className='px-6 py-3'
          disabled={isLoading}
        >
          {t('notes:cancel')}
        </Button>
        <Button
          type='submit'
          variant='escape'
          className='px-6 py-3'
          disabled={isLoading}
        >
          {isLoading ? t('notes:deleting') : t('notes:delete')}
        </Button>
      </div>
    </form>
  );
};
