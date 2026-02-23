import { motion } from 'framer-motion';
import { Suspense, lazy, memo, type FC } from 'react';
import { cn } from 'shared/lib/cn';
import { MarkdownEditor } from '../MarkdownEditor';
import type { CollaborativeEditorPanelProps } from './types';

const loadCollaborativeNoteEditor = () =>
  import('../CollaborativeNoteEditor').then(m => {
    return { default: m.CollaborativeNoteEditor };
  });

export const preloadCollaborativeNoteEditor = (): void => {
  void loadCollaborativeNoteEditor();
};

const CollaborativeNoteEditor = lazy(loadCollaborativeNoteEditor);

export const CollaborativeEditorPanel: FC<CollaborativeEditorPanelProps> = memo(
  function CollaborativeEditorPanel({
    payload,
    isLoading,
    isEditing,
    isResizing,
    isDesktop,
    leftWidth,
    min,
    max,
    widthValue,
    heightValue,
    noteId,
    userId,
    userName,
    initialContent,
    onPayloadChange,
    onOnlineUsersChange,
    collaborativeEditorRef,
  }) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={
          isDesktop
            ? { width: widthValue, opacity: 1, scale: 1 }
            : { height: heightValue, opacity: 1, scale: 1 }
        }
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          width: { duration: 0 },
          height: { duration: 0 },
          opacity: { duration: 0.15, ease: 'easeOut' },
          scale: { duration: 0.15, ease: 'easeOut' },
        }}
        className={cn(
          'h-full',
          'bg-transparent',
          'min-h-0',
          'overflow-hidden',
          'relative'
        )}
        style={
          isDesktop && leftWidth && isEditing
            ? {
                minWidth: `${min}px`,
                maxWidth: `${max}px`,
                height: '100%',
              }
            : !isDesktop
              ? { width: '100%' }
              : undefined
        }
      >
        <Suspense
          fallback={
            <div className={cn('h-full', 'min-h-0', 'w-full')}>
              <MarkdownEditor
                value={payload}
                onChange={() => {}}
                disabled={true}
                className={cn('h-full', 'min-h-0', 'w-full')}
              />
            </div>
          }
        >
          <CollaborativeNoteEditor
            ref={collaborativeEditorRef}
            noteId={noteId}
            userId={userId}
            userName={userName}
            initialContent={initialContent}
            disabled={isLoading}
            className={cn('h-full')}
            onContentChange={onPayloadChange}
            onOnlineUsersChange={onOnlineUsersChange}
          />
        </Suspense>
      </motion.div>
    );
  }
);
