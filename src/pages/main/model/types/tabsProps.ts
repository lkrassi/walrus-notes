import type { FileTreeItem } from '@/entities/tab';

interface Tab {
  id: string;
  item: FileTreeItem;
  isActive: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder?: (tabs: Tab[]) => void;
}
