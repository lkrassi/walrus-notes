import type { PointerEventHandler, RefObject } from 'react';
import type { Note } from 'shared/model/types/layouts';
import type { AwarenessUser } from '../../../model/useYjsCollaboration';
import type { CollaborativeNoteEditorHandle } from '../CollaborativeNoteEditor';

export interface EditorSplitProps {
  payload: string;
  onPayloadChange: (p: string) => void;
  isLoading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  previewRef: RefObject<HTMLDivElement | null>;
  leftWidth?: number | null;
  min?: number;
  max?: number;
  onDividerPointerDown?: PointerEventHandler<HTMLDivElement>;
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
  collaborativeEditorRef?: RefObject<CollaborativeNoteEditorHandle | null>;
}

export interface EditorPanelProps {
  payload: string;
  onPayloadChange: (p: string) => void;
  isLoading: boolean;
  isEditing: boolean;
  isResizing: boolean;
  isDesktop: boolean;
  leftWidth?: number | null;
  min?: number;
  max?: number;
  widthValue: string;
  heightValue: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export interface CollaborativeEditorPanelProps {
  payload: string;
  onPayloadChange: (p: string) => void;
  isLoading: boolean;
  isEditing: boolean;
  isResizing: boolean;
  isDesktop: boolean;
  leftWidth?: number | null;
  min?: number;
  max?: number;
  widthValue: string;
  heightValue: string;
  noteId: string;
  userId: string;
  userName: string;
  initialContent: string;
  onOnlineUsersChange?: (users: Map<number, AwarenessUser>) => void;
  collaborativeEditorRef: RefObject<CollaborativeNoteEditorHandle | null>;
}

export interface PreviewPanelProps {
  payload: string;
  isEditing: boolean;
  isDesktop: boolean;
  note?: Note;
  layoutId?: string;
  previewRef: RefObject<HTMLDivElement | null>;
}

export interface DividerProps {
  isEditing: boolean;
  isDesktop: boolean;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
}
