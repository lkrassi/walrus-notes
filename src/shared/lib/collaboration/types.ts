export interface UserInfo {
  id: string;
  name: string;
  color?: string;
}

export interface CursorInfo {
  index: number;
  selectionStart: number;
  selectionEnd: number;
  anchor: unknown;
  head: unknown;
  updatedAt: number;
}

export interface AwarenessUser {
  clientId?: number;
  isLocal?: boolean;
  user: UserInfo;
  cursor?: CursorInfo;
}
