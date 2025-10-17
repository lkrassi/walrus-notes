import { useDeleteNoteMutation } from 'widgets/model/stores/api';
import { Trash2 } from 'lucide-react';
import { Button } from 'shared';
import { useAppDispatch } from 'widgets/hooks/redux';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { useNotifications } from 'widgets/hooks/useNotifications';
import { useModalContext } from './ModalProvider';

interface DeleteNoteModalProps {
  noteId: string;
  onNoteDeleted: () => void;
}

export const DeleteNoteModal: React.FC<DeleteNoteModalProps> = ({
  noteId,
  onNoteDeleted,
}) => {
  const { t } = useLocalization();
  const { showSuccess, showError } = useNotifications();
  const { openModal } = useModalContext();
  const [deleteNote, { isLoading }] = useDeleteNoteMutation();

  const handleDelete = async () => {
    try {
      await deleteNote({ noteId }).unwrap();
      onNoteDeleted();
      showSuccess(t('common:deleteNote.success'));
      openModal(null);
    } catch (error) {
      showError(t('common:deleteNote.error'));
    }
  };

  const handleCancel = () => {
    openModal(null);
  };

  return (
    <div className='p-6'>
      <div className='text-center'>
        <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
          <Trash2 className='h-6 w-6 text-red-600 dark:text-red-400' />
        </div>
        <h3 className='text-text dark:text-dark-text mb-2 text-lg font-medium'>
          {t('common:deleteNote.title')}
        </h3>
        <p className='text-secondary dark:text-dark-secondary mb-6'>
          {t('common:deleteNote.description')}
        </p>
        <div className='flex justify-center gap-3'>
          <Button onClick={handleCancel} className='px-6 py-3'>
            {t('common:deleteNote.cancel')}
          </Button>
          <Button onClick={handleDelete} className='px-6 py-3' variant='escape'>
            {t('common:deleteNote.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};
