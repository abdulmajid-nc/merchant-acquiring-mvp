import React, { useState } from 'react';
import Layout from './Layout';

function MerchantManagement() {
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">Merchant Management</h2>
        {/* Bulk Account Creation */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Bulk Account Creation</h3>
          <input type="file" accept=".csv" onChange={handleCsvUpload} className="block w-full mb-4 px-3 py-2 border border-gray-300 rounded" />
          <select value={template} onChange={e => setTemplate(e.target.value)} className="block w-full mb-4 px-3 py-2 border border-gray-300 rounded">
            <option value="retail">Retail</option>
            <option value="ecommerce">Ecommerce</option>
            <option value="service">Service-based</option>
          </select>
          <button onClick={handleBulkCreate} className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-700 transition mb-2">Upload & Create</button>
          {bulkResult && <pre className="bg-gray-100 rounded p-4 mt-2 text-sm overflow-x-auto">{JSON.stringify(bulkResult, null, 2)}</pre>}
        </div>
        {/* Profile Update */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Update</h3>
          <input name="name" placeholder="Name" onChange={e => setProfile({ ...profile, name: e.target.value })} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
          <input name="email" placeholder="Email" onChange={e => setProfile({ ...profile, email: e.target.value })} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
          <input name="business_type" placeholder="Business Type" onChange={e => setProfile({ ...profile, business_type: e.target.value })} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
          <input name="bank" placeholder="Bank Account" onChange={e => setProfile({ ...profile, bank: e.target.value })} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
          <input name="catalog" placeholder="Product/Service Catalog" onChange={e => setProfile({ ...profile, catalog: e.target.value })} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
          <button onClick={handleProfileUpdate} className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-700 transition mb-2">Update Profile</button>
          {updateResult && <pre className="bg-gray-100 rounded p-4 mt-2 text-sm overflow-x-auto">{JSON.stringify(updateResult, null, 2)}</pre>}
        </div>
        {/* Profile Transitions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Transitions</h3>
          <select value={transitionType} onChange={e => setTransitionType(e.target.value)} className="block w-full mb-4 px-3 py-2 border border-gray-300 rounded">
            <option value="upgrade">Upgrade</option>
            <option value="downgrade">Downgrade</option>
            <option value="transfer">Transfer Ownership</option>
            <option value="location">Add Location</option>
          </select>
          <button onClick={handleTransition} className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-700 transition mb-2">Trigger Transition</button>
          {transitionResult && <pre className="bg-gray-100 rounded p-4 mt-2 text-sm overflow-x-auto">{JSON.stringify(transitionResult, null, 2)}</pre>}
        </div>
        {/* Account Closure */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Closure</h3>
          <button onClick={handleClosure} className="bg-red-600 text-white font-bold px-6 py-2 rounded hover:bg-red-700 transition mb-2">Close Account</button>
          {closureResult && <pre className="bg-gray-100 rounded p-4 mt-2 text-sm overflow-x-auto">{JSON.stringify(closureResult, null, 2)}</pre>}
        </div>
        {/* Custom Config */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Custom Account Configuration</h3>
          <input name="fee" placeholder="Fee Structure" onChange={e => setConfig({ ...config, fee: e.target.value })} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
          <input name="paymentOptions" placeholder="Payment Options" onChange={e => setConfig({ ...config, paymentOptions: e.target.value })} className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded" />
          <label className="font-bold mt-4 flex items-center">
            <input type="checkbox" checked={config.whiteLabel} onChange={e => setConfig({ ...config, whiteLabel: e.target.checked })} className="mr-2" />
            White-labeling
          </label>
          <button onClick={handleConfigUpdate} className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-700 transition mb-2">Update Config</button>
          {configResult && <pre className="bg-gray-100 rounded p-4 mt-2 text-sm overflow-x-auto">{JSON.stringify(configResult, null, 2)}</pre>}
        </div>
        {/* Automated Review */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Automated Account Review</h3>
          <button onClick={handleReview} className="bg-green-600 text-white font-bold px-6 py-2 rounded hover:bg-green-700 transition mb-2">Run Review</button>
          {reviewResult && <pre className="bg-gray-100 rounded p-4 mt-2 text-sm overflow-x-auto">{JSON.stringify(reviewResult, null, 2)}</pre>}
        </div>
      </div>
    </Layout>
  );
}

export default function MerchantManagementWrapper() {
  return (
    <Layout>
      <MerchantManagement />
    </Layout>
  );
}
