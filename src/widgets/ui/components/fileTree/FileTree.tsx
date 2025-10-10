import { CreateNoteForm } from 'features/notes/ui/components/CreateNoteForm';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import { useLocalization } from 'widgets/hooks';
import { useModalContext } from '../modal';
import {
  FileTreeItem,
  FileTreeLoading,
  FileTreeEmpty,
} from './index';

interface FileTreeProps {
  fileTree: FileTreeItemType[];
  isLoading: boolean;
  expandedItems: Set<string>;
  toggleExpanded: (itemId: string) => void;
  updateNoteInTree: (noteId: string, updatedNote: Partial<Note>) => void;
  addNoteToTree: (layoutId: string, note: Note) => void;
  onItemSelect?: (item: FileTreeItemType) => void;
  selectedItemId?: string;
}

export const FileTree = ({
  fileTree,
  isLoading,
  expandedItems,
  toggleExpanded,
  addNoteToTree,
  onItemSelect,
  selectedItemId,
}: FileTreeProps) => {
  const { t } = useLocalization();
  const { openModal } = useModalContext();

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


  if (isLoading) {
    return <FileTreeLoading />;
  }

  return (
    <div className='h-full'>
      <div className='flex-1 overflow-y-auto p-2'>
        {fileTree.length === 0 ? (
          <FileTreeEmpty />
        ) : (
          <div className='space-y-1'>
            {fileTree.map(item => renderTreeItem(item))}
          </div>
        )}
      </div>
    </div>
  );
};
