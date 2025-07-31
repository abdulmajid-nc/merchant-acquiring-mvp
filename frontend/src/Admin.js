
import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

export default function Admin() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMerchants = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(API_ENDPOINTS.MERCHANTS);
        if (Array.isArray(data)) {
          setMerchants(data);
        } else if (data && data.merchants && Array.isArray(data.merchants)) {
          setMerchants(data.merchants);
        } else {
          setMerchants([]);
        }
      } catch (err) {
        console.error('Failed to fetch merchants:', err);
        setError('Failed to fetch merchants.');
        setMerchants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(API_ENDPOINTS.MERCHANT_STATUS(id), { status });
      setMerchants(merchants.map(m => (m.id === id ? { ...m, status } : m)));
    } catch (error) {
      setError(`Failed to update merchant status: ${error.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Panel</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Merchants</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading merchants...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : merchants.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No merchants found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docs</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {merchants.map((m, idx) => (
                  <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-blue-50'}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{m.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{m.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{m.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{m.business_type}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={
                        m.status === 'Approved'
                          ? 'inline-block px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold'
                          : m.status === 'Rejected'
                          ? 'inline-block px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs font-semibold'
                          : 'inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-semibold'
                      }>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{m.docs}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <button
                        onClick={() => updateStatus(m.id, 'Approved')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-2"
                        aria-label={`Approve merchant ${m.name}`}
                        title="Approve"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(m.id, 'Rejected')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        aria-label={`Reject merchant ${m.name}`}
                        title="Reject"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
