import { updateNote } from 'features/notes/api';
import { Edit3, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from 'shared';
import type { Note } from 'shared/model/types/layouts';
import { useAppDispatch, useNotifications, useLocalization } from 'widgets';

interface NoteViewerProps {
  note: Note;
  onNoteUpdated?: (note: Note) => void;
  onNoteDeleted?: (noteId: string) => void;
}

export const NoteViewer = ({ note, onNoteUpdated }: NoteViewerProps) => {
  const { t } = useLocalization();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [payload, setPayload] = useState(note.payload);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setTitle(note.title);
    setPayload(note.payload);
  }, [note.title, note.payload]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setPayload(note.payload);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showError(t('notes:enterNoteTitle'));
      return;
    }

    setIsLoading(true);

    try {
      await updateNote({
        noteId: note.id,
        title: title.trim(),
        payload: payload.trim(),
      }, dispatch);

      const updatedNote: Note = {
        ...note,
        title: title.trim(),
        payload: payload.trim(),
        updatedAt: new Date().toISOString(),
      };

      Object.assign(note, updatedNote);

      showSuccess(t('notes:noteUpdatedSuccess'));
      onNoteUpdated?.(updatedNote);
      setIsEditing(false);
    } catch (err: any) {
      showError(t('notes:noteUpdateError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='dark:bg-dark-bg flex h-full flex-col bg-white'>
      <div className='border-border dark:border-dark-border flex flex-shrink-0 items-center justify-between border-b p-4'>
        <div className='flex-1'>
          {isEditing ? (
            <input
              type='text'
              value={title}
              onChange={e => setTitle(e.target.value)}
              className='text-text dark:text-dark-text focus:ring-primary dark:focus:ring-dark-primary w-full rounded border-none bg-transparent text-xl font-bold outline-none focus:ring-2'
              disabled={isLoading}
            />
          ) : (
            <h1 className='text-text dark:text-dark-text text-xl font-bold'>
              {note.title}
            </h1>
          )}
        </div>

        <div className='flex gap-2'>
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className='bg-btn-bg px-3 py-2 hover:opacity-90'
                disabled={isLoading}
                title={t('notes:save')}
              >
                <Save className='h-4 w-4' />
              </Button>
              <Button
                onClick={handleCancel}
                className='bg-btn-cancel px-3 py-2 shadow-[0_8px_0_0_#9f9090] hover:opacity-90 active:translate-y-1.5 active:shadow-[0_1px_0_0_#9f9090]'
                disabled={isLoading}
                title={t('notes:cancel')}
              >
                <X className='h-4 w-4' />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleEdit}
                className='bg-btn-bg px-3 py-2 hover:opacity-90'
                title={t('notes:edit')}
              >
                <Edit3 className='h-4 w-4' />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className='min-h-0 flex-1'>
        {isEditing ? (
          <textarea
            value={payload}
            onChange={e => setPayload(e.target.value)}
            className='text-text dark:text-dark-text focus:ring-primary dark:focus:ring-dark-primary h-full min-h-full w-full flex-1 resize-none border-none bg-transparent outline-none focus:ring-2'
            placeholder={t('notes:noteContentPlaceholder')}
            disabled={isLoading}
          />
        ) : (
          <div className='h-full min-h-full flex-1 overflow-y-auto'>
            <div className='prose dark:prose-invert max-w-none'>
              {payload ? (
                <div
                  className='text-text dark:text-dark-text break-words whitespace-pre-wrap'
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {payload}
                </div>
              ) : (
                <p className='text-secondary dark:text-dark-secondary italic'>
                  {t('notes:emptyNoteMessage')}
                </p>
              )}{' '}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
