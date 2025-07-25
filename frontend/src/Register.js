import React, { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', business_type: '', docs: '' });
  const [result, setResult] = useState(null);
  const [debug, setDebug] = useState({});

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setResult(null);
    setDebug({ request: form });
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/merchant/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setDebug(prev => ({ ...prev, responseStatus: res.status, responseData: data }));
      if (!res.ok) {
        setResult({ error: data.error || 'Registration failed' });
      } else {
        setResult(data);
      }
    } catch (err) {
      setDebug(prev => ({ ...prev, fetchError: err.message || String(err) }));
      setResult({ error: err.message || 'Network error' });
    }
  };

  return (
    <div>
      <h2>Merchant Registration</h2>
      <form onSubmit={submit} className="card p-4 mx-auto mt-4" style={{maxWidth: '400px'}}>
        <h2 className="h4 fw-bold text-primary mb-4 text-center">Merchant Registration</h2>
        <input name="name" placeholder="Name" onChange={handleChange} className="form-control mb-3" />
        <input name="email" placeholder="Email" onChange={handleChange} className="form-control mb-3" />
        <input name="business_type" placeholder="Business Type" onChange={handleChange} className="form-control mb-3" />
        <input name="bank" placeholder="Bank Account" onChange={handleChange} className="form-control mb-3" />
        <input name="catalog" placeholder="Product/Service Catalog" onChange={handleChange} className="form-control mb-3" />
        <button type="submit" className="btn btn-primary fw-bold w-100">Register</button>
        {result && <pre className="bg-light rounded p-3 mt-3 text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>}
      </form>
      {result && result.error && <div style={{color:'red'}}>Error: {result.error}</div>}
      {result && result.id && <div>Registered! Merchant ID: {result.id}, Status: {result.status}</div>}
      {/* Debug info for troubleshooting */}
      {(debug.request || debug.responseStatus || debug.responseData || debug.fetchError) && (
        <div style={{marginTop:'1em',padding:'1em',border:'1px solid #ccc',background:'#fafafa'}}>
          <h4>Debug Info</h4>
          {debug.request && <pre>Request: {JSON.stringify(debug.request, null, 2)}</pre>}
          {debug.responseStatus && <div>Response Status: {debug.responseStatus}</div>}
          {debug.responseData && <pre>Response Data: {JSON.stringify(debug.responseData, null, 2)}</pre>}
          {debug.fetchError && <div style={{color:'red'}}>Fetch Error: {debug.fetchError}</div>}
        </div>
      )}
    </div>
  );
}
