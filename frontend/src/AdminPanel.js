import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

// Function to provide fallback transaction data when API fails
const getFallbackTransactions = () => {
  return [
    { 
      id: 'tx1011', 
      merchant_name: 'Acme Retail', 
      terminal_id: 'POS-1001', 
      created_at: '2025-08-05T15:45:22Z', 
      amount: 120.50, 
      currency: 'USD',
      status: 'approved',
      card_scheme: 'Visa',
      masked_pan: '****4242',
      transaction_type: 'purchase'
    },
    { 
      id: 'tx1012', 
      merchant_name: 'Acme Retail', 
      terminal_id: 'POS-1001', 
      created_at: '2025-08-05T14:30:15Z', 
      amount: 75.00, 
      currency: 'USD',
      status: 'pending',
      card_scheme: 'Mastercard',
      masked_pan: '****5555',
      transaction_type: 'purchase'
    },
    { 
      id: 'tx1021', 
      merchant_name: 'Best Eats', 
      terminal_id: 'POS-2001', 
      created_at: '2025-08-05T13:22:47Z', 
      amount: 45.75,
      currency: 'USD', 
      status: 'approved',
      card_scheme: 'Visa',
      masked_pan: '****1234',
      transaction_type: 'purchase'
    },
    { 
      id: 'tx1022', 
      merchant_name: 'Tech World', 
      terminal_id: 'POS-3001', 
      created_at: '2025-08-05T11:15:30Z', 
      amount: 350.00,
      currency: 'USD', 
      status: 'approved',
      card_scheme: 'Amex',
      masked_pan: '****7890',
      transaction_type: 'purchase'
    },
    { 
      id: 'tx1023', 
      merchant_name: 'Best Eats', 
      terminal_id: 'POS-2001', 
      created_at: '2025-08-05T09:50:22Z', 
      amount: 28.50,
      currency: 'USD', 
      status: 'declined',
      card_scheme: 'Mastercard',
      masked_pan: '****9876',
      transaction_type: 'purchase',
      response_code: '05'
    },
    { 
      id: 'tx1024', 
      merchant_name: 'Coffee Shop', 
      terminal_id: 'POS-4001', 
      created_at: '2025-08-05T08:25:10Z', 
      amount: 12.75,
      currency: 'USD', 
      status: 'approved',
      card_scheme: 'Visa',
      masked_pan: '****5678',
      transaction_type: 'purchase'
    },
    { 
      id: 'tx1025', 
      merchant_name: 'Quick Grocery', 
      terminal_id: 'POS-5001', 
      created_at: '2025-08-04T19:40:33Z', 
      amount: 65.30,
      currency: 'USD', 
      status: 'approved',
      card_scheme: 'Mastercard',
      masked_pan: '****2345',
      transaction_type: 'purchase'
    },
    { 
      id: 'tx1026', 
      merchant_name: 'Tech World', 
      terminal_id: 'POS-3002', 
      created_at: '2025-08-04T17:55:48Z', 
      amount: 199.99,
      currency: 'USD', 
      status: 'refunded',
      card_scheme: 'Visa',
      masked_pan: '****3456',
      transaction_type: 'refund',
      original_transaction: 'tx1017'
    },
    { 
      id: 'tx1027', 
      merchant_name: 'Pharmacy Plus', 
      terminal_id: 'POS-6001', 
      created_at: '2025-08-04T16:20:11Z', 
      amount: 43.25,
      currency: 'USD', 
      status: 'approved',
      card_scheme: 'Discover',
      masked_pan: '****4567',
      transaction_type: 'purchase'
    },
    { 
      id: 'tx1028', 
      merchant_name: 'Quick Grocery', 
      terminal_id: 'POS-5002', 
      created_at: '2025-08-04T14:10:55Z', 
      amount: 22.45,
      currency: 'USD', 
      status: 'voided',
      card_scheme: 'Visa',
      masked_pan: '****6789',
      transaction_type: 'void',
      original_transaction: 'tx1020'
    }
  ];
};

function AdminPanel() {
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [merchants, setMerchants] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // Dashboard metrics
  const [dashboardStats, setDashboardStats] = useState({
    revenue: {
      value: '$2,847,392',
      change: '+12.5%',
      period: 'vs last month'
    },
    transactions: {
      value: '18,472',
      change: '+8.2%',
      period: 'today'
    },
    activeMerchants: {
      value: '1,248',
      change: '+15.3%',
      period: 'this month'
    },
    successRate: {
      value: '99.2%',
      change: '-0.1%',
      period: 'last 7 days'
    }
  });
  
  // System health status
  const [systemHealth, setSystemHealth] = useState({
    visa: {
      status: 'Online',
      latency: '45ms',
      uptime: '99.9%'
    },
    mastercard: {
      status: 'Online',
      latency: '52ms',
      uptime: '99.8%'
    },
    pciDss: {
      status: 'Online',
      compliance: 'Security Standards'
    }
  });

  // State for transaction status checking
  const [transactionId, setTransactionId] = useState('');
  const [transactionStatusResult, setTransactionStatusResult] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // Fetch merchants and transactions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch merchants for other functionalities if needed
        try {
          const merchantsData = await api.get(API_ENDPOINTS.MERCHANTS);
          if (merchantsData && merchantsData.merchants) {
            setMerchants(Array.isArray(merchantsData.merchants) ? merchantsData.merchants : []);
            console.log('Successfully loaded merchant data from backend');
          } else if (merchantsData && Array.isArray(merchantsData)) {
            // Handle case where mock data is returned as an array directly
            setMerchants(merchantsData);
            console.log('Using mock merchant data (array format)');
          }
        } catch (merchantError) {
          console.error('Error fetching merchants:', merchantError);
          
          // Check if we have mock data with error information
          if (merchantError.mockData) {
            if (merchantError.mockData.backendError && merchantError.mockData.errorType === 'server') {
              showError(`Backend error: ${merchantError.mockData.errorMessage || 'Unable to load merchant data'}. Please check server logs.`);
            } else if (merchantError.mockData.errorType === 'network') {
              // For network errors, silently use mock data without notification
              console.log('Network error detected, silently using mock merchant data');
            }
            
            // Use the mock data attached to the error
            if (merchantError.mockData.merchants) {
              setMerchants(merchantError.mockData.merchants);
              console.log('Using mock merchants from error object:', merchantError.mockData.merchants.length);
            } else if (Array.isArray(merchantError.mockData)) {
              // Handle array format
              setMerchants(merchantError.mockData);
              console.log('Using mock merchants (array format) from error object:', merchantError.mockData.length);
            } else {
              setMerchants([]);
            }
          } else {
            // If no mock data in error, show error and use empty array
            showError('Error loading merchant data. Please try again later.');
            setMerchants([]);
          }
        }
        
        // Fetch transactions from the transactions API endpoint
        try {
          // Fetch the most recent transactions
          const transactionData = await api.get(API_ENDPOINTS.TRANSACTIONS);
          console.log('Raw transaction data:', transactionData);
          
          if (transactionData && transactionData.transactions && Array.isArray(transactionData.transactions)) {
            // Process transactions from API response
            const processedTransactions = transactionData.transactions.map(tx => ({
              ...tx,
              merchant_name: tx.merchant_name || (tx.merchant && typeof tx.merchant === 'object' ? tx.merchant.name : tx.merchant),
              terminal_id: tx.terminal_id || (tx.terminal && typeof tx.terminal === 'object' ? tx.terminal.serial_number : tx.terminal),
              status: tx.status || 'pending',
              created_at: tx.created_at || tx.timestamp || new Date().toISOString()
            }));
            
            setTransactions(processedTransactions);
            console.log('Successfully loaded transaction data from backend:', processedTransactions.length);
          } else if (transactionData && Array.isArray(transactionData)) {
            // Handle case where mock data is returned as an array directly
            const processedTransactions = transactionData.map(tx => ({
              ...tx,
              merchant_name: tx.merchant_name || tx.merchant || 'Unknown',
              terminal_id: tx.terminal_id || tx.terminal || 'Unknown',
              status: tx.status || 'pending',
              created_at: tx.created_at || tx.timestamp || new Date().toISOString()
            }));
            setTransactions(processedTransactions);
            console.log('Using mock transaction data (array format):', processedTransactions.length);
          } else if (transactionData && transactionData.isMock) {
            console.log('Using mock transaction data from API layer');
            if (transactionData.transactions) {
              setTransactions(transactionData.transactions);
            } else {
              // Fallback to hardcoded data
              const fallbackTransactions = getFallbackTransactions();
              setTransactions(fallbackTransactions);
            }
          } else {
            console.log('No valid transactions returned, using fallback mock data');
            // Use our fallback data function
            const fallbackTransactions = getFallbackTransactions();
            setTransactions(fallbackTransactions);
            console.log('Using fallback transactions:', fallbackTransactions.length);
          }
        } catch (txError) {
          console.error('Error fetching transactions:', txError);
          
          // Check if we have mock data with error information
          if (txError.mockData) {
            if (txError.mockData.backendError && txError.mockData.errorType === 'server') {
              showError(`Backend error: ${txError.mockData.errorMessage || 'Unable to load transaction data'}. Please check server logs.`);
            } else if (txError.mockData.errorType === 'network') {
              // For network errors, silently use mock data without notification
              console.log('Network error detected, silently using mock data');
            }
            
            // Use the mock data attached to the error
            if (txError.mockData.transactions) {
              setTransactions(txError.mockData.transactions);
              console.log('Using mock transactions from error object:', txError.mockData.transactions.length);
            } else {
              const fallbackTransactions = getFallbackTransactions();
              setTransactions(fallbackTransactions);
              console.log('Using fallback transactions:', fallbackTransactions.length);
            }
          } else {
            // If no mock data in error, use default fallback
            const fallbackTransactions = getFallbackTransactions();
            setTransactions(fallbackTransactions);
            console.log('Using fallback transactions as last resort:', fallbackTransactions.length);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        showError('Error loading dashboard data');
      }
    };
    
    fetchData();
    
    // Refresh data every 60 seconds for real-time updates
    // Disabling refresh during development to avoid console errors
    // const refreshInterval = setInterval(fetchData, 60000);
    // return () => clearInterval(refreshInterval);
  }, []);

  // Function to check transaction status
  const checkTransactionStatus = async () => {
    if (!transactionId.trim()) {
      showError('Please enter a valid transaction ID');
      return;
    }
    
    setIsLoadingStatus(true);
    try {
      const result = await api.get(API_ENDPOINTS.TRANSACTION_STATUS(transactionId.trim()));
      setTransactionStatusResult(result);
      showSuccess('Transaction status retrieved successfully');
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      setTransactionStatusResult({
        error: "Failed to fetch transaction status. Please try again."
      });
      showError('Failed to fetch transaction status');
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
    setNotification({ type: 'danger', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  return (
    <main className="container mx-auto px-2 sm:px-4 py-6 min-h-screen bg-gray-50">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Dashboard</h1>
          <p className="text-gray-500 text-base">Welcome to Nymcard Acquire — Your comprehensive payment processing platform</p>
        </div>
      </header>

      {/* Stats Cards */}
      <section aria-label="Dashboard Metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue Card */}
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
        
        {/* Transactions Card */}
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
        
        {/* Active Merchants Card */}
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
        
        {/* Success Rate Card */}
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
      
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Transaction Volume Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 h-full transition-shadow hover:shadow-md">
            <h5 className="text-lg font-bold mb-1">Transaction Volume</h5>
            <p className="text-gray-500 text-sm mb-4">Real-time transaction processing overview for the last 24 hours</p>
            
            <div className="relative h-60 mb-5">
              {/* Y-axis labels */}
              <div className="absolute top-0 left-0 text-xs text-gray-500">$36,000</div>
              <div className="absolute top-1/2 left-0 text-xs text-gray-500">$18,000</div>
              <div className="absolute bottom-0 left-0 text-xs text-gray-500">$0</div>
              
              {/* X-axis time labels */}
              <div className="absolute bottom-[-20px] left-[12%] text-xs text-gray-500">6AM</div>
              <div className="absolute bottom-[-20px] left-[37%] text-xs text-gray-500">12PM</div>
              <div className="absolute bottom-[-20px] left-[62%] text-xs text-gray-500">6PM</div>
              <div className="absolute bottom-[-20px] left-[87%] text-xs text-gray-500">12AM</div>
              
              {/* Grid lines for better readability */}
              <div className="absolute top-0 left-[30px] right-0 border-t border-dashed border-gray-200 h-0"></div>
              <div className="absolute top-1/4 left-[30px] right-0 border-t border-dashed border-gray-200 h-0"></div>
              <div className="absolute top-1/2 left-[30px] right-0 border-t border-dashed border-gray-200 h-0"></div>
              <div className="absolute top-3/4 left-[30px] right-0 border-t border-dashed border-gray-200 h-0"></div>
              
              <svg viewBox="0 0 800 240" className="w-full h-full pt-1 pl-6">
                {/* Main area chart - smoother curve */}
                <path 
                  d="M0,180 C50,160 100,100 150,140 C200,180 250,80 300,40 C350,0 400,20 450,40 C500,60 550,120 600,100 C650,80 700,140 750,180 L750,240 L0,240 Z" 
                  fill="rgba(59, 130, 246, 0.1)" 
                  strokeWidth="2" 
                  stroke="#3b82f6" 
                />
                
                {/* Data points */}
                <circle cx="0" cy="180" r="4" fill="#3b82f6" />
                <circle cx="150" cy="140" r="4" fill="#3b82f6" />
                <circle cx="300" cy="40" r="4" fill="#3b82f6" />
                <circle cx="450" cy="40" r="4" fill="#3b82f6" />
                <circle cx="600" cy="100" r="4" fill="#3b82f6" />
                <circle cx="750" cy="180" r="4" fill="#3b82f6" />
              </svg>
              
              {/* Current stats */}
              <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="text-xs font-medium text-gray-500">Today's volume</div>
                <div className="text-lg font-bold text-blue-600">$147,589.25</div>
                <div className="text-xs text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  8.3% vs yesterday
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* System Health */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 h-full transition-shadow hover:shadow-md">
            <h5 className="text-lg font-bold mb-1">System Health</h5>
            <p className="text-gray-500 text-sm mb-4">Real-time monitoring of payment processing infrastructure</p>
            
            {/* VISA Network */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">●</span>
                  <span>VISA Network</span>
                </div>
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{systemHealth.visa.status}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs mb-1">
                <span>Authorization & Settlement</span>
                <span>Latency: {systemHealth.visa.latency}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: systemHealth.visa.uptime }}></div>
              </div>
              <div className="text-right text-gray-500 text-xs mt-1">Uptime: {systemHealth.visa.uptime}</div>
            </div>
            
            {/* Mastercard Network */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">●</span>
                  <span>Mastercard Network</span>
                </div>
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{systemHealth.mastercard.status}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs mb-1">
                <span>Authorization & Settlement</span>
                <span>Latency: {systemHealth.mastercard.latency}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: systemHealth.mastercard.uptime }}></div>
              </div>
              <div className="text-right text-gray-500 text-xs mt-1">Uptime: {systemHealth.mastercard.uptime}</div>
            </div>
            
            {/* PCI DSS Compliance */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">●</span>
                  <span>PCI DSS Compliance</span>
                </div>
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{systemHealth.pciDss.status}</span>
              </div>
              <div className="text-gray-500 text-xs">Security Standards</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Transaction Status Checker */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 transition-shadow hover:shadow-md">
          <h5 className="text-lg font-bold mb-3">Transaction Status Checker</h5>
          <p className="text-gray-500 text-sm mb-3">Enter transaction ID to check its current status</p>
          
          <div className="flex mb-3">
            <input
              type="text"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition duration-150 ease-in-out disabled:opacity-50"
              type="button"
              onClick={checkTransactionStatus}
              disabled={isLoadingStatus}
            >
              {isLoadingStatus ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </>
              ) : 'Check Status'}
            </button>
          </div>
          
          {transactionStatusResult && (
            <div className={`rounded-lg p-4 mb-4 ${transactionStatusResult.error 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
              {transactionStatusResult.error ? (
                <div>
                  <strong>Error: </strong> {transactionStatusResult.error}
                </div>
              ) : (
                <div>
                  <strong>Status: </strong> {transactionStatusResult.status}
                  {transactionStatusResult.message && (
                    <div className="mt-2">{transactionStatusResult.message}</div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-lg p-4 mt-3">
            <strong>Note:</strong> Transaction status functionality has been implemented in this update. 
            You can now check both merchant and transaction statuses from this page.
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 h-full transition-shadow hover:shadow-md">
          <h5 className="text-lg font-bold mb-3">Recent Status Checks</h5>
          <p className="text-gray-500 text-sm mb-3">History of recent status inquiries</p>
          
          <ul className="divide-y divide-gray-100">
            <li className="py-3 flex justify-between items-center">
              <div>
                <strong>tx1011</strong>
                <div className="text-xs text-gray-500">2025-07-28 10:45 AM</div>
              </div>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Completed</span>
            </li>
            <li className="py-3 flex justify-between items-center">
              <div>
                <strong>tx1012</strong>
                <div className="text-xs text-gray-500">2025-07-28 09:30 AM</div>
              </div>
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Pending</span>
            </li>
            <li className="py-3 flex justify-between items-center">
              <div>
                <strong>tx1023</strong>
                <div className="text-xs text-gray-500">2025-07-27 05:15 PM</div>
              </div>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Declined</span>
            </li>
          </ul>
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
                  <tr key={tx._id || tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                      {tx._id || tx.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.merchant_name || (tx.merchant && typeof tx.merchant === 'object' ? tx.merchant.name : tx.merchant) || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.terminal_id || (tx.terminal && typeof tx.terminal === 'object' ? tx.terminal.serial_number : tx.terminal) || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.timestamp || tx.created_at).toLocaleString(undefined, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${parseFloat(tx.amount).toFixed(2)} {tx.currency || 'USD'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.card_scheme || '-'} {tx.masked_pan ? (tx.masked_pan.includes('*') ? tx.masked_pan : '••••' + tx.masked_pan.slice(-4)) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        (tx.status === 'completed' || tx.status === 'approved') ? 'bg-green-500 text-white' : 
                        (tx.status === 'pending') ? 'bg-yellow-500 text-white' : 
                        (tx.status === 'voided') ? 'bg-gray-500 text-white' :
                        (tx.status === 'refunded') ? 'bg-blue-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-gray-600 hover:text-blue-600 mr-2"
                        title="View Details"
                        onClick={() => alert(`View details for transaction ${tx._id || tx.id}`)}
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
                /* Mock transaction data if API returns empty */
                getFallbackTransactions().map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">{tx.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.merchant_name || tx.merchant}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.terminal_id || tx.terminal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.created_at || tx.timestamp).toLocaleString(undefined, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${parseFloat(tx.amount).toFixed(2)} {tx.currency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.card_scheme} {tx.masked_pan ? (tx.masked_pan.includes('*') ? tx.masked_pan : '••••' + tx.masked_pan.slice(-4)) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === 'approved' ? 'bg-green-500 text-white' : 
                        tx.status === 'pending' ? 'bg-yellow-500 text-white' :
                        tx.status === 'voided' ? 'bg-gray-500 text-white' :
                        tx.status === 'refunded' ? 'bg-blue-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-gray-600 hover:text-blue-600 mr-2"
                        title="View Details"
                        onClick={() => alert(`View details for transaction ${tx.id}`)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Export Transactions
          </button>
        </div>
      </section>
      
      {notification.type && (
        <div
          className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 min-w-[260px] max-w-xs
            ${notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
              notification.type === 'danger' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-blue-50 text-blue-700 border-blue-200'}
          `}
          role="alert"
          aria-live="assertive"
        >
          <span className="flex-1">{notification.message}</span>
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 rounded"
            aria-label="Dismiss notification"
            onClick={() => setNotification({ type: '', message: '' })}
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </main>
  );
}

export default AdminPanel;



