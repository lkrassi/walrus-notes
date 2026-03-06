import { useNotifications } from '@/app/providers/notifications';
import {
  useDeletePermissionMutation,
  useGetMyLayoutsQuery,
  useGetPermissionsDashboardQuery,
  useLazyGetNotesQuery,
  useLazyGetUserProfileQuery,
  useUpdatePermissionMutation,
  type PermissionItem,
} from '@/entities';
import { cn } from '@/shared/lib/cn';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ReceivedPermissionCard } from './components/ReceivedPermissionCard';
import { SharedPermissionCard } from './components/SharedPermissionCard';
import type { EditablePermissionState } from './types';
import { initialFromPermission } from './utils';

interface ResolvedUserInfo {
  username?: string;
  imgUrl?: string;
}

export const PermissionsDashboardContent: FC = () => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useNotifications();
  const { data } = useGetPermissionsDashboardQuery();
  const { data: layoutsResponse } = useGetMyLayoutsQuery();
  const [loadUserProfile] = useLazyGetUserProfileQuery();
  const [loadNotes] = useLazyGetNotesQuery();
  const [deletePermission, { isLoading: isDeleting }] =
    useDeletePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] =
    useUpdatePermissionMutation();

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
    if (!layouts.length) {
      return;
    }

    setTargetTitlesById(prev => {
      const next = { ...prev };
      for (const layout of layouts) {
        if (layout.title) {
          next[layout.id] = layout.title;
        }
      }
      return next;
    });
  }, [layoutsResponse?.data]);

  useEffect(() => {
    const allPermissions = [...receivedRaw, ...sharedRaw];
    const userIdsToFetch = Array.from(
      new Set(
        allPermissions
          .map(permission => permission.fromUserId)
          .filter(userId => {
            if (!userId) {
              return false;
            }

            const alreadyResolved =
              !!usersById[userId]?.username && !!usersById[userId]?.imgUrl;
            return !alreadyResolved && !loadedUserIdsRef.current.has(userId);
          })
      )
    );

    if (!userIdsToFetch.length) {
      return;
    }

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

      if (cancelled) {
        return;
      }

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
      .filter(layoutId => {
        return !loadedLayoutIdsRef.current.has(layoutId);
      });

    if (!layoutIdsToFetch.length) {
      return;
    }

    layoutIdsToFetch.forEach(layoutId => {
      loadedLayoutIdsRef.current.add(layoutId);
    });

    let cancelled = false;

    const resolveNoteTitles = async () => {
      const titleEntries: Array<[string, string]> = [];

      for (const layoutId of layoutIdsToFetch) {
        let page = 1;
        let totalPages = 1;

        do {
          const response = await loadNotes({ layoutId, page }, true).unwrap();

          response.data.forEach(note => {
            if (note.title) {
              titleEntries.push([note.id, note.title]);
            }
          });

          totalPages = response.pagination?.pages || 1;
          page += 1;
        } while (page <= totalPages);
      }

      if (cancelled || !titleEntries.length) {
        return;
      }

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
    const source = sharedRaw.map(enrichPermission);
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
      let next: EditablePermissionState = {
        ...current,
        [field]: value,
      };

      if (field === 'canEdit' && value) {
        next = { ...next, canRead: true };
      }

      if (field === 'canWrite' && value) {
        next = { ...next, canRead: true };
      }

      if (field === 'canRead' && !value) {
        next = { ...next, canWrite: false, canEdit: false };
      }

      return {
        ...prev,
        [permissionId]: next,
      };
    });
  };

  const handleDelete = async (permissionId: string) => {
    try {
      await deletePermission({ permissionId }).unwrap();
      showSuccess(t('share:permissionsDashboard.notifications.deleted'));
    } catch {
      showError(t('share:permissionsDashboard.notifications.deleteError'));
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

      showSuccess(t('share:permissionsDashboard.notifications.updated'));
      setDrafts(prev => {
        const copy = { ...prev };
        delete copy[permissionId];
        return copy;
      });
    } catch {
      showError(t('share:permissionsDashboard.notifications.updateError'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={cn('mx-auto w-full max-w-6xl p-4 md:p-8')}
    >
      <div className={cn('grid gap-6 xl:grid-cols-2')}>
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.08 }}
          className={cn(
            'border-border dark:border-dark-border dark:bg-dark-bg rounded-2xl border bg-white p-4 md:p-5'
          )}
        >
          <h2 className={cn('mb-4 text-lg font-semibold')}>
            {t('share:permissionsDashboard.receivedTitle')}
          </h2>

          {!received.length && (
            <p
              className={cn('text-secondary dark:text-dark-secondary text-sm')}
            >
              {t('share:permissionsDashboard.emptyReceived')}
            </p>
          )}

          <div className={cn('space-y-3')}>
            {received.map(item => (
              <ReceivedPermissionCard key={item.id} permission={item} t={t} />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.12 }}
          className={cn(
            'border-border dark:border-dark-border dark:bg-dark-bg rounded-2xl border bg-white p-4 md:p-5'
          )}
        >
          <h2 className={cn('mb-4 text-lg font-semibold')}>
            {t('share:permissionsDashboard.sharedTitle')}
          </h2>

          {!mergedShared.length && (
            <p
              className={cn('text-secondary dark:text-dark-secondary text-sm')}
            >
              {t('share:permissionsDashboard.emptyShared')}
            </p>
          )}

          <div className={cn('space-y-3')}>
            {mergedShared.map(({ permission, draft }) => (
              <SharedPermissionCard
                key={permission.id}
                permission={permission}
                draft={draft}
                disabledDelete={isDeleting}
                disabledUpdate={isUpdating}
                onChange={(field, value, fallback) =>
                  setDraftValue(permission.id, field, value, fallback)
                }
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                t={t}
              />
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};
