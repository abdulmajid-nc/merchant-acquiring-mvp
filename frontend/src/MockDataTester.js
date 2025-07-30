import React, { useState } from 'react';
import { api, API_ENDPOINTS } from './utils/api';

function MockDataTester() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { name: 'Get Merchants List', endpoint: API_ENDPOINTS.MERCHANTS, method: 'get' },
    { name: 'Get Merchant #1', endpoint: API_ENDPOINTS.MERCHANT(1), method: 'get' },
    { name: 'Get Terminals List', endpoint: API_ENDPOINTS.TERMINALS, method: 'get' },
    { name: 'Get Terminal #1', endpoint: API_ENDPOINTS.TERMINAL(1), method: 'get' },
    { name: 'Terminal #1 Transactions', endpoint: '/api/terminals/1/transactions', method: 'get' },
  ];

  const runTest = async (endpoint, method) => {
    setLoading(true);
    try {
      const result = await api[method](endpoint);
      setTestResults({
        endpoint,
        method,
        data: result,
        isMock: result && result.isMock,
        success: true
      });
    } catch (error) {
      setTestResults({
        endpoint,
        method,
        error: error.message,
        success: false
      });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mock Data Test Tool</h1>
      <p className="mb-4 text-gray-700">
        Use this page to test the mock data system and global notification banner. 
        Click the buttons below to test different API endpoints.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {testEndpoints.map((test) => (
          <button
            key={test.endpoint}
            onClick={() => runTest(test.endpoint, test.method)}
            className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
          >
            {test.name}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-700">Loading...</p>}
      
      {testResults && !loading && (
        <div className="border rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Test Results</h2>
          <p><strong>Endpoint:</strong> {testResults.endpoint}</p>
          <p><strong>Method:</strong> {testResults.method.toUpperCase()}</p>
          <p><strong>Status:</strong> {testResults.success ? 'Success' : 'Error'}</p>
          {testResults.isMock && (
            <p className="bg-yellow-100 p-2 rounded mb-2">
              <strong>Using Mock Data:</strong> The response came from mock data, not the real API.
            </p>
          )}
          {testResults.success ? (
            <div className="mt-4">
              <h3 className="font-semibold">Response Data:</h3>
              <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(testResults.data, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-red-500 mt-2">{testResults.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MockDataTester;
