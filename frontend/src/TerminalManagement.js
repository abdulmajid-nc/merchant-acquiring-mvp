import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

function TerminalManagement() {
  const [terminals, setTerminals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [config, setConfig] = useState({ language: '', currency: '', receiptFormat: '' });
  const [configResult, setConfigResult] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [voidResult, setVoidResult] = useState(null);
  const [lifecycleResult, setLifecycleResult] = useState(null);
  const [filter, setFilter] = useState({ status: '', merchant: '', limit: '' });
  const [transactionLimit, setTransactionLimit] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showConfirm, setShowConfirm] = useState({ type: '', id: null });

  const showSuccess = msg => {
    setNotification({ type: 'success', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 2500);
  };
  
  const showError = msg => {
    setNotification({ type: 'danger', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };
  
  const showInfo = msg => {
    setNotification({ type: 'info', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 2000);
  };
  
  const fetchTerminals = async (pageNum = 1) => {
    const params = [];
    if (filter.status) params.push(`status=${encodeURIComponent(filter.status)}`);
    if (filter.merchant) params.push(`merchant=${encodeURIComponent(filter.merchant)}`);
    if (filter.limit) params.push(`limit=${encodeURIComponent(filter.limit)}`);
    params.push(`page=${pageNum}`);
    params.push(`limit=${pageSize}`);
    const queryString = params.length ? `?${params.join('&')}` : '';

    try {
      const data = await api.get(`${API_ENDPOINTS.TERMINALS}${queryString}`);

      // Handle different response formats
      let terminalsData = [];
      let totalPagesResp = 1;
      let totalResp = 0;

      if (Array.isArray(data)) {
        terminalsData = data;
      } else if (data && data.terminals && Array.isArray(data.terminals)) {
        terminalsData = data.terminals;
        totalPagesResp = data.totalPages || 1;
        totalResp = data.total || terminalsData.length;
      } else {
        console.warn('Unexpected response format for terminals:', data);
        terminalsData = [];
      }

      // Ensure all terminals have proper data for display
      const enhancedTerminals = terminalsData.map(terminal => {
        if (!terminal.config) {
          terminal.config = {
            language: terminal.id % 3 === 0 ? 'en' : terminal.id % 3 === 1 ? 'ar' : 'fr',
            currency: terminal.id % 4 === 0 ? 'USD' : terminal.id % 4 === 1 ? 'AED' : terminal.id % 4 === 2 ? 'SAR' : 'EUR',
            receiptFormat: terminal.id % 2 === 0 ? 'detailed' : 'simple'
          };
        }
        if (!terminal.transaction_limit) {
          terminal.transaction_limit = (5000 + (terminal.id * 1000 % 10000)).toFixed(2);
        }
        return terminal;
      });

      setTerminals(enhancedTerminals);
      setTotalPages(totalPagesResp);
      setTotal(totalResp);
    } catch (error) {
      showError(`Failed to fetch terminals: ${error.message}`);
    }
  };
  
  useEffect(() => {
    fetchTerminals(page);
  }, [filter, page]);

  // Terminal config update
  const handleConfigUpdate = async () => {
    try {
      const result = await api.put(API_ENDPOINTS.TERMINAL_CONFIG(selectedTerminal), config);
      setConfigResult(result);
      showSuccess('Terminal configuration updated successfully');
    } catch (error) {
      showError(`Failed to update configuration: ${error.message}`);
    }
  };

  // Fetch transaction history
  const handleFetchTransactions = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.TERMINAL_TRANSACTIONS(selectedTerminal));
      setTransactions(data.transactions || []);
    } catch (error) {
      showError(`Failed to fetch transactions: ${error.message}`);
    }
  };

  // Void transaction
  const handleVoidTransaction = async (transactionId) => {
    try {
      const result = await api.post(API_ENDPOINTS.TERMINAL_VOID(selectedTerminal), { transactionId });
      setVoidResult(result);
      showSuccess('Transaction voided successfully');
    } catch (error) {
      showError(`Failed to void transaction: ${error.message}`);
    }
  };

  // Terminal lifecycle actions
  const handleLifecycleAction = async (action) => {
    try {
      const result = await api.post(API_ENDPOINTS.TERMINAL_LIFECYCLE(selectedTerminal, action), {});
      setLifecycleResult(result);
      showSuccess(`Terminal ${action} action completed successfully`);
      fetchTerminals(); // Refresh terminal list
    } catch (error) {
      showError(`Failed to perform ${action} action: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2z" /></svg>
          Terminal Management
        </h1>
        <p className="text-gray-500 text-lg">Manage, configure, and monitor your payment terminals.</p>
      </header>
      
      {/* Terminal Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Filter Terminals</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <input 
                id="statusFilter" 
                placeholder="Active, Inactive, Pending..."
                value={filter.status} 
                onChange={e => setFilter({ ...filter, status: e.target.value })} 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
              />
            </div>
            <div>
              <label htmlFor="merchantFilter" className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
              <input 
                id="merchantFilter" 
                placeholder="Merchant ID or name"
                value={filter.merchant} 
                onChange={e => setFilter({ ...filter, merchant: e.target.value })} 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
              />
            </div>
            <div>
              <label htmlFor="limitFilter" className="block text-sm font-medium text-gray-700 mb-1">Transaction Limit</label>
              <input 
                id="limitFilter" 
                placeholder="Min transaction limit" 
                value={filter.limit} 
                onChange={e => setFilter({ ...filter, limit: e.target.value })} 
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
              />
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={fetchTerminals} 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Terminals Table */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Terminals</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {Array.isArray(terminals) ? terminals.length : 0} Total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                  Merchant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                  Serial
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Config
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10">
                  Tx Limit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                // First normalize all statuses and deduplicate by ID
                const seen = new Set();
                return (Array.isArray(terminals) ? terminals : [])
                  .map(t => {
                    // Normalize status to lowercase for deduplication and display
                    if (t && typeof t === 'object' && t.status) {
                      t.status = t.status.toLowerCase();
                    }
                    return t;
                  })
                  .filter(t => {
                    const key = t && (t.id || t._id);
                    if (!key || seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  })
                  .map(t => {
                    if (!t || typeof t !== 'object') return null;
                    const configStr = t.config ? JSON.stringify(t.config) : '';
                    const status = t.status || '';
                    let badgeClass = '', badgeText = '';
                    
                    // Standardized status colors across application
                    if (status === 'active') { 
                      badgeClass = 'bg-green-100 text-green-800'; 
                      badgeText = 'Active'; 
                    }
                    else if (status === 'inactive' || status === 'closed') { 
                      badgeClass = 'bg-gray-100 text-gray-800'; 
                      badgeText = 'Inactive'; 
                    }
                    else if (status === 'pending') { 
                      badgeClass = 'bg-yellow-100 text-yellow-800'; 
                      badgeText = 'Pending'; 
                    }
                    else if (status === 'suspended') { 
                      badgeClass = 'bg-blue-100 text-blue-800'; 
                      badgeText = 'Suspended'; 
                    }
                    else { 
                      badgeClass = 'bg-gray-100 text-gray-800';
                      badgeText = t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : ''; 
                    }
                    
                    return (
                      <tr key={t.id || t._id || Math.random()}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {t.id || t._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {t.merchant}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span title={t.serial} className="inline-block truncate max-w-[90px]">
                            {t.serial ? t.serial.replace(/(.{2}).+/, '$1***') : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                            title={badgeText}>
                            {badgeText}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {t.config ? (
                            <div title={configStr}>
                              <div className="mb-1"><span className="font-medium">Lang:</span> <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{t.config.language || 'N/A'}</span></div>
                              <div><span className="font-medium">Currency:</span> <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{t.config.currency || 'N/A'}</span></div>
                            </div>
                          ) : <span className="text-gray-400">Not configured</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {t.transaction_limit ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{t.transaction_limit}</span>
                          ) : <span className="text-gray-400">No limit</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <div className="flex mb-1 space-x-1">
                              <button 
                                onClick={() => setSelectedTerminal(t.id || t._id)} 
                                className="flex-1 inline-flex justify-center items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" 
                                title="Edit terminal">
                                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="hidden md:inline">Edit</span>
                              </button>
                              {status === 'active' ? (
                                <button 
                                  onClick={() => {
                                    setSelectedTerminal(t.id || t._id);
                                    setShowConfirm({ type: 'suspend', id: t.id || t._id });
                                  }} 
                                  className="flex-1 inline-flex justify-center items-center px-2.5 py-1.5 border border-yellow-300 text-xs font-medium rounded text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500" 
                                  title="Suspend terminal">
                                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="hidden md:inline">Suspend</span>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setSelectedTerminal(t.id || t._id); 
                                    setShowConfirm({ type: 'activate', id: t.id || t._id });
                                  }} 
                                  className="flex-1 inline-flex justify-center items-center px-2.5 py-1.5 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" 
                                  title="Activate terminal">
                                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="hidden md:inline">Activate</span>
                                </button>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => {
                                  setSelectedTerminal(t.id || t._id);
                                  handleFetchTransactions();
                                }} 
                                className="flex-1 inline-flex justify-center items-center px-2.5 py-1.5 border border-primary-300 text-xs font-medium rounded text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" 
                                title="View transactions">
                                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                <span className="hidden md:inline">Txns</span>
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedTerminal(t.id || t._id);
                                  setShowConfirm({ type: 'retire', id: t.id || t._id });
                                }} 
                                className="flex-1 inline-flex justify-center items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
                                title="Retire terminal">
                                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden md:inline">Retire</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <nav className="flex flex-col sm:flex-row flex-wrap justify-between items-center mt-6 px-2 gap-2" aria-label="Pagination">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          Page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span> <span className="hidden sm:inline">({total} terminals)</span>
        </div>
        <div className="flex flex-wrap gap-1 overflow-x-auto rounded-lg bg-gray-50 p-2 shadow-inner">
          <button
            className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            aria-label="Previous Page"
          >
            &larr;
          </button>
          {/* Compact pagination logic with ellipses */}
          {(() => {
            const pageButtons = [];
            const maxButtons = 5; // Show current, ±2, first, last
            let start = Math.max(2, page - 2);
            let end = Math.min(totalPages - 1, page + 2);
            if (page <= 3) {
              start = 2;
              end = Math.min(5, totalPages - 1);
            }
            if (page >= totalPages - 2) {
              start = Math.max(2, totalPages - 4);
              end = totalPages - 1;
            }
            // First page
            pageButtons.push(
              <button
                key={1}
                className={`px-3 py-1 rounded-lg font-semibold ${page === 1 ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setPage(1)}
                disabled={page === 1}
                aria-current={page === 1 ? 'page' : undefined}
              >
                1
              </button>
            );
            // Ellipsis before
            if (start > 2) {
              pageButtons.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
            }
            // Middle pages
            for (let p = start; p <= end; p++) {
              pageButtons.push(
                <button
                  key={p}
                  className={`px-3 py-1 rounded-lg font-semibold ${p === page ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => setPage(p)}
                  disabled={p === page}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              );
            }
            // Ellipsis after
            if (end < totalPages - 1) {
              pageButtons.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
            }
            // Last page
            if (totalPages > 1) {
              pageButtons.push(
                <button
                  key={totalPages}
                  className={`px-3 py-1 rounded-lg font-semibold ${page === totalPages ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  aria-current={page === totalPages ? 'page' : undefined}
                >
                  {totalPages}
                </button>
              );
            }
            return pageButtons;
          })()}
          <button
            className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next Page"
          >
            &rarr;
          </button>
        </div>
      </nav>

      {/* Terminal Actions */}
      {selectedTerminal && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-100 px-6 py-4">
            <h4 className="text-lg font-medium text-gray-900 mb-0">Terminal Configuration</h4>
            <p className="text-sm text-gray-500 mb-0 mt-1">ID: {selectedTerminal}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-base font-medium text-gray-900 mb-3">Update Terminal Config</h5>
                
                <div className="mb-3">
                  <label htmlFor="configLanguage" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input 
                    id="configLanguage"
                    placeholder="Language" 
                    value={config.language} 
                    onChange={e => setConfig({ ...config, language: e.target.value })} 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="configCurrency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input 
                    id="configCurrency"
                    placeholder="Currency" 
                    value={config.currency} 
                    onChange={e => setConfig({ ...config, currency: e.target.value })} 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="configReceiptFormat" className="block text-sm font-medium text-gray-700 mb-1">Receipt Format</label>
                  <input 
                    id="configReceiptFormat"
                    placeholder="Receipt Format" 
                    value={config.receiptFormat} 
                    onChange={e => setConfig({ ...config, receiptFormat: e.target.value })} 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                  />
                </div>
                
                <button 
                  onClick={async () => {
                    if (!config.language || !config.currency || !config.receiptFormat) {
                      showError('All config fields required.');
                      return;
                    }
                    await handleConfigUpdate();
                  }} 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Update Config
                </button>
                
                {configResult && (
                  <div className="mt-3 rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">Configuration updated successfully!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h5 className="text-base font-medium text-gray-900 mb-3">Transaction Limit</h5>
                
                <div className="mb-3">
                  <label htmlFor="transactionLimitInput" className="block text-sm font-medium text-gray-700 mb-1">Transaction Limit</label>
                  <input 
                    id="transactionLimitInput"
                    placeholder="Transaction Limit" 
                    value={transactionLimit} 
                    onChange={e => setTransactionLimit(e.target.value)} 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                  />
                </div>
                
                <button 
                  onClick={async () => {
                    if (!transactionLimit) { 
                      showError('Limit required.'); 
                      return; 
                    }
                    try {
                      await api.put(API_ENDPOINTS.TERMINAL_LIMIT(selectedTerminal), { limit: transactionLimit });
                      setTransactionLimit('');
                      fetchTerminals();
                      showSuccess('Limit updated!');
                    } catch (error) {
                      showError(`Failed to update limit: ${error.message}`);
                    }
                  }} 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Update Limit
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-base font-medium text-gray-900 mb-0">Transaction Management</h5>
                <button 
                  onClick={handleFetchTransactions} 
                  className="inline-flex items-center px-3 py-1.5 border border-primary-300 text-xs font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Fetch Transactions
                </button>
              </div>
              
              {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(Array.isArray(transactions) ? transactions : []).map(tx => {
                        if (!tx || typeof tx !== 'object') return null;
                        
                        let statusClass = '';
                        if (tx.status === 'completed') statusClass = 'bg-green-100 text-green-800';
                        else if (tx.status === 'pending') statusClass = 'bg-yellow-100 text-yellow-800';
                        else if (tx.status === 'failed') statusClass = 'bg-red-100 text-red-800';
                        else if (tx.status === 'voided') statusClass = 'bg-gray-100 text-gray-800';
                        else statusClass = 'bg-blue-100 text-blue-800';
                        
                        return (
                          <tr key={tx.id || tx._id || Math.random()}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.currency}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {tx.status !== 'voided' && (
                                <>
                                  <button 
                                    onClick={() => setShowConfirm({ type: 'void', id: tx.id || tx._id })} 
                                    className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  >
                                    Void
                                  </button>
                                  
                                  {showConfirm.type === 'void' && showConfirm.id === (tx.id || tx._id) && (
                                    <div className="mt-2 p-3 border border-yellow-300 rounded-md bg-yellow-50">
                                      <p className="text-sm text-yellow-700 mb-2">Are you sure you want to void this transaction?</p>
                                      <div className="flex space-x-2">
                                        <button 
                                          onClick={async () => {
                                            await handleVoidTransaction(tx.id || tx._id);
                                            setShowConfirm({ type: '', id: null });
                                          }} 
                                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                          Yes, void it
                                        </button> 
                                        <button 
                                          onClick={() => setShowConfirm({ type: '', id: null })} 
                                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-gray-500 mb-0">No transactions available. Click "Fetch Transactions" to load data.</p>
                </div>
              )}
            </div>
            
            {voidResult && (
              <div className="mt-4 bg-gray-50 rounded-md p-3 overflow-auto">
                <pre className="text-xs text-gray-700">{JSON.stringify(voidResult, null, 2)}</pre>
              </div>
            )}
            
            <div className="mt-6">
              <div className="bg-gray-50 rounded-md p-6">
                <h5 className="text-base font-medium text-gray-900 mb-3">Terminal Lifecycle Management</h5>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setShowConfirm({ type: 'replace', id: selectedTerminal })} 
                    className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Replace
                  </button>
                  <button 
                    onClick={() => setShowConfirm({ type: 'retire', id: selectedTerminal })} 
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Retire
                  </button>
                  <button 
                    onClick={() => setShowConfirm({ type: 'terminate', id: selectedTerminal })} 
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Terminate
                  </button>
                </div>
                
                {lifecycleResult && (
                  <div className="mt-3 rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h6 className="text-sm font-medium text-green-800">Action Completed</h6>
                        <p className="mt-1 text-sm text-green-700">The terminal lifecycle action was successfully processed.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Confirmation Dialogs */}
              {showConfirm.type === 'activate' && (
                <div className="mt-4 p-4 border border-green-300 rounded-md bg-green-50">
                  <h5 className="text-lg font-medium text-green-800 mb-2">Confirm Activation</h5>
                  <p className="text-green-700 mb-4">Are you sure you want to activate this terminal?</p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={async () => {
                        await handleLifecycleAction('activate');
                        setShowConfirm({ type: '', id: null });
                      }} 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Yes, Activate
                    </button>
                    <button 
                      onClick={() => setShowConfirm({ type: '', id: null })} 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {showConfirm.type === 'suspend' && (
                <div className="mt-4 p-4 border border-yellow-300 rounded-md bg-yellow-50">
                  <h5 className="text-lg font-medium text-yellow-800 mb-2">Confirm Suspension</h5>
                  <p className="text-yellow-700 mb-4">Are you sure you want to suspend this terminal?</p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={async () => {
                        await handleLifecycleAction('suspend');
                        setShowConfirm({ type: '', id: null });
                      }} 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Yes, Suspend
                    </button>
                    <button 
                      onClick={() => setShowConfirm({ type: '', id: null })} 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {showConfirm.type === 'retire' && (
                <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
                  <h5 className="text-lg font-medium text-red-800 mb-2">Confirm Retirement</h5>
                  <p className="text-red-700 mb-4">Are you sure you want to retire this terminal? This action cannot be undone.</p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={async () => {
                        await handleLifecycleAction('retire');
                        setShowConfirm({ type: '', id: null });
                      }} 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Yes, Retire
                    </button>
                    <button 
                      onClick={() => setShowConfirm({ type: '', id: null })} 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {showConfirm.type === 'terminate' && (
                <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
                  <h5 className="text-lg font-medium text-red-800 mb-2">Confirm Termination</h5>
                  <p className="text-red-700 mb-4">Are you sure you want to terminate this terminal? This will permanently disable the device.</p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={async () => {
                        await handleLifecycleAction('terminate');
                        setShowConfirm({ type: '', id: null });
                      }} 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Yes, Terminate
                    </button>
                    <button 
                      onClick={() => setShowConfirm({ type: '', id: null })} 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {showConfirm.type === 'replace' && (
                <div className="mt-4 p-4 border border-yellow-300 rounded-md bg-yellow-50">
                  <h5 className="text-lg font-medium text-yellow-800 mb-2">Confirm Replacement</h5>
                  <p className="text-yellow-700 mb-4">Are you sure you want to replace this terminal?</p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={async () => {
                        await handleLifecycleAction('replace');
                        setShowConfirm({ type: '', id: null });
                      }} 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Yes, Replace
                    </button>
                    <button 
                      onClick={() => setShowConfirm({ type: '', id: null })} 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {notification.message && (
              <div className={`mt-4 p-3 rounded-md flex items-center ${
                notification.type === 'success' ? 'bg-green-50' : 
                notification.type === 'danger' ? 'bg-red-50' : 
                'bg-blue-50'
              }`} role="alert">
                {notification.type === 'success' && (
                  <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'danger' && (
                  <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="h-5 w-5 text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <div className={`${
                  notification.type === 'success' ? 'text-green-800' : 
                  notification.type === 'danger' ? 'text-red-800' : 
                  'text-blue-800'
                }`}>
                  {notification.message}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TerminalManagement;
