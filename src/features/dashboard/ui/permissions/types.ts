import type { PermissionItem } from 'app/store';

export interface EditablePermissionState {
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
}

export interface SharedPermissionViewModel {
  permission: PermissionItem;
  draft: EditablePermissionState;
}
