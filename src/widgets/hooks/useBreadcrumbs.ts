import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useGetMyLayoutsQuery, useGetNotesQuery } from '../model/stores/api';

export const useBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();

  const { data: layoutsData } = useGetMyLayoutsQuery();
  const { data: notesData } = useGetNotesQuery(
    { layoutId: params.layoutId! },
    { skip: !params.layoutId }
  );

  const breadcrumbs = useMemo(() => {
    if (location.pathname === '/' || location.pathname === '/auth') {
      return [];
    }

    const pathnames = location.pathname.split('/').filter(x => x);

    // Если это страница настроек
    if (pathnames.includes('settings')) {
      return [
        {
          name: 'Настройки',
          path: '/settings',
          isLast: true,
        },
      ];
    }

    if (pathnames.length === 1 && pathnames[0] === 'dashboard') {
      return [];
    }

    const relevantPathnames = pathnames.slice(1);

    const crumbs = relevantPathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 2).join('/')}`;
      const isLast = index === relevantPathnames.length - 1;

      let displayName = name;

      if (params.layoutId === name) {
        const layout = layoutsData?.data?.find(l => l.id === name);
        displayName = layout?.title || 'Рабочее пространство';
      } else if (params.noteId === name) {
        const note = notesData?.data?.find(n => n.id === name);
        displayName = note?.title || 'Заметка';
      } else {
        const nameMap: Record<string, string> = {
          settings: 'Настройки',
        };
        displayName = nameMap[name] || displayName;
      }

      if (!params.layoutId && !params.noteId) {
        displayName =
          displayName.charAt(0).toUpperCase() + displayName.slice(1);
      }

      return {
        name: displayName,
        path: routeTo,
        isLast,
      };
    });

    return crumbs;
  }, [location.pathname, params, layoutsData, notesData]);

  return breadcrumbs;
};
