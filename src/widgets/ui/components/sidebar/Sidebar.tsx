import { closeLayoutTabs, closeTabsByItemId } from '@/entities';
import type { Note } from '@/entities/note';
import type { FileTreeItem } from '@/entities/tab';
import { CreateLayoutForm } from '@/features/layout';
import { ProfileButton } from '@/features/profile';
import { logoImage as logo } from '@/shared/assets';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS } from '@/shared/lib/react';
import {
  useFileTree,
  useIsMobile,
  useLocalization,
  useModalActions,
  useSidebar,
} from '@/widgets/hooks';
import { useAppDispatch } from '@/widgets/hooks/redux';
import { useResizableSidebar } from '@/widgets/hooks/useResizableSidebar';
import { parseTabId } from '@/widgets/model/utils/tabUtils';
import { FileTree } from '@/widgets/ui/components/fileTree';
import { MobileMenu } from '@/widgets/ui/components/header/MobileMenu';
import { Plus, ShieldCheck } from 'lucide-react';
import { forwardRef, useImperativeHandle, type Ref } from 'react';
import { Link } from 'react-router-dom';

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
  const isMobile = useIsMobile();
  const { width: _width, onPointerDown } = useResizableSidebar();
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
    size: MODAL_SIZE_PRESETS.layoutCreate,
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
    const graphTitle = layout ? `${layout.title}` : 'Граф заметок';

    onItemSelect?.({
      id: `graph-${layoutId}`,
      type: 'graph',
      title: graphTitle,
      layoutId,
      isMain: layout?.isMain === true,
    });

    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className={cn(
            'fixed',
            'inset-0',
            'bg-black/20',
            'backdrop-blur-sm',
            'md:hidden',
            'z-90'
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
          'flex',
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
          'md:translate-x-0',
          'z-100'
        )}
        style={_width ? { width: `${_width}px` } : undefined}
      >
        <div
          className={cn(
            'border-border',
            'dark:border-dark-border',
            'border-b',
            'pt-5',
            'pb-4',
            'px-4',
            'flex',
            'flex-col',
            'gap-3'
          )}
        >
          <div
            className={cn(
              'flex',
              'items-center',
              'gap-2',
              'md:gap-3',
              'md:hidden'
            )}
          >
            <MobileMenu iconClassName={cn('h-6', 'w-6')} />

            <Link
              to='/main'
              className={cn('flex', 'items-center', 'md:gap-3')}
              aria-label={t('common:header.goToHomepage')}
            >
              <img
                src={logo}
                alt={t('common:header.logoAlt')}
                className={cn('h-16', 'w-16', 'md:h-22', 'md:w-22')}
                loading='lazy'
              />
              <div className={cn('flex', 'items-baseline', 'gap-1')}>
                <h1
                  className={cn(
                    'text-text',
                    'dark:text-dark-text',
                    'text-base',
                    'font-bold',
                    'sm:text-xl',
                    'md:text-2xl'
                  )}
                >
                  Walrus
                </h1>
                <h1
                  className={cn(
                    'text-primary',
                    'text-base',
                    'font-bold',
                    'sm:text-xl',
                    'md:text-2xl'
                  )}
                >
                  Notes
                </h1>
              </div>
            </Link>
          </div>

          <div className={cn('flex', 'items-center', 'justify-between')}>
            <h2 className={cn('text-lg', 'font-semibold')}>
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
              <Plus className={cn('h-5', 'w-5')} />
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

        <div
          className={cn(
            'border-t',
            'border-border',
            'dark:border-dark-border',
            'p-4',
            'mt-auto'
          )}
        >
          <Link
            to='/dashboard'
            className={cn(
              'border-border dark:border-dark-border mb-3 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium',
              'text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <ShieldCheck className={cn('h-4 w-4')} />
            {t('common:navigation.dashboard')}
          </Link>
          <ProfileButton />
        </div>

        {!isMobile && (
          <div
            role='separator'
            aria-orientation='vertical'
            onPointerDown={onPointerDown}
            className={cn(
              'hidden',
              'md:block',
              'absolute',
              'top-0',
              'right-0',
              'h-full',
              'w-2',
              'cursor-col-resize',
              'hover:bg-gray-100',
              'dark:hover:bg-gray-800'
            )}
          />
        )}
      </aside>
    </>
  );
};

export const Sidebar = forwardRef(SidebarComponent);
