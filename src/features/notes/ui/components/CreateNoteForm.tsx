import { useCreateNoteMutation } from 'app/store/api';
import { useEffect, useRef, useState } from 'react';
import { Button, Input, Textarea } from 'shared';
import { cn } from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { useLocalization, useNotifications } from 'widgets';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';

interface CreateNoteFormProps {
  layoutId: string;
  onNoteCreated?: (note: Note) => void;
  onMultipleNotesCreated?: (notes: Note[]) => void;
}

export const CreateNoteForm = ({
  layoutId,
  onNoteCreated,
}: CreateNoteFormProps) => {
  const { t } = useLocalization();
  const [title, setTitle] = useState('');
  const [payload, setPayload] = useState('');
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const [createNote, { isLoading }] = useCreateNoteMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

      const newNote: Note = response.data;

      if (onNoteCreated) {
        onNoteCreated(newNote);
      }
      setTitle('');
      setPayload('');
      closeModal();
    } catch {
      showError(t('notes:noteCreationError'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6 p-6')}>
      <div>
        <label htmlFor='note-title' className={cn('tw-label')}>
          {t('notes:noteTitle')}
        </label>
        <Input
          ref={inputRef}
          id='note-title'
          type='text'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('notes:noteTitlePlaceholder')}
          className={cn('form-input', 'rounded-md')}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor='note-content' className={cn('tw-label')}>
          {t('notes:noteContent')}
        </label>
        <Textarea
          id='note-content'
          value={payload}
          onChange={e => setPayload(e.target.value)}
          placeholder={t('notes:noteContentPlaceholderTextarea')}
          rows={6}
          className={cn('form-input', 'rounded-md')}
          disabled={isLoading}
        />
      </div>

      <div className={cn('flex', 'justify-center', 'gap-3')}>
        <Button
          type='button'
          onClick={closeModal}
          variant='escape'
          className={cn('btn')}
          disabled={isLoading}
        >
          {t('layout:cancel')}
        </Button>
        <Button
          type='submit'
          variant={!title.trim() || isLoading ? 'disabled' : 'submit'}
          className={cn('btn')}
          disabled={!title.trim() || isLoading}
        >
          {isLoading ? t('notes:creating') : t('notes:createNote')}
        </Button>
      </div>
    </form>
  );
};
