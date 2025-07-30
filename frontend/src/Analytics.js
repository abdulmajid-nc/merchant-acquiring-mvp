// Helper to aggregate daily data into weekly sums
function aggregateToWeeks(data) {
  if (!data || data.length === 0) return [];
  const weeks = [];
  let weekSum = 0;
  let weekStart = data[0].date;
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    weekSum += data[i].value;
    count++;
    // Group by 7 days or last item
    if (count === 7 || i === data.length - 1) {
      weeks.push({
        date: weekStart + ' - ' + data[i].date,
        value: weekSum
      });
      weekSum = 0;
      count = 0;
      if (i + 1 < data.length) weekStart = data[i + 1].date;
    }
  }
  return weeks;
}
import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('last30days');
  const [chartData, setChartData] = useState({
    revenue: generateMockTimeSeriesData(30, 1000, 5000),
    transactions: generateMockTimeSeriesData(30, 50, 200),
    average: generateMockTimeSeriesData(30, 80, 150)
  });
  
  // Analytics metrics
  const [metrics, setMetrics] = useState({
    totalRevenue: '$847,392',
    transactionCount: '18,472',
    averageTransaction: '$45.87',
    successRate: '99.2%',
    mostActiveTerminal: 'POS-1001',
    topMerchant: 'Acme Retail'
  });

  // Generate random time series data for demo
  function generateMockTimeSeriesData(days, min, max) {
    const data = [];
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * (max - min + 1)) + min
      });
    }
    
    return data;
  }
  
  // Calculate metrics from transactions data
  const calculateMetrics = (txs) => {
    if (!txs || txs.length === 0) return;
    
    // In a real app, these would be calculated from actual transaction data
    // For now, using placeholder data
    setMetrics({
      totalRevenue: '$847,392',
      transactionCount: txs.length.toLocaleString(),
      averageTransaction: '$45.87',
      successRate: '99.2%',
      mostActiveTerminal: 'POS-1001',
      topMerchant: 'Acme Retail'
    });
  };
  
  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch from a transactions endpoint
        // with date range filters
        const response = await api.get(API_ENDPOINTS.TRANSACTIONS);
        
        // Handle different response formats
        let transactionsData = [];
        
        if (Array.isArray(response)) {
          // Direct array response
          transactionsData = response;
        } else if (response && response.transactions && Array.isArray(response.transactions)) {
          // Response with transactions property containing array
          transactionsData = response.transactions;
        } else {
          console.warn('Unexpected response format for transactions:', response);
        }
        
        if (transactionsData.length > 0) {
          setTransactions(transactionsData);
          calculateMetrics(transactionsData);
        } else {
          // Use mock data if no transactions are available
          setTransactions([]);
          // Keep the placeholder metrics
        }
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [dateRange]);
  
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    // This would normally trigger a new API call with the selected date range
    // For now, we'll just update the chart data
    let days = 30;
    let aggregate = false;
    switch (e.target.value) {
      case 'last7days':
        days = 7;
        break;
      case 'last30days':
        days = 30;
        break;
      case 'last90days':
        days = 90;
        break;
      case 'ytd':
        // Days since January 1st
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        break;
      default:
        days = 30;
    }
    // Aggregate to weeks if range is large
    aggregate = days > 45;
    let revenue = generateMockTimeSeriesData(days, 1000, 5000);
    let transactions = generateMockTimeSeriesData(days, 50, 200);
    let average = generateMockTimeSeriesData(days, 80, 150);
    if (aggregate) {
      revenue = aggregateToWeeks(revenue);
      transactions = aggregateToWeeks(transactions);
      average = aggregateToWeeks(average);
    }
    setChartData({
      revenue,
      transactions,
      average
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Analytics Dashboard</h1>
        <p className="text-gray-500">Track your payment processing performance metrics</p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Time Period:</span>
            <select 
              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
              value={dateRange}
              onChange={handleDateRangeChange}
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
          <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 font-semibold flex items-center gap-2">
            {/* Download icon can be replaced with Heroicons or similar */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
            Export
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
          <span className="text-gray-500 text-xs mb-1">Total Revenue</span>
          <span className="text-2xl font-bold">{metrics.totalRevenue}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
          <span className="text-gray-500 text-xs mb-1">Transactions</span>
          <span className="text-2xl font-bold">{metrics.transactionCount}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
          <span className="text-gray-500 text-xs mb-1">Average Value</span>
          <span className="text-2xl font-bold">{metrics.averageTransaction}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
          <span className="text-gray-500 text-xs mb-1">Success Rate</span>
          <span className="text-2xl font-bold">{metrics.successRate}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
          <span className="text-gray-500 text-xs mb-1">Top Terminal</span>
          <span className="text-2xl font-bold">{metrics.mostActiveTerminal}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
          <span className="text-gray-500 text-xs mb-1">Top Merchant</span>
          <span className="text-2xl font-bold">{metrics.topMerchant}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h5 className="font-bold mb-4">Revenue Over Time</h5>
            {/* Responsive chart container */}
            <div className="w-full overflow-x-hidden">
              <div className="w-full" style={{ height: '300px', position: 'relative' }}>
                <div className="text-center py-5">
                  <div className="flex justify-between mb-4 w-full">
                    {(() => {
                      const total = chartData.revenue.length;
                      let labelStep = 1;
                      if (total > 20 && total <= 40) labelStep = 2;
                      else if (total > 40 && total <= 60) labelStep = 4;
                      else if (total > 60) labelStep = Math.ceil(total / 10);
                      return chartData.revenue.map((data, index) => {
                        // Always show first and last, and every labelStep
                        if (index === 0 || index === total - 1 || index % labelStep === 0) {
                          let label = '';
                          if (data.date.includes(' - ')) {
                            // Weekly range: show as '30/06-06/07'
                            const [start, end] = data.date.split(' - ');
                            label = `${start.slice(5).replace('-', '/')}–${end.slice(5).replace('-', '/')}`;
                          } else {
                            // Daily: show as '30 Jun' or '30/06'
                            const [year, month, day] = data.date.split('-');
                            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                            label = `${parseInt(day,10)} ${months[parseInt(month,10)-1]}`;
                          }
                          return (
                            <div key={index} className="text-center flex-1">
                              <div className="text-xs text-gray-400">{label}</div>
                            </div>
                          );
                        } else {
                          return <div key={index} className="flex-1" />;
                        }
                      });
                    })()}
                  </div>
                  <div style={{ height: '200px', position: 'relative' }} className="mx-4">
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      height: '180px',
                      background: 'linear-gradient(to top, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0) 100%)',
                      borderRadius: '8px'
                    }}></div>
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      height: '180px',
                      display: 'flex',
                      alignItems: 'flex-end'
                    }}>
                      {chartData.revenue.map((data, index) => (
                        <div 
                          key={index}
                          style={{ 
                            height: `${(data.value / 5000) * 100}%`, 
                            flex: 1,
                            minWidth: 0,
                            backgroundColor: 'rgba(37, 99, 235, 0.8)',
                            margin: '0 1px',
                            borderTopLeftRadius: '3px',
                            borderTopRightRadius: '3px'
                          }}
                          title={`${data.date}: $${data.value.toLocaleString()}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h5 className="font-bold mb-4">Transaction Volume</h5>
            <div style={{ height: '300px' }}>
              <div className="flex flex-col h-full justify-center items-center">
                {/* This would be a real chart in a production app */}
                <div style={{ width: '180px', height: '180px', position: 'relative' }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'conic-gradient(#2563eb 0% 75%, #22c55e 75% 90%, #f59e0b 90% 97%, #ef4444 97% 100%)',
                    transform: 'rotate(-90deg)'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <div className="text-gray-400 text-xs">Success Rate</div>
                    <div className="font-bold text-2xl mb-0">99.2%</div>
                  </div>
                </div>
                <div className="mt-4 w-full">
                  <div className="flex justify-between text-xs mb-2">
                    <div className="flex items-center">
                      <div style={{width: '10px', height: '10px', backgroundColor: '#2563eb', borderRadius: '2px'}} className="mr-2"></div>
                      <span>Approved</span>
                    </div>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <div className="flex items-center">
                      <div style={{width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '2px'}} className="mr-2"></div>
                      <span>Settled</span>
                    </div>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <div className="flex items-center">
                      <div style={{width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '2px'}} className="mr-2"></div>
                      <span>Pending</span>
                    </div>
                    <span className="font-medium">7%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center">
                      <div style={{width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '2px'}} className="mr-2"></div>
                      <span>Declined</span>
                    </div>
                    <span className="font-medium">3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h5 className="font-bold mb-0">Recent Transactions</h5>
            <a href="#" className="text-blue-600 hover:underline text-sm">View All</a>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              <p className="mt-2 text-gray-500">Loading transaction data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 rounded px-4 py-2 mb-4">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terminal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.length === 0 ? (
                    // Mock data since we don't have real transactions yet
                    [
                      { id: 'tx1011', merchant: 'Acme Retail', terminal: 'POS-1001', date: '2025-07-27', amount: 120.50, status: 'Completed' },
                      { id: 'tx1012', merchant: 'Acme Retail', terminal: 'POS-1001', date: '2025-07-27', amount: 75.00, status: 'Pending' },
                      { id: 'tx1021', merchant: 'Best Eats', terminal: 'POS-2001', date: '2025-07-26', amount: 45.75, status: 'Completed' },
                      { id: 'tx1022', merchant: 'Tech World', terminal: 'POS-3001', date: '2025-07-26', amount: 350.00, status: 'Completed' },
                      { id: 'tx1023', merchant: 'Best Eats', terminal: 'POS-2001', date: '2025-07-25', amount: 28.50, status: 'Declined' }
                    ].map(tx => (
                      <tr key={tx.id}>
                        <td className="px-4 py-2">{tx.id}</td>
                        <td className="px-4 py-2">{tx.merchant}</td>
                        <td className="px-4 py-2">{tx.terminal}</td>
                        <td className="px-4 py-2">{tx.date}</td>
                        <td className="px-4 py-2">${tx.amount.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' : tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    transactions.map(tx => (
                      <tr key={tx.id}>
                        <td className="px-4 py-2">{tx.id}</td>
                        <td className="px-4 py-2">{tx.merchant}</td>
                        <td className="px-4 py-2">{tx.terminal}</td>
                        <td className="px-4 py-2">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2">${tx.amount.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
