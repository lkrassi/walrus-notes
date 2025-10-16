import { CreateLayoutForm } from 'features/layout/ui/components/CreateLayoutForm';
import { Menu, Plus, X } from 'lucide-react';
import { forwardRef, useImperativeHandle, useState, type Ref } from 'react';
import { useParams } from 'react-router-dom';
import type { Note } from 'shared/model/types/layouts';
import {
  useFileTree,
  useLocalization,
  useSearchSuggestions,
  useSidebar,
} from 'widgets/hooks';
import type { FileTreeItem } from 'widgets/hooks/useFileTree';
import { FileTree } from '../fileTree';
import { useModalContext } from '../modal';
import { SearchInput } from './SearchInput';

type SidebarProps = {
  onItemSelect?: (item: FileTreeItem) => void;
};

const SidebarComponent = (
  { onItemSelect }: SidebarProps,
  ref: Ref<{
    updateNoteInTree: (noteId: string, updates: Partial<Note>) => void;
  }>
) => {
  const { t } = useLocalization();
  const { layoutId, noteId } = useParams<{
    layoutId?: string;
    noteId?: string;
  }>();
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const { openModal } = useModalContext();
  const {
    fileTree,
    expandedItems,
    toggleExpanded,
    updateNoteInTree,
    addNoteToTree,
    reloadLayouts,
  } = useFileTree();

  const allSearchableItems = useSearchSuggestions(fileTree);

  useImperativeHandle(ref, () => ({ updateNoteInTree }), [updateNoteInTree]);

  const selectedItemId = noteId || layoutId;

  const handleCreateLayout = () => {
    openModal(<CreateLayoutForm onLayoutCreated={reloadLayouts} />, {
      title: t('fileTree:createNewLayout'),
      size: 'md',
    });
  };

  const handleItemSelect = (item: FileTreeItem) => {
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
          className='text-secondary hover:text-text dark:text-dark-secondary dark:hover:text-dark-text fixed top-4 left-4 z-50 rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden dark:hover:bg-gray-800'
          title={t('common:menu.open')}
          aria-label={t('common:menu.open')}
        >
          <Menu className='h-6 w-6' />
        </button>
      )}

      {isMobileOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden'
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        data-tour="sidebar"
        className={`text-text border-border fixed top-0 bottom-0 left-0 z-50 flex w-80 flex-col border-r bg-white transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} dark:bg-dark-bg dark:border-dark-border dark:text-dark-text md:relative md:flex md:translate-x-0`}
      >
        <div className='border-border dark:border-dark-border border-b p-4'>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className='text-secondary hover:text-text dark:text-dark-secondary dark:hover:text-dark-text mb-2 self-start rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden dark:hover:bg-gray-800'
            title={
              isMobileOpen ? t('common:menu.close') : t('common:menu.open')
            }
            aria-label={
              isMobileOpen ? t('common:menu.close') : t('common:menu.open')
            }
          >
            {isMobileOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </button>

          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>
              {t('fileTree:fileStructure')}
            </h2>
            <button
              data-tour="create-layout"
              onClick={handleCreateLayout}
              className='text-secondary hover:text-text dark:text-dark-secondary dark:hover:text-dark-text rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
              title={t('fileTree:createNewLayout')}
              aria-label={t('fileTree:createNewLayout')}
            >
              <Plus className='h-5 w-5' />
            </button>
          </div>

          <div className='mt-3'>
            <div data-tour="search">
              <SearchInput
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                suggestions={allSearchableItems}
              />
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          <FileTree
            fileTree={fileTree}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
            updateNoteInTree={updateNoteInTree}
            addNoteToTree={addNoteToTree}
            onItemSelect={handleItemSelect}
            selectedItemId={selectedItemId}
            searchQuery={searchQuery}
          />
        </div>
      </aside>
    </>
  );
};

export const Sidebar = forwardRef(SidebarComponent);
