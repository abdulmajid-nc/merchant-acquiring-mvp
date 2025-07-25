import React, { useState } from 'react';

export default function Status() {
  const [id, setId] = useState('');
  const [merchant, setMerchant] = useState(null);

  const checkStatus = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/${id}`);
    const data = await res.json();
    setMerchant(data);
  };

  return (
      <div>
        <form onSubmit={handleSubmit} className="card p-4 mx-auto mt-4" style={{maxWidth: '400px'}}>
          <h2 className="h4 fw-bold text-primary mb-4 text-center">Check Merchant Status</h2>
          <input name="id" placeholder="Merchant ID" onChange={e => setId(e.target.value)} className="form-control mb-3" />
          <button type="submit" className="btn btn-primary fw-bold w-100">Check Status</button>
          {result && <pre className="bg-light rounded p-3 mt-3 text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>}
        </form>
      </div>
  );
}
