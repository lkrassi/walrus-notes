import { motion } from 'framer-motion';
import { useRef } from 'react';
import { cn } from 'shared/lib/cn';
import { CollaborativeNoteEditor } from './CollaborativeNoteEditor';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';

import type { Note } from 'shared/model/types/layouts';
import type { AwarenessUser } from '../../model/useYjsCollaboration';

interface Props {
  payload: string;
  onPayloadChange: (p: string) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  previewRef: React.RefObject<HTMLDivElement | null>;
  leftWidth?: number | null;
  min?: number;
  max?: number;
  onDividerPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  isDesktop: boolean;
  note?: Note;
  layoutId?: string;
  enterFromLeft?: boolean;
  isEditing?: boolean;
  isResizing?: boolean;
  hasLocalChanges?: boolean;
  hasServerDraft?: boolean;
  isSaving?: boolean;
  isPending?: boolean;
  isFullscreen?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDiscardConfirm?: () => void;
  onInsertImage?: (url: string) => void;
  onExport?: () => void;
  onImport?: (content: string) => void;
  onToggleFullscreen?: () => void;
  enableCollaboration?: boolean;
  userId?: string;
  userName?: string;
  onOnlineUsersChange?: (users: Map<number, AwarenessUser>) => void;
}

export const NoteContentEditorSplit: React.FC<Props> = ({
  payload,
  onPayloadChange,
  isLoading,
  textareaRef,
  previewRef,
  leftWidth,
  min,
  max,
  onDividerPointerDown,
  isDesktop,
  note,
  layoutId,
  isEditing = false,
  isResizing = false,
  enableCollaboration = false,
  userId,
  userName,
  onOnlineUsersChange,
}) => {
  const initialContentRef = useRef<string>('');
  const lastNoteIdRef = useRef<string | undefined>(undefined);

  if (enableCollaboration && isEditing && note?.id) {
    const noteIdChanged = lastNoteIdRef.current !== note.id;
    const shouldInitContent = initialContentRef.current === '' && payload;

    if (noteIdChanged || shouldInitContent) {
      initialContentRef.current = payload;
      lastNoteIdRef.current = note.id;
    }
  }
  const computeWidth = () => {
    if (isDesktop) {
      if (isEditing) return leftWidth ? `${leftWidth}px` : '480px';
      return '0px';
    }
    return isEditing ? '50%' : '0%';
  };

  const widthValue = computeWidth();

  const computeHeight = () => {
    if (isDesktop) return '100%';
    return isEditing ? '50%' : '0%';
  };

  const heightValue = computeHeight();

  if (enableCollaboration && isEditing && note?.id && userId && userName) {
    return (
      <div className={cn('flex', 'flex-col', 'h-full')}>
        <div
          className={cn('flex', 'flex-col', 'md:flex-row', 'flex-1', 'min-h-0')}
        >
          <motion.div
            initial={false}
            animate={
              isDesktop ? { width: widthValue } : { height: heightValue }
            }
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
                ? { minWidth: `${min}px`, maxWidth: `${max}px`, height: '100%' }
                : !isDesktop
                  ? { width: '100%' }
                  : undefined
            }
          >
            <CollaborativeNoteEditor
              noteId={note.id}
              userId={userId}
              userName={userName}
              initialContent={initialContentRef.current}
              disabled={isLoading}
              className={cn('h-full')}
              onContentChange={onPayloadChange}
              onOnlineUsersChange={onOnlineUsersChange}
            />
          </motion.div>

          <div
            role='separator'
            aria-orientation={isDesktop ? 'vertical' : 'horizontal'}
            onPointerDown={onDividerPointerDown}
            className={cn(
              isEditing ? 'block' : 'hidden',
              isDesktop
                ? 'h-full w-2 cursor-col-resize'
                : 'h-2 w-full cursor-row-resize',
              'select-none',
              'touch-none',
              'bg-transparent',
              'hover:bg-border',
              'dark:hover:bg-dark-border'
            )}
          />

          <motion.div
            initial={false}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.22 }}
            className={cn(
              'flex-1',
              'h-full',
              'min-h-0',
              'border-border',
              'dark:border-dark-border',
              isDesktop ? 'border-l' : 'border-t',
              'p-4',
              'bg-transparent',
              !isDesktop && 'basis-1/2',
              !isDesktop && 'min-h-0'
            )}
          >
            <MarkdownPreview
              ref={previewRef}
              content={payload}
              note={note}
              layoutId={layoutId}
              showRelated={!isEditing}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex', 'flex-col', 'h-full')}>
      <div
        className={cn('flex', 'flex-col', 'md:flex-row', 'flex-1', 'min-h-0')}
      >
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
              ? { minWidth: `${min}px`, maxWidth: `${max}px`, height: '100%' }
              : !isDesktop
                ? { width: '100%' }
                : undefined
          }
        >
          <div
            className={cn(
              'h-full',
              'p-0',
              !isEditing && 'pointer-events-none',
              !isEditing && 'select-none'
            )}
            aria-hidden={!isEditing}
          >
            <MarkdownEditor
              ref={textareaRef}
              value={payload}
              onChange={onPayloadChange}
              disabled={!isEditing || isLoading}
              className={cn('h-full', 'min-h-0')}
            />
          </div>
        </motion.div>

        <div
          role='separator'
          aria-orientation={isDesktop ? 'vertical' : 'horizontal'}
          onPointerDown={onDividerPointerDown}
          className={cn(
            isEditing ? 'block' : 'hidden',
            isDesktop
              ? 'h-full w-2 cursor-col-resize'
              : 'h-2 w-full cursor-row-resize',
            'select-none',
            'touch-none',
            'bg-transparent',
            'hover:bg-border',
            'dark:hover:bg-dark-border'
          )}
        />

        <motion.div
          initial={false}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.22 }}
          className={cn(
            'flex-1',
            'h-full',
            'min-h-0',
            'border-border',
            'dark:border-dark-border',
            isDesktop ? 'border-l' : 'border-t',
            'p-4',
            'bg-transparent',
            !isDesktop && 'basis-1/2',
            !isDesktop && 'min-h-0'
          )}
        >
          <MarkdownPreview
            ref={previewRef}
            content={payload}
            note={note}
            layoutId={layoutId}
            showRelated={!isEditing}
          />
        </motion.div>
      </div>
    </div>
  );
};
