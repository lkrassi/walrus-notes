import { CreateNoteForm } from 'features/notes/ui/components/CreateNoteForm';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import { useLocalization } from 'widgets/hooks';
import { useModalContext } from '../modal';
import {
  FileTreeItem,
  FileTreeEmpty,
} from './index';

interface FileTreeProps {
  fileTree: FileTreeItemType[];
  expandedItems: Set<string>;
  toggleExpanded: (itemId: string) => void;
  updateNoteInTree: (noteId: string, updatedNote: Partial<Note>) => void;
  addNoteToTree: (layoutId: string, note: Note) => void;
  onItemSelect?: (item: FileTreeItemType) => void;
  selectedItemId?: string;
  searchQuery?: string;
}

export const FileTree = ({
  fileTree,
  expandedItems,
  toggleExpanded,
  addNoteToTree,
  onItemSelect,
  selectedItemId,
  searchQuery,
}: FileTreeProps) => {
  const { t } = useLocalization();
  const { openModal } = useModalContext();

  const filterFileTree = (items: FileTreeItemType[], query: string): FileTreeItemType[] => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();

    return items
      .map(item => {
        const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
        const matchesPayload = item.type === 'note' && item.note?.payload?.toLowerCase().includes(lowerQuery);

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

  const filteredFileTree = searchQuery ? filterFileTree(fileTree, searchQuery) : fileTree;

  const handleItemClick = (item: FileTreeItemType) => {
    if (item.type === 'layout') {
      toggleExpanded(item.id);
    }
    onItemSelect?.(item);
  };



  const handleCreateNote = (layoutId: string) => {
    openModal(
      <CreateNoteForm
        layoutId={layoutId}
        onNoteCreated={(note) => addNoteToTree(layoutId, note)}
      />,
      {
        title: t('fileTree:createNewNote'),
        size: 'lg',
      }
    );
  };


  const renderTreeItem = (item: FileTreeItemType, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const isSelected = selectedItemId === item.id;
    const hasChildren = !!(item.children && item.children.length > 0);

    return (
      <FileTreeItem
        key={item.id}
        item={item}
        level={level}
        isExpanded={isExpanded}
        isSelected={isSelected}
        hasChildren={hasChildren}
        onItemClick={handleItemClick}
        onCreateNote={handleCreateNote}
        childrenItems={item.children}
        renderChild={renderTreeItem}
      />
    );
  };

  return (
    <div className='h-full flex flex-col'>
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
