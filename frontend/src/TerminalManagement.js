import React, { useState, useEffect } from 'react';

export default function TerminalManagement() {
  const [terminals, setTerminals] = useState([]);
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [config, setConfig] = useState({ language: '', currency: '', receiptFormat: '' });
  const [configResult, setConfigResult] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [voidResult, setVoidResult] = useState(null);
  const [lifecycleResult, setLifecycleResult] = useState(null);

  useEffect(() => {
    fetch('https://merchant-acquiring-mvp.onrender.com/api/terminals', {
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' }
    })
      .then(res => res.json())
      .then(data => setTerminals(data.terminals || []));
  }, []);

  // Terminal config update
  const handleConfigUpdate = async () => {
    const res = await fetch(`https://merchant-acquiring-mvp.onrender.com/api/terminals/${selectedTerminal}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setConfigResult(await res.json());
  };

  // Fetch transaction history
  const handleFetchTransactions = async () => {
    const res = await fetch(`https://merchant-acquiring-mvp.onrender.com/api/terminals/${selectedTerminal}/transactions`, {
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    const data = await res.json();
    setTransactions(data.transactions || []);
  };

  // Void transaction
  const handleVoidTransaction = async (transactionId) => {
    const res = await fetch(`https://merchant-acquiring-mvp.onrender.com/api/terminals/${selectedTerminal}/void`, {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setVoidResult(await res.json());
  };

  // Terminal lifecycle actions
  const handleLifecycleAction = async (action) => {
    const res = await fetch(`https://merchant-acquiring-mvp.onrender.com/api/terminals/${selectedTerminal}/${action}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setLifecycleResult(await res.json());
  };

  return (
    <div>
      <h2>Terminal Management</h2>
      {/* Terminals Table */}
      <table border="1">
        <thead>
          <tr>
            <th>ID</th><th>Merchant</th><th>Serial</th><th>Status</th><th>Config</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {terminals.map(t => (
            <tr key={t.id || t._id}>
              <td>{t.id || t._id}</td>
              <td>{t.merchant}</td>
              <td>{t.serial}</td>
              <td>{t.status}</td>
              <td>{JSON.stringify(t.config)}</td>
              <td>
                <button onClick={() => setSelectedTerminal(t.id || t._id)}>Select</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Terminal Actions */}
      {selectedTerminal && (
        <div>
          <h4>Update Terminal Config</h4>
          <input placeholder="Language" value={config.language} onChange={e => setConfig({ ...config, language: e.target.value })} />
          <input placeholder="Currency" value={config.currency} onChange={e => setConfig({ ...config, currency: e.target.value })} />
          <input placeholder="Receipt Format" value={config.receiptFormat} onChange={e => setConfig({ ...config, receiptFormat: e.target.value })} />
          <button onClick={handleConfigUpdate}>Update Config</button>
          {configResult && <pre>{JSON.stringify(configResult, null, 2)}</pre>}
          <h4>Transaction Management</h4>
          <button onClick={handleFetchTransactions}>Fetch Transactions</button>
          <ul>
            {transactions.map(tx => (
              <li key={tx.id || tx._id}>
                {tx.amount} {tx.currency} - {tx.status}
                <button onClick={() => handleVoidTransaction(tx.id || tx._id)}>Void</button>
              </li>
            ))}
          </ul>
          {voidResult && <pre>{JSON.stringify(voidResult, null, 2)}</pre>}
          <h4>Terminal Lifecycle</h4>
          <button onClick={() => handleLifecycleAction('replace')}>Replace</button>
          <button onClick={() => handleLifecycleAction('retire')}>Retire</button>
          <button onClick={() => handleLifecycleAction('terminate')}>Terminate</button>
          {lifecycleResult && <pre>{JSON.stringify(lifecycleResult, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
