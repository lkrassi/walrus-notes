import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';
import { cn } from '@/shared/lib/core';
import type { FC, ReactNode } from 'react';

interface FileTreeSectionProps {
  title?: string;
  items: FileTreeItemType[];
  renderSectionHeader: (title: string) => ReactNode;
  renderTreeItem: (item: FileTreeItemType, level?: number) => ReactNode;
}

export const FileTreeSection: FC<FileTreeSectionProps> = ({
  title,
  items,
  renderSectionHeader,
  renderTreeItem,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn(title ? 'mb-2' : '')}>
      {title ? renderSectionHeader(title) : null}
      {items.map(item => renderTreeItem(item, 0))}
    </div>
  );
};
