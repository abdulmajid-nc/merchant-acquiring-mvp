import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';

import Register from './Register';


function MerchantManagement() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMerchants(page);
    // eslint-disable-next-line
  }, [page]);

  const fetchMerchants = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`${API_ENDPOINTS.MERCHANTS}?page=${pageNum}&limit=${pageSize}`);
      if (response && response.merchants && Array.isArray(response.merchants)) {
        setMerchants(response.merchants);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total || 0);
      } else {
        setMerchants([]);
        setTotalPages(1);
        setTotal(0);
        console.warn('Unexpected response format for merchants:', response);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching merchants:', err);
      setError('Failed to load merchants. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01.88 7.88M12 3v1m0 16v1m8.66-13.66l-.7.7M4.34 19.66l-.7.7M21 12h-1M4 12H3m16.66 7.66l-.7-.7M4.34 4.34l-.7-.7" /></svg>
          Merchant Management
        </h1>
        <p className="text-gray-500 text-lg">Manage your merchants, view details, and register new accounts.</p>
      </header>

      {/* Register New Merchant Button & Section */}
      <section className="mb-10">
        {!showRegister ? (
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setShowRegister(true)}
            aria-label="Register New Merchant"
          >
            <span className="inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Register New Merchant
            </span>
          </button>
        ) : (
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Register New Merchant</h2>
              <button
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => setShowRegister(false)}
                aria-label="Cancel Register"
              >
                Cancel
              </button>
            </div>
            <Register />
          </div>
        )}
      </section>

      {error && <div className="bg-red-100 text-red-700 rounded px-4 py-2 mb-4">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          <span className="text-gray-600 text-lg">Loading merchants...</span>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Business Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400 text-lg">No merchants found</td>
                </tr>
              ) : (
                merchants.map(merchant => (
                  <tr key={merchant.id || merchant._id} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{merchant.id || merchant._id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{merchant.name}</td>
                    <td className="px-4 py-3 text-gray-700">{merchant.email}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{merchant.business_type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                        merchant.status === 'approved' ? 'bg-green-100 text-green-800' :
                        merchant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {merchant.status === 'approved' && (
                          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                        {merchant.status === 'pending' && (
                          <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
                        )}
                        {merchant.status === 'rejected' && (
                          <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded shadow text-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" aria-label="View Merchant">
                          <svg className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          View
                        </button>
                        <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded shadow text-xs hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" aria-label="Edit Merchant">
                          <svg className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6l9-9a2.828 2.828 0 114 4l-9 9z" /></svg>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <nav className="flex flex-col sm:flex-row flex-wrap justify-between items-center mt-6 px-2 gap-2" aria-label="Pagination">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              Page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span> <span className="hidden sm:inline">({total} merchants)</span>
            </div>
            <div className="flex flex-wrap gap-1 overflow-x-auto rounded-lg bg-gray-50 p-2 shadow-inner">
              <button
                className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                aria-label="Previous Page"
              >
                &larr;
              </button>
              {/* Compact pagination logic with ellipses */}
              {(() => {
                const pageButtons = [];
                const maxButtons = 5; // Show current, ±2, first, last
                let start = Math.max(2, page - 2);
                let end = Math.min(totalPages - 1, page + 2);
                if (page <= 3) {
                  start = 2;
                  end = Math.min(5, totalPages - 1);
                }
                if (page >= totalPages - 2) {
                  start = Math.max(2, totalPages - 4);
                  end = totalPages - 1;
                }
                // First page
                pageButtons.push(
                  <button
                    key={1}
                    className={`px-3 py-1 rounded-lg font-semibold ${page === 1 ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    aria-current={page === 1 ? 'page' : undefined}
                  >
                    1
                  </button>
                );
                // Ellipsis before
                if (start > 2) {
                  pageButtons.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
                }
                // Middle pages
                for (let p = start; p <= end; p++) {
                  pageButtons.push(
                    <button
                      key={p}
                      className={`px-3 py-1 rounded-lg font-semibold ${p === page ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      onClick={() => setPage(p)}
                      disabled={p === page}
                      aria-current={p === page ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  );
                }
                // Ellipsis after
                if (end < totalPages - 1) {
                  pageButtons.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
                }
                // Last page
                if (totalPages > 1) {
                  pageButtons.push(
                    <button
                      key={totalPages}
                      className={`px-3 py-1 rounded-lg font-semibold ${page === totalPages ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      aria-current={page === totalPages ? 'page' : undefined}
                    >
                      {totalPages}
                    </button>
                  );
                }
                return pageButtons;
              })()}
              <button
                className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next Page"
              >
                &rarr;
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

export default MerchantManagement;