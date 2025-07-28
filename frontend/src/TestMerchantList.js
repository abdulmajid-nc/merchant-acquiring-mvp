import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './utils/api';

function TestMerchantList() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');
  
  useEffect(() => {
    // For debugging
    setApiUrl(API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:4000');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    
    // Try both methods for fetching
    fetch('http://localhost:4000/api/merchants', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched merchants:', data);
        setMerchants(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching merchants:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);
  
  if (loading) {
    return <div>Loading merchants...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div className="container py-4">
      <h2>Merchant List Test</h2>
      
      <div className="card">
        <div className="card-body">
          <h3 className="card-title">All Merchants</h3>
          
          {Array.isArray(merchants) && merchants.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.business_type}</td>
                    <td>
                      <Link to={`/merchant/${m.id}/pricing`} className="btn btn-primary btn-sm">
                        Pricing
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No merchants found.</p>
          )}
          
          <div className="mt-3">
            <h4>Raw Data:</h4>
            <pre>{JSON.stringify(merchants, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestMerchantList;
