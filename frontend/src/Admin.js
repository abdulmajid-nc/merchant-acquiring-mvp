import React, { useEffect, useState } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

export default function Admin() {
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const data = await api.get(API_ENDPOINTS.MERCHANTS);
        setMerchants(data);
      } catch (error) {
        console.error('Failed to fetch merchants:', error);
      }
    };
    fetchMerchants();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(API_ENDPOINTS.MERCHANT_STATUS(id), { status });
      setMerchants(merchants.map(m => (m.id === id ? { ...m, status } : m)));
    } catch (error) {
      console.error(`Failed to update merchant status: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>Docs</th><th>Actions</th>
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
            <td>{m.docs}</td>
            <td>
              <button onClick={() => updateStatus(m.id, 'Approved')} className="btn btn-success btn-sm me-2">Approve</button>
              <button onClick={() => updateStatus(m.id, 'Rejected')} className="btn btn-danger btn-sm">Reject</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
