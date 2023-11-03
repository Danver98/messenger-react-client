import { StompSessionProvider } from 'react-stomp-hooks';
import './App.css';
import AuthProvider from './middleware/AuthProvider';
import Routing from './routing/Routing';
import { ServiceUrl } from './util/Constants';
import ChatDataProvider from './middleware/stomp/StompChatDataProvider';

function App() {
  return (
    <StompSessionProvider
      url={ServiceUrl.BACKEND_SERVICE_WEB_SOCKET_URL}
      onConnect={(frame: any) => {
        console.log(`Successfully connected to server websocket!`);
      }}
      onDisconnect={(frame: any) => {
        console.log(`Successfully disconnected from server websocket!`);
      }}
    >
      <ChatDataProvider>
        <AuthProvider>
          <Routing />
        </AuthProvider>
      </ChatDataProvider>
    </StompSessionProvider>
  )
}

export default App;
