import { useEffect } from 'react';
import { useAppDispatch, useTabs } from './redux';
import { initializeTabs } from 'app/store/slices/tabsSlice';
import type { DashboardTab } from 'app/store/slices/tabsSlice';

const TABS_STORAGE_KEY = 'walrus-notes:tabs';

/**
 * Hook для сохранения и восстановления вкладок из localStorage
 * Автоматически:
 * - Загружает сохраненные вкладки при монтировании компонента
 * - Сохраняет вкладки в localStorage при изменении
 */
export const useTabsPersistence = () => {
  const dispatch = useAppDispatch();
  const { openTabs, activeTabId } = useTabs();

  // Загружаем сохраненные вкладки при инициализации
  useEffect(() => {
    const loadSavedTabs = () => {
      try {
        if (typeof window === 'undefined') return;

        const savedData = window.localStorage.getItem(TABS_STORAGE_KEY);
        if (!savedData) return;

        const parsedData = JSON.parse(savedData);
        
        // Проверяем структуру данных
        if (
          parsedData &&
          Array.isArray(parsedData.openTabs) &&
          typeof parsedData.activeTabId === 'string'
        ) {
          dispatch(initializeTabs(parsedData));
        }
      } catch (error) {
        console.warn('Failed to load saved tabs:', error);
      }
    };

    loadSavedTabs();
  }, [dispatch]);

  // Сохраняем вкладки в localStorage при их изменении
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const dataToSave = {
        openTabs,
        activeTabId,
      };

      window.localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save tabs to localStorage:', error);
    }
  }, [openTabs, activeTabId]);
};
