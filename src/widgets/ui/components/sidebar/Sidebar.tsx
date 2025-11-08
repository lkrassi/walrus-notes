import { closeLayoutTabs, closeTabsByItemId } from 'app/store/slices/tabsSlice';
import { CreateLayoutForm } from 'features/layout/ui/components/CreateLayoutForm';
import { Menu, Plus, X } from 'lucide-react';
import { forwardRef, useImperativeHandle, type Ref } from 'react';
import cn from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { useFileTree, useLocalization, useSidebar } from 'widgets/hooks';
import { useAppDispatch } from 'widgets/hooks/redux';
import type { FileTreeItem } from 'widgets/hooks/useFileTree';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { parseTabId } from 'widgets/model/utils/tabUtils';
import { FileTree } from '../fileTree';

type SidebarProps = {
  onItemSelect?: (item: FileTreeItem) => void;
  selectedItemId?: string;
};

const SidebarComponent = (
  { onItemSelect, selectedItemId }: SidebarProps,
  ref: Ref<{
    updateNoteInTree: (noteId: string, updates: Partial<Note>) => void;
  }>
) => {
  const { t } = useLocalization();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const dispatch = useAppDispatch();
  const {
    fileTree,
    expandedItems,
    toggleExpanded,
    updateNoteInTree,
    addNoteToTree,
  } = useFileTree();

  const { openModalFromTrigger } = useModalActions();

  useImperativeHandle(ref, () => ({ updateNoteInTree }));

  const currentSelectedItemId = selectedItemId
    ? selectedItemId.includes('::')
      ? parseTabId(selectedItemId).id
      : selectedItemId
    : undefined;

  const handleCreateLayout = openModalFromTrigger(<CreateLayoutForm />, {
    title: t('fileTree:createNewLayout'),
    size: 'md',
  });

  const handleDeleteNote = (noteId: string) => {
    dispatch(closeTabsByItemId({ itemId: noteId, itemType: 'note' }));
  };

  const handleDeleteLayout = (layoutId: string) => {
    dispatch(closeLayoutTabs(layoutId));
  };

  const handleItemSelect = (item: FileTreeItem) => {
    onItemSelect?.(item);
    setIsMobileOpen(false);
  };

  const handleOpenGraph = (layoutId: string) => {
    const layout = fileTree.find(item => item.id === layoutId);
    const graphTitle = layout ? `Граф: ${layout.title}` : 'Граф заметок';

    onItemSelect?.({
      id: `graph-${layoutId}`,
      type: 'graph',
      title: graphTitle,
      layoutId,
    });
  };

  return (
    <>
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className={cn(
            'mobile-menu-button',
            'text-secondary',
            'hover:text-text',
            'dark:text-dark-secondary',
            'dark:hover:text-dark-text',
            'fixed',
            'top-4',
            'left-4',
            'z-50',
            'rounded-lg',
            'p-2',
            'transition-colors',
            'hover:bg-gray-100',
            'md:hidden',
            'dark:hover:bg-gray-800'
          )}
          title={t('common:menu.open')}
          aria-label={t('common:menu.open')}
        >
          <Menu className={cn('h-6 w-6')} />
        </button>
      )}

      {isMobileOpen && (
        <div
          className={cn(
            'fixed',
            'inset-0',
            'z-40',
            'bg-black/20',
            'backdrop-blur-sm',
            'md:hidden'
          )}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'text-text',
          'border-border',
          'fixed',
          'top-0',
          'bottom-0',
          'left-0',
          'z-50',
          'flex',
          'w-80',
          'flex-col',
          'border-r',
          'bg-white',
          'transition-transform',
          'duration-300',
          'ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'dark:bg-dark-bg',
          'dark:border-dark-border',
          'dark:text-dark-text',
          'md:relative',
          'md:flex',
          'md:translate-x-0'
        )}
      >
        <div
          className={cn('border-border dark:border-dark-border border-b p-4')}
        >
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={cn(
              'text-secondary',
              'hover:text-text',
              'dark:text-dark-secondary',
              'dark:hover:text-dark-text',
              'mb-2',
              'self-start',
              'rounded-lg',
              'p-2',
              'transition-colors',
              'hover:bg-gray-100',
              'md:hidden',
              'dark:hover:bg-gray-800'
            )}
            title={
              isMobileOpen ? t('common:menu.close') : t('common:menu.open')
            }
            aria-label={
              isMobileOpen ? t('common:menu.close') : t('common:menu.open')
            }
          >
            {isMobileOpen ? (
              <X className={cn('h-5 w-5')} />
            ) : (
              <Menu className={cn('h-5 w-5')} />
            )}
          </button>

          <div className={cn('flex items-center justify-between')}>
            <h2 className={cn('text-lg font-semibold')}>
              {t('fileTree:fileStructure')}
            </h2>
            <button
              onClick={handleCreateLayout}
              title={t('fileTree:createNewLayout')}
              aria-label={t('fileTree:createNewLayout')}
              className={cn(
                'text-text',
                'hover:text-primary',
                'dark:text-dark-text',
                'dark:hover:text-primary',
                'rounded',
                'p-1'
              )}
            >
              <Plus className={cn('h-5 w-5')} />
            </button>
          </div>
        </div>

        <div className={cn('flex-1 overflow-y-auto')}>
          <FileTree
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
            updateNoteInTree={updateNoteInTree}
            addNoteToTree={addNoteToTree}
            onItemSelect={handleItemSelect}
            selectedItemId={currentSelectedItemId}
            onOpenGraph={handleOpenGraph}
            onDeleteNote={handleDeleteNote}
            onDeleteLayout={handleDeleteLayout}
          />
        </div>
      </aside>
    </>
  );
};

export const Sidebar = forwardRef(SidebarComponent);
