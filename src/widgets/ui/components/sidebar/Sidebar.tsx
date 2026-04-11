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
import { useResizableSidebar } from '@/widgets/hooks/useResizableSidebar';
import { parseTabId } from '@/widgets/model/utils/tabUtils';
import { FileTree } from '@/widgets/ui/components/fileTree';
import { Plus, ShieldCheck, X } from 'lucide-react';
import { forwardRef, useImperativeHandle, type Ref } from 'react';
import { Link } from 'react-router-dom';

type SidebarProps = {
  onItemSelect?: (item: FileTreeItem, mode?: 'preview' | 'pinned') => void;
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
  const { fileTree, expandedItems, toggleExpanded, updateNoteInTree } =
    useFileTree();

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

  const handleItemSelect = (
    item: FileTreeItem,
    mode: 'preview' | 'pinned' = 'preview'
  ) => {
    onItemSelect?.(item, mode);
    setIsMobileOpen(false);
  };

  const handleOpenGraph = (layoutId: string) => {
    const layout = fileTree.find(item => item.id === layoutId);
    const graphTitle =
      layout?.isMain === true
        ? t('main:allNotes')
        : layout
          ? `${layout.title}`
          : 'Граф заметок';

    onItemSelect?.(
      {
        id: `graph-${layoutId}`,
        type: 'graph',
        title: graphTitle,
        layoutId,
        isMain: layout?.isMain === true,
      },
      'pinned'
    );

    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className={cn(
            'fixed',
            'inset-0',
            'bg-foreground/20',
            'backdrop-blur-sm',
            'md:hidden',
            'z-90'
          )}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'text-foreground',
          'border-border',
          'fixed',
          'top-14',
          'bottom-0',
          'left-0',
          'flex',
          'flex-col',
          'w-[min(88vw,360px)]',
          'border-r',
          'bg-bg',
          'transition-transform',
          'duration-300',
          'ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:static',
          'md:flex',
          'md:translate-x-0',
          'md:inset-auto',
          'md:top-auto',
          'md:bottom-auto',
          'md:z-auto',
          'md:m-2',
          'md:mr-0',
          'md:w-auto',
          'md:rounded-xl',
          'md:border',
          'z-100'
        )}
        style={_width ? { width: `${_width}px` } : undefined}
      >
        <div
          className={cn(
            'border-border',
            'border-b',
            'px-3',
            'py-3',
            'flex',
            'flex-col',
            'gap-2.5',
            'bg-surface/55'
          )}
        >
          <div
            className={cn(
              'flex',
              'items-center',
              'gap-2',
              'md:hidden',
              'mb-1',
              'min-h-10'
            )}
          >
            <button
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'text-muted-foreground',
                'hover:text-foreground',
                'focus:ring-ring',
                'rounded-lg',
                'p-2',
                'transition-colors',
                'duration-200',
                'hover:bg-interactive-hover',
                'active:bg-interactive-active',
                'focus:ring-2',
                'focus:outline-none'
              )}
              aria-label={t('common:menu.close')}
            >
              <X className={cn('h-6', 'w-6')} />
            </button>

            <img
              src={logo}
              alt={t('common:header.logoAlt')}
              className={cn(
                'h-10',
                'w-10',
                'min-h-10',
                'min-w-10',
                'max-h-10',
                'max-w-10'
              )}
              loading='eager'
              decoding='async'
            />
            <div className={cn('flex', 'items-baseline', 'gap-1', 'flex-1')}>
              <h1
                className={cn(
                  'text-text',
                  'text-lg',
                  'leading-none',
                  'font-bold'
                )}
              >
                Walrus
              </h1>
              <h1
                className={cn(
                  'text-primary',
                  'text-lg',
                  'leading-none',
                  'font-bold'
                )}
              >
                Notes
              </h1>
            </div>
          </div>

          <div
            className={cn('flex', 'items-center', 'justify-between', 'gap-2')}
          >
            <h2 className={cn('text-base', 'font-semibold', 'tracking-tight')}>
              {t('fileTree:fileStructure')}
            </h2>
            <button
              onClick={handleCreateLayout}
              title={t('fileTree:createNewLayout')}
              aria-label={t('fileTree:createNewLayout')}
              className={cn(
                'text-foreground',
                'hover:text-primary',
                'hover:bg-interactive-hover',
                'rounded-md',
                'p-1.5',
                'transition-colors'
              )}
            >
              <Plus className={cn('h-5', 'w-5')} />
            </button>
          </div>
        </div>

        <div className={cn('flex-1', 'overflow-y-auto', 'min-h-0')}>
          <FileTree
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
            onItemSelect={handleItemSelect}
            selectedItemId={currentSelectedItemId}
            onOpenGraph={handleOpenGraph}
          />
        </div>

        <div
          className={cn(
            'mt-auto',
            'border-t',
            'border-border',
            'p-3',
            'bg-surface/40'
          )}
        >
          <Link
            to='/dashboard'
            className={cn(
              'border-border',
              'mb-2.5',
              'flex',
              'items-center',
              'justify-center',
              'gap-2',
              'rounded-lg',
              'border',
              'bg-bg/80',
              'px-3',
              'py-2',
              'text-sm',
              'font-medium',
              'text-foreground',
              'transition-colors',
              'hover:bg-interactive-hover'
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
              'hover:bg-surface-2/80'
            )}
          />
        )}
      </aside>
    </>
  );
};

export const Sidebar = forwardRef(SidebarComponent);
