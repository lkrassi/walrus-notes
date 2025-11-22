import React, { useEffect, useRef } from 'react';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import useResizableSplit from 'widgets/hooks/useResizableSplit';
import { syncScroll } from '../../lib/syncScroll';
import { useIsDesktop } from 'widgets/hooks';

import type { Note } from 'shared/model/types/layouts';

interface NoteContentProps {
  isEditing: boolean;
  payload: string;
  isLoading: boolean;
  onPayloadChange: (payload: string) => void;
  note?: Note;
  layoutId?: string;
}

export const NoteContent: React.FC<NoteContentProps> = ({
  isEditing,
  payload,
  isLoading,
  onPayloadChange,
  note,
  layoutId,
}) => {
  const { t } = useLocalization();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const { leftWidth, onDividerPointerDown, min, max } = useResizableSplit({
    storageKey: 'wn.note.split',
  });
  const isDesktop = useIsDesktop();

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

  useEffect(() => {
    if (!isEditing) return;
    const ta = textareaRef.current;
    const pv = previewRef.current;
    const clean = syncScroll(ta, pv);
    return () => {
      try {
        clean();
      } catch (_e) {}
    };
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className={cn('flex', 'flex-col', 'h-full')}>
        <div
          className={cn('flex', 'flex-col', 'md:flex-row', 'flex-1', 'min-h-0')}
        >
          <div
            className={cn(
              'h-full',
              'bg-transparent',
              !isDesktop && 'basis-1/2',
              !isDesktop && 'min-h-0'
            )}
            style={
              isDesktop && leftWidth
                ? {
                    width: `${leftWidth}px`,
                    minWidth: `${min}px`,
                    maxWidth: `${max}px`,
                  }
                : undefined
            }
          >
            <MarkdownEditor
              ref={textareaRef}
              value={payload}
              onChange={onPayloadChange}
              disabled={isLoading}
            />
          </div>

          <div
            role='separator'
            aria-orientation='vertical'
            onPointerDown={onDividerPointerDown}
            className={cn(
              'hidden',
              'md:block',
              'h-full',
              'w-2',
              'cursor-col-resize',
              'select-none',
              'touch-none',
              'bg-transparent',
              'hover:bg-border',
              'dark:hover:bg-dark-border'
            )}
          />

          <div
            className={cn(
              'flex-1',
              'h-full',
              'border-border',
              'dark:border-dark-border',
              isDesktop ? 'border-l' : 'border-t',
              'p-4',
              'bg-transparent',
              !isDesktop && 'basis-1/2',
              !isDesktop && 'min-h-0'
            )}
          >
            <MarkdownPreview
              ref={previewRef}
              content={payload}
              note={note}
              layoutId={layoutId}
              showRelated={!isEditing}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-full', 'overflow-y-auto', 'p-4', 'bg-transparent')}>
      <div className={cn('prose', 'dark:prose-invert', 'max-w-none')}>
        {payload ? (
          <MarkdownPreview
            content={payload}
            note={note}
            layoutId={layoutId}
            showRelated={!isEditing}
          />
        ) : (
          <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
            {t('notes:emptyNoteMessage')}
          </p>
        )}
      </div>
    </div>
  );
};
