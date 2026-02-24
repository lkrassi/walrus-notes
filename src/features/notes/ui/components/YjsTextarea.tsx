import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type KeyboardEventHandler,
} from 'react';
import { Textarea } from 'shared';
import { cn } from 'shared/lib/cn';
import type * as Y from 'yjs';
import { useYjsTextareaBinding } from '../../lib/yjs/useYjsTextareaBinding';

export interface YjsTextareaHandle {
  insertText: (text: string) => void;
  focus: () => void;
}

interface YjsTextareaProps {
  ytext: Y.Text | null;
  fallbackContent?: string;
  disabled?: boolean;
  className?: string;
  onContentChange?: (content: string) => void;
}

export const YjsTextarea = forwardRef<YjsTextareaHandle, YjsTextareaProps>(
  (
    {
      ytext,
      fallbackContent = '',
      disabled = false,
      className,
      onContentChange,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useYjsTextareaBinding({
      textareaRef,
      ytext,
      fallbackContent,
      disabled,
      onContentChange,
    });

    useImperativeHandle(
      ref,
      () => ({
        insertText: (text: string) => {
          if (!ytext) return;

          const currentLength = ytext.length;
          if (currentLength > 0) {
            ytext.insert(currentLength, '\n\n' + text);
          } else {
            ytext.insert(0, text);
          }

          if (textareaRef.current) {
            textareaRef.current.focus();
            const newLength = ytext.length;
            textareaRef.current.setSelectionRange(newLength, newLength);
          }
        },
        focus: () => {
          textareaRef.current?.focus();
        },
      }),
      [ytext]
    );

    const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = e => {
      const el = e.currentTarget as HTMLTextAreaElement;
      const { value, selectionStart, selectionEnd } = el;

      if (e.key === 'Tab') {
        e.preventDefault();
        const tab = '  ';

        if (e.shiftKey) {
          const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
          const before = value.slice(lineStart, selectionStart);

          if (before.startsWith(tab)) {
            const newValue =
              value.slice(0, lineStart) +
              before.slice(tab.length) +
              value.slice(selectionEnd);

            el.value = newValue;
            const pos = Math.max(selectionStart - tab.length, lineStart);

            requestAnimationFrame(() => {
              el.setSelectionRange(pos, pos);
              el.dispatchEvent(new Event('input', { bubbles: true }));
            });
          }
        } else {
          const newValue =
            value.slice(0, selectionStart) + tab + value.slice(selectionEnd);

          el.value = newValue;
          const newPos = selectionStart + tab.length;

          requestAnimationFrame(() => {
            el.setSelectionRange(newPos, newPos);
            el.dispatchEvent(new Event('input', { bubbles: true }));
          });
        }
        return;
      }

      if (e.key === 'Enter') {
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const line = value.slice(lineStart, selectionStart);

        const unorderedMatch = line.match(/^\s*([-*+])\s+/);
        if (unorderedMatch) {
          e.preventDefault();
          const marker = unorderedMatch[1] + ' ';
          const insert = '\n' + marker;
          const newValue =
            value.slice(0, selectionStart) + insert + value.slice(selectionEnd);

          el.value = newValue;
          const pos = selectionStart + insert.length;

          requestAnimationFrame(() => {
            el.setSelectionRange(pos, pos);
            el.dispatchEvent(new Event('input', { bubbles: true }));
          });
          return;
        }

        const orderedMatch = line.match(/^\s*(\d+)\.\s+/);
        if (orderedMatch) {
          e.preventDefault();
          const next = Number(orderedMatch[1]) + 1;
          const marker = `${next}. `;
          const insert = '\n' + marker;
          const newValue =
            value.slice(0, selectionStart) + insert + value.slice(selectionEnd);

          el.value = newValue;
          const pos = selectionStart + insert.length;

          requestAnimationFrame(() => {
            el.setSelectionRange(pos, pos);
            el.dispatchEvent(new Event('input', { bubbles: true }));
          });
          return;
        }
      }
    };

    return (
      <div className={cn('relative', 'h-full', className)}>
        <Textarea
          ref={textareaRef}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          rows={6}
          className={cn(
            'no-border',
            'rounded-none',
            'bg-transparent',
            'resize-none',
            'h-full',
            'w-full',
            'px-4',
            'pt-12.5',
            'pb-4',
            'outline-none',
            'font-inherit',
            'text-base',
            'leading-7'
          )}
          aria-label='Collaborative markdown editor'
        />
      </div>
    );
  }
);

YjsTextarea.displayName = 'YjsTextarea';
