import { useMemo } from 'react';
import type { FileTreeItem } from './useFileTree';

export const useSearchSuggestions = (fileTree: FileTreeItem[]) => {
  const allSearchableItems = useMemo(() => {
    const items: string[] = [];
    const collectItems = (tree: FileTreeItem[]) => {
      tree.forEach(item => {
        items.push(item.title);
        if (item.children) {
          collectItems(item.children);
        }
      });
    };
    collectItems(fileTree);
    return [...new Set(items)]; // Убираем дубликаты
  }, [fileTree]);

  return allSearchableItems;
};
