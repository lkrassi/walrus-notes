import type { PermissionItem } from '@/entities';
import {
  useApplyLinkMutation,
  useDeletePermissionMutation,
  useGetMyLayoutsQuery,
  useGetPermissionsDashboardQuery,
  useLazyGetNotesQuery,
  useLazyGetUserProfileQuery,
  useUpdatePermissionMutation,
} from '@/entities';
import { useNotifications } from '@/entities/notification';
import { useEffect, useMemo, useRef, useState } from 'react';
import { initialFromPermission } from '../lib/utils';
import type { EditablePermissionState } from '../model';

interface ResolvedUserInfo {
  username?: string;
  imgUrl?: string;
}

export function useDashboardPermissions() {
  const { showError, showSuccess } = useNotifications();
  const { data } = useGetPermissionsDashboardQuery();
  const { data: layoutsResponse } = useGetMyLayoutsQuery();
  const [loadUserProfile] = useLazyGetUserProfileQuery();
  const [loadNotes] = useLazyGetNotesQuery();
  const [deletePermission, { isLoading: isDeleting }] =
    useDeletePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] =
    useUpdatePermissionMutation();
  const [applyLink] = useApplyLinkMutation();

  const [drafts, setDrafts] = useState<Record<string, EditablePermissionState>>(
    {}
  );
  const [usersById, setUsersById] = useState<Record<string, ResolvedUserInfo>>(
    {}
  );
  const [targetTitlesById, setTargetTitlesById] = useState<
    Record<string, string>
  >({});
  const loadedUserIdsRef = useRef<Set<string>>(new Set());
  const loadedLayoutIdsRef = useRef<Set<string>>(new Set());

  const sharedRaw = data?.shared || [];
  const receivedRaw = data?.received || [];

  useEffect(() => {
    const layouts = layoutsResponse?.data || [];
    if (!layouts.length) return;
    setTargetTitlesById(prev => {
      const next = { ...prev };
      for (const layout of layouts) {
        if (layout.title) next[layout.id] = layout.title;
      }
      return next;
    });
  }, [layoutsResponse?.data]);

  useEffect(() => {
    const allPermissions = [...receivedRaw, ...sharedRaw];
    const userIdsToFetch = Array.from(
      new Set(
        allPermissions
          .flatMap(permission => [permission.fromUserId, permission.toUserId])
          .filter(userId => {
            if (!userId) return false;
            const alreadyResolved =
              !!usersById[userId]?.username && !!usersById[userId]?.imgUrl;
            return !alreadyResolved && !loadedUserIdsRef.current.has(userId);
          })
      )
    );
    if (!userIdsToFetch.length) return;
    userIdsToFetch.forEach(userId => loadedUserIdsRef.current.add(userId));
    let cancelled = false;
    const resolveUsers = async () => {
      const responses = await Promise.allSettled(
        userIdsToFetch.map(async userId => {
          const response = await loadUserProfile(userId, true).unwrap();
          return {
            userId,
            username: response.data.username,
            imgUrl: response.data.imgUrl,
          };
        })
      );
      if (cancelled) return;
      setUsersById(prev => {
        const next = { ...prev };
        responses.forEach(response => {
          if (response.status === 'fulfilled') {
            next[response.value.userId] = {
              username: response.value.username,
              imgUrl: response.value.imgUrl,
            };
          }
        });
        return next;
      });
    };
    resolveUsers();
    return () => {
      cancelled = true;
    };
  }, [loadUserProfile, receivedRaw, sharedRaw, usersById]);

  useEffect(() => {
    const layouts = layoutsResponse?.data || [];
    const layoutIdsToFetch = layouts
      .map(layout => layout.id)
      .filter(layoutId => !loadedLayoutIdsRef.current.has(layoutId));
    if (!layoutIdsToFetch.length) return;
    layoutIdsToFetch.forEach(layoutId =>
      loadedLayoutIdsRef.current.add(layoutId)
    );
    let cancelled = false;
    const resolveNoteTitles = async () => {
      const titleEntries: Array<[string, string]> = [];
      for (const layoutId of layoutIdsToFetch) {
        let page = 1;
        let totalPages = 1;
        do {
          const response = await loadNotes({ layoutId, page }, true).unwrap();
          response.data.forEach(note => {
            if (note.title) titleEntries.push([note.id, note.title]);
          });
          totalPages = response.pagination?.pages || 1;
          page += 1;
        } while (page <= totalPages);
      }
      if (cancelled || !titleEntries.length) return;
      setTargetTitlesById(prev => {
        const next = { ...prev };
        titleEntries.forEach(([id, title]) => {
          next[id] = title;
        });
        return next;
      });
    };
    resolveNoteTitles();
    return () => {
      cancelled = true;
    };
  }, [layoutsResponse?.data, loadNotes]);

  const enrichPermission = (permission: PermissionItem): PermissionItem => {
    const userInfo = usersById[permission.fromUserId];
    return {
      ...permission,
      fromUserName: permission.fromUserName || userInfo?.username,
      fromUserAvatar: permission.fromUserAvatar || userInfo?.imgUrl,
      targetTitle:
        permission.targetTitle || targetTitlesById[permission.targetId],
    };
  };

  const received = useMemo(
    () => receivedRaw.map(enrichPermission),
    [receivedRaw, targetTitlesById, usersById]
  );

  const mergedShared = useMemo(() => {
    const source = sharedRaw.map(permission => {
      const toUser = usersById[permission.toUserId] || {};
      return {
        ...enrichPermission(permission),
        toUserName: toUser.username,
        toUserAvatar: toUser.imgUrl,
      };
    });
    return source.map(permission => ({
      permission,
      draft: drafts[permission.id] || initialFromPermission(permission),
    }));
  }, [drafts, sharedRaw, targetTitlesById, usersById]);

  const setDraftValue = (
    permissionId: string,
    field: keyof EditablePermissionState,
    value: boolean,
    fallback: PermissionItem
  ) => {
    setDrafts(prev => {
      const current = prev[permissionId] || initialFromPermission(fallback);
      let next: EditablePermissionState = { ...current, [field]: value };
      if (field === 'canEdit' && value) next = { ...next, canRead: true };
      if (field === 'canWrite' && value) next = { ...next, canRead: true };
      if (field === 'canRead' && !value)
        next = { ...next, canWrite: false, canEdit: false };
      return { ...prev, [permissionId]: next };
    });
  };

  const handleDelete = async (permissionId: string) => {
    try {
      await deletePermission({ permissionId }).unwrap();
      showSuccess('Доступ удалён');
    } catch {
      showError('Ошибка удаления');
    }
  };

  const handleUpdate = async (
    permissionId: string,
    draft: EditablePermissionState
  ) => {
    try {
      await updatePermission({
        permissionsId: permissionId,
        canRead: draft.canRead,
        canWrite: draft.canWrite,
        canEdit: draft.canEdit,
      }).unwrap();
      showSuccess('Доступ обновлён');
      setDrafts(prev => {
        const copy = { ...prev };
        delete copy[permissionId];
        return copy;
      });
    } catch {
      showError('Ошибка обновления');
    }
  };

  const handleApplyLink = async (linkId: string) => {
    try {
      const response = await applyLink({ linkId }).unwrap();
      const { targetId, kind } = response;
      const targetName = targetTitlesById[targetId] || 'папка';
      const accessLevel =
        kind === 'PERMISSIONS_KIND_LAYOUT' ? 'папке' : 'заметке';

      showSuccess(`Теперь у вас есть доступ к ${accessLevel} "${targetName}".`);
      window.location.href = '/main';
    } catch {
      showError('Ошибка при получении доступа.');
    }
  };

  return {
    received,
    mergedShared,
    setDraftValue,
    handleDelete,
    handleUpdate,
    handleApplyLink,
    isDeleting,
    isUpdating,
  };
}
