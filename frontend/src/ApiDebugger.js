import React, { useState, useEffect } from 'react';
import { API_BASE_URL, api, API_ENDPOINTS } from './utils/api';

function ApiDebugger() {
  const [apiResponse, setApiResponse] = useState(null);
  const [directResponse, setDirectResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [envValue, setEnvValue] = useState(process.env.REACT_APP_API_URL || 'Not set');
  const [usedMockData, setUsedMockData] = useState(false);

  useEffect(() => {
    // Test the API utility configuration
    console.log('API_BASE_URL:', API_BASE_URL);
    setLoading(true);

    // Try direct fetch with our enhanced API utility to get mock data if needed
    api.get(API_ENDPOINTS.MERCHANTS)
      .then(data => {
        console.log('API utility fetch response:', data);
        setDirectResponse(data);
        
        // Check if this is mock data
        if (data && (data.isMock || 
            (typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'isMock')))) {
          setUsedMockData(true);
        }
      })
      .catch(err => {
        console.error('API utility fetch failed:', err);
        setError(prev => ({ ...prev, direct: err.message }));
      });

    // Try direct fetch with explicit URL as a comparison
    fetch('http://localhost:4000/api/merchants')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('Direct fetch response:', data);
        setApiResponse(data);
      })
      .catch(err => {
        console.error('Direct fetch failed:', err);
        setError(prev => ({ ...prev, api: err.message }));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Debugger</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
        <p><strong>REACT_APP_API_URL:</strong> {envValue}</p>
        <p><strong>API_BASE_URL:</strong> {API_BASE_URL}</p>
        {usedMockData && (
          <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">
            <strong>⚠️ Using Mock Data:</strong> The API utility is currently using mock data because the backend server is unreachable.
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-4 border rounded shadow ${usedMockData ? 'border-yellow-300' : ''}`}>
          <h2 className="text-lg font-semibold mb-2">
            API Utility Request
            {usedMockData && <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">MOCK</span>}
          </h2>
          {error?.direct && (
            <div className="p-3 bg-red-100 text-red-700 rounded mb-3">
              Error: {error.direct}
            </div>
          )}
          {directResponse ? (
            <pre className={`p-3 rounded overflow-auto max-h-96 ${usedMockData ? 'bg-yellow-50' : 'bg-gray-50'}`}>
              {JSON.stringify(directResponse, null, 2)}
            </pre>
          ) : loading ? (
            <p>Loading...</p>
          ) : (
            <p>No data received</p>
          )}
        </div>
        
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Direct Fetch ({API_BASE_URL})</h2>
          {error?.api && (
            <div className="p-3 bg-red-100 text-red-700 rounded mb-3">
              Error: {error.api}
            </div>
          )}
          {apiResponse ? (
            <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          ) : loading ? (
            <p>Loading...</p>
          ) : (
            <p>No data received</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 border rounded shadow">
        <h2 className="text-lg font-semibold mb-2">API Endpoints Tester</h2>
        <p className="mb-2">Test various endpoints to see if mock data is properly configured:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <button 
            onClick={() => api.get(API_ENDPOINTS.MERCHANTS).then(data => setDirectResponse(data))}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Test Merchants List
          </button>
          <button 
            onClick={() => api.get(API_ENDPOINTS.MERCHANT(1)).then(data => setDirectResponse(data))}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Test Merchant #1
          </button>
          <button 
            onClick={() => api.get(API_ENDPOINTS.TERMINALS).then(data => setDirectResponse(data))}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Test Terminals List
          </button>
          <button 
            onClick={() => api.get(API_ENDPOINTS.TERMINAL(1)).then(data => setDirectResponse(data))}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Test Terminal #1
          </button>
          <button 
            onClick={() => api.get('/api/terminals/1/transactions').then(data => setDirectResponse(data))}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Test Terminal #1 Transactions
          </button>
          <button 
            onClick={() => api.post('/api/terminals/1/suspend').then(data => setDirectResponse(data))}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Suspend Terminal #1
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApiDebugger;
