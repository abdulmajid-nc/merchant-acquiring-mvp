import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';
import formatCurrency from './utils/formatCurrency';
import TransactionTable from './components/TransactionTable';
import TransactionStatusBadge from './components/TransactionStatusBadge';
import StatusBadge from './components/StatusBadge';
import StatsCard from './components/StatsCard';
import TransactionDetailsModal from './components/TransactionDetailsModal';
import { SYSTEM_STATUSES } from './constants/transactionConstants';

function AdminPanel() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [transactionStatusResult, setTransactionStatusResult] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    revenue: { value: '$345,678', change: '+12%', period: 'vs. last month' },
    transactions: { value: '12,345', change: '+8%', period: 'vs. last month' },
    activeMerchants: { value: '189', change: '+5%', period: 'vs. last month' },
    successRate: { value: '99.2%', change: '+0.5%', period: 'vs. last month' }
  });

  const [systemHealth, setSystemHealth] = useState({
    visa: { status: 'Operational', latency: '120ms', uptime: '99.99%' },
    mastercard: { status: 'Operational', latency: '115ms', uptime: '99.98%' },
    pciDss: { status: 'Compliant', lastCheck: '2025-08-19' }
  });

  // Fetch transactions when component mounts
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.TRANSACTIONS);
      setTransactions(response.transactions || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions. Please try again later.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const checkTransactionStatus = async () => {
    if (!transactionId.trim()) {
      showError('Please enter a transaction ID');
      return;
    }

    setIsLoadingStatus(true);
    setTransactionStatusResult(null);

    try {
      const response = await api.get(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}`);
      if (response) {
        setTransactionStatusResult({
          status: response.status,
          message: `Transaction ${response.status.toLowerCase()} at ${new Date(response.timestamp).toLocaleString()}`
        });
      } else {
        throw new Error('Transaction not found');
      }
    } catch (err) {
      console.error('Failed to check transaction status:', err);
      setTransactionStatusResult({
        error: 'Transaction not found or invalid ID'
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Helper for feedback
  const showSuccess = msg => {
    setNotification({ type: 'success', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 2500);
  };

  const showError = msg => {
    setNotification({ type: 'error', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
      <main className="container mx-auto px-2 sm:px-4 py-6">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Dashboard</h1>
            <p className="text-gray-500 text-base">Welcome to Nymcard Acquire — Your comprehensive payment processing platform</p>
          </div>
        </header>

        {/* Stats Cards */}
        <section aria-label="Dashboard Metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h6 className="text-gray-500 text-sm font-medium">Total Revenue</h6>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{dashboardStats.revenue.value}</h2>
              <div className="flex items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  dashboardStats.revenue.change.startsWith('+') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardStats.revenue.change}
                </span>
                <span className="text-gray-500 text-xs ml-2">{dashboardStats.revenue.period}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h6 className="text-gray-500 text-sm font-medium">Transactions</h6>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{dashboardStats.transactions.value}</h2>
              <div className="flex items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  dashboardStats.transactions.change.startsWith('+') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardStats.transactions.change}
                </span>
                <span className="text-gray-500 text-xs ml-2">{dashboardStats.transactions.period}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h6 className="text-gray-500 text-sm font-medium">Active Merchants</h6>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{dashboardStats.activeMerchants.value}</h2>
              <div className="flex items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  dashboardStats.activeMerchants.change.startsWith('+') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardStats.activeMerchants.change}
                </span>
                <span className="text-gray-500 text-xs ml-2">{dashboardStats.activeMerchants.period}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h6 className="text-gray-500 text-sm font-medium">Success Rate</h6>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{dashboardStats.successRate.value}</h2>
              <div className="flex items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  dashboardStats.successRate.change.startsWith('+') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardStats.successRate.change}
                </span>
                <span className="text-gray-500 text-xs ml-2">{dashboardStats.successRate.period}</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Recent Transactions */}
        <section className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-8 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-bold">Recent Transactions</h5>
            <div className="text-sm text-blue-600 hover:underline cursor-pointer">View All</div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terminal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 10).map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                        {tx.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.merchant_name || (tx.merchant && typeof tx.merchant === 'object' ? tx.merchant.name : tx.merchant) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.terminal_id || (tx.terminal && typeof tx.terminal === 'object' ? tx.terminal.serial_number : tx.terminal) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(tx.created_at).toLocaleString(undefined, {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.masked_pan || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <TransactionStatusBadge status={tx.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="text-gray-600 hover:text-blue-600 mr-2"
                          title="View Details"
                          onClick={() => setSelectedTransaction(tx)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No transactions available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {notification.type && (
          <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
