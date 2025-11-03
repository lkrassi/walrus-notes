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

export const getItemPath = (
  item: FileTreeItem,
  fileTree: FileTreeItem[]
): string => {
  console.log('🔍 getItemPath called for:', item);
  console.log('📁 fileTree:', fileTree);

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

  if (item.type === 'note') {
    console.log('📝 Processing note:', item.id);
    console.log('📂 Note parentId:', item.parentId);
    console.log('📋 Note data:', item.note);

    let path: string[] | null = null;

    // 1. Пробуем найти по parentId (должен быть установлен)
    if (item.parentId) {
      console.log('🔎 Searching by parentId:', item.parentId);
      path = findPath(fileTree, item.parentId);
      console.log('📌 Path found by parentId:', path);
    }

    // 2. Если не нашли по parentId, пробуем найти по layoutId из данных заметки
    if (!path && item.note?.layoutId) {
      console.log('🔎 Searching by layoutId:', item.note.layoutId);
      path = findPath(fileTree, item.note.layoutId);
      console.log('📌 Path found by layoutId:', path);
    }

    // 3. Если все еще не нашли, ищем саму заметку в дереве
    if (!path) {
      console.log('🔎 Searching note itself in tree:', item.id);
      path = findPath(fileTree, item.id);
      console.log('📌 Path found by note id:', path);
    }

    // 4. Если путь не найден, показываем layoutId для отладки
    const result = path
      ? path.join(' / ')
      : `Layout: ${item.parentId || item.note?.layoutId || 'Неизвестно'}`;
    console.log('🎯 Final path result:', result);
    return result;
  }

  // Для layout ищем путь
  if (item.type === 'layout') {
    console.log('📁 Processing layout:', item.id);
    const path = findPath(fileTree, item.id);
    const result = path ? path.slice(0, -1).join(' / ') : '';
    console.log('🎯 Layout path result:', result);
    return result;
  }

  return '';
};
