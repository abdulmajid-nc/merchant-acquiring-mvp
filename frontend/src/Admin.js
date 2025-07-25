import React, { useEffect, useState } from 'react';

export default function Admin() {
  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/merchants`)
      .then(res => res.json())
      .then(setMerchants);
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setMerchants(merchants.map(m => (m.id === id ? { ...m, status } : m)));
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
