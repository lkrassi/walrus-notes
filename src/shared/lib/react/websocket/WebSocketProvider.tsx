import { buildWsUrl } from '@/shared/config';
import { createContext, useContext, type FC, type ReactNode } from 'react';
import { useWebSocket } from './useWebSocket';

type WSContextValue = ReturnType<typeof useWebSocket> | null;

const WebSocketContext = createContext<WSContextValue>(null);

export const useWSContext = () => {
  return useContext(WebSocketContext);
};

interface Props {
  children: ReactNode;
  userId?: string;
}

export const WebSocketProvider: FC<Props> = ({ children, userId }) => {
  const normalizedUserId = userId ?? '';

  const wsUrl = normalizedUserId ? buildWsUrl(undefined, normalizedUserId) : '';
  const ws = useWebSocket({ url: wsUrl, userId: normalizedUserId });
  const value = normalizedUserId ? ws : null;

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
