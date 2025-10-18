import { NoteViewer } from 'features/notes/ui/components/NoteViewer';
import { Tabs } from 'features/dashboard/ui/components/Tabs';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem } from 'widgets/hooks';
import { useLocalization } from 'widgets/hooks/useLocalization';

interface DashboardContentProps {
  openTabs: Array<{ id: string; item: FileTreeItem; isActive: boolean }>;
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder: (tabs: Array<{ id: string; item: FileTreeItem; isActive: boolean }>) => void;
  getItemPath: (item: FileTreeItem) => string;
  onNoteUpdated: (noteId: string, updates: Partial<Note>) => void;
}

export const DashboardContent = ({
  openTabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabReorder,
  getItemPath,
  onNoteUpdated,
}: DashboardContentProps) => {
  const { t } = useLocalization();

  const activeTab = openTabs.find(tab => tab.isActive);

  const renderContent = () => {
    if (!activeTab) {
      return (
        <div className='flex h-full items-center justify-center'>
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
                {t('dashboard:noteLoadError')}
              </p>
            </div>
          </div>
        );
      }

      return (
        <NoteViewer
          note={note}
          onNoteUpdated={updatedNote =>
            onNoteUpdated(updatedNote.id, {
              title: updatedNote.title,
              payload: updatedNote.payload,
            })
          }
          onNoteDeleted={() => {
            onTabClose(activeTab.id);
            if (openTabs.length <= 1) {
              window.history.replaceState(null, '', '/dashboard');
            }
          }}
        />
      );
    }

    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <div className='text-secondary dark:text-dark-secondary mx-auto mb-4 h-16 w-16'>
            <svg viewBox='0 0 24 24' fill='currentColor'>
              <path d='M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z' />
            </svg>
          </div>
          <h3 className='text-text dark:text-dark-text mb-2 text-xl font-semibold'>
            {activeTab.item.title}
          </h3>
          <p className='text-secondary dark:text-dark-secondary'>
            {t('dashboard:layoutFolderDescription')}
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
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          onTabReorder={onTabReorder}
          getItemPath={getItemPath}
        />
      )}
      <div className='flex-1 min-h-0'>
        {renderContent()}
      </div>
    </main>
  );
};
