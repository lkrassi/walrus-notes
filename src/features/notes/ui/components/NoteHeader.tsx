import { Edit3, Save, X } from 'lucide-react';
import { Button, Input } from 'shared';
import { useLocalization } from 'widgets';

interface NoteHeaderProps {
  isEditing: boolean;
  title: string;
  isLoading: boolean;
  onTitleChange: (title: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const NoteHeader: React.FC<NoteHeaderProps> = ({
  isEditing,
  title,
  isLoading,
  onTitleChange,
  onEdit,
  onSave,
  onCancel,
}) => {
  const { t } = useLocalization();

  return (
    <div className='border-border dark:border-dark-border flex items-center justify-between border-b p-4'>
      <div className='min-w-0 flex-1'>
        {isEditing ? (
          <Input
            type='text'
            ring={false}
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className='w-[50%] border-none'
            disabled={isLoading}
          />
        ) : (
          <p className='text-text dark:text-dark-text max-w-md truncate px-3 py-2'>
            {title}
          </p>
        )}
      </div>

      <div className='flex gap-2'>
        {isEditing ? (
          <>
            <Button
              onClick={onSave}
              className='bg-btn-bg px-3 py-2 hover:opacity-90'
              disabled={isLoading}
              title={t('notes:save')}
              variant='submit'
            >
              <Save className='h-4 w-4' />
            </Button>
            <Button
              onClick={onCancel}
              className='px-3 py-2 shadow-[0_8px_0_0_#9f9090] hover:opacity-90 active:translate-y-1.5 active:shadow-[0_1px_0_0_#9f9090]'
              disabled={isLoading}
              title={t('notes:cancel')}
              variant='escape'
            >
              <X className='h-4 w-4' />
            </Button>
          </>
        ) : (
          <Button
            onClick={onEdit}
            className='bg-btn-bg px-3 py-2 hover:opacity-90'
            title={t('notes:edit')}
            variant='default'
          >
            <Edit3 className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
};
