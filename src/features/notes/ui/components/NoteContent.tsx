import { useEffect, useRef } from 'react';
import { Textarea } from 'shared';
import cn from 'shared/lib/cn';
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
      <Textarea
        ref={textareaRef}
        value={payload}
        onChange={e => onPayloadChange(e.target.value)}
        className={cn(
          'no-border',
          'rounded-none',
          'bg-transparent',
          'resize-none',
          'h-full',
          'p-4',
          'outline-none'
        )}
        placeholder={t('notes:noteContentPlaceholder')}
        disabled={isLoading}
        rows={6}
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
    <div className={cn('h-full', 'overflow-y-auto', 'p-4')}>
      <div className={cn('prose', 'dark:prose-invert', 'max-w-none')}>
        {payload ? (
          <div
            className={cn(
              'text-text',
              'dark:text-dark-text',
              'wrap-break-word',
              'whitespace-pre-wrap'
            )}
          >
            {payload}
          </div>
        ) : (
          <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
            {t('notes:emptyNoteMessage')}
          </p>
        )}
      </div>
    </div>
  );
};
