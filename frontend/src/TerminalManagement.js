import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

function TerminalManagement() {
  // Helper for status badge
  const statusBadge = s => s ? <span className={`badge bg-${s === 'active' ? 'primary' : s === 'suspended' ? 'warning text-dark' : 'danger'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span> : null;
  const [terminals, setTerminals] = useState([]);
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [config, setConfig] = useState({ language: '', currency: '', receiptFormat: '' });
  const [configResult, setConfigResult] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [voidResult, setVoidResult] = useState(null);
  const [lifecycleResult, setLifecycleResult] = useState(null);
  const [filter, setFilter] = useState({ status: '', merchant: '', limit: '' });
  const [transactionLimit, setTransactionLimit] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
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
  const fetchTerminals = async () => {
    const params = [];
    if (filter.status) params.push(`status=${encodeURIComponent(filter.status)}`);
    if (filter.merchant) params.push(`merchant=${encodeURIComponent(filter.merchant)}`);
    if (filter.limit) params.push(`limit=${encodeURIComponent(filter.limit)}`);
    const queryString = params.length ? `?${params.join('&')}` : '';
    
    try {
      const data = await api.get(`${API_ENDPOINTS.TERMINALS}${queryString}`);
      setTerminals(data.terminals || []);
    } catch (error) {
      showError(`Failed to fetch terminals: ${error.message}`);
    }
  };
  useEffect(() => { fetchTerminals(); }, [filter]);

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
    setLifecycleResult(await res.json());
  };

  return (
      <div className="container py-4">
        <h2 className="display-5 fw-bold text-primary text-center mb-4">Terminal Management</h2>
        {/* Terminal Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="h5 fw-semibold text-dark mb-3">Filter Terminals</h3>
            <input placeholder="Status" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="form-control mb-2" />
            <input placeholder="Merchant" value={filter.merchant} onChange={e => setFilter({ ...filter, merchant: e.target.value })} className="form-control mb-2" />
            <input placeholder="Transaction Limit" value={filter.limit} onChange={e => setFilter({ ...filter, limit: e.target.value })} className="form-control mb-2" />
            <button onClick={fetchTerminals} className="btn btn-primary btn-sm">Apply Filters</button>
          </div>
        </div>
        {/* Terminals Table */}
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="h5 fw-semibold text-dark mb-3">Terminals</h3>
            <table className="table table-bordered table-hover mb-4">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Merchant</th>
                  <th>Serial</th>
                  <th>Status</th>
                  <th>Config</th>
                  <th>Transaction Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
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
                      let badgeClass = 'bg-secondary', badgeText = '';
                      if (status === 'active') { badgeClass = 'bg-success'; badgeText = 'Active'; }
                      else if (status === 'inactive' || status === 'closed') { badgeClass = 'bg-secondary'; badgeText = 'Inactive'; }
                      else if (status === 'pending') { badgeClass = 'bg-warning text-dark'; badgeText = 'Pending'; }
                      else { badgeText = t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : ''; }
                      return (
                        <tr key={t.id || t._id || Math.random()}>
                          <td>{t.id || t._id}</td>
                          <td>{t.merchant}</td>
                          <td>
                            <span title={t.serial} className="d-inline-block text-truncate" style={{maxWidth: '90px'}}>
                              {t.serial ? t.serial.replace(/(.{2}).+/, '$1***') : ''}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${badgeClass}`}
                              title={badgeText}>
                              {badgeText}
                            </span>
                          </td>
                          <td className="text-break small" title={configStr}>
                            {configStr.length > 20 ? configStr.slice(0, 20) + '...' : configStr}
                          </td>
                          <td>{t.transaction_limit || ''}</td>
                          <td>
                            <div className="btn-group" role="group" aria-label="Terminal Actions">
                              <button onClick={() => setSelectedTerminal(t.id || t._id)} className="btn btn-primary btn-sm" title="Select terminal for actions"><i className="bi bi-pencil-square"></i></button>
                              <button onClick={() => setShowConfirm({ type: 'activate', id: t.id || t._id })} className="btn btn-success btn-sm" title="Activate terminal"><i className="bi bi-power"></i></button>
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
        {/* Terminal Actions */}
        {selectedTerminal && (
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="h6 fw-semibold text-dark mb-3">Update Terminal Config</h4>
              <input placeholder="Language" value={config.language} onChange={e => setConfig({ ...config, language: e.target.value })} className="form-control mb-3" />
              <input placeholder="Currency" value={config.currency} onChange={e => setConfig({ ...config, currency: e.target.value })} className="form-control mb-3" />
              <input placeholder="Receipt Format" value={config.receiptFormat} onChange={e => setConfig({ ...config, receiptFormat: e.target.value })} className="form-control mb-3" />
              <button onClick={async () => {
                if (!config.language || !config.currency || !config.receiptFormat) {
                  showError('All config fields required.');
                  return;
                }
                await handleConfigUpdate();
                showSuccess('Config updated!');
              }} className="btn btn-primary fw-bold mb-2">Update Config</button>
              {configResult && <pre className="bg-light rounded p-3 mt-2 text-sm overflow-auto">{JSON.stringify(configResult, null, 2)}</pre>}
              <h4 className="h6 fw-semibold text-dark mt-4 mb-3">Transaction Limit</h4>
              <input placeholder="Transaction Limit" value={transactionLimit} onChange={e => setTransactionLimit(e.target.value)} className="form-control mb-2" />
              <button onClick={async () => {
                if (!transactionLimit) { showError('Limit required.'); return; }
                try {
                  await api.put(API_ENDPOINTS.TERMINAL_LIMIT(selectedTerminal), { limit: transactionLimit });
                  setTransactionLimit('');
                  fetchTerminals();
                  showSuccess('Limit updated!');
                } catch (error) {
                  showError(`Failed to update limit: ${error.message}`);
                }
              }} className="btn btn-primary btn-sm mb-2">Update Limit</button>
              <h4 className="h6 fw-semibold text-dark mt-4 mb-3">Transaction Management</h4>
              <button onClick={handleFetchTransactions} className="btn btn-info mb-2">Fetch Transactions</button>
              <ul className="list-group mb-4">
                {transactions.map(tx => (
                  <li key={tx.id || tx._id} className="list-group-item d-flex justify-content-between align-items-center py-1 small">
                    <span>{tx.amount} {tx.currency} - {tx.status}</span>
                    <button onClick={() => setShowConfirm({ type: 'void', id: tx.id || tx._id })} className="btn btn-danger btn-sm ms-2">Void</button>
                    {showConfirm.type === 'void' && showConfirm.id === (tx.id || tx._id) && (
                      <div className="alert alert-warning mt-2">Are you sure? <button onClick={async () => {
                        await handleVoidTransaction(tx.id || tx._id);
                        setShowConfirm({ type: '', id: null });
                        showSuccess('Transaction voided!');
                      }} className="btn btn-danger btn-sm">Yes</button> <button onClick={() => setShowConfirm({ type: '', id: null })} className="btn btn-secondary btn-sm">No</button></div>
                    )}
                  </li>
                ))}
                {(Array.isArray(transactions) ? transactions : []).map(tx => {
                  if (!tx || typeof tx !== 'object') return null;
                  return (
                    <li key={tx.id || tx._id || Math.random()} className="list-group-item d-flex justify-content-between align-items-center py-1 small">
                      <span>{tx.amount} {tx.currency} - {tx.status}</span>
                      <button onClick={() => setShowConfirm({ type: 'void', id: tx.id || tx._id })} className="btn btn-danger btn-sm ms-2">Void</button>
                      {showConfirm.type === 'void' && showConfirm.id === (tx.id || tx._id) && (
                        <div className="alert alert-warning mt-2">Are you sure? <button onClick={async () => {
                          await handleVoidTransaction(tx.id || tx._id);
                          setShowConfirm({ type: '', id: null });
                          showSuccess('Transaction voided!');
                        }} className="btn btn-danger btn-sm">Yes</button> <button onClick={() => setShowConfirm({ type: '', id: null })} className="btn btn-secondary btn-sm">No</button></div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {voidResult && <pre className="bg-light rounded p-3 mt-2 text-sm overflow-auto">{JSON.stringify(voidResult, null, 2)}</pre>}
              <h4 className="h6 fw-semibold text-dark mt-4 mb-3">Terminal Lifecycle</h4>
              <button onClick={() => setShowConfirm({ type: 'replace', id: selectedTerminal })} className="btn btn-warning me-2 mb-2">Replace</button>
              <button onClick={() => setShowConfirm({ type: 'retire', id: selectedTerminal })} className="btn btn-secondary me-2 mb-2">Retire</button>
              <button onClick={() => setShowConfirm({ type: 'terminate', id: selectedTerminal })} className="btn btn-danger mb-2">Terminate</button>
              {lifecycleResult && <pre className="bg-light rounded p-3 mt-2 text-sm overflow-auto">{JSON.stringify(lifecycleResult, null, 2)}</pre>}
              {notification.message && (
                <div className={`alert alert-${notification.type} mt-2`} role="alert">
                  {notification.message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );

}


export default TerminalManagement;
