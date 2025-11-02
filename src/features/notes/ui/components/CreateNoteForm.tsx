import { useState } from 'react';
import { Button, Input } from 'shared';
import type { Note } from 'shared/model/types/layouts';
import { useLocalization, useNotifications } from 'widgets';
import { useCreateNoteMutation } from 'widgets/model/stores/api';
import { useModalContext } from 'widgets/ui';

interface CreateNoteFormProps {
  layoutId: string;
  onNoteCreated?: (note: Note) => void;
  onMultipleNotesCreated?: (notes: Note[]) => void;
}

export const CreateNoteForm = ({
  layoutId,
  onNoteCreated,
  onMultipleNotesCreated,
}: CreateNoteFormProps) => {
  const { t } = useLocalization();
  const [title, setTitle] = useState('');
  const [payload, setPayload] = useState('');
  const [isCreatingMultiple, setIsCreatingMultiple] = useState(false);
  const { showError, showSuccess } = useNotifications();
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

  const createMultipleNotes = async () => {
    setIsCreatingMultiple(true);
    const createdNotes: Note[] = [];

    try {
      for (let i = 1; i <= 200; i++) {
        try {
          const response = await createNote({
            layoutId,
            title: `Тестовая заметка ${i}`,
            payload: `Это содержимое тестовой заметки номер ${i}. Создана для тестирования пагинации и производительности.`,
          }).unwrap();

          createdNotes.push(response.data);

          // Небольшая задержка чтобы не перегружать сервер
          if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Ошибка при создании заметки ${i}:`, error);
        }
      }

      if (onMultipleNotesCreated && createdNotes.length > 0) {
        onMultipleNotesCreated(createdNotes);
      }

      showSuccess(`Успешно создано ${createdNotes.length} заметок из 200`);

      if (createdNotes.length > 0) {
        closeModal();
      }
    } catch (error) {
      showError('Произошла ошибка при массовом создании заметок');
    } finally {
      setIsCreatingMultiple(false);
    }
  };

  const createMultipleNotesBatch = async () => {
    setIsCreatingMultiple(true);
    const createdNotes: Note[] = [];

    try {
      // Создаем 20 групп по 10 заметок для лучшей производительности
      const batchSize = 10;
      const totalBatches = 20;

      for (let batch = 0; batch < totalBatches; batch++) {
        const batchPromises = [];

        for (let i = 0; i < batchSize; i++) {
          const noteNumber = batch * batchSize + i + 1;
          batchPromises.push(
            createNote({
              layoutId,
              title: `Тестовая заметка ${noteNumber}`,
              payload: `Содержимое тестовой заметки номер ${noteNumber}. Используется для тестирования интерфейса и пагинации.`,
            }).unwrap()
          );
        }

        try {
          const batchResults = await Promise.allSettled(batchPromises);
          batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              createdNotes.push(result.value.data);
            }
          });

          // Задержка между батчами
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (batchError) {
          console.error(`Ошибка в батче ${batch + 1}:`, batchError);
        }
      }

      if (onMultipleNotesCreated && createdNotes.length > 0) {
        onMultipleNotesCreated(createdNotes);
      }

      showSuccess(`Успешно создано ${createdNotes.length} заметок из 200`);

      if (createdNotes.length > 0) {
        closeModal();
      }
    } catch (error) {
      showError('Произошла ошибка при массовом создании заметок');
    } finally {
      setIsCreatingMultiple(false);
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
          disabled={isLoading || isCreatingMultiple}
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
          disabled={isLoading || isCreatingMultiple}
        />
      </div>

      {/* Кнопка для создания одной заметки */}
      <div className='flex justify-end gap-3'>
        <Button
          type='button'
          onClick={closeModal}
          variant='escape'
          className='px-6 py-3'
          disabled={isLoading || isCreatingMultiple}
        >
          {t('layout:cancel')}
        </Button>
        <Button
          type='submit'
          variant='submit'
          className='px-6 py-3'
          disabled={isLoading || isCreatingMultiple}
        >
          {isLoading ? t('notes:creating') : t('notes:createNote')}
        </Button>
      </div>

      {/* Разделитель */}
      <div className='relative my-6'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-300 dark:border-gray-600' />
        </div>
        <div className='relative flex justify-center'>
          <span className='bg-white px-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400'>
            {t('common:or')}
          </span>
        </div>
      </div>

      {/* Кнопки для массового создания */}
      <div className='space-y-3'>
        <div className='text-center'>
          <p className='text-text-secondary dark:text-dark-text-secondary mb-4 text-sm'>
            Создать тестовые данные для проверки пагинации
          </p>
        </div>

        <div className='flex gap-3'>
          <Button
            type='button'
            onClick={createMultipleNotes}
            variant='default'
            className='flex-1 py-3'
            disabled={isLoading || isCreatingMultiple}
          >
            {isCreatingMultiple
              ? 'Создание...'
              : 'Создать 200 заметок (последовательно)'}
          </Button>

          <Button
            type='button'
            onClick={createMultipleNotesBatch}
            variant='default'
            className='flex-1 py-3'
            disabled={isLoading || isCreatingMultiple}
          >
            {isCreatingMultiple
              ? 'Создание...'
              : 'Создать 200 заметок (пакетами)'}
          </Button>
        </div>

        {isCreatingMultiple && (
          <div className='text-center'>
            <p className='text-text-secondary dark:text-dark-text-secondary text-sm'>
              Идет создание заметок... Это может занять несколько секунд
            </p>
          </div>
        )}
      </div>
    </form>
  );
};
