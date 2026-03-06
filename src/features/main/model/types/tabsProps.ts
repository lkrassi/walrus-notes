import type { FileTreeItem } from '@/shared/model';

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
