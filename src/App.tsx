import './App.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './middleware/AuthProvider';
import Routing from './routing/Routing';
import { Provider as BusProvider } from 'react-bus';
import ChatDataProvider from './middleware/stomp/StompChatDataProvider';
import StompSessionProvider from './middleware/stomp/StompSessionWrapper';

function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            padding: '12px 20px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <BusProvider>
        <AuthProvider>
          <StompSessionProvider>
            <ChatDataProvider>
              <Routing />
            </ChatDataProvider>
          </StompSessionProvider>
        </AuthProvider>
      </BusProvider>
    </>
  )
}

export default App;