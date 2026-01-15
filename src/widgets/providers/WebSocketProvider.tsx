import React, { createContext, useContext } from 'react';
import useWebSocket from 'widgets/hooks/useWebSocket';
import { buildWsUrl } from 'shared/config/ws';
import { useAppSelector } from 'widgets/hooks/redux';

type WSContextValue = ReturnType<typeof useWebSocket> | null;

const WebSocketContext = createContext<WSContextValue>(null);

export const useWSContext = () => {
  return useContext(WebSocketContext);
};

interface Props {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<Props> = ({ children }) => {
  const { profile } = useAppSelector(state => state.user);
  const userId = profile?.id;

  // Don't create WebSocket URL until userId is available
  const wsUrl = userId ? buildWsUrl(undefined, userId) : '';
  const ws = useWebSocket({ url: wsUrl, userId: userId || '' });

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
