import { CreateLayoutForm } from 'features/layout/ui/components/CreateLayoutForm';
import { Menu, Plus, X } from 'lucide-react';
import { forwardRef, useCallback, useImperativeHandle, useState, type Ref } from 'react';
import type { Note } from 'shared/model/types/layouts';
import { useFileTree, useLocalization, useSidebar } from 'widgets/hooks';
import type { FileTreeItem } from 'widgets/hooks/useFileTree';
import { FileTree } from '../fileTree';
import { useModalContext } from '../modal';

interface SidebarProps {
  onItemSelect?: (item: FileTreeItem) => void;
}

const SidebarComponent = ({ onItemSelect }: SidebarProps, ref: Ref<{ updateNoteInTree: (noteId: string, updates: Partial<Note>) => void }>) => {
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

  useImperativeHandle(ref, () => ({ updateNoteInTree }), [updateNoteInTree]);


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
          className='text-secondary dark:text-dark-secondary hover:text-text dark:hover:text-dark-text fixed top-4 left-4 z-50 rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden dark:hover:bg-gray-800'
          title={t('common:menu.open')}
        >
          <Menu className='h-6 w-6' />
        </button>
      )}

      {isMobileOpen && (
        <div
          className='fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300 ease-in-out md:hidden'
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`dark:bg-dark-bg border-border dark:border-dark-border fixed top-0 bottom-0 left-0 z-50 flex w-80 flex-col border-r bg-white transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:flex md:translate-x-0 md:resize-x`}
        style={
          isMobileOpen
            ? {}
            : { minWidth: '200px', maxWidth: '800px', width: '320px' }
        }
      >
        <div className='border-border dark:border-dark-border flex flex-col border-b p-4'>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className='text-secondary dark:text-dark-secondary hover:text-text dark:hover:text-dark-text self-start rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden dark:hover:bg-gray-800'
            title={
              isMobileOpen ? t('common:menu.close') : t('common:menu.open')
            }
          >
            {isMobileOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </button>
          <div className='mt-2 flex items-center justify-between'>
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

export const Sidebar = forwardRef(SidebarComponent);
