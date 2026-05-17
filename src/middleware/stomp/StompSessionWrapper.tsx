// StompSessionWrapper.tsx
import React, { useMemo } from 'react';
import { StompSessionProvider } from 'react-stomp-hooks';
import { useAuthContextData } from '../../middleware/AuthProvider';
import { ServiceUrl, Headers } from '../../util/Constants';

interface StompSessionWrapperProps {
  children: React.ReactNode;
}

const StompSessionWrapper: React.FC<StompSessionWrapperProps> = ({ children }) => {
  const { getAccessToken } = useAuthContextData();
  
  // Get token and prepare connection headers
  const connectHeaders = useMemo(() => {
    const token = getAccessToken?.();
    return {
      [Headers.AUTHORIZATION]: token ? `Bearer ${token}` : '',
    };
  }, [getAccessToken]);

  // Always render StompSessionProvider, but it won't connect without a token
  // Use a dummy URL or disable connection when no token
  const shouldConnect = !!connectHeaders.Authorization;
  

  return (
    <StompSessionProvider
      url={ServiceUrl.BACKEND_SERVICE_WEB_SOCKET_URL}
      connectHeaders={connectHeaders}
      onConnect={(frame: any) => {
        console.log(`Successfully connected to server websocket with auth!`);
      }}
      onDisconnect={(frame: any) => {
        console.log(`Successfully disconnected from server websocket!`);
      }}
      onStompError={(error: any) => {
        console.error('STOMP error:', error);
      }}
      onWebSocketClose={(event: CloseEvent) => {
        console.log('WebSocket closed:', event);
      }}
    >
      {children}
    </StompSessionProvider>
  );
};

export default StompSessionWrapper;