/**
 * API utility functions for handling API requests
 */

// Base API URL from environment variables with fallback
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // Always provide the localhost fallback if API_BASE_URL is empty
  const baseUrl = API_BASE_URL || 'http://localhost:4000';
  return `${baseUrl}${endpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Merchants
  MERCHANTS: '/api/merchants',
  MERCHANT_REGISTER: '/api/merchant/register',
  MERCHANT_BY_ID: (id) => `/api/merchants/${id}`,
  MERCHANT_STATUS: (id) => `/api/merchant/${id}/status`,
  MERCHANT_BANK: (id) => `/api/merchant/${id}/bank`,
  MERCHANT_BANK_BY_ACCOUNT: (merchantId, accountId) => `/api/merchant/${merchantId}/bank/${accountId}`,
  MERCHANT_CATALOG: (id) => `/api/merchant/${id}/catalog`,
  MERCHANT_CATALOG_BY_ID: (merchantId, itemId) => `/api/merchant/${merchantId}/catalog/${itemId}`,
  MERCHANT_PROFILE: (id) => `/api/merchants/${id}/profile`,
  MERCHANT_ARCHIVE: (id) => `/api/merchant/${id}/archive`,
  MERCHANT_LIFECYCLE: (id, transitionType) => `/api/merchants/${id}/${transitionType}`,
  MERCHANT_CLOSE: (id) => `/api/merchants/${id}/close`,
  MERCHANT_CONFIG: (id) => `/api/merchants/${id}/config`,
  MERCHANT_REVIEW: (id) => `/api/merchants/${id}/review`,
  MERCHANT_TRANSFER: (id) => `/api/merchants/${id}/transfer`,
  MERCHANT_LOCATION: (id) => `/api/merchants/${id}/location`,
  MERCHANT_SETTLEMENT: (id) => `/api/merchant/${id}/settlement`,
  MERCHANTS_ARCHIVED: '/api/merchants/archived',
  MERCHANTS_BULK: '/api/merchants/bulk',
  
  // Terminals
  TERMINALS: '/api/terminals',
  TERMINAL_CONFIG: (id) => `/api/terminals/${id}/config`,
  TERMINAL_TRANSACTIONS: (id) => `/api/terminals/${id}/transactions`,
  TERMINAL_VOID: (id) => `/api/terminals/${id}/void`,
  TERMINAL_LIFECYCLE: (id, action) => `/api/terminals/${id}/${action}`,
  TERMINAL_LIMIT: (id) => `/api/terminals/${id}/limit`,
  
  // MCCs
  MCCS: '/api/mccs',
  MCC_BY_CODE: (code) => `/api/mccs/${code}`,
  
  // Applications
  APPLICATIONS: '/api/applications',
  
  // Merchant Pricing & Devices
  MERCHANT: (id) => `/api/merchants/${id}`,
  MERCHANT_PRICING: (id) => `/api/merchants/${id}/pricing`,
  MERCHANT_DEVICES: (id) => `/api/merchants/${id}/devices`,
  MERCHANT_ASSIGN_DEVICE: (id) => `/api/merchants/${id}/devices/assign`,
  MERCHANT_REMOVE_DEVICE: (id) => `/api/merchants/${id}/devices/remove`,
  
  // Transactions
  TRANSACTIONS: '/api/transactions',
  TRANSACTION_BY_ID: (id) => `/api/transactions/${id}`,
  TRANSACTION_STATUS: (id) => `/api/transactions/${id}/status`
};

// Helper function for making fetch requests with proper error handling
export const fetchApi = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  console.log(`API Request to: ${url}`);
  
  try {
    // Add default headers if not provided
    const fetchOptions = {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      mode: 'cors'
    };
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} for ${url}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`API Success from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`API request to ${url} failed:`, error);
    throw error;
  }
};

// Common fetch methods
export const api = {
  get: (endpoint) => fetchApi(endpoint),
  
  post: (endpoint, data) => fetchApi(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }),
  
  put: (endpoint, data) => fetchApi(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }),
  
  delete: (endpoint) => fetchApi(endpoint, {
    method: 'DELETE'
  })
};

export default api;
