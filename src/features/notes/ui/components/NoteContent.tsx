import { useEffect, useRef } from 'react';
import { useLocalization } from 'widgets';

interface NoteContentProps {
  isEditing: boolean;
  payload: string;
  isLoading: boolean;
  onPayloadChange: (payload: string) => void;
}

export const NoteContent: React.FC<NoteContentProps> = ({
  isEditing,
  payload,
  isLoading,
  onPayloadChange,
}) => {
  const { t } = useLocalization();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const focusAndScrollToEnd = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);

      textarea.scrollTop = textarea.scrollHeight;
    }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const timer = setTimeout(focusAndScrollToEnd, 10);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;

      if (textarea.selectionStart === textarea.value.length) {
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
  }, [payload, isEditing]);

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={payload}
        onChange={e => onPayloadChange(e.target.value)}
        className='text-text dark:text-dark-text focus:ring-primary dark:focus:ring-dark-primary h-full w-full resize-none bg-transparent p-4 outline-none'
        placeholder={t('notes:noteContentPlaceholder')}
        disabled={isLoading}
        onClick={e => {
          const textarea = e.currentTarget;
          if (textarea.selectionStart === textarea.value.length) {
            textarea.scrollTop = textarea.scrollHeight;
          }
        }}
      />
    );
  }

  return (
    <div className='h-full overflow-y-auto p-4'>
      <div className='prose dark:prose-invert max-w-none'>
        {payload ? (
          <div className='text-text dark:text-dark-text whitespace-pre-wrap'>
            {payload}
          </div>
        ) : (
          <p className='text-secondary dark:text-dark-secondary italic'>
            {t('notes:emptyNoteMessage')}
          </p>
        )}
      </div>
    </div>
  );
};
