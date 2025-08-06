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
  APPLICATION_STEPS: (id) => `/api/applications/${id}/steps`,
  APPLICATION_STATUS: (id) => `/api/applications/${id}/status`,
  APPLICATION_DOCUMENTS: (id) => `/api/applications/${id}/documents`,
  APPLICATION_DOCUMENT: (appId, docId) => `/api/applications/${appId}/documents/${docId}`,
  
  // Transactions
  TRANSACTIONS: '/api/transactions',
  TRANSACTION_BY_ID: (id) => `/api/transactions/${id}`,
  TRANSACTION_STATUS: (id) => `/api/transactions/${id}/status`,
  TRANSACTION_REFUND: (id) => `/api/transactions/${id}/refund`,
  TRANSACTION_VOID: (id) => `/api/transactions/${id}/void`,
  
  // Analytics
  ANALYTICS_DASHBOARD: '/api/analytics/dashboard',
  ANALYTICS_TRANSACTIONS: '/api/analytics/transactions',
  ANALYTICS_REVENUE: '/api/analytics/revenue',
  
  // User Management
  USERS: '/api/users',
  USER_BY_ID: (id) => `/api/users/${id}`,
  USER_LOGIN: '/api/users/login',
  USER_REGISTER: '/api/users/register',
  USER_PROFILE: '/api/users/profile',
  USER_PASSWORD_RESET: '/api/users/password-reset',
  USER_VERIFY_EMAIL: '/api/users/verify-email',
  USER_ROLES: '/api/users/roles',
  USER_PERMISSIONS: '/api/users/permissions',
  USER_ASSIGN_ROLE: (userId, roleId) => `/api/users/${userId}/roles/${roleId}`,
  
  // System
  SYSTEM_HEALTH: '/api/system/health',
  SYSTEM_LOGS: '/api/system/logs',
  SYSTEM_CONFIG: '/api/system/config',
  SYSTEM_VERSION: '/api/system/version',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_READ: (id) => `/api/notifications/${id}/read`,
  NOTIFICATION_MARK_ALL_READ: '/api/notifications/mark-all-read',
  
  // Pricing
  MERCHANT_PRICING: '/api/merchantPricing',
  
  // Merchant pricing specific endpoints
  PRICING_BY_MERCHANT: (merchantId) => `/api/merchantPricing/merchant/${merchantId}`,
  PRICING_BY_ID: (id) => `/api/merchantPricing/${id}`,
  PRICING_TEMPLATE_CREATE: '/api/merchantPricing/template',
  PRICING_TEMPLATE_UPDATE: (id) => `/api/merchantPricing/template/${id}`,
  PRICING_TEMPLATE_DELETE: (id) => `/api/merchantPricing/template/${id}`,
  PRICING_TEMPLATES: '/api/merchantPricing/templates',
  
  // Test and Simulation
  TEST_TRANSACTION: '/api/test/transaction',
  SIMULATION_CONFIG: '/api/simulation/config',
  
  // File storage
  FILE_UPLOAD: '/api/files/upload',
  FILE_DOWNLOAD: (id) => `/api/files/${id}/download`,
  FILE_DELETE: (id) => `/api/files/${id}/delete`
};

// Simple request cache
const cache = {};
const clearCache = () => {
  for (let key in cache) {
    delete cache[key];
  }
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

export const clearApiCache = clearCache;

// Helper functions for URL construction
export const buildUrl = (endpoint, params = {}) => {
  // If endpoint already contains the full URL, return it
  if (endpoint.startsWith('http')) return endpoint;
  
  // Handle ID replacement pattern if endpoint is a function (dynamic endpoint)
  let url = typeof endpoint === 'function' ? endpoint(params.id) : endpoint;
  
  // Remove id from params if it was used in the URL
  if (typeof endpoint === 'function' && params.id) {
    const { id, ...restParams } = params;
    params = restParams;
  }
  
  // Add query parameters if any
  const queryParams = [];
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    }
  }
  
  if (queryParams.length > 0) {
    url += `${url.includes('?') ? '&' : '?'}${queryParams.join('&')}`;
  }
  
  return url;
};

// Mock data for development
export const MOCK_DATA = {
  '/api/merchants': {
    merchants: [
      {
        id: 1,
        name: 'Sample Merchant 1',
        business_type: 'Retail',
        contact_name: 'John Smith',
        email: 'john@example.com',
        phone: '123-456-7890',
        status: 'active',
        registration_date: '2023-01-15',
        mcc: '5411',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
          country: 'USA'
        }
      },
      {
        id: 2,
        name: 'Sample Merchant 2',
        business_type: 'Online',
        contact_name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '987-654-3210',
        status: 'pending',
        registration_date: '2023-01-20',
        mcc: '5499',
        address: {
          street: '456 Oak St',
          city: 'Othertown',
          state: 'NY',
          zip: '67890',
          country: 'USA'
        }
      }
    ],
    total: 2,
    isMock: true
  },
  '/api/transactions': {
    transactions: [
      {
        id: 'tx_123456',
        amount: 125.00,
        currency: 'USD',
        status: 'approved',
        created_at: '2023-01-15T12:30:45Z',
        merchant_id: 1,
        terminal_id: 'term_1',
        payment_method: 'visa',
        card_number_masked: '4***********1234',
        payment_type: 'credit',
        response_code: '00',
        response_message: 'Approved or completed successfully'
      },
      {
        id: 'tx_789012',
        amount: 75.50,
        currency: 'USD',
        status: 'approved',
        created_at: '2023-01-15T14:45:22Z',
        merchant_id: 2,
        terminal_id: 'term_2',
        payment_method: 'mastercard',
        card_number_masked: '5***********5678',
        payment_type: 'credit',
        response_code: '00',
        response_message: 'Approved or completed successfully'
      },
      {
        id: 'tx_345678',
        amount: 200.00,
        currency: 'USD',
        status: 'declined',
        created_at: '2023-01-15T16:12:18Z',
        merchant_id: 1,
        terminal_id: 'term_1',
        payment_method: 'amex',
        card_number_masked: '3***********9012',
        payment_type: 'credit',
        response_code: '05',
        response_message: 'Do not honor'
      }
    ],
    total: 3,
    isMock: true
  },
  '/api/mccs': {
    mccs: [
      { code: '5411', description: 'Grocery Stores, Supermarkets' },
      { code: '5499', description: 'Miscellaneous Food Stores' },
      { code: '5812', description: 'Eating Places, Restaurants' }
    ],
    isMock: true
  },
  '/api/terminals': {
    terminals: [
      {
        id: 'term_1',
        merchant_id: 1,
        model: 'Verifone P400',
        serial_number: 'VF1234567',
        status: 'active',
        location: 'Main Store',
        ip_address: '192.168.1.101',
        software_version: '4.3.1',
        last_active: '2023-01-15T12:30:45Z'
      },
      {
        id: 'term_2',
        merchant_id: 2,
        model: 'Ingenico iCT250',
        serial_number: 'IC9876543',
        status: 'active',
        location: 'Checkout Counter',
        ip_address: '192.168.2.102',
        software_version: '8.2.5',
        last_active: '2023-01-15T14:45:22Z'
      }
    ],
    isMock: true
  },
  '/api/merchantPricing': {
    pricing: [
      {
        id: 'price_1',
        merchant_id: 1,
        scheme: 'visa',
        transaction_type: 'purchase',
        fixed_fee: 0.30,
        percentage_fee: 2.9,
        effective_date: '2023-01-01',
        expiry_date: null
      },
      {
        id: 'price_2',
        merchant_id: 1,
        scheme: 'mastercard',
        transaction_type: 'purchase',
        fixed_fee: 0.30,
        percentage_fee: 2.9,
        effective_date: '2023-01-01',
        expiry_date: null
      }
    ],
    isMock: true
  }
};

// Function to generate consistent structured mock data
export const getMockData = (endpoint) => {
  // Normalize the endpoint to remove query parameters
  const baseEndpoint = endpoint.split('?')[0];
  
  // Try to get existing mock data for this endpoint
  let mockData = MOCK_DATA[baseEndpoint];
  
  // If no exact match for the endpoint, check for dynamic endpoints
  if (!mockData) {
    // Check for pattern matching endpoints (like /api/merchants/123)
    if (baseEndpoint.match(/\/api\/merchants\/\d+$/)) {
      // This is a single merchant endpoint
      const merchantId = parseInt(baseEndpoint.split('/').pop(), 10);
      const allMerchants = MOCK_DATA['/api/merchants']?.merchants || [];
      const merchant = allMerchants.find(m => m.id === merchantId);
      
      if (merchant) {
        return { ...merchant, isMock: true };
      }
    } else if (baseEndpoint.match(/\/api\/transactions\/\w+$/)) {
      // This is a single transaction endpoint
      const transactionId = baseEndpoint.split('/').pop();
      const allTransactions = MOCK_DATA['/api/transactions']?.transactions || [];
      const transaction = allTransactions.find(t => t.id === transactionId);
      
      if (transaction) {
        return { ...transaction, isMock: true };
      }
    } else if (baseEndpoint.match(/\/api\/terminals\/\w+$/)) {
      // This is a single terminal endpoint
      const terminalId = baseEndpoint.split('/').pop();
      const allTerminals = MOCK_DATA['/api/terminals']?.terminals || [];
      const terminal = allTerminals.find(t => t.id === terminalId);
      
      if (terminal) {
        return { ...terminal, isMock: true };
      }
    }
    
    // Generate fallback data for unknown endpoints
    const fallbackData = {
      message: `Mock data for ${endpoint} is not available`,
      status: 200,
      isMock: true, // Mark explicitly as mock data
      endpoint: baseEndpoint // Include the endpoint for debugging
    };
    
    return fallbackData;
  }
  
  // For merchants endpoint
  if (baseEndpoint.startsWith('/api/merchants')) {
    if (Array.isArray(mockData)) {
      console.log('Wrapping mock merchant array in proper structure');
      return { merchants: mockData, isMock: true };
    } else if (mockData && mockData.merchants) {
      return mockData;
    }
  }
  
  // Return data in the expected format based on the endpoint
  return mockData || { 
    status: 200,
    statusText: 'OK (Mock)',
    headers: {},
    message: 'No mock data available',
    isMock: true
  };
};

// Main fetch function with error handling
export async function fetchApi(endpoint, options = {}) {
  // Use the base API URL directly instead of calling getApiUrl() without parameters
  const apiUrl = API_BASE_URL || 'http://localhost:4000';
  
  // Normalize endpoint to ensure it starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${apiUrl}${normalizedEndpoint}`;
  
  console.log('API Request to:', url);
  
  try {
    // Add default headers
    const fetchOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers || {}
      }
    };
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    // Handle empty responses (like for DELETE operations)
    if (response.status === 204) {
      // Notify the application that real data is being used
      if (notifyMockDataUsage && typeof notifyMockDataUsage === 'function') {
        notifyMockDataUsage(false, endpoint);
      }
      return { status: response.status, success: true };
    }
    
    // Notify the application that real data is being used
    if (notifyMockDataUsage && typeof notifyMockDataUsage === 'function') {
      notifyMockDataUsage(false, endpoint);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request to ${url} failed:`, error);
    
    // Check if this is a network error (server down/unreachable) vs server error (500)
    const isNetworkError = error.message && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('Network request failed') ||
      error.message.includes('net::ERR_CONNECTION_REFUSED')
    );
    
    // Get mock data for fallback
    const mockData = getMockData(endpoint);
    
    // Add error information to the mock data
    if (mockData) {
      mockData.backendError = true;
      mockData.errorMessage = error.message;
      mockData.errorType = isNetworkError ? 'network' : 'server';
      
      if (isNetworkError) {
        console.log(`Backend unavailable for ${endpoint}, using mock data instead`);
      } else {
        console.log(`Backend returned error for ${endpoint}, using mock data with error flag`);
      }
      
      // Notify the application that mock data is being used
      if (notifyMockDataUsage && typeof notifyMockDataUsage === 'function') {
        notifyMockDataUsage(true, endpoint);
      }
      
      return mockData;
    }
    
    // If no mock data is available, rethrow the error
    throw error;
  }
}

// Common fetch methods
export const api = {
  get: async (endpoint) => {
    try {
      const result = await fetchApi(endpoint);
      
      // If the result is from a mock
      if (result && result.isMock) {
        // For transactions endpoint, handle special case
        if (endpoint.startsWith('/api/transactions') && result.transactions) {
          console.log(`Returning mock transaction data for GET ${endpoint}:`, result.transactions.length, 'transactions');
          return result;
        }
        
        console.log(`Returning mock data for GET ${endpoint}:`, result);
        return result;
      }
      
      return result;
    } catch (error) {
      console.error(`Error in api.get for ${endpoint}:`, error);
      
      // For transactions endpoint, try to return fallback mock data
      if (endpoint.startsWith('/api/transactions')) {
        const fallbackData = getMockData('/api/transactions');
        if (fallbackData) {
          fallbackData.backendError = true;
          fallbackData.errorMessage = error.message;
          console.log('Returning fallback transaction data with error info:', fallbackData);
          return fallbackData;
        }
      }
      
      // For merchants endpoint, try to return fallback mock data
      if (endpoint.startsWith('/api/merchants')) {
        const fallbackData = getMockData('/api/merchants');
        if (fallbackData) {
          fallbackData.backendError = true;
          fallbackData.errorMessage = error.message;
          console.log('Returning fallback merchant data with error info:', fallbackData);
          return fallbackData;
        }
      }
      
      // For other endpoints or if no fallback is available
      return {
        backendError: true,
        errorMessage: error.message,
        isMock: true
      };
    }
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
      console.log(`Returning mock data for POST ${endpoint}:`, result);
      return result;
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
