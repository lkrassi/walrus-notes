import { NoteViewer } from 'features/notes/ui/components/NoteViewer';
import { useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import { PrivateHeader, Sidebar, useLocalization } from 'widgets';
import type { FileTreeItem } from 'widgets/hooks/useFileTree';

export const DashBoard = () => {
  const { t } = useLocalization();
  const [selectedItem, setSelectedItem] = useState<FileTreeItem | null>(null);

  const handleItemSelect = (item: FileTreeItem) => {
    setSelectedItem(item);
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
            onNoteUpdated={(updatedNote: Note) => {
            }}
            onNoteDeleted={(noteId: string) => {
              setSelectedItem(null);
            }}
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
      <div className='grid h-[calc(100vh-4rem)] grid-cols-[auto_1fr] max-md:block'>
        <Sidebar onItemSelect={handleItemSelect} />
        <main className='flex h-full flex-col'>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
