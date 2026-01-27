import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Textarea } from 'shared';
import { cn } from 'shared/lib/cn';

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
}

export const MarkdownEditor = forwardRef<
  HTMLTextAreaElement,
  MarkdownEditorProps
>(({ value, onChange, disabled, className }, ref) => {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useImperativeHandle(ref, () => taRef.current as HTMLTextAreaElement);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = e => {
    const el = e.currentTarget as HTMLTextAreaElement;
    const { selectionStart, selectionEnd } = el;

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
          onChange(newValue);
          const pos = Math.max(selectionStart - tab.length, lineStart);
          requestAnimationFrame(() => el.setSelectionRange(pos, pos));
        }
      } else {
        const newValue =
          value.slice(0, selectionStart) + tab + value.slice(selectionEnd);
        onChange(newValue);
        requestAnimationFrame(() =>
          el.setSelectionRange(
            selectionStart + tab.length,
            selectionStart + tab.length
          )
        );
      }
      return;
    }

    if (e.key === 'Enter') {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const line = value.slice(lineStart, selectionStart);
      const unorderedMatch = line.match(/^\s*([-*+])\s+/);
      const orderedMatch = line.match(/^\s*(\d+)\.\s+/);

      if (unorderedMatch) {
        e.preventDefault();
        const marker = unorderedMatch[1] + ' ';
        const insert = '\n' + marker;
        const newValue =
          value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
        onChange(newValue);
        const pos = selectionStart + insert.length;
        requestAnimationFrame(() => el.setSelectionRange(pos, pos));
        return;
      }

      if (orderedMatch) {
        e.preventDefault();
        const next = Number(orderedMatch[1]) + 1;
        const marker = `${next}. `;
        const insert = '\n' + marker;
        const newValue =
          value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
        onChange(newValue);
        const pos = selectionStart + insert.length;
        requestAnimationFrame(() => el.setSelectionRange(pos, pos));
        return;
      }
    }
  };

  return (
    <Textarea
      ref={taRef}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      rows={6}
      className={cn(
        'no-border',
        'rounded-none',
        'bg-transparent',
        'resize-none',
        'h-full',
        'p-4',
        'outline-none',
        className
      )}
    />
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';
