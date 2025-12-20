export type TabType = 'note' | 'layout' | 'graph';

export const createTabId = (type: TabType, id: string): string => {
  return `${type}::${id}`;
};

export const parseTabId = (tabId: string): { type: TabType; id: string } => {
  const [type, ...idParts] = tabId.split('::');
  return {
    type: type as TabType,
    id: idParts.join('::'),
  };
};
