import { motion } from 'framer-motion';
import { memo, type FC } from 'react';
import { cn } from 'shared/lib/cn';
import { MarkdownEditor } from '../MarkdownEditor';
import type { EditorPanelProps } from './types';

export const EditorPanel: FC<EditorPanelProps> = memo(function EditorPanel({
  payload,
  onPayloadChange,
  isLoading,
  isEditing,
  isResizing,
  isDesktop,
  leftWidth,
  min,
  max,
  widthValue,
  heightValue,
  textareaRef,
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
  );
});
