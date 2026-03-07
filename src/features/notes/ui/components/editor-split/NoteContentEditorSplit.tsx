import type { CollaborativeNoteEditorHandle } from '../CollaborativeNoteEditor';
import { cn } from '@/shared/lib';
import { LayoutGroup } from 'framer-motion';
import { memo, useRef, type FC } from 'react';
import { CollaborativeEditorPanel } from './CollaborativeEditorPanel';
import { Divider } from './Divider';
import { EditorPanel } from './EditorPanel';
import { PreviewPanel } from './PreviewPanel';
import type { EditorSplitProps } from './types';
import {
  useCollaborativeContent,
  useEditorDimensions,
} from '../../../lib/hooks';

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
              <div>
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
              </div>

              {isEditing && (
                <Divider
                  isEditing={isEditing}
                  isDesktop={isDesktop}
                  onPointerDown={onDividerPointerDown}
                />
              )}

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
            <div>
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
            </div>

            <div>
              {isEditing && (
                <div key='divider'>
                  <Divider
                    isEditing={isEditing}
                    isDesktop={isDesktop}
                    onPointerDown={onDividerPointerDown}
                  />
                </div>
              )}
            </div>

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
