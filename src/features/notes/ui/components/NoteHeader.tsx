import { Edit3, Save, X, CircleQuestionMark, Code } from 'lucide-react';
import { Button, Input } from 'shared';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { MarkdownHelp } from './MarkdownHelp';

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
  const { openModalFromTrigger } = useModalActions();

  const handleOpenMarkdownHelp = openModalFromTrigger(<MarkdownHelp />, {
    title: t('notes:markdownGuide'),
    size: 'lg',
  });

  return (
    <div className={cn('panel-header')}>
      <div className={cn('min-w-0', 'flex-1')}>
        {isEditing ? (
          <Input
            type='text'
            ring={false}
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className={cn('w-[50%]', 'border-none', 'max-sm:w-full')}
            disabled={isLoading}
          />
        ) : (
          <p className={cn('note-title')}>{title}</p>
        )}
      </div>

      <div className={cn('flex', 'gap-2')}>
        {isEditing ? (
          <>
            <Button
              onClick={onSave}
              className={cn('px-4', 'py-2')}
              disabled={isLoading}
              title={t('notes:save')}
              variant='submit'
            >
              <Save className={cn('h-4', 'w-4')} />
            </Button>
            <Button
              onClick={onCancel}
              className={cn('px-4', 'py-2')}
              disabled={isLoading}
              title={t('notes:cancel')}
              variant='escape'
            >
              <X className={cn('h-4', 'w-4')} />
            </Button>
          </>
        ) : (
          <Button
            onClick={onEdit}
            className={cn('px-4', 'py-2')}
            title={t('notes:edit')}
            variant='default'
          >
            <Edit3 className={cn('h-4', 'w-4')} />
          </Button>
        )}
        <Button
          onClick={handleOpenMarkdownHelp}
          className={cn('px-4', 'py-2')}
          title={t('notes:editorHelp')}
          variant='default'
        >
          <CircleQuestionMark className={cn('h-4', 'w-4')} />
        </Button>
      </div>
    </div>
  );
};
