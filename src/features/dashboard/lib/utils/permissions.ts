import type { PermissionItem } from '@/entities';
import type { EditablePermissionState } from '../../model';

export type PermissionRight = 'read' | 'write' | 'edit';

export const initialFromPermission = (
  permission: PermissionItem
): EditablePermissionState => ({
  canRead: permission.canRead,
  canWrite: permission.canWrite,
  canEdit: permission.canEdit,
});

export const kindLabelKey = (kind: string) => {
  if (kind.includes('LAYOUT')) return 'share:permissionsDashboard.kind.layout';
  return 'share:permissionsDashboard.kind.unknown';
};

export const createFriendlyUserName = (
  userName: string | undefined,
  fallbackLabel: string
) => {
  if (userName && userName.trim().length > 0) {
    return userName;
  }

  return fallbackLabel;
};

export const createFriendlyTargetName = (
  targetTitle: string | undefined,
  kind: string,
  layoutLabel: string,
  noteLabel: string,
  unknownLabel: string
) => {
  if (targetTitle && targetTitle.trim().length > 0) {
    return targetTitle;
  }

  const kindLabel = kind.includes('LAYOUT')
    ? layoutLabel
    : kind.includes('NOTE')
      ? noteLabel
      : unknownLabel;

  return kindLabel;
};

export const rightsList = (state: EditablePermissionState) => {
  const values: PermissionRight[] = [];

  if (state.canRead) values.push('read');
  if (state.canWrite) values.push('write');
  if (state.canEdit) values.push('edit');

  return values;
};

export const rightTooltipKey = (right: PermissionRight) =>
  `share:permissionsDashboard.rightsDescriptions.${right}`;

export const isPermissionDraftDirty = (
  permission: PermissionItem,
  draft: EditablePermissionState
) =>
  permission.canRead !== draft.canRead ||
  permission.canWrite !== draft.canWrite ||
  permission.canEdit !== draft.canEdit;
