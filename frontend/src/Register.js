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
      const res = await fetch('https://merchant-acquiring-mvp.onrender.com/api/merchant/register', {
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
      <form onSubmit={submit}>
        <input name="name" placeholder="Business Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="business_type" placeholder="Business Type" onChange={handleChange} required />
        <textarea name="docs" placeholder="Documents (comma separated URLs)" onChange={handleChange} />
        <button type="submit">Register</button>
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
