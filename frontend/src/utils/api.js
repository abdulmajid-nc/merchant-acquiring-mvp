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

// Mock data for development when API is unavailable
const MOCK_DATA = {
  '/api/merchants': [
    {
      id: 1,
      name: 'Acme Retail',
      email: 'acme@retail.com',
      business_type: 'retail',
      docs: 'doc1,doc2',
      status: 'approved',
      created_at: '2025-07-28T07:35:43.560Z',
      address: '123 Main St',
      contact: '555-1234',
      bank_accounts: [{ name: 'Primary', account: '1234567890' }],
      catalog: [{ id: 1, name: 'Product 1' }],
      archived: false,
      settlement_schedule: 'weekly',
      logo: '',
      theme: '',
      white_label: false,
      terminals: [
        { id: 1, serial: 'T1001', status: 'active' },
        { id: 2, serial: 'T1002', status: 'inactive' }
      ]
    },
    {
      id: 2,
      name: 'Best Eats',
      email: 'info@besteats.com',
      business_type: 'restaurant',
      docs: 'docA,docB',
      status: 'pending',
      created_at: '2025-07-29T11:22:33.444Z'
    }
  ],
  '/api/merchants/1': {
    id: 1,
    name: 'Acme Retail',
    email: 'acme@retail.com',
    business_type: 'retail',
    docs: 'doc1,doc2',
    status: 'approved',
    created_at: '2025-07-28T07:35:43.560Z',
    address: '123 Main St',
    contact: '555-1234',
    bank_accounts: [{ name: 'Primary', account: '1234567890' }],
    catalog: [{ id: 1, name: 'Product 1' }],
    archived: false,
    settlement_schedule: 'weekly',
    logo: '',
    theme: '',
    white_label: false,
    terminals: [
      { id: 1, serial: 'T1001', status: 'active' },
      { id: 2, serial: 'T1002', status: 'inactive' }
    ]
  },
  '/api/merchants/2': {
    id: 2,
    name: 'Best Eats',
    email: 'info@besteats.com',
    business_type: 'restaurant',
    docs: 'docA,docB',
    status: 'pending',
    created_at: '2025-07-29T11:22:33.444Z'
  },
  '/api/terminals': [
    { id: 1, merchant_id: 1, serial: 'T1001', model: 'PAX A80', status: 'active', last_ping: '2025-07-29T10:23:15Z' },
    { id: 2, merchant_id: 1, serial: 'T1002', model: 'PAX A60', status: 'inactive', last_ping: '2025-07-25T16:45:22Z' },
    { id: 3, merchant_id: 2, serial: 'T2001', model: 'Verifone V200c', status: 'active', last_ping: '2025-07-30T08:12:44Z' }
  ],
  '/api/terminals/1': {
    id: 1, 
    merchant_id: 1, 
    serial: 'T1001', 
    model: 'PAX A80', 
    status: 'active', 
    last_ping: '2025-07-29T10:23:15Z',
    transaction_count: 3,
    total_volume: 243.29,
    config: {
      receipt_header: 'Acme Retail',
      receipt_footer: 'Thank you for shopping with us!',
      timezone: 'America/New_York',
      auto_settlement: true,
      settlement_time: '23:00'
    }
  },
  '/api/terminals/2': {
    id: 2, 
    merchant_id: 1, 
    serial: 'T1002', 
    model: 'PAX A60', 
    status: 'inactive', 
    last_ping: '2025-07-25T16:45:22Z',
    transaction_count: 1,
    total_volume: 22.50,
    config: {
      receipt_header: 'Acme Retail',
      receipt_footer: 'Thank you for shopping with us!',
      timezone: 'America/New_York',
      auto_settlement: true,
      settlement_time: '23:00'
    }
  },
  '/api/terminals/3': {
    id: 3, 
    merchant_id: 2, 
    serial: 'T2001', 
    model: 'Verifone V200c', 
    status: 'active', 
    last_ping: '2025-07-30T08:12:44Z',
    transaction_count: 2,
    total_volume: 113.24,
    config: {
      receipt_header: 'Best Eats',
      receipt_footer: 'Enjoy your meal!',
      timezone: 'America/Chicago',
      auto_settlement: true,
      settlement_time: '22:00'
    }
  },
  '/api/terminals/1/transactions': [
    { id: 'txn_001', amount: 45.99, status: 'approved', timestamp: '2025-07-30T07:22:15Z', card_type: 'Visa', last_four: '4242' },
    { id: 'txn_002', amount: 129.50, status: 'approved', timestamp: '2025-07-30T09:15:22Z', card_type: 'Mastercard', last_four: '5555' },
    { id: 'txn_004', amount: 67.80, status: 'approved', timestamp: '2025-07-30T11:30:45Z', card_type: 'Visa', last_four: '1111' }
  ],
  '/api/terminals/2/transactions': [
    { id: 'txn_005', amount: 22.50, status: 'declined', timestamp: '2025-07-25T14:22:10Z', card_type: 'Amex', last_four: '8888' }
  ],
  '/api/terminals/3/transactions': [
    { id: 'txn_003', amount: 78.25, status: 'approved', timestamp: '2025-07-30T10:05:17Z', card_type: 'Mastercard', last_four: '9876' },
    { id: 'txn_006', amount: 34.99, status: 'approved', timestamp: '2025-07-30T12:45:30Z', card_type: 'Visa', last_four: '4321' }
  ],
  '/api/terminals/1/suspend': { 
    success: true, 
    message: 'Terminal successfully suspended',
    terminal: { 
      id: 1, 
      merchant_id: 1, 
      serial: 'T1001', 
      model: 'PAX A80', 
      status: 'suspended', 
      last_ping: '2025-07-29T10:23:15Z' 
    }
  },
  '/api/terminals/1/activate': { 
    success: true, 
    message: 'Terminal successfully activated',
    terminal: { 
      id: 1, 
      merchant_id: 1, 
      serial: 'T1001', 
      model: 'PAX A80', 
      status: 'active', 
      last_ping: '2025-07-30T12:34:56Z' 
    }
  },
  '/api/mccs': [
    { code: '5411', description: 'Grocery Stores, Supermarkets', risk_level: 'low' },
    { code: '5812', description: 'Eating Places, Restaurants', risk_level: 'medium' },
    { code: '5999', description: 'Miscellaneous and Specialty Retail Stores', risk_level: 'medium' }
  ],
  '/api/transactions': [
    { id: 'txn_001', merchant_id: 1, terminal_id: 1, amount: 45.99, status: 'approved', timestamp: '2025-07-30T07:22:15Z' },
    { id: 'txn_002', merchant_id: 1, terminal_id: 1, amount: 129.50, status: 'approved', timestamp: '2025-07-30T09:15:22Z' },
    { id: 'txn_003', merchant_id: 2, terminal_id: 3, amount: 78.25, status: 'declined', timestamp: '2025-07-30T10:05:17Z' }
  ]
};

// Function to get mock data based on endpoint
const getMockData = (endpoint) => {
  // Extract the base endpoint without query parameters
  const baseEndpoint = endpoint.split('?')[0];
  
  // First check for exact match
  if (MOCK_DATA[baseEndpoint]) {
    return MOCK_DATA[baseEndpoint];
  }
  
  // Check for pattern matches like '/api/merchants/1'
  if (baseEndpoint.match(/\/api\/merchants\/\d+$/)) {
    const id = baseEndpoint.split('/').pop();
    return MOCK_DATA[`/api/merchants/${id}`] || { error: 'Merchant not found' };
  }
  
  // Check for pattern matches like '/api/terminals/1'
  if (baseEndpoint.match(/\/api\/terminals\/\d+$/)) {
    const id = baseEndpoint.split('/').pop();
    return MOCK_DATA[`/api/terminals/${id}`] || { error: 'Terminal not found' };
  }
  
  // Check for pattern matches like '/api/terminals/1/transactions'
  if (baseEndpoint.match(/\/api\/terminals\/\d+\/transactions$/)) {
    const id = baseEndpoint.split('/')[3]; // Get the terminal ID
    return MOCK_DATA[`/api/terminals/${id}/transactions`] || { 
      message: 'No transactions found for this terminal',
      transactions: [] 
    };
  }
  
  // Check for terminal lifecycle actions like '/api/terminals/1/suspend'
  if (baseEndpoint.match(/\/api\/terminals\/\d+\/(suspend|activate|deactivate|reset)$/)) {
    const id = baseEndpoint.split('/')[3]; // Get the terminal ID
    const action = baseEndpoint.split('/').pop(); // Get the action (suspend, activate, etc.)
    
    // Return the exact action if available
    if (MOCK_DATA[`/api/terminals/${id}/${action}`]) {
      return MOCK_DATA[`/api/terminals/${id}/${action}`];
    }
    
    // Otherwise return a generic successful response
    let newStatus = 'active';
    if (action === 'suspend') newStatus = 'suspended';
    if (action === 'deactivate') newStatus = 'inactive';
    
    return {
      success: true,
      message: `Terminal successfully ${action}d`,
      terminal: {
        id: parseInt(id),
        merchant_id: id === '3' ? 2 : 1, // Assign appropriate merchant ID based on terminal
        serial: `T${id}001`,
        model: id === '3' ? 'Verifone V200c' : 'PAX A80',
        status: newStatus,
        last_ping: new Date().toISOString()
      }
    };
  }
  
  // Return empty data if no mock available
  return { 
    message: 'No mock data available for this endpoint',
    isMock: true, // Mark explicitly as mock data
    endpoint: baseEndpoint // Include the endpoint for debugging
  };
};

// Global flag to track if mock data is being used
let isUsingMockData = false;

// Function to notify about mock data usage
// This will be assigned when the app initializes
let notifyMockDataUsage = null;

// Export function to set the notification callback
export const setMockDataNotifier = (callback) => {
  notifyMockDataUsage = callback;
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
    
    // Try to fetch from the actual API
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} for ${url}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`API Success from ${url}:`, data);
    
    // If we were previously using mock data, but now have a successful API call,
    // update the notification
    if (isUsingMockData && notifyMockDataUsage) {
      isUsingMockData = false;
      notifyMockDataUsage(false);
    }
    
    return data;
  } catch (error) {
    console.error(`API request to ${url} failed:`, error);
    
    // If fetch fails (e.g., backend is down), use mock data for development
    console.log(`Using mock data for ${endpoint}`);
    const mockData = getMockData(endpoint);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Add isMock flag to the mockData if it doesn't already have one
    if (typeof mockData === 'object' && mockData !== null) {
      mockData.isMock = true;
    }
    
    // Update the global mock data status and notify if possible
    if (!isUsingMockData && notifyMockDataUsage) {
      isUsingMockData = true;
      notifyMockDataUsage(true);
    }
    
    // Return data in the expected format based on the endpoint
    return { 
      data: mockData,
      status: 200,
      statusText: 'OK (Mock)',
      headers: {},
      isMock: true
    };
  }
};

// Common fetch methods
export const api = {
  get: async (endpoint) => {
    const result = await fetchApi(endpoint);
    // If the result is from a mock, just return the data directly
    if (result && result.isMock) {
      console.log(`Returning mock data for GET ${endpoint}:`, result.data);
      return result.data;
    }
    return result;
  },
  
  post: async (endpoint, data) => {
    const result = await fetchApi(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    // If the result is from a mock, just return the data directly
    if (result && result.isMock) {
      console.log(`Returning mock data for POST ${endpoint}:`, result.data);
      return result.data;
    }
    return result;
  },
  
  put: async (endpoint, data) => {
    const result = await fetchApi(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    // If the result is from a mock, just return the data directly
    if (result && result.isMock) {
      console.log(`Returning mock data for PUT ${endpoint}:`, result.data);
      return result.data;
    }
    return result;
  },
  
  delete: async (endpoint) => {
    const result = await fetchApi(endpoint, {
      method: 'DELETE'
    });
    // If the result is from a mock, just return the data directly
    if (result && result.isMock) {
      console.log(`Returning mock data for DELETE ${endpoint}:`, result.data);
      return result.data;
    }
    return result;
  }
};

export default api;
