import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './utils/api';

function ApiDebugger() {
  const [apiResponse, setApiResponse] = useState(null);
  const [directResponse, setDirectResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [envValue, setEnvValue] = useState(process.env.REACT_APP_API_URL || 'Not set');

  useEffect(() => {
    // Test the API utility configuration
    console.log('API_BASE_URL:', API_BASE_URL);
    setLoading(true);

    // Try direct fetch with explicit URL
    fetch('http://localhost:4000/api/merchants')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('Direct fetch response:', data);
        setDirectResponse(data);
      })
      .catch(err => {
        console.error('Direct fetch failed:', err);
        setError(prev => ({ ...prev, direct: err.message }));
      });

    // Try fetch with API_BASE_URL
    fetch(`${API_BASE_URL}/api/merchants`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('API_BASE_URL fetch response:', data);
        setApiResponse(data);
      })
      .catch(err => {
        console.error('API_BASE_URL fetch failed:', err);
        setError(prev => ({ ...prev, api: err.message }));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-4">
      <h2>API Debugger</h2>
      
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Environment Configuration</h3>
          <p><strong>REACT_APP_API_URL:</strong> {envValue}</p>
          <p><strong>API_BASE_URL from utility:</strong> {API_BASE_URL || 'Not set'}</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Direct Fetch (http://localhost:4000)</h3>
          {error?.direct && <div className="alert alert-danger">{error.direct}</div>}
          {directResponse ? (
            <>
              <p><strong>Status:</strong> Success</p>
              <p><strong>Data Count:</strong> {Array.isArray(directResponse) ? directResponse.length : 'Not an array'}</p>
              <pre className="bg-light p-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                {JSON.stringify(directResponse, null, 2)}
              </pre>
            </>
          ) : loading ? (
            <p>Loading...</p>
          ) : (
            <p>No data received</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 className="card-title">API_BASE_URL Fetch</h3>
          {error?.api && <div className="alert alert-danger">{error.api}</div>}
          {apiResponse ? (
            <>
              <p><strong>Status:</strong> Success</p>
              <p><strong>Data Count:</strong> {Array.isArray(apiResponse) ? apiResponse.length : 'Not an array'}</p>
              <pre className="bg-light p-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </>
          ) : loading ? (
            <p>Loading...</p>
          ) : (
            <p>No data received</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiDebugger;
