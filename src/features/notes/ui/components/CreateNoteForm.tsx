import { getLayoutAccess, useCreateNoteMutation, useGetMyLayoutsQuery } from '@/entities';
import type { Note } from '@/entities/note';
import { useNotifications } from '@/entities/notification';
import { Button, Input, Textarea } from '@/shared';
import { cn } from '@/shared/lib/core';
import { useModalContentContext } from '@/shared/lib/react';
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from 'react';
import { useTranslation } from 'react-i18next';

interface CreateNoteFormProps {
  layoutId: string;
  onNoteCreated?: (note: Note) => void;
  onMultipleNotesCreated?: (notes: Note[]) => void;
}

export const CreateNoteForm = memo(function CreateNoteForm({
  layoutId,
  onNoteCreated,
}: CreateNoteFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [payload, setPayload] = useState('');
  const { showError } = useNotifications();
  const { closeModal } = useModalContentContext();
  const [createNote, { isLoading }] = useCreateNoteMutation();
  const { data: layoutsResponse } = useGetMyLayoutsQuery(undefined);
  const currentLayout = (layoutsResponse?.data || []).find(l => l.id === layoutId);
  const canEdit = currentLayout ? getLayoutAccess(currentLayout).canEdit : true;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!title.trim()) {
        showError(t('notes:enterNoteTitle'));
        return;
      }

      try {
        if (!canEdit) {
          showError('Not enough permissions');
          return;
        }
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
    },
    [
      closeModal,
      createNote,
      layoutId,
      onNoteCreated,
      payload,
      showError,
      t,
      title,
      canEdit,
    ]
  );

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
          disabled={!title.trim() || isLoading || !canEdit}
        >
          {isLoading ? t('notes:creating') : t('notes:createNote')}
        </Button>
      </div>
    </form>
  );
});
