import { useState } from 'react';
import { Button, Input } from 'shared';
import type { Note } from 'shared/model/types/layouts';
import { useLocalization, useNotifications } from 'widgets';
import { useCreateNoteMutation } from 'widgets/model/stores/api';
import { useModalContext } from 'widgets/ui';

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
  const { showError } = useNotifications();
  const { closeModal } = useModalContext();
  const [createNote, { isLoading }] = useCreateNoteMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showError(t('notes:enterNoteTitle'));
      return;
    }

    try {
      const response = await createNote({
        layoutId,
        title: title.trim(),
        payload: payload.trim(),
      }).unwrap();

      // Используем данные из ответа API, а не создаем вручную
      const newNote: Note = response.data;

      if (onNoteCreated) {
        onNoteCreated(newNote);
      }
      setTitle('');
      setPayload('');
      closeModal();
    } catch (err: any) {
      showError(t('notes:noteCreationError'));
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
        <Input
          id='note-title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('notes:noteTitlePlaceholder')}
          className='w-full rounded-xl border-2 px-4 py-3'
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
          className='border-border dark:border-dark-border text-text dark:text-dark-text placeholder-input-placeholder dark:placeholder-dark-input-placeholder focus:ring-primary dark:focus:ring-dark-primary w-full resize-none rounded-lg border bg-white px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 dark:bg-gray-800'
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
          variant='submit'
          className='px-6 py-3'
          disabled={isLoading}
        >
          {isLoading ? t('notes:creating') : t('notes:createNote')}
        </Button>
      </div>
    </form>
  );
};
