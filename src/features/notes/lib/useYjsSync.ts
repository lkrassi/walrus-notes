import type { EditorView } from '@codemirror/view';
import { useEffect, useRef, type MutableRefObject } from 'react';
import type * as Y from 'yjs';

interface UseYjsSyncProps {
  ytext: Y.Text | null;
  viewRef: MutableRefObject<EditorView | null>;
  onContentChange?: (content: string) => void;
}

export const useYjsSync = ({
  ytext,
  viewRef,
  onContentChange,
}: UseYjsSyncProps) => {
  const onContentChangeRef = useRef(onContentChange);
  const pendingFrameRef = useRef<number | null>(null);
  const latestContentRef = useRef<string>('');
  const selectionPendingRef = useRef<{ anchor: number; head: number } | null>(
    null
  );
  const selectionPendingFrameRef = useRef<number | null>(null);

  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  useEffect(() => {
    if (!ytext) return;

    const handleYTextChange = (event: Y.YTextEvent) => {
      latestContentRef.current = ytext.toString();

      try {
        const transaction = (event as any).transaction as
          | { local?: boolean }
          | undefined;
        const isLocal = !!(transaction && transaction.local);

        if (!isLocal && viewRef.current) {
          const delta = event.delta as
            | Array<{ retain?: number; insert?: string; delete?: number }>
            | undefined;
          if (Array.isArray(delta)) {
            let index = 0;
            const sel = viewRef.current.state.selection.main;
            let anchor = sel.anchor;
            let head = sel.head;

            for (const op of delta) {
              if (op.retain) {
                index += op.retain;
              } else if (op.insert) {
                const L = String(op.insert).length;
                if (index <= anchor) anchor += L;
                if (index <= head) head += L;
                index += L;
              } else if (op.delete) {
                const del = op.delete as number;
                const delStart = index;
                const delEnd = index + del;

                if (delEnd <= anchor) {
                  anchor -= del;
                } else if (delStart <= anchor && anchor < delEnd) {
                  anchor = delStart;
                }

                if (delEnd <= head) {
                  head -= del;
                } else if (delStart <= head && head < delEnd) {
                  head = delStart;
                }
              }
            }

            if (anchor !== sel.anchor || head !== sel.head) {
              selectionPendingRef.current = { anchor, head };
              if (selectionPendingFrameRef.current === null) {
                selectionPendingFrameRef.current = requestAnimationFrame(() => {
                  selectionPendingFrameRef.current = null;
                  const pending = selectionPendingRef.current;
                  selectionPendingRef.current = null;
                  if (!pending || !viewRef.current) return;
                  const docLen = viewRef.current.state.doc.length;
                  const clampedAnchor = Math.max(
                    0,
                    Math.min(pending.anchor, docLen)
                  );
                  const clampedHead = Math.max(
                    0,
                    Math.min(pending.head, docLen)
                  );
                  try {
                    viewRef.current.dispatch({
                      selection: { anchor: clampedAnchor, head: clampedHead },
                    });
                  } catch (_e) {}
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('handleYTextChange error', e);
      }

      if (pendingFrameRef.current !== null) {
        return;
      }
      pendingFrameRef.current = requestAnimationFrame(() => {
        pendingFrameRef.current = null;
        const callback = onContentChangeRef.current;
        if (callback) {
          callback(latestContentRef.current);
        }
      });
    };

    ytext.observe(handleYTextChange);

    return () => {
      ytext.unobserve(handleYTextChange);
      if (pendingFrameRef.current !== null) {
        cancelAnimationFrame(pendingFrameRef.current);
        pendingFrameRef.current = null;
      }
      if (selectionPendingFrameRef.current !== null) {
        cancelAnimationFrame(selectionPendingFrameRef.current);
        selectionPendingFrameRef.current = null;
      }
      selectionPendingRef.current = null;
    };
  }, [ytext, viewRef]);
};
