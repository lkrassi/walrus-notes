import { type FC, useRef } from 'react';
import { cn } from 'shared/lib/cn';
import type { WebsocketProvider } from 'y-websocket';
import type * as Y from 'yjs';
import '../../../../app/styles/codemirror.css';
import { useEditorSetup } from '../../lib/useEditorSetup';
import { useYjsSync } from '../../lib/useYjsSync';

interface CollaborativeEditorProps {
  ytext: Y.Text;
  provider: WebsocketProvider;
  disabled?: boolean;
  className?: string;
  onContentChange?: (content: string) => void;
  isContentLoaded?: boolean;
}

export const CollaborativeEditor: FC<CollaborativeEditorProps> = ({
  ytext,
  provider,
  disabled = false,
  className,
  onContentChange,
  isContentLoaded = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null!);

  const viewRef = useEditorSetup({
    editorRef,
    ytext,
    provider,
    disabled,
    isContentLoaded,
  });

  useYjsSync({
    ytext,
    viewRef,
    onContentChange,
  });

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
