import { apiSlice } from '@/shared/api';

export interface GenerateLinkRequest {
  targetId: string;
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
  expiredAt: string | null;
}

interface GenerateLinkResponse {
  data: {
    linkId: string;
  };
  meta: Record<string, unknown>;
}

interface ApplyLinkRequest {
  linkId: string;
}

interface ApplyLinkResponse {
  data: {
    targetId: string;
    kind: 'PERMISSIONS_KIND_LAYOUT' | 'PERMISSIONS_KIND_NOTE';
  };
  meta: Record<string, unknown>;
}

export interface PermissionItem {
  id: string;
  canEdit: boolean;
  canRead: boolean;
  canWrite: boolean;
  fromUserId: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  toUserId: string;
  toUserName?: string;
  toUserAvatar?: string;
  kind: string;
  targetId: string;
  targetTitle?: string;
}

interface RawPermissionItem {
  canEdit?: boolean;
  canRead?: boolean;
  canWrite?: boolean;
  fromUserId?: string;
  fromUserName?: string;
  fromUsername?: string;
  fromUserAvatar?: string;
  fromUserImgUrl?: string;
  kind?: string;
  targetId?: string;
  targetTitle?: string;
  title?: string;
  permissionId?: string;
  id?: string;
  uuid?: string;
  'uuid.UUID'?: string;
}

interface PermissionsDashboardResponse {
  data: {
    recivied?: RawPermissionItem[];
    received?: RawPermissionItem[];
    shared?: RawPermissionItem[];
  };
  meta: Record<string, unknown>;
  pagination?: {
    page: number;
    pages: number;
    perPage: number;
  };
}

export interface PermissionsDashboardData {
  received: PermissionItem[];
  shared: PermissionItem[];
}

interface DeletePermissionRequest {
  permissionId: string;
}

interface UpdatePermissionRequest {
  permissionsId: string;
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
}

export const shareApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPermissionsDashboard: builder.query<PermissionsDashboardData, void>({
      query: () => '/permissions/dashboard',
      providesTags: ['Permissions'],
      transformResponse: (response: PermissionsDashboardResponse) => {
        const extractId = (item: RawPermissionItem): string =>
          item.permissionId ||
          item.id ||
          item.uuid ||
          item['uuid.UUID'] ||
          `${item.fromUserId || 'unknown'}:${item.targetId || 'unknown'}:${item.kind || 'unknown'}`;

        const mapPermission = (item: RawPermissionItem): PermissionItem => ({
          id: extractId(item),
          canEdit: item.canEdit ?? false,
          canRead: item.canRead ?? false,
          canWrite: item.canWrite ?? false,
          fromUserId: item.fromUserId ?? '',
          fromUserName: item.fromUserName || item.fromUsername,
          fromUserAvatar: item.fromUserAvatar || item.fromUserImgUrl,
          toUserId: (item as any).toUserId ?? '',
          toUserName: (item as any).toUserName,
          toUserAvatar: (item as any).toUserAvatar,
          kind: item.kind ?? 'PERMISSIONS_KIND_UNSPECIFIED',
          targetId: item.targetId ?? '',
          targetTitle: item.targetTitle || item.title,
        });

        const receivedRaw =
          response.data.recivied || response.data.received || [];
        const sharedRaw = response.data.shared || [];

        return {
          received: receivedRaw.map(mapPermission),
          shared: sharedRaw.map(mapPermission),
        };
      },
    }),

    generateLink: builder.mutation<
      { linkId: string; fullUrl: string },
      GenerateLinkRequest
    >({
      query: payload => ({
        url: '/permissions/links/generate',
        method: 'POST',
        body: {
          targetId: payload.targetId,
          canRead: payload.canRead,
          canWrite: payload.canWrite,
          canEdit: payload.canEdit,
          expiredAt: payload.expiredAt,
        },
      }),
      transformResponse: (response: GenerateLinkResponse) => {
        const baseUrl = window.location.origin;
        return {
          linkId: response.data.linkId,
          fullUrl: `${baseUrl}/apply?linkId=${response.data.linkId}`,
        };
      },
    }),

    applyLink: builder.mutation<ApplyLinkResponse['data'], ApplyLinkRequest>({
      query: payload => ({
        url: '/permissions/links/apply',
        method: 'POST',
        body: { linkId: payload.linkId },
      }),
      transformResponse: (response: ApplyLinkResponse) => response.data,
    }),

    deletePermission: builder.mutation<string, DeletePermissionRequest>({
      query: payload => ({
        url: '/permissions/delete',
        method: 'POST',
        body: { permissionId: payload.permissionId },
      }),
      invalidatesTags: ['Permissions'],
      transformResponse: (response: { data: string }) => response.data,
    }),

    updatePermission: builder.mutation<string, UpdatePermissionRequest>({
      query: payload => ({
        url: '/permissions/update',
        method: 'POST',
        body: {
          permissionsId: payload.permissionsId,
          canRead: payload.canRead,
          canWrite: payload.canWrite,
          canEdit: payload.canEdit,
        },
      }),
      invalidatesTags: ['Permissions'],
      transformResponse: (response: { data: string }) => response.data,
    }),
  }),
});

export const {
  useGetPermissionsDashboardQuery,
  useGenerateLinkMutation,
  useApplyLinkMutation,
  useDeletePermissionMutation,
  useUpdatePermissionMutation,
} = shareApi;
