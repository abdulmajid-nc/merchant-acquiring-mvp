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
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">Terminal Management</h2>
        {/* Terminals Table */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Terminals</h3>
          <table className="min-w-full bg-white border rounded mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Merchant</th>
                <th className="py-2 px-4 border-b">Serial</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Config</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terminals.map(t => (
                <tr key={t.id || t._id} className="hover:bg-blue-50">
                  <td className="py-2 px-4 border-b">{t.id || t._id}</td>
                  <td className="py-2 px-4 border-b">{t.merchant}</td>
                  <td className="py-2 px-4 border-b">{t.serial}</td>
                  <td className="py-2 px-4 border-b">{t.status}</td>
                  <td className="py-2 px-4 border-b text-xs">{JSON.stringify(t.config)}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => setSelectedTerminal(t.id || t._id)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Select</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Terminal Actions */}
        {selectedTerminal && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Update Terminal Config</h4>
            <input placeholder="Language" value={config.language} onChange={e => setConfig({ ...config, language: e.target.value })} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
            <input placeholder="Currency" value={config.currency} onChange={e => setConfig({ ...config, currency: e.target.value })} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
            <input placeholder="Receipt Format" value={config.receiptFormat} onChange={e => setConfig({ ...config, receiptFormat: e.target.value })} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
            <button onClick={handleConfigUpdate} className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-700 transition mb-2">Update Config</button>
            {configResult && <pre className="bg-gray-100 rounded p-4 mt-2 text-sm overflow-x-auto">{JSON.stringify(configResult, null, 2)}</pre>}
            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Transaction Management</h4>
            <button onClick={handleFetchTransactions} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2">Fetch Transactions</button>
            <ul className="mb-4">
              {transactions.map(tx => (
                <li key={tx.id || tx._id} className="flex items-center justify-between py-1 text-sm">
                  <span>{tx.amount} {tx.currency} - {tx.status}</span>
                  <button onClick={() => handleVoidTransaction(tx.id || tx._id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2">Void</button>
                </li>
              ))}
            </ul>
            {voidResult && <pre className="bg-gray-100 rounded p-4 mt-2 text-sm overflow-x-auto">{JSON.stringify(voidResult, null, 2)}</pre>}
            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Terminal Lifecycle</h4>
            <button onClick={() => handleLifecycleAction('replace')} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2">Replace</button>
            <button onClick={() => handleLifecycleAction('retire')} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2">Retire</button>
            <button onClick={() => handleLifecycleAction('terminate')} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Terminate</button>
            {lifecycleResult && <pre className="bg-gray-100 rounded p-4 mt-2 text-sm overflow-x-auto">{JSON.stringify(lifecycleResult, null, 2)}</pre>}
          </div>
        )}
      </div>
    </Layout>
  );

}

export default function TerminalManagementWrapper() {
  return (
    <Layout>
      <TerminalManagement />
    </Layout>
  );
}
