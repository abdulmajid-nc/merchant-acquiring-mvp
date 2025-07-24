import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Register';
import Status from './Status';
import Admin from './Admin';
import MerchantManagement from './MerchantManagement';
import AdminPanel from './AdminPanel';
import TerminalManagement from './TerminalManagement';

function App() {
  return (
    <Router>
      <nav style={{marginBottom: '1em'}}>
        <Link to="/">Register</Link> |{' '}
        <Link to="/status">Status</Link> |{' '}
        <Link to="/admin">Admin</Link> |{' '}
        <Link to="/merchant-management">Merchant Management</Link> |{' '}
        <Link to="/admin-panel">Admin Panel</Link> |{' '}
        <Link to="/terminal-management">Terminal Management</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/status" element={<Status />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/merchant-management" element={<MerchantManagement />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/terminal-management" element={<TerminalManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
