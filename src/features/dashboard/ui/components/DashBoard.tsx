import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { checkAuth } from 'shared/api/checkAuth';
import type { FileTreeItem } from 'widgets/hooks';
import { useFileTree } from 'widgets/hooks';
import { useAppDispatch } from 'widgets/hooks/redux';
import { useGetUserProfileQuery } from 'widgets/model/stores/api';
import { setUserProfile } from 'widgets/model/stores/slices/userSlice';
import { Sidebar } from 'widgets/ui';
import { DashboardContent } from './DashboardContent';
import { DashboardHeader } from './DashboardHeader';

export const DashBoard = () => {
  const dispatch = useAppDispatch();
  const { layoutId, noteId } = useParams<{
    layoutId?: string;
    noteId?: string;
  }>();
  const { fileTree } = useFileTree();
  const sidebarRef = useRef<{
    updateNoteInTree: (
      noteId: string,
      updates: Partial<import('shared/model/types/layouts').Note>
    ) => void;
  }>(null);
  const [openTabs, setOpenTabs] = useState<
    Array<{ id: string; item: FileTreeItem; isActive: boolean }>
  >([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const userId = checkAuth() ? localStorage.getItem('userId') : null;
  const { data: userProfileResponse } = useGetUserProfileQuery(userId || '', {
    skip: !userId,
  });

  useEffect(() => {
    if (userProfileResponse?.data) {
      dispatch(setUserProfile(userProfileResponse.data));
    }
  }, [userProfileResponse, dispatch]);

  useEffect(() => {
    if (layoutId || noteId) {
      const findItemById = (
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

      const targetId = noteId || layoutId;
      if (targetId) {
        const foundItem = findItemById(fileTree, targetId);
        if (foundItem) {
          openTab(foundItem);
        }
      }
    }
  }, [layoutId, noteId, fileTree]);

  const openTab = (item: FileTreeItem) => {
    setOpenTabs(prev => {
      const existingTab = prev.find(tab => tab.id === item.id);
      if (existingTab) {
        // Если вкладка уже открыта, просто активируем её
        return prev.map(tab => ({
          ...tab,
          isActive: tab.id === item.id,
        }));
      } else {
        // Добавляем новую вкладку
        return [
          ...prev.map(tab => ({ ...tab, isActive: false })),
          { id: item.id, item, isActive: true },
        ];
      }
    });
    setActiveTabId(item.id);
  };

  const closeTab = (tabId: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        // Если закрываем активную вкладку, активируем последнюю
        newTabs[newTabs.length - 1].isActive = true;
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      return newTabs;
    });
  };

  const switchTab = (tabId: string) => {
    setOpenTabs(prev =>
      prev.map(tab => ({
        ...tab,
        isActive: tab.id === tabId,
      }))
    );
    setActiveTabId(tabId);

    // Синхронизируем URL с активной вкладкой
    const activeTab = openTabs.find(tab => tab.id === tabId);
    if (activeTab) {
      if (activeTab.item.type === 'note') {
        window.history.replaceState(
          null,
          '',
          `/dashboard/${activeTab.item.parentId}/${activeTab.item.id}`
        );
      } else if (activeTab.item.type === 'layout') {
        window.history.replaceState(
          null,
          '',
          `/dashboard/${activeTab.item.id}`
        );
      }
    }
  };

  const reorderTabs = (
    newTabs: Array<{ id: string; item: FileTreeItem; isActive: boolean }>
  ) => {
    setOpenTabs(newTabs);
  };

  const getItemPath = (item: FileTreeItem): string => {
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

  const handleNoteUpdated = (
    noteId: string,
    updates: Partial<import('shared/model/types/layouts').Note>
  ) => {
    setOpenTabs(prev =>
      prev.map(tab => {
        if (tab.id === noteId && tab.item.type === 'note' && tab.item.note) {
          return {
            ...tab,
            item: {
              ...tab.item,
              note: { ...tab.item.note, ...updates },
              title: updates.title || tab.item.title,
            },
          };
        }
        return tab;
      })
    );

    sidebarRef.current?.updateNoteInTree(noteId, updates);
  };

  const handleItemSelect = (item: FileTreeItem) => {
    openTab(item);
    // Обновляем URL для синхронизации с деревом
    if (item.type === 'note') {
      window.history.replaceState(
        null,
        '',
        `/dashboard/${item.parentId}/${item.id}`
      );
    } else if (item.type === 'layout') {
      window.history.replaceState(null, '', `/dashboard/${item.id}`);
    }
  };

  return (
    <div className='flex h-screen flex-col'>
      <DashboardHeader />
      <div className='flex min-h-0 flex-1 max-md:flex-col'>
        <Sidebar
          ref={sidebarRef}
          onItemSelect={handleItemSelect}
          selectedItemId={activeTabId || undefined}
        />
        <DashboardContent
          openTabs={openTabs}
          activeTabId={activeTabId}
          onTabClick={switchTab}
          onTabClose={closeTab}
          onTabReorder={reorderTabs}
          getItemPath={getItemPath}
          onNoteUpdated={handleNoteUpdated}
        />
      </div>
    </div>
  );
};
