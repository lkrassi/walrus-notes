import { NoteViewer } from 'features/notes/ui/components/NoteViewer';
import { getUserProfile } from 'features/profile/api/getUserProfile';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { checkAuth } from 'shared/api/checkAuth';
import type { Note } from 'shared/model/types/layouts';
import { PrivateHeader, Sidebar, useFileTree, useLocalization } from 'widgets';
import { useAppDispatch } from 'widgets/hooks/redux';
import type { FileTreeItem } from 'widgets/hooks/useFileTree';
import { setUserProfile } from 'widgets/model/stores/slices/userSlice';

export const DashBoard = () => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { layoutId, noteId } = useParams<{
    layoutId?: string;
    noteId?: string;
  }>();
  const { fileTree } = useFileTree();
  const sidebarRef = useRef<{
    updateNoteInTree: (noteId: string, updates: Partial<Note>) => void;
  }>(null);
  const [selectedItem, setSelectedItem] = useState<FileTreeItem | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (checkAuth()) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            const response = await getUserProfile(userId, dispatch);
            dispatch(setUserProfile(response.data));
          } catch (error) {
            console.error('Failed to load user profile:', error);
          }
        }
      }
    };

    loadUserProfile();
  }, [dispatch]);

  useEffect(() => {
    if (layoutId || noteId) {
      let foundItem: FileTreeItem | null = null;

      if (noteId) {
        foundItem = findItemInTree(fileTree || [], noteId);
      } else if (layoutId) {
        foundItem = findItemInTree(fileTree || [], layoutId);
      }

      // Устанавливаем selectedItem только если нашли элемент
      if (foundItem) {
        setSelectedItem(foundItem);
      }
    } else {
      setSelectedItem(null);
    }
  }, [layoutId, noteId, fileTree]);

  const handleNoteUpdated = useCallback(
    (noteId: string, updates: Partial<Note>) => {
      sidebarRef.current?.updateNoteInTree(noteId, updates);
      setSelectedItem(prev => {
        if (prev && prev.id === noteId && prev.type === 'note' && prev.note) {
          return {
            ...prev,
            note: { ...prev.note, ...updates },
            title: updates.title || prev.title,
          };
        }
        return prev;
      });
    },
    []
  );

  const handleItemSelect = (item: FileTreeItem) => {
    // Устанавливаем selectedItem сразу при клике
    setSelectedItem(item);

    // Обновляем URL
    if (item.type === 'layout') {
      navigate(`/dashboard/${item.id}`, { replace: true });
    } else if (item.type === 'note') {
      navigate(`/dashboard/${item.parentId}/${item.id}`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleNoteDeleted = (noteId: string) => {
    navigate('/dashboard', { replace: true });
  };

  const renderContent = () => {
    if (!selectedItem) {
      return (
        <div className='flex flex-1 items-center justify-center'>
          <div className='text-center'>
            <div className='text-secondary dark:text-dark-secondary mx-auto mb-4 h-16 w-16'>
              <svg viewBox='0 0 24 24' fill='currentColor'>
                <path d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' />
              </svg>
            </div>
            <h3 className='text-text dark:text-dark-text mb-2 text-xl font-semibold'>
              {t('dashboard:selectFileOrFolder')}
            </h3>
            <p className='text-secondary dark:text-dark-secondary'>
              {t('dashboard:selectItemDescription')}
            </p>
          </div>
        </div>
      );
    }

    if (selectedItem.type === 'note') {
      const note = selectedItem.note;
      if (!note) {
        return (
          <div className='flex flex-1 items-center justify-center'>
            <div className='text-center'>
              <p className='text-secondary dark:text-dark-secondary'>
                {t('dashboard:noteLoadError')}
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className='flex-1'>
          <NoteViewer
            note={note}
            onNoteUpdated={updatedNote =>
              handleNoteUpdated(updatedNote.id, {
                title: updatedNote.title,
                payload: updatedNote.payload,
              })
            }
            onNoteDeleted={handleNoteDeleted}
          />
        </div>
      );
    }

    return (
      <div className='flex flex-1 items-center justify-center'>
        <div className='text-center'>
          <div className='text-secondary dark:text-dark-secondary mx-auto mb-4 h-16 w-16'>
            <svg viewBox='0 0 24 24' fill='currentColor'>
              <path d='M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z' />
            </svg>
          </div>
          <h3 className='text-text dark:text-dark-text mb-2 text-xl font-semibold'>
            {selectedItem.title}
          </h3>
          <p className='text-secondary dark:text-dark-secondary'>
            {t('dashboard:layoutFolderDescription')}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className='bg-gradient min-h-screen'>
      <PrivateHeader />
      <div className='flex h-[calc(100vh-4rem)] max-md:flex-col'>
        <Sidebar ref={sidebarRef} onItemSelect={handleItemSelect} />
        <main className='flex h-full w-full min-w-0 flex-col overflow-hidden'>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const findItemInTree = (
  items: FileTreeItem[],
  itemId: string
): FileTreeItem | null => {
  for (const item of items) {
    if (item.id === itemId) {
      return item;
    }

    if (item.children && item.children.length > 0) {
      const foundInChildren = findItemInTree(item.children, itemId);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }

  return null;
};
