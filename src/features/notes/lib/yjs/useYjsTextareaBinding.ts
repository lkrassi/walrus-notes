import { useEffect, useRef, type RefObject } from 'react';
import type * as Y from 'yjs';

interface UseYjsTextareaBindingProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  ytext: Y.Text | null;
  fallbackContent?: string;
  isContentLoaded?: boolean;
  disabled?: boolean;
  onContentChange?: (content: string) => void;
  onSyncedContentChange?: (content: string) => void;
}

export const useYjsTextareaBinding = ({
  textareaRef,
  ytext,
  fallbackContent = '',
  isContentLoaded = false,
  disabled = false,
  onContentChange,
  onSyncedContentChange,
}: UseYjsTextareaBindingProps) => {
  const isYjsBindingDebug = import.meta.env.DEV;
  const logBinding = (message: string, extra?: Record<string, unknown>) => {
    if (!isYjsBindingDebug || !ytext) return;

    if (extra) {
      console.log(`[yjs-binding][len:${ytext.length}] ${message}`, extra);
      return;
    }

    console.log(`[yjs-binding][len:${ytext.length}] ${message}`);
  };
  const onContentChangeRef = useRef(onContentChange);
  const onSyncedContentChangeRef = useRef(onSyncedContentChange);
  const isLocalChangeRef = useRef(false);
  const lastRemoteContentRef = useRef<string>('');

  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);
  useEffect(() => {
    onSyncedContentChangeRef.current = onSyncedContentChange;
  }, [onSyncedContentChange]);

  useEffect(() => {
    if (!textareaRef.current) return;

    if (ytext) {
      const initialContent = ytext.toString();
      const shouldKeepFallback =
        !isContentLoaded && initialContent.length === 0;
      const nextContent = shouldKeepFallback ? fallbackContent : initialContent;

      if (textareaRef.current.value !== nextContent) {
        logBinding('sync textarea from ytext on mount/update', {
          prevTextareaLength: textareaRef.current.value.length,
          newLength: nextContent.length,
          isContentLoaded,
        });
        textareaRef.current.value = nextContent;
        lastRemoteContentRef.current = nextContent;
        if (!shouldKeepFallback && onSyncedContentChangeRef.current) {
          onSyncedContentChangeRef.current(initialContent);
        }
      }
      return;
    }

    if (fallbackContent && textareaRef.current.value === '') {
      textareaRef.current.value = fallbackContent;
      lastRemoteContentRef.current = fallbackContent;
      if (onSyncedContentChangeRef.current) {
        onSyncedContentChangeRef.current(fallbackContent);
      }
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

      logBinding('local input diff detected', {
        oldLength: oldValue.length,
        newLength: newValue.length,
      });

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

        logBinding('applied local diff into ytext', {
          commonPrefixLength,
          commonSuffixLength,
          deleteLength,
          insertLength: insertText.length,
          resultLength: ytext.length,
        });

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

      const transaction = (event as { transaction?: { local?: boolean } })
        .transaction as { local?: boolean } | undefined;
      const isLocal = !!(transaction && transaction.local);

      logBinding('observe ytext change', {
        localTransaction: !!transaction?.local,
        prevTextareaLength: textarea.value.length,
        newContentLength: newContent.length,
        delta: event.delta,
      });

      const selectionStart = textarea.selectionStart ?? 0;
      const selectionEnd = textarea.selectionEnd ?? 0;

      let newSelectionStart = selectionStart;
      let newSelectionEnd = selectionEnd;

      try {
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
        logBinding('restored textarea selection after remote change', {
          selectionStart,
          selectionEnd,
          clampedStart,
          clampedEnd,
        });
      } catch (error) {
        console.warn(
          'Failed to restore textarea selection after Yjs update',
          error
        );
      }

      if (isLocal && onContentChangeRef.current) {
        onContentChangeRef.current(newContent);
      }
      if (onSyncedContentChangeRef.current) {
        onSyncedContentChangeRef.current(newContent);
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
