import type { DashboardTab } from '@/entities';
import {
  closeTab,
  openTab,
  reorderTabs,
  switchTab,
  updateTabNote,
} from '@/entities';
import { CreateLayoutForm } from '@/features/layout';
import { CreateNoteForm } from '@/features/notes/ui/components/CreateNoteForm';
import { NoteViewer } from '@/features/notes/ui/components/NoteViewer';
import { Skeleton } from '@/shared';
import { cn, useModalActions, useModalContext } from '@/shared/lib';
import { useIsMobile } from '@/shared/lib/hooks';
import { createTabId, type FileTreeItem, type Note } from '@/shared/model';
import { FileText } from 'lucide-react';
import { lazy, memo, Suspense, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { CreateChoiceModal } from './CreateChoiceModal';
import { EmptyMainFallback } from './EmptyMainFallback';
import { FolderSelectModal } from './FolderSelectModal';
import { Tabs } from './Tabs';
const NotesGraph = lazy(() =>
  import('@/features/graph').then(m => ({
    default: m.NotesGraph,
  }))
);

type RootStateLike = {
  tabs: {
    openTabs: DashboardTab[];
  };
};

interface MainContentProps {
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
  onItemSelect?: (item: FileTreeItem) => void;
}

export const MainContent = memo(function DashboardContent({
  onNoteOpen,
}: MainContentProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { openTabs } = useSelector((state: RootStateLike) => state.tabs);
  const { openModal } = useModalContext();
  const { openModalFromTrigger } = useModalActions();

  const isMobile = useIsMobile();

  const activeTab = openTabs.find(tab => tab.isActive);

  const confirmIfUnsaved = useCallback(
    (action: () => void) => {
      if (!activeTab) {
        action();
        return;
      }

      if (activeTab.item.type !== 'note') {
        action();
        return;
      }

      const note = activeTab.item.note;
      if (!note) {
        action();
        return;
      }

      action();
      return;
    },
    [activeTab]
  );

  const handleTabClick = useCallback(
    (tabId: string) => {
      confirmIfUnsaved(() => dispatch(switchTab(tabId)));
    },
    [confirmIfUnsaved, dispatch]
  );

  const handleTabClose = useCallback(
    (tabId: string) => {
      confirmIfUnsaved(() => dispatch(closeTab(tabId)));
    },
    [confirmIfUnsaved, dispatch]
  );

  const handleTabReorder = useCallback(
    (tabs: DashboardTab[]) => {
      dispatch(reorderTabs(tabs));
    },
    [dispatch]
  );

  const handleNoteUpdated = useCallback(
    (noteId: string, updates: Partial<Note>) => {
      dispatch(updateTabNote({ noteId, updates }));
    },
    [dispatch]
  );

  const handleItemSelect = useCallback(
    (item: FileTreeItem) => {
      const tabId = createTabId(item.type, item.id);
      const existingTab = openTabs.find(tab => tab.id === tabId);

      if (existingTab) {
        confirmIfUnsaved(() => dispatch(switchTab(tabId)));
        return;
      }

      confirmIfUnsaved(() => {
        dispatch(openTab({ ...item, openedFromSidebar: false }));
        dispatch(switchTab(tabId));
      });
    },
    [confirmIfUnsaved, dispatch, openTabs]
  );

  const handleCreateFolder = useCallback(() => {
    openModal(<CreateLayoutForm />, {
      title: t('layout:createLayout') || 'Создать папку',
      size: 'md',
      showCloseButton: true,
    });
  }, [openModal, t]);

  const handleFolderSelected = useCallback(
    (layoutId: string) => {
      openModal(<CreateNoteForm layoutId={layoutId} />, {
        title: t('notes:createNote') || 'Создать заметку',
        size: 'md',
        showCloseButton: true,
      });
    },
    [openModal, t]
  );

  const handleStartNoteCreation = useCallback(() => {
    openModal(<FolderSelectModal onFolderSelected={handleFolderSelected} />, {
      title: '',
      size: 'md',
      showCloseButton: true,
    });
  }, [handleFolderSelected, openModal]);

  const handleFolderClickFromGallery = useCallback(
    (layoutId: string, title: string) => {
      const tabId = createTabId('layout', layoutId);
      const existingTab = openTabs.find(tab => tab.id === tabId);

      if (existingTab) {
        confirmIfUnsaved(() => dispatch(switchTab(tabId)));
        return;
      }

      confirmIfUnsaved(() => {
        dispatch(
          openTab({
            id: layoutId,
            type: 'layout',
            title: title,
            color: '',
            openedFromSidebar: false,
            isMain: false,
          } as FileTreeItem)
        );
        dispatch(switchTab(tabId));
      });
    },
    [confirmIfUnsaved, dispatch, openTabs]
  );

  const handleOnCreateClick = openModalFromTrigger(
    <CreateChoiceModal
      onCreateFolder={handleCreateFolder}
      onCreateNote={handleStartNoteCreation}
    />,
    {
      title: t('dashboard:whatToCreate'),
      size: 'md',
      showCloseButton: true,
    }
  );

  const handleNoteOpenFromGraph = useCallback(
    (noteData: { noteId: string; note: Note }) => {
      if (onNoteOpen) {
        onNoteOpen(noteData);
        return;
      }

      const existingTab = openTabs.find(
        tab => tab.item.type === 'note' && tab.item.id === noteData.noteId
      );

      if (existingTab) {
        handleTabClick(existingTab.id);
        return;
      }

      const noteItem: FileTreeItem = {
        id: noteData.noteId,
        type: 'note',
        title: noteData.note.title,
        parentId: noteData.note.layoutId,
        note: noteData.note,
        isMain: false,
      };

      handleItemSelect(noteItem);
    },
    [handleItemSelect, handleTabClick, onNoteOpen, openTabs]
  );

  const renderContent = () => {
    if (!activeTab) {
      return isMobile ? (
        <EmptyMainFallback
          onFolderClick={handleFolderClickFromGallery}
          onCreateClick={handleOnCreateClick}
        />
      ) : (
        <div
          className={cn(
            'bg-bg',
            'dark:bg-dark-bg',
            'flex',
            'h-full',
            'items-center',
            'justify-center'
          )}
        >
          <div className={cn('text-center')}>
            <div
              className={cn(
                'text-secondary',
                'dark:text-dark-secondary',
                'mx-auto',
                'mb-4',
                'h-16',
                'w-16'
              )}
            >
              <FileText className='h-15 w-15' />{' '}
            </div>
            <h3
              className={cn(
                'text-text',
                'dark:text-dark-text',
                'mb-2',
                'text-xl',
                'font-semibold'
              )}
            >
              {t('main:selectFileOrFolder')}
            </h3>
            <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
              {t('main:selectItemDescription')}
            </p>
          </div>
        </div>
      );
    }

    if (activeTab.item.type === 'note') {
      const note = activeTab.item.note;

      if (!note) {
        return (
          <div
            className={cn('flex', 'h-full', 'items-center', 'justify-center')}
          >
            <div className={cn('text-center')}>
              <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
                Загрузка заметки...
              </p>
            </div>
          </div>
        );
      }

      return (
        <NoteViewer
          key={note.id}
          note={note}
          layoutId={activeTab.item.parentId || note.layoutId || ''}
          openedFromSidebar={!!activeTab.item.openedFromSidebar}
          onNoteUpdated={updatedNote =>
            handleNoteUpdated(updatedNote.id, {
              title: updatedNote.title,
              payload: updatedNote.payload,
              draft: updatedNote.draft,
            })
          }
          onNoteDeleted={() => {
            handleTabClose(activeTab.id);
          }}
        />
      );
    }

    if (activeTab.item.type === 'layout' || activeTab.item.type === 'graph') {
      const layoutId =
        activeTab.item.type === 'layout'
          ? activeTab.item.id
          : activeTab.item.layoutId;

      if (!layoutId) {
        return (
          <div
            className={cn('flex', 'h-full', 'items-center', 'justify-center')}
          >
            <div className={cn('text-center')}>
              <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
                Ошибка: не указан layoutId
              </p>
            </div>
          </div>
        );
      }

      return (
        <Suspense
          fallback={
            <div
              className={cn(
                'h-full',
                'border-border dark:border-dark-border',
                'space-y-3 rounded-xl border p-4'
              )}
            >
              <Skeleton className='h-7 w-2/5' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-[60%] w-full rounded-xl' />
            </div>
          }
        >
          <NotesGraph
            layoutId={layoutId}
            onNoteOpen={handleNoteOpenFromGraph}
            allowNodeDrag={activeTab.item.isMain !== true}
            isMain={activeTab.item.isMain === true}
          />
        </Suspense>
      );
    }

    if (isMobile && activeTab.item.type === 'note') {
      return (
        <div
          className={cn(
            'bg-bg',
            'dark:bg-dark-bg',
            'flex',
            'h-full',
            'items-center',
            'justify-center'
          )}
        >
          <div className={cn('text-center')}>
            <div
              className={cn(
                'text-secondary',
                'dark:text-dark-secondary',
                'mx-auto',
                'mb-4',
                'h-12',
                'w-12'
              )}
            >
              <FileText className='h-15 w-15' />
            </div>
            <h3
              className={cn(
                'text-text',
                'dark:text-dark-text',
                'mb-2',
                'text-lg',
                'font-semibold'
              )}
            >
              Выберите заметку
            </h3>
            <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
              Выберите заметку во вкладках или в сайдбаре
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={cn('flex', 'h-full', 'items-center', 'justify-center')}>
        <div className={cn('text-center')}>
          <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
            Неподдерживаемый тип вкладки
          </p>
        </div>
      </div>
    );
  };

  return (
    <main
      className={cn(
        'flex-col',
        'flex',
        'min-h-0',
        'min-w-0',
        'flex-1',
        'relative'
      )}
    >
      {openTabs.length > 0 && (
        <Tabs
          tabs={openTabs}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onTabReorder={handleTabReorder}
        />
      )}
      <div className={cn('min-h-0', 'flex-1')}>{renderContent()}</div>
    </main>
  );
});
