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
    
    setChartData({
      revenue: generateMockTimeSeriesData(days, 1000, 5000),
      transactions: generateMockTimeSeriesData(days, 50, 200),
      average: generateMockTimeSeriesData(days, 80, 150)
    });
  };

  return (
    <div className="container-fluid px-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 fw-bold mb-1">Analytics Dashboard</h1>
          <p className="text-muted">Track your payment processing performance metrics</p>
        </div>
      </div>
      
      {/* Date Range Selector */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <span className="me-2">Time Period:</span>
                <select 
                  className="form-select" 
                  value={dateRange}
                  onChange={handleDateRangeChange}
                >
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                  <option value="ytd">Year to Date</option>
                </select>
              </div>
              
              <button className="btn btn-outline-secondary">
                <i className="bi bi-download me-1"></i> Export
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Revenue</h6>
              <h2 className="fw-bold mb-0">{metrics.totalRevenue}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Transactions</h6>
              <h2 className="fw-bold mb-0">{metrics.transactionCount}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Average Value</h6>
              <h2 className="fw-bold mb-0">{metrics.averageTransaction}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Success Rate</h6>
              <h2 className="fw-bold mb-0">{metrics.successRate}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Top Terminal</h6>
              <h2 className="fw-bold mb-0">{metrics.mostActiveTerminal}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Top Merchant</h6>
              <h2 className="fw-bold mb-0">{metrics.topMerchant}</h2>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-4">Revenue Over Time</h5>
              {/* In a real app, you would use a charting library like Chart.js or Recharts */}
              <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
                <div className="text-center py-5">
                  <div className="d-flex justify-content-between mb-4">
                    {chartData.revenue.filter((_, i) => i % 5 === 0 || i === chartData.revenue.length - 1).map((data, index) => (
                      <div key={index} className="text-center" style={{ width: '50px' }}>
                        <div className="small text-muted">{data.date.split('-')[2]}/{data.date.split('-')[1]}</div>
                      </div>
                    ))}
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
        
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-4">Transaction Volume</h5>
              <div style={{ height: '300px' }}>
                <div className="d-flex flex-column h-100 justify-content-center align-items-center">
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
                      <div className="text-muted small">Success Rate</div>
                      <div className="fw-bold h3 mb-0">99.2%</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 w-100">
                    <div className="d-flex justify-content-between small mb-2">
                      <div className="d-flex align-items-center">
                        <div style={{width: '10px', height: '10px', backgroundColor: '#2563eb', borderRadius: '2px'}} className="me-2"></div>
                        <span>Approved</span>
                      </div>
                      <span className="fw-medium">75%</span>
                    </div>
                    <div className="d-flex justify-content-between small mb-2">
                      <div className="d-flex align-items-center">
                        <div style={{width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '2px'}} className="me-2"></div>
                        <span>Settled</span>
                      </div>
                      <span className="fw-medium">15%</span>
                    </div>
                    <div className="d-flex justify-content-between small mb-2">
                      <div className="d-flex align-items-center">
                        <div style={{width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '2px'}} className="me-2"></div>
                        <span>Pending</span>
                      </div>
                      <span className="fw-medium">7%</span>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <div className="d-flex align-items-center">
                        <div style={{width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '2px'}} className="me-2"></div>
                        <span>Declined</span>
                      </div>
                      <span className="fw-medium">3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Recent Transactions</h5>
                <a href="#" className="text-decoration-none">View All</a>
              </div>
              
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading transaction data...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Merchant</th>
                        <th>Terminal</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
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
                            <td>{tx.id}</td>
                            <td>{tx.merchant}</td>
                            <td>{tx.terminal}</td>
                            <td>{tx.date}</td>
                            <td>${tx.amount.toFixed(2)}</td>
                            <td>
                              <span className={`badge ${tx.status === 'Completed' ? 'bg-success' : tx.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        transactions.map(tx => (
                          <tr key={tx.id}>
                            <td>{tx.id}</td>
                            <td>{tx.merchant}</td>
                            <td>{tx.terminal}</td>
                            <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                            <td>${tx.amount.toFixed(2)}</td>
                            <td>
                              <span className={`badge ${tx.status === 'completed' ? 'bg-success' : tx.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
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
      </div>
    </div>
  );
}

export default Analytics;
