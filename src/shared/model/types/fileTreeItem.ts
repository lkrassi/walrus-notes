import type { Note } from './layouts';

export type FileTreeItemType = 'layout' | 'note' | 'graph';

export type FileTreeItem = {
  id: string;
  type: FileTreeItemType;
  title: string;
  isMain: boolean;
  color?: string;
  children?: FileTreeItem[];
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
  note?: Note;
  layoutId?: string;
  openedFromSidebar?: boolean;
};
