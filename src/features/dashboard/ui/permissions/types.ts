import type { PermissionItem } from '@/entities';

export interface EditablePermissionState {
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
}

export interface SharedPermissionViewModel {
  permission: PermissionItem;
  draft: EditablePermissionState;
}
