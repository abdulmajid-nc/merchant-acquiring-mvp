import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Register';
import Status from './Status';
import Admin from './Admin';
import MerchantManagementWrapper from './MerchantManagement';
import AdminPanelWrapper from './AdminPanel';
import TerminalManagementWrapper from './TerminalManagement';

import Layout from './Layout';

function RegisterWrapper() {
  return <Register />;
}

function StatusWrapper() {
  return <Status />;
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RegisterWrapper />} />
          <Route path="/status" element={<StatusWrapper />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/merchant-management" element={<MerchantManagementWrapper />} />
          <Route path="/admin-panel" element={<AdminPanelWrapper />} />
          <Route path="/terminal-management" element={<TerminalManagementWrapper />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
