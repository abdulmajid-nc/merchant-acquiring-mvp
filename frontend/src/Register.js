import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { API_ENDPOINTS } from './utils/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', business_type: '', bank: '', catalog: '' });
  const [result, setResult] = useState(null);
  const [debug, setDebug] = useState({});

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setResult(null);
    setDebug({ request: form });
    try {
      const data = await api.post(API_ENDPOINTS.MERCHANT_REGISTER, form);
      setDebug(prev => ({ ...prev, responseStatus: 200, responseData: data }));
      setResult(data);
    } catch (err) {
      setDebug(prev => ({ ...prev, fetchError: err.message || String(err) }));
      setResult({ error: err.message || 'Registration failed' });
    }
  };

  return (
    <div className="container-fluid px-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 fw-bold mb-1">Merchant Registration</h1>
          <p className="text-muted">Register a new merchant in the Nexus Acquire payment platform</p>
        </div>
      </div>
      
      <div className="row">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Merchant Details</h5>
              <form onSubmit={submit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Business Name</label>
                  <input 
                    id="name"
                    name="name" 
                    value={form.name}
                    onChange={handleChange} 
                    className="form-control form-control-lg" 
                    placeholder="Enter business name" 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Business Email</label>
                  <input 
                    id="email"
                    name="email" 
                    type="email"
                    value={form.email}
                    onChange={handleChange} 
                    className="form-control form-control-lg" 
                    placeholder="Enter business email" 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="business_type" className="form-label">Business Type</label>
                  <select 
                    id="business_type"
                    name="business_type" 
                    value={form.business_type}
                    onChange={handleChange} 
                    className="form-select form-select-lg"
                  >
                    <option value="">Select business type</option>
                    <option value="retail">Retail</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="professional_services">Professional Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="bank" className="form-label">Bank Account Details</label>
                  <textarea 
                    id="bank"
                    name="bank" 
                    value={form.bank}
                    onChange={handleChange} 
                    className="form-control" 
                    rows="3"
                    placeholder="Enter bank account information" 
                  ></textarea>
                  <div className="form-text">Enter bank name, account number, and routing information</div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="catalog" className="form-label">Product/Service Catalog</label>
                  <textarea 
                    id="catalog"
                    name="catalog" 
                    value={form.catalog}
                    onChange={handleChange} 
                    className="form-control" 
                    rows="3"
                    placeholder="Describe products or services offered" 
                  ></textarea>
                </div>
                
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mt-4 mt-lg-0">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Application Status</h5>
              {!result && (
                <div className="text-center py-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#6c757d" className="mb-3" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                  <p className="text-muted mb-0">Submit your application to see status information</p>
                </div>
              )}
              
              {result && result.error && (
                <div className="alert alert-danger">
                  <h6 className="alert-heading fw-bold">Registration Failed</h6>
                  <p className="mb-0">{result.error}</p>
                </div>
              )}
              
              {result && result.id && (
                <div className="alert alert-success">
                  <h6 className="alert-heading fw-bold">Registration Successful!</h6>
                  <p>Your merchant application has been submitted successfully.</p>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span>Merchant ID:</span>
                    <strong>{result.id}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Status:</span>
                    <span className="badge bg-warning text-dark">{result.status || 'Pending'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="card border-0 bg-light">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Next Steps</h5>
              <ol className="ps-3">
                <li className="mb-2">Complete the registration form with accurate business information</li>
                <li className="mb-2">Submit your application for review</li>
                <li className="mb-2">Our team will verify your details (typically 1-2 business days)</li>
                <li className="mb-2">Upon approval, you'll receive credentials to access the merchant portal</li>
                <li>Set up your payment terminals and start accepting payments</li>
              </ol>
              <div className="mt-3">
                <Link to="/status" className="text-decoration-none">Check existing application status →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug info - hidden in production */}
      {process.env.NODE_ENV === 'development' && (debug.request || debug.responseStatus || debug.responseData || debug.fetchError) && (
        <div className="card mt-4 border-0">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Debug Information</h5>
            <div className="small">
              {debug.request && (
                <div className="mb-3">
                  <h6 className="text-muted">Request Payload:</h6>
                  <pre className="bg-light p-3 rounded">{JSON.stringify(debug.request, null, 2)}</pre>
                </div>
              )}
              
              {debug.responseStatus && (
                <div className="mb-3">
                  <h6 className="text-muted">Response Status:</h6>
                  <div className="bg-light p-3 rounded">{debug.responseStatus}</div>
                </div>
              )}
              
              {debug.responseData && (
                <div className="mb-3">
                  <h6 className="text-muted">Response Data:</h6>
                  <pre className="bg-light p-3 rounded">{JSON.stringify(debug.responseData, null, 2)}</pre>
                </div>
              )}
              
              {debug.fetchError && (
                <div className="mb-3">
                  <h6 className="text-muted">Fetch Error:</h6>
                  <div className="bg-light p-3 rounded text-danger">{debug.fetchError}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
