import React, { useState } from 'react';

function DirectApiTest() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetch('http://localhost:4000/api/merchants', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      
      if (!result.ok) {
        throw new Error(`HTTP error! Status: ${result.status}`);
      }
      
      const data = await result.json();
      console.log('API test result:', data);
      setResponse(data);
    } catch (err) {
      console.error('API test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2>Direct API Test</h2>
      <div className="card">
        <div className="card-body">
          <button 
            className="btn btn-primary mb-3" 
            onClick={testApi}
            disabled={loading}
          >
            {loading ? 'Testing API...' : 'Test API Connection'}
          </button>
          
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}
          
          {response && (
            <div>
              <h3>API Response:</h3>
              <p>Found {Array.isArray(response) ? response.length : 0} merchants</p>
              <pre className="bg-light p-3" style={{maxHeight: '300px', overflow: 'auto'}}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DirectApiTest;
