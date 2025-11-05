import type { DashboardTab } from 'app/store/slices/tabsSlice';
import {
  closeTab,
  openTab,
  reorderTabs,
  switchTab,
  updateTabNote,
} from 'app/store/slices/tabsSlice';
import { Tabs } from 'features/dashboard/ui/components/Tabs';
import { NotesGraph } from 'features/graph/ui/components/NotesGraph';
import { NoteViewer } from 'features/notes/ui/components/NoteViewer';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem } from 'widgets/hooks';
import { useIsMobile } from 'widgets/hooks';
import { useAppDispatch, useTabs } from 'widgets/hooks/redux';
import { useLocalization } from 'widgets/hooks/useLocalization';

interface DashboardContentProps {
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
  onItemSelect?: (item: FileTreeItem) => void;
}

export const DashboardContent = ({ onNoteOpen }: DashboardContentProps) => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const { openTabs } = useTabs();

  const isMobile = useIsMobile();

  const activeTab = openTabs.find(tab => tab.isActive);

  const handleTabClick = (tabId: string) => {
    dispatch(switchTab(tabId));
  };

  const handleTabClose = (tabId: string) => {
    dispatch(closeTab(tabId));
  };

  const handleTabReorder = (tabs: DashboardTab[]) => {
    dispatch(reorderTabs(tabs));
  };

  const handleNoteUpdated = (noteId: string, updates: Partial<Note>) => {
    dispatch(updateTabNote({ noteId, updates }));
  };

  const handleItemSelect = (item: FileTreeItem) => {
    const tabId = `${item.type}-${item.id}`;
    const existingTab = openTabs.find(tab => tab.id === tabId);

    if (existingTab) {
      dispatch(switchTab(tabId));
    } else {
      dispatch(openTab(item));
      dispatch(switchTab(tabId));
    }
  };

  const handleNoteOpenFromGraph = (noteData: {
    noteId: string;
    note: Note;
  }) => {
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
    };

    handleItemSelect(noteItem);
  };

  const renderContent = () => {
    if (!activeTab) {
      return (
        <div className='bg-bg dark:bg-dark-bg flex h-full items-center justify-center'>
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

    if (activeTab.item.type === 'note') {
      const note = activeTab.item.note;

      if (!note) {
        return (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <p className='text-secondary dark:text-dark-secondary'>
                Загрузка заметки...
              </p>
            </div>
          </div>
        );
      }

      return (
        <NoteViewer
          note={note}
          layoutId={activeTab.item.parentId || note.layoutId || ''}
          onNoteUpdated={updatedNote =>
            handleNoteUpdated(updatedNote.id, {
              title: updatedNote.title,
              payload: updatedNote.payload,
            })
          }
          onNoteDeleted={() => {
            handleTabClose(activeTab.id);
          }}
        />
      );
    }

    if (!isMobile) {
      if (activeTab.item.type === 'layout' || activeTab.item.type === 'graph') {
        const layoutId =
          activeTab.item.type === 'layout'
            ? activeTab.item.id
            : activeTab.item.layoutId;

        if (!layoutId) {
          return (
            <div className='flex h-full items-center justify-center'>
              <div className='text-center'>
                <p className='text-secondary dark:text-dark-secondary'>
                  Ошибка: не указан layoutId
                </p>
              </div>
            </div>
          );
        }

        return (
          <NotesGraph
            layoutId={layoutId}
            onNoteOpen={handleNoteOpenFromGraph}
          />
        );
      }
    }

    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <p className='text-secondary dark:text-dark-secondary'>
            Неподдерживаемый тип вкладки
          </p>
        </div>
      </div>
    );
  };

  return (
    <main className='flex min-h-0 min-w-0 flex-1 flex-col'>
      {openTabs.length > 0 && (
        <Tabs
          tabs={openTabs}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onTabReorder={handleTabReorder}
        />
      )}
      <div className='min-h-0 flex-1'>{renderContent()}</div>
    </main>
  );
};
