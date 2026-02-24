import { type FC, useRef } from 'react';
import { cn } from 'shared/lib/cn';
import type * as Y from 'yjs';
import { YjsTextarea, type YjsTextareaHandle } from './YjsTextarea';

interface CollaborativeEditorProps {
  ytext: Y.Text;
  disabled?: boolean;
  className?: string;
  onContentChange?: (content: string) => void;
}

export const CollaborativeEditor: FC<CollaborativeEditorProps> = ({
  ytext,
  disabled = false,
  className,
  onContentChange,
}) => {
  const editorRef = useRef<YjsTextareaHandle>(null);

  return (
    <div
      className={cn(
        'collaborative-editor',
        'h-full',
        'overflow-hidden',
        'bg-transparent',
        className
      )}
    >
      <YjsTextarea
        ref={editorRef}
        ytext={ytext}
        disabled={disabled}
        onContentChange={onContentChange}
        className='h-full'
      />
    </div>
  );
};
