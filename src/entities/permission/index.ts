export {
  useApplyLinkMutation,
  useDeletePermissionMutation,
  useGenerateLinkMutation,
  useGetPermissionsDashboardQuery,
  useUpdatePermissionMutation,
} from './api';

export type { PermissionItem, PermissionsDashboardData } from './api';

export {
  permissionsReducer,
  resetGeneratedLink,
  selectLastGeneratedLink,
} from './model';
export type { PermissionsState } from './model';
