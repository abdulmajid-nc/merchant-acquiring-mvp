import React, { useState } from 'react';
import Layout from './Layout';

export default function MerchantManagement() {
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
    const res = await fetch('https://merchant-acquiring-mvp.onrender.com/api/merchants/bulk', {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setBulkResult(await res.json());
  };

  // Profile update
  const handleProfileUpdate = async () => {
    const res = await fetch('https://merchant-acquiring-mvp.onrender.com/api/merchants/PROFILE_ID/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setUpdateResult(await res.json());
  };

  // Profile transition
  const handleTransition = async () => {
    const res = await fetch(`https://merchant-acquiring-mvp.onrender.com/api/merchants/PROFILE_ID/${transitionType}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setTransitionResult(await res.json());
  };

  // Account closure
  const handleClosure = async () => {
    const res = await fetch('https://merchant-acquiring-mvp.onrender.com/api/merchants/PROFILE_ID/close', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setClosureResult(await res.json());
  };

  // Custom config
  const handleConfigUpdate = async () => {
    const res = await fetch('https://merchant-acquiring-mvp.onrender.com/api/merchants/PROFILE_ID/config', {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setConfigResult(await res.json());
  };

  // Automated review
  const handleReview = async () => {
    const res = await fetch('https://merchant-acquiring-mvp.onrender.com/api/merchants/PROFILE_ID/review', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' },
    });
    setReviewResult(await res.json());
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    padding: '2em',
    marginBottom: '2em',
    maxWidth: '500px',
    margin: '2em auto'
  };
  const inputStyle = {
    margin: '0.5em 0',
    padding: '0.5em',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%'
  };
  const buttonStyle = {
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5em 1.5em',
    margin: '0.5em 0',
    cursor: 'pointer',
    fontWeight: 'bold'
  };
  const labelStyle = { fontWeight: 'bold', marginTop: '1em' };
  return (
    <Layout>
      <h2 style={{textAlign:'center', color:'#007bff', marginBottom:'2em'}}>Merchant Management</h2>
      {/* Bulk Account Creation */}
      <div style={cardStyle}>
        <h3 style={{color:'#333'}}>Bulk Account Creation</h3>
        <input type="file" accept=".csv" onChange={handleCsvUpload} style={inputStyle} />
        <select value={template} onChange={e => setTemplate(e.target.value)} style={inputStyle}>
          <option value="retail">Retail</option>
          <option value="ecommerce">Ecommerce</option>
          <option value="service">Service-based</option>
        </select>
        <button onClick={handleBulkCreate} style={buttonStyle}>Upload & Create</button>
        {bulkResult && <pre>{JSON.stringify(bulkResult, null, 2)}</pre>}
      </div>
      {/* Profile Update */}
      <div style={cardStyle}>
        <h3 style={{color:'#333'}}>Profile Update</h3>
        <input name="name" placeholder="Name" onChange={e => setProfile({ ...profile, name: e.target.value })} style={inputStyle} />
        <input name="email" placeholder="Email" onChange={e => setProfile({ ...profile, email: e.target.value })} style={inputStyle} />
        <input name="business_type" placeholder="Business Type" onChange={e => setProfile({ ...profile, business_type: e.target.value })} style={inputStyle} />
        <input name="bank" placeholder="Bank Account" onChange={e => setProfile({ ...profile, bank: e.target.value })} style={inputStyle} />
        <input name="catalog" placeholder="Product/Service Catalog" onChange={e => setProfile({ ...profile, catalog: e.target.value })} style={inputStyle} />
        <button onClick={handleProfileUpdate} style={buttonStyle}>Update Profile</button>
        {updateResult && <pre>{JSON.stringify(updateResult, null, 2)}</pre>}
      </div>
      {/* Profile Transitions */}
      <div style={cardStyle}>
        <h3 style={{color:'#333'}}>Profile Transitions</h3>
        <select value={transitionType} onChange={e => setTransitionType(e.target.value)} style={inputStyle}>
          <option value="upgrade">Upgrade</option>
          <option value="downgrade">Downgrade</option>
          <option value="transfer">Transfer Ownership</option>
          <option value="location">Add Location</option>
        </select>
        <button onClick={handleTransition} style={buttonStyle}>Trigger Transition</button>
        {transitionResult && <pre>{JSON.stringify(transitionResult, null, 2)}</pre>}
      </div>
      {/* Account Closure */}
      <div style={cardStyle}>
        <h3 style={{color:'#333'}}>Account Closure</h3>
        <button onClick={handleClosure} style={buttonStyle}>Close Account</button>
        {closureResult && <pre>{JSON.stringify(closureResult, null, 2)}</pre>}
      </div>
      {/* Custom Config */}
      <div style={cardStyle}>
        <h3 style={{color:'#333'}}>Custom Account Configuration</h3>
        <input name="fee" placeholder="Fee Structure" onChange={e => setConfig({ ...config, fee: e.target.value })} style={inputStyle} />
        <input name="paymentOptions" placeholder="Payment Options" onChange={e => setConfig({ ...config, paymentOptions: e.target.value })} style={inputStyle} />
        <label style={labelStyle}>
          <input type="checkbox" checked={config.whiteLabel} onChange={e => setConfig({ ...config, whiteLabel: e.target.checked })} />
          White-labeling
        </label>
        <button onClick={handleConfigUpdate} style={buttonStyle}>Update Config</button>
        {configResult && <pre>{JSON.stringify(configResult, null, 2)}</pre>}
      </div>
      {/* Automated Review */}
      <div style={cardStyle}>
        <h3 style={{color:'#333'}}>Automated Account Review</h3>
        <button onClick={handleReview} style={buttonStyle}>Run Review</button>
        {reviewResult && <pre>{JSON.stringify(reviewResult, null, 2)}</pre>}
      </div>
    </Layout>
  );
}
