import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import React, { useEffect, useRef } from 'react';
import { cn } from 'shared/lib/cn';
import { yCollab } from 'y-codemirror.next';
import type { WebsocketProvider } from 'y-websocket';
import type * as Y from 'yjs';

interface CollaborativeEditorProps {
  ytext: Y.Text;
  provider: WebsocketProvider;
  disabled?: boolean;
  className?: string;
  onContentChange?: (content: string) => void;
  isContentLoaded?: boolean;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  ytext,
  provider,
  disabled = false,
  className,
  onContentChange,
  isContentLoaded = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const editableCompartment = useRef(new Compartment());
  const onContentChangeRef = useRef(onContentChange);
  const pendingFrameRef = useRef<number | null>(null);
  const latestContentRef = useRef<string>('');
  const hasInitiallyFocusedRef = useRef(false);
  const selectionPendingRef = useRef<{ anchor: number; head: number } | null>(
    null
  );
  const selectionPendingFrameRef = useRef<number | null>(null);

  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  useEffect(() => {
    if (!editorRef.current || !ytext || !provider) {
      return;
    }

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        EditorView.lineWrapping,
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown(),
        yCollab(ytext, provider.awareness),
        editableCompartment.current.of(EditorView.editable.of(!disabled)),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: 'inherit',
          },
          '.cm-content': {
            padding: '16px',
            minHeight: '100%',
          },
          '.cm-ySelectionInfo': {
            position: 'absolute',
            top: '-1.4em',
            left: '-1px',
            fontSize: '0.75em',
            fontFamily: 'sans-serif',
            fontStyle: 'normal',
            fontWeight: 'normal',
            lineHeight: 'normal',
            userSelect: 'none',
            color: 'white',
            paddingLeft: '4px',
            paddingRight: '4px',
            paddingTop: '1px',
            paddingBottom: '1px',
            zIndex: 101,
            borderRadius: '2px',
            whiteSpace: 'nowrap',
          },
          '.cm-ySelectionCaret': {
            position: 'relative',
            borderLeft: '2px solid',
            marginLeft: '-1px',
            marginRight: '-1px',
            boxSizing: 'border-box',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

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
      view.destroy();
      viewRef.current = null;
    };
  }, [ytext, provider]);

  useEffect(() => {
    if (viewRef.current && ytext && isContentLoaded) {
      if (!hasInitiallyFocusedRef.current) {
        const timer = requestAnimationFrame(() => {
          if (viewRef.current) {
            viewRef.current.focus();
            const endPos = viewRef.current.state.doc.length;
            viewRef.current.dispatch({
              selection: { anchor: endPos, head: endPos },
            });
            hasInitiallyFocusedRef.current = true;
          }
        });
        return () => cancelAnimationFrame(timer);
      }
    }
  }, [ytext, provider, isContentLoaded]);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: editableCompartment.current.reconfigure(
          EditorView.editable.of(!disabled)
        ),
      });
    }
  }, [disabled]);

  return (
    <div
      ref={editorRef}
      className={cn(
        'collaborative-editor',
        'h-full',
        'overflow-hidden',
        'bg-transparent',
        className
      )}
    />
  );
};

CollaborativeEditor.displayName = 'CollaborativeEditor';
