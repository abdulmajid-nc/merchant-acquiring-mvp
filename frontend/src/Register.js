import React, { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', business_type: '', docs: '' });
  const [result, setResult] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    //https://merchant-acquiring-a6mwwna44-abdul-majids-projects-21932dce.vercel.app/
    //http://localhost:4000/api/merchant/register
    const res = await fetch('https://merchant-acquiring-a6mwwna44-abdul-majids-projects-21932dce.vercel.ap/api/merchant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResult(data);
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
      {result && <div>Registered! Merchant ID: {result.id}, Status: {result.status}</div>}
    </div>
  );
}
