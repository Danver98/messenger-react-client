import './App.css';
import {  Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './components/Pages/Home';
import Register from './components/Pages/Register/Register';
import Login from './components/Pages/Login/Login';
import Chats from './components/Pages/Chats/Chats';
import Intro from './components/Pages/Intro';
import ProtectedRoute from './middleware/ProtectedRoute';
import ChatRoom from './components/Pages/Chats/ChatRoom';
import AuthProvider from './middleware/AuthProvider';
import Routing from './routing/Routing';

function App() {
  return (
    <AuthProvider>
      <Routing />
    </AuthProvider>
  )
}

export default App;
