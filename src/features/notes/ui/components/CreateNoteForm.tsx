import { createNote } from 'features/notes/api';
import { useState } from 'react';
import { Button } from 'shared';
import type { Note } from 'shared/model/types/layouts';
import {
  useAppDispatch,
  useLocalization,
  useModalContext,
  useNotifications,
} from 'widgets';

interface CreateNoteFormProps {
  layoutId: string;
  onNoteCreated?: (note: Note) => void;
}

export const CreateNoteForm = ({
  layoutId,
  onNoteCreated,
}: CreateNoteFormProps) => {
  const { t } = useLocalization();
  const [title, setTitle] = useState('');
  const [payload, setPayload] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();
  const { closeModal } = useModalContext();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showError(t('notes:enterNoteTitle'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await createNote(
        {
          layoutId,
          title: title.trim(),
          payload: payload.trim(),
        },
        dispatch
      );

      const newNote: Note = {
        id: response.data.id,
        layoutId,
        title: title.trim(),
        payload: payload.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      showSuccess(t('notes:noteCreatedSuccess'));
      onNoteCreated?.(newNote);
      setTitle('');
      setPayload('');
      closeModal();
    } catch (err: any) {
      showError(t('notes:noteCreationError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6 p-6'>
      <div>
        <label
          htmlFor='note-title'
          className='text-text dark:text-dark-text mb-2 block text-sm font-medium'
        >
          {t('notes:noteTitle')}
        </label>
        <input
          id='note-title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('notes:noteTitlePlaceholder')}
          className='border-border dark:border-dark-border text-text dark:text-dark-text placeholder-input-placeholder dark:placeholder-dark-input-placeholder focus:ring-primary dark:focus:ring-dark-primary w-full rounded-lg border bg-white px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 dark:bg-gray-800'
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div>
        <label
          htmlFor='note-content'
          className='text-text dark:text-dark-text mb-2 block text-sm font-medium'
        >
          {t('notes:noteContent')}
        </label>
        <textarea
          id='note-content'
          value={payload}
          onChange={e => setPayload(e.target.value)}
          placeholder={t('notes:noteContentPlaceholderTextarea')}
          rows={6}
          className='border-border dark:border-dark-border text-text dark:text-dark-text placeholder-input-placeholder dark:placeholder-dark-input-placeholder focus:ring-primary dark:focus:ring-dark-primary resize-vertical w-full rounded-lg border bg-white px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 dark:bg-gray-800'
          disabled={isLoading}
        />
      </div>

      <div className='flex justify-end gap-3'>
        <Button
          type='button'
          onClick={closeModal}
          variant='escape'
          className='px-6 py-3'
          disabled={isLoading}
        >
          {t('layout:cancel')}
        </Button>
        <Button
          type='submit'
          variant='default'
          className='px-6 py-3'
          disabled={isLoading}
        >
          {isLoading ? t('notes:creating') : t('notes:createNote')}
        </Button>
      </div>
    </form>
  );
};
