
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { API_ENDPOINTS } from './utils/api';

export default function Status() {
  const [id, setId] = useState('');
  const [merchant, setMerchant] = useState(null);

  const checkStatus = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.MERCHANT_BY_ID(id));
      setMerchant(data);
    } catch (error) {
      console.error('Failed to check merchant status:', error);
      setMerchant({ error: 'Failed to fetch merchant status. Please try again.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await checkStatus();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="card p-4 mx-auto mt-4" style={{ maxWidth: '400px' }}>
        <h2 className="h4 fw-bold text-primary mb-4 text-center">Check Merchant Status</h2>
        <input name="id" placeholder="Merchant ID" onChange={e => setId(e.target.value)} className="form-control mb-3" />
        <button type="submit" className="btn btn-primary fw-bold w-100">Check Status</button>
        {merchant && <pre className="bg-light rounded p-3 mt-3 text-sm overflow-auto">{JSON.stringify(merchant, null, 2)}</pre>}
      </form>
    </div>
  );
}
