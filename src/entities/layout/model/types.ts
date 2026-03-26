export interface LayoutPermission {
  canRead: boolean;
  canWrite: boolean;
  canEdit: boolean;
}

export interface Layout {
  id: string;
  title: string;
  ownerId: string;
  isMain: boolean;
  color?: string;
  permission: LayoutPermission;
  createdAt?: string;
  updatedAt?: string;
}
