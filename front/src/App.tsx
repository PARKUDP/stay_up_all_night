import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Classes from './components/Classes';
import Assignments from './components/Assignments';
import Login from './components/login';

function App() {
    const handleLogin = (email: string, password: string) => {
      console.log('ログインされたメールアドレス:', email, 'とパスワード:', password);
    };

  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login onSubmit={handleLogin} />} />
        <Route path="/" element={<Classes />} />
        <Route path="/assignments/:classId" element={<Assignments />} />
      </Routes>
    </Router>
    );
}


export default App;
