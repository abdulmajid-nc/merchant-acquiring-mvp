import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Register';
import Status from './Status';
import Admin from './Admin';
import MerchantManagement from './MerchantManagement';
import AdminPanel from './AdminPanel';
import TerminalManagement from './TerminalManagement';
import MccManagement from './MccManagement';
import MerchantPricing from './MerchantPricing';
import TestMerchantList from './TestMerchantList';
import ApiDebugger from './ApiDebugger';
import DirectApiTest from './DirectApiTest';
import Analytics from './Analytics';
import MockDataTester from './MockDataTester';

import Layout from './Layout';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import NotificationBanner from './components/NotificationBanner';
import { setMockDataNotifier } from './utils/api';

function RegisterWrapper() {
  return <Register />;
}

function StatusWrapper() {
  return <Status />;
}

function AnalyticsWrapper() {
  return <Analytics />;
}

// This component connects the API mock data notifications to our notification system
function AppWithNotifications() {
  const { setUsingMockData } = useNotification();
  
  useEffect(() => {
    // Register our notification callback with the API utility
    setMockDataNotifier(setUsingMockData);
  }, [setUsingMockData]);
  
  return (
    <>
      <NotificationBanner />
      <Routes>
        <Route path="/" element={<RegisterWrapper />} />
        <Route path="/status" element={<StatusWrapper />} />
        <Route path="/analytics" element={<AnalyticsWrapper />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/merchant-management" element={<MerchantManagement />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/terminal-management" element={<TerminalManagement />} />
        <Route path="/mcc-management" element={<MccManagement />} />
        <Route path="/merchant/:id/pricing" element={<MerchantPricing />} />
        <Route path="/test-merchants" element={<TestMerchantList />} />
        <Route path="/debug" element={<ApiDebugger />} />
        <Route path="/direct-test" element={<DirectApiTest />} />
        <Route path="/mock-test" element={<MockDataTester />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <NotificationProvider>
        <Layout>
          <AppWithNotifications />
        </Layout>
      </NotificationProvider>
    </Router>
  );
}

export default App;
