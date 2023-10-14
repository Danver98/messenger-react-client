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

function App() {

  return (
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route path='/secured' element={<ProtectedRoute />}>
            <Route element={<Home />}></Route>
            <Route path='/secured/chats' element={<Chats userId={100}/>}></Route>
            <Route path='/secured/chats/room' element={<ChatRoom />}></Route>
          </Route>
          <Route path='/intro' element={<Intro />}/>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/login' element={<Login />}></Route>
        </Route>
      </Routes>
  );
}

export default App;
