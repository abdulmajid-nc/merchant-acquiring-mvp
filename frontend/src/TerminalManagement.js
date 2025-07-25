import React, { useState, useEffect } from 'react';
import Layout from './Layout';

function TerminalManagement() {
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
  const fetchTerminals = () => {
    const params = [];
    if (filter.status) params.push(`status=${encodeURIComponent(filter.status)}`);
    if (filter.merchant) params.push(`merchant=${encodeURIComponent(filter.merchant)}`);
    if (filter.limit) params.push(`limit=${encodeURIComponent(filter.limit)}`);
    const url = `${process.env.REACT_APP_API_URL}/api/terminals${params.length ? '?' + params.join('&') : ''}`;
    fetch(url, { headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' } })
      .then(res => res.json())
      .then(data => setTerminals(data.terminals || []));
  };
  useEffect(() => { fetchTerminals(); }, [filter]);

  // Terminal config update
  const handleConfigUpdate = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/terminals/${selectedTerminal}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setConfigResult(await res.json());
  };

  // Fetch transaction history
  const handleFetchTransactions = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/terminals/${selectedTerminal}/transactions`, {
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    const data = await res.json();
    if (data.transactions && data.transactions.length > 0) {
      setTransactions(data.transactions);
    } else {
      // Dummy data for transactions
      setTransactions([
        { id: 'tx1', amount: 100, currency: 'USD', status: 'Completed' },
        { id: 'tx2', amount: 50, currency: 'EUR', status: 'Pending' }
      ]);
    }
  };

  // Void transaction
  const handleVoidTransaction = async (transactionId) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/terminals/${selectedTerminal}/void`, {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setVoidResult(await res.json());
  };

  // Terminal lifecycle actions
  const handleLifecycleAction = async (action) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/terminals/${selectedTerminal}/${action}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setLifecycleResult(await res.json());
  };

  return (
    <Layout>
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
                {terminals.map(t => (
                  <tr key={t.id || t._id}>
                    <td>{t.id || t._id}</td>
                    <td>{t.merchant}</td>
                    <td>{t.serial}</td>
                    <td>{t.status}</td>
                    <td className="text-break small">{JSON.stringify(t.config)}</td>
                    <td>{t.transaction_limit || ''}</td>
                    <td>
                      <button onClick={() => setSelectedTerminal(t.id || t._id)} className="btn btn-primary btn-sm me-2">Select</button>
                      <button onClick={() => setShowConfirm({ type: 'activate', id: t.id || t._id })} className="btn btn-success btn-sm">Activate</button>
                    </td>
                  </tr>
                ))}
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
                await fetch(`${process.env.REACT_APP_API_URL}/api/terminals/${selectedTerminal}/limit`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ limit: transactionLimit })
                });
                setTransactionLimit('');
                fetchTerminals();
                showSuccess('Limit updated!');
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
              {showConfirm.type && ['activate','replace','retire','terminate'].includes(showConfirm.type) && (
                <div className="alert alert-warning mt-2">Are you sure you want to {showConfirm.type}?
                  <button onClick={async () => {
                    if (showConfirm.type === 'activate') {
                      await fetch(`${process.env.REACT_APP_API_URL}/api/terminals/${showConfirm.id}/activate`, { method: 'POST' });
                      fetchTerminals();
                      showSuccess('Terminal activated!');
                    } else {
                      await handleLifecycleAction(showConfirm.type);
                      showSuccess(`Terminal ${showConfirm.type}d!`);
                    }
                    setShowConfirm({ type: '', id: null });
                  }} className="btn btn-danger btn-sm ms-2">Yes</button>
                  <button onClick={() => setShowConfirm({ type: '', id: null })} className="btn btn-secondary btn-sm ms-2">No</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );

}


export default TerminalManagement;
