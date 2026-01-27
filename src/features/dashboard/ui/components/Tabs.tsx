import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FileText, Folder, Network } from 'lucide-react';
import { useState } from 'react';
import { cn } from 'shared/lib/cn';
import { useDndSensors } from 'shared/lib/useDndSensors';
import type { TabsProps } from '../../model/types/tabsProps';
import { SortableTab } from './SortableTab';

export const Tabs = ({
  tabs,
  onTabClick,
  onTabClose,
  onTabReorder,
}: TabsProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useDndSensors();

  const visibleTabs = tabs;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex(tab => tab.id === active.id);
      const newIndex = tabs.findIndex(tab => tab.id === over.id);
      const newTabs = arrayMove(tabs, oldIndex, newIndex);
      onTabReorder?.(newTabs);
    }
    setActiveId(null);
  };

  const activeTab = activeId ? tabs.find(tab => tab.id === activeId) : null;

  return (
    <div
      className={cn(
        'border-border dark:border-dark-border dark:bg-dark-bg dark:text-dark-text relative flex bg-white shadow-sm'
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleTabs.map(t => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div
            className={cn(
              'relative flex flex-1 overflow-x-auto overflow-y-hidden'
            )}
          >
            {visibleTabs.map(tab => (
              <SortableTab
                key={tab.id}
                tab={tab}
                isActive={tab.isActive}
                onClick={() => onTabClick(tab.id)}
                onClose={() => onTabClose(tab.id)}
                showAnimatedBackground={tab.isActive}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeTab ? (
            <div
              className={cn(
                'border-border dark:border-dark-border relative flex max-w-[200px] min-w-[120px] cursor-grab items-center border-r bg-white px-4 py-2 whitespace-nowrap shadow-lg select-none dark:bg-gray-800'
              )}
            >
              <div className='mr-2 flex min-w-0 flex-1 items-center overflow-hidden'>
                {activeTab.item.type === 'note' ? (
                  <FileText className='mr-2 h-4 w-4' />
                ) : activeTab.item.isMain === true ? (
                  <Network className='mr-2 h-4 w-4' />
                ) : (
                  <Folder className='mr-2 h-4 w-4' />
                )}
                <div className='min-w-0 flex-1 overflow-hidden'>
                  <div className='truncate text-sm font-medium'>
                    {activeTab.item.title}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
