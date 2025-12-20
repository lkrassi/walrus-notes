import React, { createContext, useContext, useEffect } from 'react';
import useWebSocket from 'widgets/hooks/useWebSocket';
import { buildWsUrl } from 'shared/config/ws';

type WSContextValue = ReturnType<typeof useWebSocket> | null;

const WebSocketContext = createContext<WSContextValue>(null);

export const useWSContext = () => {
  return useContext(WebSocketContext);
};

interface Props {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<Props> = ({ children }) => {
  const userId =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('userId') || ''
      : '';

  const wsUrl = buildWsUrl(undefined, userId);
  const ws = useWebSocket({ url: wsUrl, userId });

  useEffect(() => {
  }, [wsUrl, userId]);

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
