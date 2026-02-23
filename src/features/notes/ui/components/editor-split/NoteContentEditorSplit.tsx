import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { memo, useEffect, useRef, type FC } from 'react';
import { cn } from 'shared/lib/cn';
import type { CollaborativeNoteEditorHandle } from '../CollaborativeNoteEditor';
import {
  CollaborativeEditorPanel,
  preloadCollaborativeNoteEditor,
} from './CollaborativeEditorPanel';
import { Divider } from './Divider';
import { EditorPanel } from './EditorPanel';
import { PreviewPanel } from './PreviewPanel';
import type { EditorSplitProps } from './types';
import { useCollaborativeContent } from './useCollaborativeContent';
import { useEditorDimensions } from './useEditorDimensions';

export const NoteContentEditorSplit: FC<EditorSplitProps> = memo(
  function NoteContentEditorSplit({
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
    collaborativeEditorRef: externalCollaborativeEditorRef,
  }) {
    const localCollaborativeEditorRef =
      useRef<CollaborativeNoteEditorHandle>(null);
    const collaborativeEditorRef =
      externalCollaborativeEditorRef || localCollaborativeEditorRef;

    const { widthValue, heightValue } = useEditorDimensions({
      isDesktop,
      isEditing,
      leftWidth,
    });

    useEffect(() => {
      if (enableCollaboration && isEditing) {
        preloadCollaborativeNoteEditor();
      }
    }, [enableCollaboration, isEditing]);

    const initialContent = useCollaborativeContent({
      enableCollaboration,
      isEditing,
      noteId: note?.id,
      payload,
    });

    if (enableCollaboration && isEditing && note?.id && userId && userName) {
      return (
        <div className={cn('flex', 'flex-col', 'h-full')}>
          <LayoutGroup>
            <div
              className={cn(
                'flex',
                'flex-col',
                'md:flex-row',
                'flex-1',
                'min-h-0',
                'relative',
                'overflow-hidden'
              )}
            >
              <AnimatePresence initial={false}>
                {isEditing && (
                  <CollaborativeEditorPanel
                    key='collaborative-editor'
                    payload={payload}
                    onPayloadChange={onPayloadChange}
                    isLoading={isLoading}
                    isEditing={isEditing}
                    isResizing={isResizing}
                    isDesktop={isDesktop}
                    leftWidth={leftWidth}
                    min={min}
                    max={max}
                    widthValue={widthValue}
                    heightValue={heightValue}
                    noteId={note.id}
                    userId={userId}
                    userName={userName}
                    initialContent={initialContent}
                    onOnlineUsersChange={onOnlineUsersChange}
                    collaborativeEditorRef={collaborativeEditorRef}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {isEditing && (
                  <motion.div
                    key='divider-collab'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <Divider
                      isEditing={isEditing}
                      isDesktop={isDesktop}
                      onPointerDown={onDividerPointerDown}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <PreviewPanel
                payload={payload}
                isEditing={isEditing}
                isDesktop={isDesktop}
                note={note}
                layoutId={layoutId}
                previewRef={previewRef}
              />
            </div>
          </LayoutGroup>
        </div>
      );
    }

    return (
      <div className={cn('flex', 'flex-col', 'h-full')}>
        <LayoutGroup>
          <div
            className={cn(
              'flex',
              'flex-col',
              'md:flex-row',
              'flex-1',
              'min-h-0',
              'relative',
              'overflow-hidden'
            )}
          >
            <AnimatePresence initial={false}>
              {isEditing && (
                <EditorPanel
                  key='editor'
                  payload={payload}
                  onPayloadChange={onPayloadChange}
                  isLoading={isLoading}
                  isEditing={isEditing}
                  isResizing={isResizing}
                  isDesktop={isDesktop}
                  leftWidth={leftWidth}
                  min={min}
                  max={max}
                  widthValue={widthValue}
                  heightValue={heightValue}
                  textareaRef={textareaRef}
                />
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {isEditing && (
                <motion.div
                  key='divider'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <Divider
                    isEditing={isEditing}
                    isDesktop={isDesktop}
                    onPointerDown={onDividerPointerDown}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <PreviewPanel
              payload={payload}
              isEditing={isEditing}
              isDesktop={isDesktop}
              note={note}
              layoutId={layoutId}
              previewRef={previewRef}
            />
          </div>
        </LayoutGroup>
      </div>
    );
  }
);
