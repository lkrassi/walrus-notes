import { useEffect, useRef, type RefObject } from 'react';
import type * as Y from 'yjs';

interface UseYjsTextareaBindingProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  ytext: Y.Text | null;
  fallbackContent?: string;
  disabled?: boolean;
  onContentChange?: (content: string) => void;
}

export const useYjsTextareaBinding = ({
  textareaRef,
  ytext,
  fallbackContent = '',
  disabled = false,
  onContentChange,
}: UseYjsTextareaBindingProps) => {
  const onContentChangeRef = useRef(onContentChange);
  const isLocalChangeRef = useRef(false);
  const lastRemoteContentRef = useRef<string>('');

  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  useEffect(() => {
    if (!textareaRef.current) return;

    if (ytext) {
      const initialContent = ytext.toString();
      const hasFallback = fallbackContent.length > 0;
      const hasTextareaValue = textareaRef.current.value.length > 0;

      if (initialContent.length === 0 && hasFallback && hasTextareaValue) {
        return;
      }

      if (textareaRef.current.value !== initialContent) {
        textareaRef.current.value = initialContent;
        lastRemoteContentRef.current = initialContent;
      }
      return;
    }

    if (fallbackContent && textareaRef.current.value === '') {
      textareaRef.current.value = fallbackContent;
      lastRemoteContentRef.current = fallbackContent;
    }
  }, [ytext, textareaRef, fallbackContent]);
  useEffect(() => {
    if (!textareaRef.current || !ytext || disabled) return;

    const textarea = textareaRef.current;

    const handleInput = () => {
      if (!textarea || isLocalChangeRef.current) return;

      const newValue = textarea.value;
      const oldValue = ytext.toString();

      if (newValue === oldValue) return;

      isLocalChangeRef.current = true;

      try {
        const commonPrefixLength = findCommonPrefixLength(oldValue, newValue);
        const commonSuffixLength = findCommonSuffixLength(
          oldValue,
          newValue,
          commonPrefixLength
        );

        const deleteLength =
          oldValue.length - commonPrefixLength - commonSuffixLength;
        const insertText = newValue.slice(
          commonPrefixLength,
          newValue.length - commonSuffixLength
        );

        if (deleteLength > 0) {
          ytext.delete(commonPrefixLength, deleteLength);
        }
        if (insertText.length > 0) {
          ytext.insert(commonPrefixLength, insertText);
        }

        if (onContentChangeRef.current) {
          onContentChangeRef.current(newValue);
        }
      } finally {
        isLocalChangeRef.current = false;
      }
    };

    textarea.addEventListener('input', handleInput);

    return () => {
      textarea.removeEventListener('input', handleInput);
    };
  }, [ytext, textareaRef, disabled]);

  useEffect(() => {
    if (!ytext || !textareaRef.current) return;

    const textarea = textareaRef.current;

    const handleYTextChange = (event: Y.YTextEvent) => {
      if (isLocalChangeRef.current || !textarea) return;

      const newContent = ytext.toString();
      if (textarea.value === newContent) {
        lastRemoteContentRef.current = newContent;
        return;
      }

      const selectionStart = textarea.selectionStart ?? 0;
      const selectionEnd = textarea.selectionEnd ?? 0;

      let newSelectionStart = selectionStart;
      let newSelectionEnd = selectionEnd;

      try {
        const transaction = (event as { transaction?: { local?: boolean } })
          .transaction as { local?: boolean } | undefined;
        const isLocal = !!(transaction && transaction.local);

        if (!isLocal) {
          const delta = event.delta as
            | Array<{ retain?: number; insert?: string; delete?: number }>
            | undefined;

          if (Array.isArray(delta)) {
            let index = 0;

            for (const op of delta) {
              if (op.retain) {
                index += op.retain;
              } else if (op.insert) {
                const insertedLength = String(op.insert).length;

                if (index <= selectionStart) {
                  newSelectionStart += insertedLength;
                }
                if (index <= selectionEnd) {
                  newSelectionEnd += insertedLength;
                }

                index += insertedLength;
              } else if (op.delete) {
                const deletedLength = op.delete as number;
                const deleteStart = index;
                const deleteEnd = index + deletedLength;

                if (deleteEnd <= selectionStart) {
                  newSelectionStart -= deletedLength;
                } else if (
                  deleteStart <= selectionStart &&
                  selectionStart < deleteEnd
                ) {
                  newSelectionStart = deleteStart;
                }

                if (deleteEnd <= selectionEnd) {
                  newSelectionEnd -= deletedLength;
                } else if (
                  deleteStart <= selectionEnd &&
                  selectionEnd < deleteEnd
                ) {
                  newSelectionEnd = deleteStart;
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn(
          'Failed to compute textarea selection after Yjs update',
          error
        );
      }

      textarea.value = newContent;
      lastRemoteContentRef.current = newContent;

      try {
        const maxLength = newContent.length;
        const clampedStart = Math.max(
          0,
          Math.min(newSelectionStart, maxLength)
        );
        const clampedEnd = Math.max(0, Math.min(newSelectionEnd, maxLength));

        textarea.setSelectionRange(clampedStart, clampedEnd);
      } catch (error) {
        console.warn(
          'Failed to restore textarea selection after Yjs update',
          error
        );
      }

      if (onContentChangeRef.current) {
        onContentChangeRef.current(newContent);
      }
    };

    ytext.observe(handleYTextChange);

    return () => {
      ytext.unobserve(handleYTextChange);
    };
  }, [ytext, textareaRef]);
};

function findCommonPrefixLength(str1: string, str2: string): number {
  const minLength = Math.min(str1.length, str2.length);
  let i = 0;
  while (i < minLength && str1[i] === str2[i]) {
    i++;
  }
  return i;
}

function findCommonSuffixLength(
  str1: string,
  str2: string,
  prefixLength: number
): number {
  const maxSuffixLength = Math.min(
    str1.length - prefixLength,
    str2.length - prefixLength
  );
  let i = 0;
  while (
    i < maxSuffixLength &&
    str1[str1.length - 1 - i] === str2[str2.length - 1 - i]
  ) {
    i++;
  }
  return i;
}
