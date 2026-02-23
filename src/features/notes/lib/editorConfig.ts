import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import type { Extension } from '@codemirror/state';
import { Compartment } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { yCollab } from 'y-codemirror.next';
import type { WebsocketProvider } from 'y-websocket';
import type * as Y from 'yjs';

export const editorTheme = EditorView.theme({
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
});

export const createEditorExtensions = (
  ytext: Y.Text,
  provider: WebsocketProvider,
  editableCompartment: Compartment,
  disabled: boolean
): Extension[] => {
  return [
    EditorView.lineWrapping,
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    markdown(),
    yCollab(ytext, provider.awareness),
    editableCompartment.of(EditorView.editable.of(!disabled)),
    editorTheme,
  ];
};
