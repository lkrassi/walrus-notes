import { FileText, Folder, X } from 'lucide-react';
import { useState } from 'react';
import type { TabsProps } from '../../model/types/tabsProps';

export const Tabs = ({
  tabs,
  onTabClick,
  onTabClose,
  onTabReorder,
  getItemPath,
}: TabsProps) => {
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    const tabId = (e.target as HTMLElement)
      .closest('[data-tab-id]')
      ?.getAttribute('data-tab-id');
    if (tabId) {
      setDraggedTab(tabId);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetTabId = (e.target as HTMLElement)
      .closest('[data-tab-id]')
      ?.getAttribute('data-tab-id');
    setDragOverTab(targetTabId || null);
  };

  const handleDragLeave = () => {
    setDragOverTab(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTab || !dragOverTab || draggedTab === dragOverTab) return;

    const draggedIndex = tabs.findIndex(tab => tab.id === draggedTab);
    const targetIndex = tabs.findIndex(tab => tab.id === dragOverTab);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTabs = [...tabs];
    const [removed] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, removed);

    onTabReorder?.(newTabs);
    setDraggedTab(null);
    setDragOverTab(null);
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDragOverTab(null);
  };

  return (
    <div className='border-border dark:border-dark-border dark:bg-dark-bg scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent flex overflow-x-auto border-b bg-white'>
      {tabs.map(tab => (
        <div
          key={tab.id}
          draggable
          data-tab-id={tab.id}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          style={{
            boxShadow:
              draggedTab === tab.id
                ? '0 10px 25px rgba(0, 0, 0, 0.15)'
                : dragOverTab === tab.id
                  ? '0 0 0 2px rgba(59, 130, 246, 0.5)'
                  : '0 1px 3px rgba(0, 0, 0, 0.1)',
            backgroundColor:
              dragOverTab === tab.id && draggedTab !== tab.id
                ? 'rgba(59, 130, 246, 0.1)'
                : undefined,
            transition: 'all 0.2s ease',
            zIndex: draggedTab === tab.id ? 50 : 10,
          }}
          className={`border-border dark:border-dark-border group relative flex min-w-0 cursor-pointer items-center border-r px-4 py-2 whitespace-nowrap select-none ${
            tab.isActive
              ? 'bg-primary border-b-primary border-b-2 text-white'
              : 'text-text dark:text-dark-text bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
          } `}
          onClick={() => onTabClick(tab.id)}
        >
          <div className='mr-2 flex min-w-0 flex-1 items-center'>
            {tab.item.type === 'note' ? (
              <FileText className='mr-2 h-4 w-4' />
            ) : (
              <Folder className='mr-2 h-4 w-4' />
            )}
            <div className='min-w-0 flex-1'>
              {tab.item.type === 'note' && getItemPath ? (
                <div className='truncate text-xs opacity-75'>
                  {getItemPath(tab.item) || tab.item.title}
                </div>
              ) : null}
              <div className='truncate text-sm font-medium'>
                {tab.item.title}
              </div>
            </div>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className={` ${tab.isActive ? 'text-white' : 'text-text dark:text-dark-text'}`}
          >
            <X
              className={`${tab.isActive ? 'hover:bg-white hover:text-black' : 'hover:bg-primary'} h-3 w-3 rounded-xl duration-200`}
            />
          </button>
        </div>
      ))}
    </div>
  );
};
