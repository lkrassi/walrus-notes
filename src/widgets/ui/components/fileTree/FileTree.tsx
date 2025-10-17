import { CreateNoteForm } from 'features/notes/ui/components/CreateNoteForm';
import type { Note } from 'shared/model/types/layouts';
import { useLocalization } from 'widgets/hooks';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import { useAppSelector } from '../../../hooks/redux';
import { useGetMyLayoutsQuery } from '../../../model/stores/api';
import { useModalContext } from '../modal';
import { FileTreeEmpty, FileTreeItem } from './index';

interface FileTreeProps {
  expandedItems: Set<string>;
  toggleExpanded: (itemId: string) => void;
  updateNoteInTree: (noteId: string, updatedNote: Partial<Note>) => void;
  addNoteToTree: (layoutId: string, note: Note) => void;
  onItemSelect?: (item: FileTreeItemType) => void;
  selectedItemId?: string;
  searchQuery?: string;
  onDeleteNote?: (noteId: string) => void;
}

export const FileTree = ({
  expandedItems,
  toggleExpanded,
  addNoteToTree,
  onItemSelect,
  selectedItemId,
  searchQuery,
  onDeleteNote,
}: Omit<FileTreeProps, 'fileTree' | 'onNotesLoaded' | 'loadMoreNotes'>) => {
  const { t } = useLocalization();
  const { openModal } = useModalContext();

  const { data: layoutsResponse } = useGetMyLayoutsQuery(undefined);
  const accessToken = useAppSelector(state => state.user.accessToken);

  const fileTree = (() => {
    if (!layoutsResponse?.data) return [];

    return layoutsResponse.data.map(layout => ({
      id: layout.id,
      type: 'layout' as const,
      title: layout.title,
      children: [],
      createdAt: layout.createdAt,
      updatedAt: layout.updatedAt,
      isNotesLoaded: false,
    }));
  })();

  const filterFileTree = (
    items: FileTreeItemType[],
    query: string
  ): FileTreeItemType[] => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();

    return items
      .map(item => {
        const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
        const matchesPayload =
          item.type === 'note' &&
          item.note?.payload?.toLowerCase().includes(lowerQuery);

        if (matchesTitle || matchesPayload) {
          return item;
        }

        if (item.children) {
          const filteredChildren = filterFileTree(item.children, query);
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
        }

        return null;
      })
      .filter((item): item is FileTreeItemType => item !== null);
  };

  const filteredFileTree = (() => {
    return searchQuery ? filterFileTree(fileTree, searchQuery) : fileTree;
  })();

  const handleCreateNote = (layoutId: string) => {
    openModal(
      <CreateNoteForm
        layoutId={layoutId}
        onNoteCreated={note => addNoteToTree(layoutId, note)}
      />,
      {
        title: t('fileTree:createNewNote'),
        size: 'lg',
      }
    );
  };

  const handleItemClick = (item: FileTreeItemType) => {
    onItemSelect?.(item);
    if (item.type === 'layout') {
      toggleExpanded(item.id);
    }
  };

  const renderTreeItem = (item: FileTreeItemType, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const isSelected = selectedItemId === item.id;
    const hasChildren = !!(item.children && item.children.length > 0);

    return (
      <div key={item.id}>
        <FileTreeItem
          item={item}
          level={level}
          isExpanded={isExpanded}
          isSelected={isSelected}
          hasChildren={hasChildren}
          onItemClick={handleItemClick}
          onCreateNote={handleCreateNote}
          onDeleteNote={onDeleteNote}
          renderChild={renderTreeItem}
        />
      </div>
    );
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1 overflow-y-auto p-2'>
        {filteredFileTree.length === 0 ? (
          <FileTreeEmpty searchQuery={searchQuery} />
        ) : (
          <div className='space-y-1'>
            {filteredFileTree.map(item => renderTreeItem(item))}
          </div>
        )}
      </div>
    </div>
  );
};
