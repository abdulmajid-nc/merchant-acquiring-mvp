import React, { useState, useEffect } from 'react';
import { Tooltip } from 'bootstrap';
import Layout from './Layout';

function MerchantManagement() {
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [bankAccount, setBankAccount] = useState({ account: '', bank: '' });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [catalogItem, setCatalogItem] = useState({ name: '', price: '' });
  const [archived, setArchived] = useState([]);
  const [settlement, setSettlement] = useState('monthly');
  const [branding, setBranding] = useState({ logo: '', theme: '', white_label: false });
  const [fee, setFee] = useState({ volume: '', industry: '' });
  const [feeResult, setFeeResult] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showConfirm, setShowConfirm] = useState({ type: '', id: null });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/merchants`)
      .then(res => res.json())
      .then(data => setMerchants(data));
    fetch(`${process.env.REACT_APP_API_URL}/api/merchants/archived`)
      .then(res => res.json())
      .then(data => setArchived(data.archived || []));
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

  useEffect(() => {
    if (selectedMerchant) {
      fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/bank`)
        .then(res => res.json())
        .then(data => setBankAccounts(data.bank_accounts || []));
      fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/catalog`)
        .then(res => res.json())
        .then(data => setCatalog(data.catalog || []));
    }
  }, [selectedMerchant]);
  // Bulk account creation
  const [csvFile, setCsvFile] = useState(null);
  const [template, setTemplate] = useState('retail');
  const [bulkResult, setBulkResult] = useState(null);

  // Profile update
  const [profile, setProfile] = useState({ name: '', email: '', business_type: '', bank: '', catalog: '' });
  const [updateResult, setUpdateResult] = useState(null);

  // Profile transitions
  const [transitionType, setTransitionType] = useState('upgrade');
  const [transitionResult, setTransitionResult] = useState(null);

  // Account closure
  const [closureResult, setClosureResult] = useState(null);

  // Custom config
  const [config, setConfig] = useState({ fee: '', paymentOptions: '', whiteLabel: false });
  const [configResult, setConfigResult] = useState(null);

  // Automated review
  const [reviewResult, setReviewResult] = useState(null);

  // CSV upload handler
  const handleCsvUpload = e => setCsvFile(e.target.files[0]);

  // Bulk account creation
  const handleBulkCreate = async () => {
    if (!csvFile) return;
    const formData = new FormData();
    formData.append('csv', csvFile);
    formData.append('template', template);
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/bulk`, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setBulkResult(await res.json());
  };

  // Profile update
  const handleProfileUpdate = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/${selectedMerchant}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profile),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setUpdateResult(await res.json());
  };

  // Profile transition
  const handleTransition = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/${selectedMerchant}/${transitionType}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setTransitionResult(await res.json());
  };

  // Account closure
  const handleClosure = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/${selectedMerchant}/close`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setClosureResult(await res.json());
  };

  // Custom config
  const handleConfigUpdate = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/${selectedMerchant}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setConfigResult(await res.json());
  };

  // Automated review
  const handleReview = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/merchants/${selectedMerchant}/review`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setReviewResult(await res.json());
  };

  return (
    <Layout>
      <div className="container py-4">
        <h2 className="display-5 fw-bold text-primary text-center mb-4">Merchant Management</h2>
        {/* Merchant List */}
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.business_type}</td>
                    <td>{m.status}</td>
                    <td>
                      <button onClick={() => setSelectedMerchant(m.id)} className="btn btn-primary btn-sm me-2">Select</button>
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
        {/* Merchant Details & Actions */}
        {selectedMerchant && (
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="h6 fw-semibold text-dark mb-3">Business Info</h4>
              <input placeholder="Name" onChange={e => setProfile({ ...profile, name: e.target.value })} className="form-control mb-2" />
              <input placeholder="Address" onChange={e => setProfile({ ...profile, address: e.target.value })} className="form-control mb-2" />
              <input placeholder="Contact" onChange={e => setProfile({ ...profile, contact: e.target.value })} className="form-control mb-2" />
              <button onClick={async () => {
                if (!profile.name || !profile.address || !profile.contact) {
                  showError('Name, address, and contact are required.');
                  return;
                }
                try {
                  await handleProfileUpdate();
                  showSuccess('Profile updated!');
                } catch (e) { showError('Update failed.'); }
              }} className="btn btn-primary btn-sm mb-2">Update Info</button>
      {notification.message && (
        <div className={`alert alert-${notification.type} mt-2`} role="alert">
          {notification.message}
        </div>
      )}
              <h4 className="h6 fw-semibold text-dark mb-3 mt-4">Bank Accounts</h4>
              <input placeholder="Account" value={bankAccount.account} onChange={e => setBankAccount({ ...bankAccount, account: e.target.value })} className="form-control mb-2" />
              <input placeholder="Bank" value={bankAccount.bank} onChange={e => setBankAccount({ ...bankAccount, bank: e.target.value })} className="form-control mb-2" />
              <button onClick={async () => {
                if (!bankAccount.account || !bankAccount.bank) {
                  showError('Account and bank are required.');
                  return;
                }
                try {
                  await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/bank`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bankAccount)
                  });
                  setBankAccount({ account: '', bank: '' });
                  fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/bank`).then(res => res.json()).then(data => setBankAccounts(data.bank_accounts || []));
                  showSuccess('Bank account added!');
                } catch (e) { showError('Add failed.'); }
              }} className="btn btn-success btn-sm mb-2">Add Bank Account</button>
              <ul>
                {bankAccounts.map(b => (
                  <li key={b.account}>
                    {b.account} ({b.bank}) <button onClick={() => setShowConfirm({ type: 'bank', id: b.account })} className="btn btn-danger btn-sm ms-2">Delete</button>
                    {showConfirm.type === 'bank' && showConfirm.id === b.account && (
                      <div className="alert alert-warning mt-2">Are you sure? <button onClick={async () => {
                        await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/bank/${showConfirm.id}`, { method: 'DELETE' });
                        fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/bank`).then(res => res.json()).then(data => setBankAccounts(data.bank_accounts || []));
                        setShowConfirm({ type: '', id: null });
                        showSuccess('Bank account deleted!');
                      }} className="btn btn-danger btn-sm">Yes</button> <button onClick={() => setShowConfirm({ type: '', id: null })} className="btn btn-secondary btn-sm">No</button></div>
                    )}
                  </li>
                ))}
              </ul>
              <h4 className="h6 fw-semibold text-dark mb-3 mt-4">Product/Service Catalog</h4>
              <input placeholder="Name" value={catalogItem.name} onChange={e => setCatalogItem({ ...catalogItem, name: e.target.value })} className="form-control mb-2" />
              <input placeholder="Price" value={catalogItem.price} onChange={e => setCatalogItem({ ...catalogItem, price: e.target.value })} className="form-control mb-2" />
              <button onClick={async () => {
                if (!catalogItem.name || !catalogItem.price) {
                  showError('Name and price required.');
                  return;
                }
                try {
                  await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/catalog`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(catalogItem)
                  });
                  setCatalogItem({ name: '', price: '' });
                  fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/catalog`).then(res => res.json()).then(data => setCatalog(data.catalog || []));
                  showSuccess('Catalog item added!');
                } catch (e) { showError('Add failed.'); }
              }} className="btn btn-success btn-sm mb-2">Add Item</button>
              <ul>
                {catalog.map(i => (
                  <li key={i.id}>
                    {i.name} (${i.price}) <button onClick={() => setShowConfirm({ type: 'catalog', id: i.id })} className="btn btn-danger btn-sm ms-2">Delete</button>
                    {showConfirm.type === 'catalog' && showConfirm.id === i.id && (
                      <div className="alert alert-warning mt-2">Are you sure? <button onClick={async () => {
                        await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/catalog/${showConfirm.id}`, { method: 'DELETE' });
                        fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/catalog`).then(res => res.json()).then(data => setCatalog(data.catalog || []));
                        setShowConfirm({ type: '', id: null });
                        showSuccess('Catalog item deleted!');
                      }} className="btn btn-danger btn-sm">Yes</button> <button onClick={() => setShowConfirm({ type: '', id: null })} className="btn btn-secondary btn-sm">No</button></div>
                    )}
                  </li>
                ))}
              </ul>
              <h4 className="h6 fw-semibold text-dark mb-3 mt-4">Archival & Settings</h4>
              <button onClick={() => setShowConfirm({ type: 'archive', id: selectedMerchant })} className="btn btn-secondary btn-sm mb-2">Archive Merchant</button>
              {showConfirm.type === 'archive' && (
                <div className="alert alert-warning mt-2">Are you sure? <button onClick={async () => {
                  await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${showConfirm.id}/archive`, { method: 'POST' });
                  fetch(`${process.env.REACT_APP_API_URL}/api/merchants/archived`).then(res => res.json()).then(data => setArchived(data.archived || []));
                  setShowConfirm({ type: '', id: null });
                  showSuccess('Merchant archived!');
                }} className="btn btn-danger btn-sm">Yes</button> <button onClick={() => setShowConfirm({ type: '', id: null })} className="btn btn-secondary btn-sm">No</button></div>
              )}
              <h4 className="h6 fw-semibold text-dark mb-3 mt-4">Settlement Schedule</h4>
              <select value={settlement} onChange={e => setSettlement(e.target.value)} className="form-select mb-2">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button onClick={async () => {
                await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/settlement`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ schedule: settlement })
                });
              }} className="btn btn-primary btn-sm mb-2">Update Settlement</button>
              <h4 className="h6 fw-semibold text-dark mb-3 mt-4">Branding</h4>
              <input placeholder="Logo URL" value={branding.logo} onChange={e => setBranding({ ...branding, logo: e.target.value })} className="form-control mb-2" title="URL to logo image" />
              <input placeholder="Theme" value={branding.theme} onChange={e => setBranding({ ...branding, theme: e.target.value })} className="form-control mb-2" title="Theme name or color" />
              <label className="font-bold mt-2 flex items-center" title="Enable white-label branding">
                <input type="checkbox" checked={branding.white_label} onChange={e => setBranding({ ...branding, white_label: e.target.checked })} className="me-2" />
                White-label
              </label>
              <button onClick={async () => {
                await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/branding`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(branding)
                });
                showSuccess('Branding updated!');
              }} className="btn btn-primary btn-sm mb-2">Update Branding</button>
              <h4 className="h6 fw-semibold text-dark mb-3 mt-4">Custom Fee Structure</h4>
              <input placeholder="Volume" value={fee.volume} onChange={e => setFee({ ...fee, volume: e.target.value })} className="form-control mb-2" title="Monthly transaction volume (for discount)" />
              <input placeholder="Industry" value={fee.industry} onChange={e => setFee({ ...fee, industry: e.target.value })} className="form-control mb-2" title="Industry type (e.g. retail, restaurant)" />
              <button onClick={async () => {
                if (!fee.volume || !fee.industry) {
                  showError('Volume and industry required.');
                  return;
                }
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${selectedMerchant}/fee`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(fee)
                });
                setFeeResult(await res.json());
                showSuccess('Fee calculated!');
              }} className="btn btn-primary btn-sm mb-2">Calculate Fee</button>
              {feeResult && <pre className="bg-light rounded p-3 mt-2 text-sm overflow-auto">{JSON.stringify(feeResult, null, 2)}</pre>}
            </div>
          </div>
        )}
        {/* Bulk Account Creation */}
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="h5 fw-semibold text-dark mb-3">Bulk Account Creation</h3>
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="form-control mb-3" />
            <select value={template} onChange={e => setTemplate(e.target.value)} className="form-select mb-3">
              <option value="retail">Retail</option>
              <option value="ecommerce">Ecommerce</option>
              <option value="service">Service-based</option>
            </select>
            <button onClick={handleBulkCreate} className="btn btn-primary fw-bold mb-2">Upload & Create</button>
            {bulkResult && <pre className="bg-light rounded p-3 mt-2 text-sm overflow-auto">{JSON.stringify(bulkResult, null, 2)}</pre>}
          </div>
        </div>
      </div>
    </Layout>
  );
}


export default MerchantManagement;
