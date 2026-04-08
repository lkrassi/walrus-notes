import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';

export interface FileTreeSection {
  id: 'owned' | 'shared' | 'search';
  items: FileTreeItemType[];
}

export interface ActiveDragNote {
  noteId: string;
  title?: string;
}
