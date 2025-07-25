import React, { useEffect, useState } from 'react';
import Layout from './Layout';

function AdminPanel() {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showConfirm, setShowConfirm] = useState({ type: '', id: null });
  const [archived, setArchived] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/merchants/archived`)
      .then(res => res.json())
      .then(data => setArchived(data.archived || []));
  }, []);
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
    fetch(`${process.env.REACT_APP_API_URL}/api/merchants`, {
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' }
    })
      .then(res => res.json())
      .then(data => setMerchants(data.merchants || []));
    fetch(`${process.env.REACT_APP_API_URL}/api/terminals`, {
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' }
    })
      .then(res => res.json())
      .then(data => setTerminals(data.terminals || []));
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
  const showInfo = msg => {
    setNotification({ type: 'info', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 2000);
  };
  // Update merchant status
  const handleStatusUpdate = async () => {
    if (!status) { showError('Status required.'); return; }
    await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/${selectedMerchant}/profile`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    showSuccess('Status updated!');
  };

  // Update merchant ownership
  const handleOwnerUpdate = async () => {
    if (!owner) { showError('Owner required.'); return; }
    await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/${selectedMerchant}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ owner }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    showSuccess('Ownership transferred!');
  };

  // Update merchant location
  const handleLocationUpdate = async () => {
    if (!location) { showError('Location required.'); return; }
    await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/${selectedMerchant}/location`, {
      method: 'POST',
      body: JSON.stringify({ location }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    showSuccess('Location added!');
  };

  // Trigger account closure/upgrade/archive with confirmation
  const handleAccountAction = async (action) => {
    setShowConfirm({ type: action, id: selectedMerchant });
  };

  // Bulk upload
  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    const formData = new FormData();
    formData.append('csv', bulkFile);
    formData.append('template', bulkTemplate);
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/bulk`, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setBulkResult(await res.json());
  };

  return (
    <Layout>
      <div className="container py-4">
        <h2 className="display-5 fw-bold text-primary text-center mb-4">Admin Panel</h2>
        {/* Merchants Table */}
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="h5 fw-semibold text-dark mb-3">Merchants</h3>
            <table className="table table-bordered table-hover mb-4">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Locations</th>
                  <th>Actions</th>
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
                    <td className="text-break small">{(m.locations || []).join(', ')}</td>
                    <td>
                      <button onClick={() => setSelectedMerchant(m.id || m._id)} className="btn btn-primary btn-sm me-2">Select</button>
                      <button onClick={() => handleAccountAction('upgrade')} className="btn btn-success btn-sm me-2">Upgrade</button>
                      <button onClick={() => handleAccountAction('close')} className="btn btn-danger btn-sm me-2">Close</button>
                      <button onClick={() => handleAccountAction('archive')} className="btn btn-secondary btn-sm">Archive</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Archived Merchants */}
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="h5 fw-semibold text-dark mb-3">Archived Merchants</h3>
            <ul>
              {archived.map(m => (
                <li key={m.id}>{m.name} (ID: {m.id})</li>
              ))}
            </ul>
          </div>
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
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="h6 fw-semibold text-dark mb-3">Update Merchant</h4>
              <input placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} className="form-control mb-3" />
              <button onClick={handleStatusUpdate} className="btn btn-primary fw-bold mb-2">Update Status</button>
              <input placeholder="Owner" value={owner} onChange={e => setOwner(e.target.value)} className="form-control mb-3" />
              <button onClick={handleOwnerUpdate} className="btn btn-success fw-bold mb-2">Transfer Ownership</button>
              <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="form-control mb-3" />
              <button onClick={handleLocationUpdate} className="btn btn-warning fw-bold mb-2">Add Location</button>
      {notification.message && (
        <div className={`alert alert-${notification.type} mt-2`} role="alert">
          {notification.message}
        </div>
      )}
              {showConfirm.type && (
                <div className="alert alert-warning mt-2">Are you sure you want to {showConfirm.type} this merchant?
                  <button onClick={async () => {
                    await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/${showConfirm.id}/${showConfirm.type}`, {
                      method: 'POST',
                      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
                    });
                    setShowConfirm({ type: '', id: null });
                    showSuccess(`Merchant ${showConfirm.type}d!`);
                  }} className="btn btn-danger btn-sm ms-2">Yes</button>
                  <button onClick={() => setShowConfirm({ type: '', id: null })} className="btn btn-secondary btn-sm ms-2">No</button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Bulk Upload */}
        <div className="card mb-4">
          <div className="card-body">
            <h4 className="h6 fw-semibold text-dark mb-3">Bulk Merchant Upload</h4>
            <input type="file" accept=".csv" onChange={e => setBulkFile(e.target.files[0])} className="form-control mb-3" />
            <select value={bulkTemplate} onChange={e => setBulkTemplate(e.target.value)} className="form-select mb-3">
              <option value="retail">Retail</option>
              <option value="ecommerce">Ecommerce</option>
              <option value="service">Service-based</option>
            </select>
            <button onClick={handleBulkUpload} className="btn btn-primary fw-bold mb-2">Upload</button>
            {bulkResult && <pre className="bg-light rounded p-3 mt-2 text-sm overflow-auto">{JSON.stringify(bulkResult, null, 2)}</pre>}
          </div>
        </div>
      </div>
    </Layout>
  );

}


export default AdminPanel;
