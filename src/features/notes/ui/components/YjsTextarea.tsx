import { useYjsTextareaBinding } from '@/features/notes/lib/yjs/useYjsTextareaBinding';
import { cn } from '@/shared/lib/cn';
import type { AwarenessUser } from '@/shared/lib/collaboration';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type KeyboardEventHandler,
} from 'react';
import { Textarea } from 'shared';
import type * as Y from 'yjs';
import { RemoteCursorsLayer } from './remote-cursors/RemoteCursorsLayer';

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
  onCursorChange?: (selectionStart: number, selectionEnd: number) => void;
  onlineUsers?: Map<number, AwarenessUser>;
  currentUserId: string;
}

export const YjsTextarea = forwardRef<YjsTextareaHandle, YjsTextareaProps>(
  (
    {
      ytext,
      fallbackContent = '',
      disabled = false,
      className,
      onContentChange,
      onCursorChange,
      onlineUsers,
      currentUserId,
    },
    ref
  ) => {
    const isPresenceDebug = import.meta.env.DEV;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const cursorRafRef = useRef<number | null>(null);

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

    const publishCursor = useCallback(() => {
      if (!onCursorChange || !textareaRef.current) {
        return;
      }

      const { selectionStart, selectionEnd } = textareaRef.current;
      onCursorChange(selectionStart ?? 0, selectionEnd ?? 0);
    }, [isPresenceDebug, onCursorChange]);

    const scheduleCursorPublish = useCallback(() => {
      if (cursorRafRef.current !== null) {
        return;
      }

      cursorRafRef.current = requestAnimationFrame(() => {
        cursorRafRef.current = null;
        publishCursor();
      });
    }, [publishCursor]);

    useEffect(() => {
      scheduleCursorPublish();
      return () => {
        if (cursorRafRef.current !== null) {
          cancelAnimationFrame(cursorRafRef.current);
          cursorRafRef.current = null;
        }
      };
    }, [scheduleCursorPublish]);

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
              scheduleCursorPublish();
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
            scheduleCursorPublish();
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
            scheduleCursorPublish();
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
            scheduleCursorPublish();
          });
          return;
        }
      }
    };

    const awarenessUsers = onlineUsers ? Array.from(onlineUsers.values()) : [];

    return (
      <div className={cn('relative', 'h-full', className)}>
        <Textarea
          ref={textareaRef}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onSelect={scheduleCursorPublish}
          onClick={scheduleCursorPublish}
          onKeyUp={scheduleCursorPublish}
          onMouseUp={scheduleCursorPublish}
          onFocus={scheduleCursorPublish}
          onInput={scheduleCursorPublish}
          rows={6}
          autoFocus
          className={cn(
            'no-border',
            'rounded-none',
            'bg-transparent',
            'resize-none',
            'h-full',
            'w-full',
            'relative',
            'z-10',
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

        <RemoteCursorsLayer
          textareaRef={textareaRef}
          users={awarenessUsers}
          currentUserId={currentUserId}
        />
      </div>
    );
  }
);

YjsTextarea.displayName = 'YjsTextarea';
