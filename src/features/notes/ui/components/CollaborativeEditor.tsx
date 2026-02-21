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

    const handleYTextChange = () => {
      const content = ytext.toString();
      const callback = onContentChangeRef.current;
      if (callback) {
        callback(content);
      }
    };

    ytext.observe(handleYTextChange);

    return () => {
      ytext.unobserve(handleYTextChange);
      view.destroy();
      viewRef.current = null;
    };
  }, [ytext, provider, disabled]);

  useEffect(() => {
    if (viewRef.current && ytext && isContentLoaded) {
      const timer = requestAnimationFrame(() => {
        if (viewRef.current) {
          viewRef.current.focus();
          const endPos = viewRef.current.state.doc.length;
          viewRef.current.dispatch({
            selection: { anchor: endPos, head: endPos },
          });
        }
      });
      return () => cancelAnimationFrame(timer);
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
