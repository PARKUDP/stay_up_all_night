import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Classes from './components/Classes';
import Assignments from './components/Assignments';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Classes />} />
        <Route path="/assignments/:classId" element={<Assignments />} />
      </Routes>
    </Router>
  );
}

export default App;
