export type WSEventName = string;

export interface WSEvent<T = unknown> {
  event: WSEventName;
  payload: T;
}
