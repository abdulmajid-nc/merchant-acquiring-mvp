import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Register';
import Status from './Status';
import Admin from './Admin';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Register</Link> | <Link to="/status">Status</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/status" element={<Status />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
