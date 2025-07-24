import React, { useEffect, useState } from 'react';
import Layout from './Layout';

function AdminPanel() {
  const [merchants, setMerchants] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [owner, setOwner] = useState('');
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkTemplate, setBulkTemplate] = useState('retail');
  const [bulkResult, setBulkResult] = useState(null);

  useEffect(() => {
    fetch('https://merchant-acquiring-mvp.onrender.com/api/merchants', {
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' }
    })
      .then(res => res.json())
      .then(data => setMerchants(data.merchants || []));
    fetch('https://merchant-acquiring-mvp.onrender.com/api/terminals', {
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' }
    })
      .then(res => res.json())
      .then(data => setTerminals(data.terminals || []));
  }, []);

  // Update merchant status
  const handleStatusUpdate = async () => {
    await fetch(`https://merchant-acquiring-mvp.onrender.com/api/merchants/${selectedMerchant}/profile`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
  };

  // Update merchant ownership
  const handleOwnerUpdate = async () => {
    await fetch(`https://merchant-acquiring-mvp.onrender.com/api/merchants/${selectedMerchant}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ owner }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
  };

  // Update merchant location
  const handleLocationUpdate = async () => {
    await fetch(`https://merchant-acquiring-mvp.onrender.com/api/merchants/${selectedMerchant}/location`, {
      method: 'POST',
      body: JSON.stringify({ location }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
  };

  // Trigger account closure/upgrade
  const handleAccountAction = async (action) => {
    await fetch(`https://merchant-acquiring-mvp.onrender.com/api/merchants/${selectedMerchant}/${action}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
  };

  // Bulk upload
  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    const formData = new FormData();
    formData.append('csv', bulkFile);
    formData.append('template', bulkTemplate);
    const res = await fetch('https://merchant-acquiring-mvp.onrender.com/api/merchants/bulk', {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setBulkResult(await res.json());
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">Admin Panel</h2>
        {/* Merchants Table */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Merchants</h3>
          <table className="min-w-full bg-white border rounded mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Owner</th>
                <th className="py-2 px-4 border-b">Locations</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map(m => (
                <tr key={m.id || m._id} className="hover:bg-blue-50">
                  <td className="py-2 px-4 border-b">{m.id || m._id}</td>
                  <td className="py-2 px-4 border-b">{m.name}</td>
                  <td className="py-2 px-4 border-b">{m.email}</td>
                  <td className="py-2 px-4 border-b">{m.business_type}</td>
                  <td className="py-2 px-4 border-b">{m.status}</td>
                  <td className="py-2 px-4 border-b">{m.owner}</td>
                  <td className="py-2 px-4 border-b text-xs">{(m.locations || []).join(', ')}</td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => setSelectedMerchant(m.id || m._id)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2">Select</button>
                    <button onClick={() => handleAccountAction('upgrade')} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2">Upgrade</button>
                    <button onClick={() => handleAccountAction('close')} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 mr-2">Close</button>
                    <button onClick={() => handleAccountAction('archive')} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Archive</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        {/* Merchant Actions */}
        {selectedMerchant && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Update Merchant</h4>
            <input placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
            <button onClick={handleStatusUpdate} className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-700 transition mb-2">Update Status</button>
            <input placeholder="Owner" value={owner} onChange={e => setOwner(e.target.value)} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
            <button onClick={handleOwnerUpdate} className="bg-green-500 text-white font-bold px-6 py-2 rounded hover:bg-green-600 transition mb-2">Transfer Ownership</button>
            <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
            <button onClick={handleLocationUpdate} className="bg-yellow-500 text-white font-bold px-6 py-2 rounded hover:bg-yellow-600 transition mb-2">Add Location</button>
          </div>
        )}
        {/* Bulk Upload */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Bulk Merchant Upload</h4>
          <input type="file" accept=".csv" onChange={e => setBulkFile(e.target.files[0])} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
          <select value={bulkTemplate} onChange={e => setBulkTemplate(e.target.value)} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded">
            <option value="retail">Retail</option>
            <option value="ecommerce">Ecommerce</option>
            <option value="service">Service-based</option>
          </select>
          <button onClick={handleBulkUpload} className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-700 transition mb-2">Upload</button>
          {bulkResult && <pre className="bg-gray-100 rounded p-4 mt-2 text-sm overflow-x-auto">{JSON.stringify(bulkResult, null, 2)}</pre>}
        </div>
      </div>
    </Layout>
  );

}

export default function AdminPanelWrapper() {
  return (
    <Layout>
      <AdminPanel />
    </Layout>
  );
}
