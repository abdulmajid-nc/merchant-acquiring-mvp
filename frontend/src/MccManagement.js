import React, { useState, useEffect } from 'react';
import api, { API_ENDPOINTS } from './utils/api';


function MccManagement() {
  const [mccs, setMccs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  // Form state
  const [newMcc, setNewMcc] = useState({ code: '', description: '', category: '' });
  // Form validation
  const [validation, setValidation] = useState({ code: '', description: '', category: '' });
  // Categories for dropdown (can be expanded or fetched from API)
  const categories = [
    'Retail', 'Food & Beverage', 'Healthcare', 'Travel', 'Education', 'Financial Services', 'Entertainment', 'Utilities', 'Other'
  ];

  useEffect(() => { fetchMccs(page); }, [page]);

  const fetchMccs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await api.get(`${API_ENDPOINTS.MCCS}?page=${pageNum}&limit=${pageSize}`);
      if (Array.isArray(data)) {
        setMccs(data);
        setTotal(data.length);
        setTotalPages(1);
      } else if (data && data.mccs && Array.isArray(data.mccs)) {
        setMccs(data.mccs);
        setTotal(data.total || data.mccs.length);
        setTotalPages(data.totalPages || 1);
      } else {
        console.warn('Unexpected response format for MCCs:', data);
        setMccs([]);
        setTotal(0);
        setTotalPages(1);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch MCCs:', err);
      setError('Failed to load MCCs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMcc({
      ...newMcc,
      [name]: value
    });
    
    // Clear validation error when user types
    if (validation[name]) {
      setValidation({
        ...validation,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newValidation = { code: '', description: '', category: '' };
    
    // MCC Code validation - must be 4 digit numeric
    if (!/^\d{4}$/.test(newMcc.code)) {
      newValidation.code = 'MCC must be a 4-digit numeric code';
      isValid = false;
    }
    
    // Description validation - cannot be empty
    if (!newMcc.description.trim()) {
      newValidation.description = 'Description is required';
      isValid = false;
    }
    
    // Category validation - cannot be empty
    if (!newMcc.category.trim()) {
      newValidation.category = 'Category is required';
      isValid = false;
    }
    
    setValidation(newValidation);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      await api.post(API_ENDPOINTS.MCCS, newMcc);
      
      // Reset form after successful submission
      setNewMcc({
        code: '',
        description: '',
        category: ''
      });
      
      // Show success notification
      showSuccess('MCC added successfully!');
      
      // Refresh the MCC list
      fetchMccs();
      
    } catch (err) {
      console.error("Failed to add MCC:", err);
      showError(`Failed to add MCC: ${err.message}`);
    }
  };

  // Notification helpers
  const showSuccess = (msg) => {
    setNotification({ type: 'success', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };
  
  const showError = (msg) => {
    setNotification({ type: 'danger', message: msg });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      {/* Page header */}
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2a2 2 0 01-2 2H11a2 2 0 01-2-2z" /></svg>
          Merchant Category Codes (MCC) Management
        </h1>
        <p className="text-gray-500 text-lg">Manage your merchant category codes, view details, and add new codes.</p>
      </header>

      {/* Notification alert */}
      {notification.message && (
        <div className={`mb-6 px-4 py-3 rounded-md flex items-center ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-600' :
          notification.type === 'danger' ? 'bg-red-50 text-red-800 border-l-4 border-red-600' :
          'bg-blue-50 text-blue-800 border-l-4 border-blue-600'
        }`} role="alert">
          <div className="flex-grow">{notification.message}</div>
          <button
            type="button"
            className="ml-auto rounded-md inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setNotification({ type: '', message: '' })}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* MCC List */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">MCC List</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold py-1 px-3 rounded-full">
                  {total} Codes
                </span>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <svg className="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  <span className="text-gray-600 text-lg">Loading MCCs...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : mccs.length === 0 ? (
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">No MCCs found. Add a new MCC using the form.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">MCC Code</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mccs.map((mcc) => (
                        <tr key={mcc.code || mcc._id} className="hover:bg-blue-50 transition">
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                              {mcc.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{mcc.description}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                              {mcc.category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              <nav className="flex flex-col sm:flex-row flex-wrap justify-between items-center mt-6 px-2 gap-2" aria-label="Pagination">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                  Page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span> <span className="hidden sm:inline">({total} codes)</span>
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
                    const maxButtons = 5;
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
                    if (start > 2) {
                      pageButtons.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
                    }
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
                    if (end < totalPages - 1) {
                      pageButtons.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
                    }
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
          </div>
        </div>

        {/* Add New MCC Form */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Add New MCC</h2>
                <p className="text-sm text-gray-500 mt-1">Create a new merchant category code</p>
              </div>
              <form onSubmit={handleSubmit}>
                {/* ...existing code for form fields... */}
                <div className="mb-4">
                  <label htmlFor="mccCode" className="block text-sm font-medium text-gray-700 mb-1">
                    MCC Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className={`pl-10 pr-4 py-2 block w-full rounded-md shadow-sm ${validation.code ?
                        'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500' :
                        'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                      id="mccCode"
                      name="code"
                      value={newMcc.code}
                      onChange={handleInputChange}
                      placeholder="e.g., 5812"
                      maxLength="4"
                    />
                  </div>
                  {validation.code && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validation.code}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-gray-500">Must be a 4-digit numeric code</p>
                </div>
                <div className="mb-4">
                  <label htmlFor="mccDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className={`pl-10 pr-4 py-2 block w-full rounded-md shadow-sm ${validation.description ?
                        'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500' :
                        'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                      id="mccDescription"
                      name="description"
                      value={newMcc.description}
                      onChange={handleInputChange}
                      placeholder="e.g., Restaurants"
                    />
                  </div>
                  {validation.description && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validation.description}
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label htmlFor="mccCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <select
                      className={`pl-10 pr-10 py-2 block w-full rounded-md shadow-sm appearance-none ${validation.category ?
                        'border-red-300 text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500' :
                        'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
                      id="mccCategory"
                      name="category"
                      value={newMcc.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {validation.category && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validation.category}
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add MCC
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MccManagement;
