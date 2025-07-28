import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

function AdminPanel() {
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [merchants, setMerchants] = useState([]);
  
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const merchantsData = await api.get(API_ENDPOINTS.MERCHANTS);
        setMerchants(Array.isArray(merchantsData.merchants) ? merchantsData.merchants : []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    
    fetchData();
  }, []);

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
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h1 className="h2 fw-bold mb-1">Dashboard</h1>
        <p className="text-muted">Welcome to Nexus Acquire - Your comprehensive payment processing platform</p>
      </div>
      
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {/* Total Revenue Card */}
        <div className="col-md-3">
          <div className="card border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-muted mb-0">Total Revenue</h6>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#198754" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"/>
                  <path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1h-.003zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195l.054.012z"/>
                  <path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083c.058-.344.145-.678.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1H1z"/>
                  <path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 5.982 5.982 0 0 1 3.13-1.567z"/>
                </svg>
              </div>
              <div>
                <h2 className="fw-bold mb-0">{dashboardStats.revenue.value}</h2>
                <div>
                  <span className={`badge ${dashboardStats.revenue.change.startsWith('+') ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'} fw-normal`}>
                    {dashboardStats.revenue.change}
                  </span>
                  <span className="text-muted ms-2 small">{dashboardStats.revenue.period}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transactions Card */}
        <div className="col-md-3">
          <div className="card border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-muted mb-0">Transactions</h6>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#6c757d" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0V4zm0 3v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7H0zm3 2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1z"/>
                </svg>
              </div>
              <div>
                <h2 className="fw-bold mb-0">{dashboardStats.transactions.value}</h2>
                <div>
                  <span className={`badge ${dashboardStats.transactions.change.startsWith('+') ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'} fw-normal`}>
                    {dashboardStats.transactions.change}
                  </span>
                  <span className="text-muted ms-2 small">{dashboardStats.transactions.period}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active Merchants Card */}
        <div className="col-md-3">
          <div className="card border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-muted mb-0">Active Merchants</h6>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0d6efd" viewBox="0 0 16 16">
                  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                </svg>
              </div>
              <div>
                <h2 className="fw-bold mb-0">{dashboardStats.activeMerchants.value}</h2>
                <div>
                  <span className={`badge ${dashboardStats.activeMerchants.change.startsWith('+') ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'} fw-normal`}>
                    {dashboardStats.activeMerchants.change}
                  </span>
                  <span className="text-muted ms-2 small">{dashboardStats.activeMerchants.period}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Success Rate Card */}
        <div className="col-md-3">
          <div className="card border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-muted mb-0">Success Rate</h6>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#6c757d" viewBox="0 0 16 16">
                  <path d="M8 0l1.669.864 1.858.282.842 1.68 1.337 1.32L13.4 6l.306 1.854-1.337 1.32-.842 1.68-1.858.282L8 12l-1.669-.864-1.858-.282-.842-1.68-1.337-1.32L2.6 6l-.306-1.854 1.337-1.32.842-1.68L6.331.864 8 0z"/>
                  <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1 4 11.794z"/>
                </svg>
              </div>
              <div>
                <h2 className="fw-bold mb-0">{dashboardStats.successRate.value}</h2>
                <div>
                  <span className={`badge ${dashboardStats.successRate.change.startsWith('+') ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'} fw-normal`}>
                    {dashboardStats.successRate.change}
                  </span>
                  <span className="text-muted ms-2 small">{dashboardStats.successRate.period}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mb-4">
        {/* Transaction Volume Chart */}
        <div className="col-md-8 mb-4">
          <div className="card border-0 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-1">Transaction Volume</h5>
              <p className="text-muted small mb-4">Real-time transaction processing overview for the last 24 hours</p>
              
              <div className="transaction-chart" style={{ height: '240px', position: 'relative', marginBottom: '20px' }}>
                {/* This would normally be a chart component, we'll use a placeholder */}
                <div className="position-absolute top-0 start-0 small text-muted">$36,000</div>
                <div className="position-absolute top-50 start-0 small text-muted">$18,000</div>
                <div className="position-absolute bottom-0 start-0 small text-muted">$0</div>
                
                <svg viewBox="0 0 800 240" style={{ width: '100%', height: '100%' }}>
                  <path 
                    d="M0,180 C50,160 100,100 150,140 C200,180 250,80 300,40 C350,0 400,20 450,40 C500,60 550,120 600,100 C650,80 700,140 750,180 L750,240 L0,240 Z" 
                    fill="rgba(65, 105, 225, 0.1)" 
                    strokeWidth="2" 
                    stroke="#4169e1" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* System Health */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-1">System Health</h5>
              <p className="text-muted small mb-4">Real-time monitoring of payment processing infrastructure</p>
              
              {/* VISA Network */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center">
                    <span className="text-success me-2">●</span>
                    <span>VISA Network</span>
                  </div>
                  <span className="badge bg-success text-white">{systemHealth.visa.status}</span>
                </div>
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Authorization & Settlement</span>
                  <span>Latency: {systemHealth.visa.latency}</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-success" role="progressbar" style={{ width: systemHealth.visa.uptime }} aria-valuenow="99.9" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div className="text-end text-muted small mt-1">Uptime: {systemHealth.visa.uptime}</div>
              </div>
              
              {/* Mastercard Network */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center">
                    <span className="text-success me-2">●</span>
                    <span>Mastercard Network</span>
                  </div>
                  <span className="badge bg-success text-white">{systemHealth.mastercard.status}</span>
                </div>
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Authorization & Settlement</span>
                  <span>Latency: {systemHealth.mastercard.latency}</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-success" role="progressbar" style={{ width: systemHealth.mastercard.uptime }} aria-valuenow="99.8" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div className="text-end text-muted small mt-1">Uptime: {systemHealth.mastercard.uptime}</div>
              </div>
              
              {/* PCI DSS Compliance */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center">
                    <span className="text-success me-2">●</span>
                    <span>PCI DSS Compliance</span>
                  </div>
                  <span className="badge bg-success text-white">{systemHealth.pciDss.status}</span>
                </div>
                <div className="text-muted small">Security Standards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Merchants Table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-4">Recent Merchants</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(merchants) ? merchants.slice(0, 5) : []).map(m => {
                  if (!m || typeof m !== 'object') return null;
                  return (
                    <tr key={m.id || m._id || Math.random()}>
                      <td>{m.id || m._id}</td>
                      <td>{m.name}</td>
                      <td>
                        <span title={m.email} className="d-inline-block text-truncate" style={{maxWidth: '120px'}}>
                          {m.email ? m.email.replace(/(.{2}).+(@.+)/, '$1***$2') : ''}
                        </span>
                      </td>
                      <td>{m.business_type}</td>
                      <td>
                        <span className={`badge ${m.status === 'active' ? 'bg-success' : m.status === 'pending' ? 'bg-warning text-dark' : m.status === 'closed' ? 'bg-danger' : 'bg-secondary'}`}>
                          {m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) : ''}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2">View</button>
                        <button className="btn btn-sm btn-outline-secondary">Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {notification.type && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show position-fixed bottom-0 end-0 m-3`} role="alert">
          {notification.message}
          <button type="button" className="btn-close" onClick={() => setNotification({ type: '', message: '' })}></button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
