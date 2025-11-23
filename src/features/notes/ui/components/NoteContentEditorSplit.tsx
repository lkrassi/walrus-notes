import React from 'react';
import { motion } from 'framer-motion';
import cn from 'shared/lib/cn';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';

import type { Note } from 'shared/model/types/layouts';

interface Props {
  payload: string;
  onPayloadChange: (p: string) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  previewRef: React.RefObject<HTMLDivElement | null>;
  leftWidth?: number | null;
  min?: number;
  max?: number;
  onDividerPointerDown?: (e: any) => void;
  isDesktop: boolean;
  note?: Note;
  layoutId?: string;
  enterFromLeft?: boolean;
}

const NoteContentEditorSplit: React.FC<Props> = ({
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
  enterFromLeft = false,
}) => {
  return (
    <motion.div
      key='editing'
      initial={enterFromLeft ? { x: -120, opacity: 0 } : { x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={enterFromLeft ? { x: -120, opacity: 0 } : { x: 120, opacity: 0 }}
      transition={{ duration: 0.22 }}
      className={cn('flex', 'flex-col', 'h-full')}
    >
      <div
        className={cn('flex', 'flex-col', 'md:flex-row', 'flex-1', 'min-h-0')}
      >
        <div
          className={cn(
            'h-full',
            'bg-transparent',
            !isDesktop && 'basis-1/2',
            !isDesktop && 'min-h-0'
          )}
          style={
            isDesktop && leftWidth
              ? {
                  width: `${leftWidth}px`,
                  minWidth: `${min}px`,
                  maxWidth: `${max}px`,
                }
              : undefined
          }
        >
          <MarkdownEditor
            ref={textareaRef}
            value={payload}
            onChange={onPayloadChange}
            disabled={isLoading}
          />
        </div>

        <div
          role='separator'
          aria-orientation='vertical'
          onPointerDown={onDividerPointerDown}
          className={cn(
            'hidden',
            'md:block',
            'h-full',
            'w-2',
            'cursor-col-resize',
            'select-none',
            'touch-none',
            'bg-transparent',
            'hover:bg-border',
            'dark:hover:bg-dark-border'
          )}
        />

        <motion.div
          initial={{ x: 0, opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className={cn(
            'flex-1',
            'h-full',
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
            showRelated={false}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NoteContentEditorSplit;
