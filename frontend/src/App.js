import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Register';
import Status from './Status';
import Admin from './Admin';
import MerchantManagementWrapper from './MerchantManagement';
import AdminPanelWrapper from './AdminPanel';
import TerminalManagementWrapper from './TerminalManagement';
import MccManagement from './MccManagement';
import MerchantPricing from './MerchantPricing';
import TestMerchantList from './TestMerchantList';
import ApiDebugger from './ApiDebugger';
import DirectApiTest from './DirectApiTest';
import Analytics from './Analytics';

import Layout from './Layout';

function RegisterWrapper() {
  return <Register />;
}

function StatusWrapper() {
  return <Status />;
}

function AnalyticsWrapper() {
  return <Analytics />;
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RegisterWrapper />} />
          <Route path="/status" element={<StatusWrapper />} />
          <Route path="/analytics" element={<AnalyticsWrapper />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/merchant-management" element={<MerchantManagementWrapper />} />
          <Route path="/admin-panel" element={<AdminPanelWrapper />} />
          <Route path="/terminal-management" element={<TerminalManagementWrapper />} />
          <Route path="/mcc-management" element={<MccManagement />} />
          <Route path="/merchant/:id/pricing" element={<MerchantPricing />} />
          <Route path="/test-merchants" element={<TestMerchantList />} />
          <Route path="/debug" element={<ApiDebugger />} />
          <Route path="/direct-test" element={<DirectApiTest />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
