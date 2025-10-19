import type { FileTreeItem } from 'widgets/hooks';

export const findItemById = (
  items: FileTreeItem[],
  targetId: string
): FileTreeItem | null => {
  for (const item of items) {
    if (item.id === targetId) {
      return item;
    }
    if (item.children) {
      const found = findItemById(item.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

export const getItemPath = (item: FileTreeItem, fileTree: FileTreeItem[]): string => {
  const findPath = (
    items: FileTreeItem[],
    targetId: string,
    currentPath: string[] = []
  ): string[] | null => {
    for (const currentItem of items) {
      if (currentItem.id === targetId) {
        return [...currentPath, currentItem.title];
      }
      if (currentItem.children) {
        const found = findPath(currentItem.children, targetId, [
          ...currentPath,
          currentItem.title,
        ]);
        if (found) return found;
      }
    }
    return null;
  };

  if (item.type === 'note' && item.parentId) {
    const path = findPath(fileTree, item.parentId);
    return path ? path.join(' / ') : '';
  }
  return '';
};
