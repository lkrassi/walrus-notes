import { closeLayoutTabs, closeTabsByItemId } from 'app/store/slices/tabsSlice';
import { CreateLayoutForm } from 'features/layout/ui/components/CreateLayoutForm';
import { ProfileButton } from 'features/profile';
import { Plus } from 'lucide-react';
import { forwardRef, useImperativeHandle, type Ref } from 'react';
import { Link } from 'react-router-dom';
import cn from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import {
  useFileTree,
  useLocalization,
  useSidebar,
  useIsMobile,
} from 'widgets/hooks';
// import { useHolidaySettings } from 'widgets/hooks/useHolidaySettings';
import { useResizableSidebar } from 'widgets/hooks/useResizableSidebar';
import { useAppDispatch } from 'widgets/hooks/redux';
import type { FileTreeItem } from 'widgets/hooks/useFileTree';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { parseTabId } from 'widgets/model/utils/tabUtils';
import { FileTree } from '../fileTree';
import { MobileMenu } from '../header/MobileMenu';
// import logo2 from '../../../../assets/logo2.png';
import logo from '../../../../assets/logo.png';

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
  // const { enabled } = useHolidaySettings();
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
              to='/dashboard'
              className={cn('flex', 'items-center', 'gap-2', 'md:gap-3')}
              aria-label={t('common:header.goToHomepage')}
            >
              <img
                src={logo}
                alt={t('common:header.logoAlt')}
                className={cn('h-15', 'w-15', 'md:h-25', 'md:w-25')}
                loading='lazy'
              />
              <div
                className={cn(
                  'flex',
                  'items-baseline',
                  'gap-1',
                  'max-md:hidden'
                )}
              >
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
