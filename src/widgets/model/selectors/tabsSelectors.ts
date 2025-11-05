import type { RootState } from 'app/store';

export const selectOpenTabs = (state: RootState) => state.tabs.openTabs;
export const selectActiveTab = (state: RootState) =>
  state.tabs.openTabs.find(tab => tab.isActive);
export const selectTabById = (tabId: string) => (state: RootState) =>
  state.tabs.openTabs.find(tab => tab.id === tabId);
