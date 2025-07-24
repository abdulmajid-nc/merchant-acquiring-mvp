import React, { useState } from 'react';

export default function Status() {
  const [id, setId] = useState('');
  const [merchant, setMerchant] = useState(null);

  const checkStatus = async () => {
    const res = await fetch(`https://merchant-acquiring-mvp.onrender.com/api/merchant/${id}`);
    const data = await res.json();
    setMerchant(data);
  };

  return (
    <div>
      <h2>Check Application Status</h2>
      <input value={id} onChange={e => setId(e.target.value)} placeholder="Merchant ID" />
      <button onClick={checkStatus}>Check</button>
      {merchant && (
        <div>
          <p>Name: {merchant.name}</p>
          <p>Status: {merchant.status}</p>
        </div>
      )}
    </div>
  );
}
