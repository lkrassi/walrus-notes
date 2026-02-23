import { Compartment, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { useEffect, useRef, type RefObject } from 'react';
import type { WebsocketProvider } from 'y-websocket';
import type * as Y from 'yjs';
import { createEditorExtensions } from './editorConfig';

interface UseEditorSetupProps {
  editorRef: RefObject<HTMLDivElement>;
  ytext: Y.Text | null;
  provider: WebsocketProvider | null;
  disabled: boolean;
  isContentLoaded: boolean;
}

export const useEditorSetup = ({
  editorRef,
  ytext,
  provider,
  disabled,
  isContentLoaded,
}: UseEditorSetupProps) => {
  const viewRef = useRef<EditorView | null>(null);
  const editableCompartment = useRef(new Compartment());
  const hasInitiallyFocusedRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current || !ytext || !provider) {
      return;
    }

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: createEditorExtensions(
        ytext,
        provider,
        editableCompartment.current,
        disabled
      ),
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [ytext, provider, editorRef]);

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
  }, [ytext, isContentLoaded]);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: editableCompartment.current.reconfigure(
          EditorView.editable.of(!disabled)
        ),
      });
    }
  }, [disabled]);

  return viewRef;
};
