import type { RootState } from '@/app/store';
import { buildWsUrl } from '@/shared/config/ws';
import { useWebSocket } from '@/shared/lib/hooks';
import { createContext, useContext, type FC, type ReactNode } from 'react';
import { useSelector } from 'react-redux';

type WSContextValue = ReturnType<typeof useWebSocket> | null;

const WebSocketContext = createContext<WSContextValue>(null);

export const useWSContext = () => {
  return useContext(WebSocketContext);
};

interface Props {
  children: ReactNode;
}

export const WebSocketProvider: FC<Props> = ({ children }) => {
  const profile = useSelector((state: RootState) => state.user.profile);
  const userId = profile?.id;

  const wsUrl = userId ? buildWsUrl(undefined, userId) : '';
  const ws = useWebSocket({ url: wsUrl, userId: userId || '' });

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};
