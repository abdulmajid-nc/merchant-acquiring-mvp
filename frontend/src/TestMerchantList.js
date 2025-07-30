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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Merchant List Test</h2>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">All Merchants</h3>
          
          {Array.isArray(merchants) && merchants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {merchants.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.business_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link to={`/merchant/${m.id}/pricing`} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                          Pricing
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No merchants found.</p>
          )}
          
          <div className="mt-6">
            <h4 className="text-base font-medium mb-2">Raw Data:</h4>
            <pre className="p-4 bg-gray-50 rounded-md text-sm overflow-x-auto">{JSON.stringify(merchants, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestMerchantList;
