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
import MockDataTester from './MockDataTester';
import FeeStructureManagement from './FeeStructureManagement';
import VolumeTierManagement from './VolumeTierManagement';
import AssignFeeStructure from './AssignFeeStructure';

import Layout from './Layout';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import NotificationBanner from './components/NotificationBanner';
import { setMockDataNotifier } from './utils/api';

function RegisterWrapper() {
  return <Register />;
}

function StatusWrapper() {
  return <Status />;
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
        <Route path="/fee-structure-management" element={<FeeStructureManagement />} />
        <Route path="/fee-structure/:id/volume-tiers" element={<VolumeTierManagement />} />
        <Route path="/fee-structure/:id/assign" element={<AssignFeeStructure />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <NotificationProvider>
          <Layout>
            <AppWithNotifications />
          </Layout>
        </NotificationProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
