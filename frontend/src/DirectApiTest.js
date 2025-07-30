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
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Direct API Test</h2>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <button 
            onClick={testApi} 
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mb-3" 
          >
            Test Direct Connection
          </button>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          )}
          
          {response && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">API Response:</h3>
              <p className="mb-2">Found {Array.isArray(response) ? response.length : 0} merchants</p>
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm max-h-72 overflow-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DirectApiTest;
