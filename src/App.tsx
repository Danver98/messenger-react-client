import './App.css';
import {  Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import Chats from './components/Chats';
import Intro from './components/Intro';
import ProtectedRoute from './middleware/ProtectedRoute';

function App() {

  return (
    <div className="main-wrapper">
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route path='/secured' element={<ProtectedRoute />}>
            <Route element={<Home />}></Route>
            <Route path='/secured/chats' element={<Chats />}></Route>
          </Route>
          <Route path='/intro' element={<Intro />}/>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/login' element={<Login />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
