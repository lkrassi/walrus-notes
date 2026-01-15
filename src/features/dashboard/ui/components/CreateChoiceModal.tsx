import { FileText } from 'lucide-react';
import cn from 'shared/lib/cn';
import FolderIcon from 'shared/ui/icons/FolderIcon';
import { useLocalization } from 'widgets/hooks';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';

interface CreateChoiceModalProps {
  onCreateFolder: () => void;
  onCreateNote: () => void;
}

export const CreateChoiceModal = ({
  onCreateFolder,
  onCreateNote,
}: CreateChoiceModalProps) => {
  const { t } = useLocalization();
  const { closeModal } = useModalContentContext();

  const handleFolderClick = () => {
    closeModal();
    onCreateFolder();
  };

  const handleNoteClick = () => {
    closeModal();
    onCreateNote();
  };

  return (
    <div className={cn('p-4', 'md:p-6', 'space-y-3', 'md:space-y-4')}>
      <h3
        className={cn(
          'text-base',
          'md:text-lg',
          'font-semibold',
          'text-text',
          'dark:text-dark-text',
          'text-center',
          'mb-3',
          'md:mb-4'
        )}
      >
        {t('dashboard:folderOrNote') || 'Выберите, что создать папку или заметку?'}
      </h3>

      <button
        onClick={handleFolderClick}
        className={cn(
          'w-full',
          'flex',
          'flex-col',
          'md:flex-row',
          'md:items-center',
          'items-center',
          'gap-3',
          'md:gap-4',
          'p-3',
          'md:p-4',
          'rounded-lg',
          'border-2',
          'border-gray-200',
          'dark:border-gray-700',
          'bg-white',
          'dark:bg-gray-800',
          'hover:border-primary',
          'hover:bg-primary/5',
          'dark:hover:bg-primary/10',
          'transition-all',
          'cursor-pointer',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-primary/50'
        )}
      >
        <div
          className={cn(
            'flex',
            'h-10',
            'md:h-12',
            'w-10',
            'md:w-12',
            'items-center',
            'justify-center',
            'rounded-full',
            'bg-blue-100',
            'dark:bg-blue-900/30',
            'flex-shrink-0'
          )}
        >
          <FolderIcon
            className={cn(
              'h-5',
              'md:h-6',
              'w-5',
              'md:w-6',
              'text-blue-600',
              'dark:text-blue-400'
            )}
          />
        </div>
        <div className={cn('flex-1', 'text-center', 'md:text-left')}>
          <h4
            className={cn(
              'font-medium',
              'text-sm',
              'md:text-base',
              'text-text',
              'dark:text-dark-text',
              'mb-1'
            )}
          >
            {t('dashboard:createFolder') || 'Создать папку'}
          </h4>
          <p
            className={cn(
              'text-xs',
              'md:text-sm',
              'text-secondary',
              'dark:text-dark-secondary',
              'line-clamp-2'
            )}
          >
            {t('dashboard:createFolderDescription') ||
              'Новая папка для организации заметок'}
          </p>
        </div>
      </button>

      <button
        onClick={handleNoteClick}
        className={cn(
          'w-full',
          'flex',
          'flex-col',
          'md:flex-row',
          'md:items-center',
          'items-center',
          'gap-3',
          'md:gap-4',
          'p-3',
          'md:p-4',
          'rounded-lg',
          'border-2',
          'border-gray-200',
          'dark:border-gray-700',
          'bg-white',
          'dark:bg-gray-800',
          'hover:border-primary',
          'hover:bg-primary/5',
          'dark:hover:bg-primary/10',
          'transition-all',
          'cursor-pointer',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-primary/50'
        )}
      >
        <div
          className={cn(
            'flex',
            'h-10',
            'md:h-12',
            'w-10',
            'md:w-12',
            'items-center',
            'justify-center',
            'rounded-full',
            'bg-green-100',
            'dark:bg-green-900/30',
            'flex-shrink-0'
          )}
        >
          <FileText
            className={cn(
              'h-5',
              'md:h-6',
              'w-5',
              'md:w-6',
              'text-green-600',
              'dark:text-green-400'
            )}
          />
        </div>
        <div className={cn('flex-1', 'text-center', 'md:text-left')}>
          <h4
            className={cn(
              'font-medium',
              'text-sm',
              'md:text-base',
              'text-text',
              'dark:text-dark-text',
              'mb-1'
            )}
          >
            {t('dashboard:createNote') || 'Создать заметку'}
          </h4>
          <p
            className={cn(
              'text-xs',
              'md:text-sm',
              'text-secondary',
              'dark:text-dark-secondary',
              'line-clamp-2'
            )}
          >
            {t('dashboard:createNoteDescription') ||
              'Новая заметка в выбранной папке'}
          </p>
        </div>
      </button>
    </div>
  );
};
