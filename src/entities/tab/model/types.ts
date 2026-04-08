import type { Note } from '@/entities/note';

export type FileTreeItemType = 'layout' | 'note' | 'graph';
export type LayoutAccess = {
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
};

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
  access?: LayoutAccess;
};
