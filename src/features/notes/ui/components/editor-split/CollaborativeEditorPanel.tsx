import { motion } from 'framer-motion';
import { Suspense, lazy, memo, type FC } from 'react';
import { Loader } from 'shared';
import { cn } from 'shared/lib/cn';
import type { CollaborativeEditorPanelProps } from './types';

const CollaborativeNoteEditor = lazy(() =>
  import('../CollaborativeNoteEditor').then(m => ({
    default: m.CollaborativeNoteEditor,
  }))
);

export const CollaborativeEditorPanel: FC<CollaborativeEditorPanelProps> = memo(
  function CollaborativeEditorPanel({
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
        initial={false}
        animate={isDesktop ? { width: widthValue } : { height: heightValue }}
        transition={{ duration: isResizing ? 0 : 0.22 }}
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
            <div
              className={cn('flex', 'items-center', 'justify-center', 'h-full')}
            >
              <Loader size='md' text='Инициализация редактора...' />
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
