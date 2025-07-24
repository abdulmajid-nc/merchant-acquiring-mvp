import React, { useEffect, useState } from 'react';

export default function AdminPanel() {
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
    <div>
      <h2>Admin Panel</h2>
      {/* Merchants Table */}
      <h3>Merchants</h3>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>Owner</th><th>Locations</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map(m => (
            <tr key={m.id || m._id}>
              <td>{m.id || m._id}</td>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.business_type}</td>
              <td>{m.status}</td>
              <td>{m.owner}</td>
              <td>{(m.locations || []).join(', ')}</td>
              <td>
                <button onClick={() => setSelectedMerchant(m.id || m._id)}>Select</button>
                <button onClick={() => handleAccountAction('upgrade')}>Upgrade</button>
                <button onClick={() => handleAccountAction('close')}>Close</button>
                <button onClick={() => handleAccountAction('archive')}>Archive</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Terminals Table */}
      <h3>Terminals</h3>
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
      {/* Merchant Actions */}
      {selectedMerchant && (
        <div>
          <h4>Update Merchant</h4>
          <input placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} />
          <button onClick={handleStatusUpdate}>Update Status</button>
          <input placeholder="Owner" value={owner} onChange={e => setOwner(e.target.value)} />
          <button onClick={handleOwnerUpdate}>Transfer Ownership</button>
          <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
          <button onClick={handleLocationUpdate}>Add Location</button>
        </div>
      )}
      {/* Bulk Upload */}
      <div>
        <h4>Bulk Merchant Upload</h4>
        <input type="file" accept=".csv" onChange={e => setBulkFile(e.target.files[0])} />
        <select value={bulkTemplate} onChange={e => setBulkTemplate(e.target.value)}>
          <option value="retail">Retail</option>
          <option value="ecommerce">Ecommerce</option>
          <option value="service">Service-based</option>
        </select>
        <button onClick={handleBulkUpload}>Upload</button>
        {bulkResult && <pre>{JSON.stringify(bulkResult, null, 2)}</pre>}
      </div>
    </div>
  );
}
