import { CreateLayoutForm } from 'features/layout/ui/components/CreateLayoutForm';
import { Menu, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { Note } from 'shared/model/types/layouts';
import { useFileTree, useLocalization, useSidebar } from 'widgets/hooks';
import type { FileTreeItem } from 'widgets/hooks/useFileTree';
import { FileTree } from '../fileTree';
import { useModalContext } from '../modal';

interface SidebarProps {
  onItemSelect?: (item: FileTreeItem) => void;
  onNoteUpdated?: (noteId: string, updatedNote: Partial<Note>) => void;
}

export const Sidebar = ({ onItemSelect, onNoteUpdated }: SidebarProps) => {
  const { t } = useLocalization();
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const { openModal } = useModalContext();
  const {
    fileTree,
    isLoading,
    expandedItems,
    toggleExpanded,
    updateNoteInTree,
    addNoteToTree,
    reloadLayouts,
  } = useFileTree();

  const handleCreateLayout = () => {
    openModal(<CreateLayoutForm onLayoutCreated={reloadLayouts} />, {
      title: t('fileTree:createNewLayout'),
      size: 'md',
    });
  };

  const handleItemSelect = (item: FileTreeItem) => {
    setSelectedItemId(item.id);
    onItemSelect?.(item);
    if (item.type === 'note') {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className='md:hidden fixed top-4 left-4 z-50 text-secondary dark:text-dark-secondary hover:text-text dark:hover:text-dark-text rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
          title={t('common:menu.open')}
        >
          <Menu className='h-6 w-6' />
        </button>
      )}

      {isMobileOpen && (
        <div
          className='fixed inset-0 z-40 backdrop-blur-sm md:hidden transition-opacity duration-300 ease-in-out'
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`dark:bg-dark-bg border-border dark:border-dark-border flex flex-col border-r bg-white fixed top-0 bottom-0 left-0 z-50 w-80 transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:resize-x`}
        style={
          isMobileOpen
            ? {}
            : { minWidth: '200px', maxWidth: '800px', width: '320px' }
        }
      >
        <div className='border-border dark:border-dark-border flex flex-col border-b p-4'>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className='md:hidden self-start text-secondary dark:text-dark-secondary hover:text-text dark:hover:text-dark-text rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
            title={isMobileOpen ? t('common:menu.close') : t('common:menu.open')}
          >
            {isMobileOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </button>
          <div className='flex items-center justify-between mt-2'>
            <h2 className='text-text dark:text-dark-text text-lg font-semibold'>
              {t('fileTree:fileStructure')}
            </h2>
            <button
              onClick={handleCreateLayout}
              className='text-secondary dark:text-dark-secondary hover:text-text dark:hover:text-dark-text rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
              title={t('fileTree:createNewLayout')}
            >
              <Plus className='h-5 w-5' />
            </button>
          </div>
        </div>

        <div className='flex-1'>
          <FileTree
            fileTree={fileTree}
            isLoading={isLoading}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
            updateNoteInTree={updateNoteInTree}
            addNoteToTree={addNoteToTree}
            onItemSelect={handleItemSelect}
            selectedItemId={selectedItemId}
          />
        </div>
      </aside>
    </>
  );
};

