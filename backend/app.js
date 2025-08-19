const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

// Use jPTS adapter for PostgreSQL database connection
const jptsAdapter = require('./jpts-adapter');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${req.method} ${req.url} [${new Date().toISOString()}]`);
  
  // Log when response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  
  next();
});

// Initialize mock data in global scope for fallback
global.dbConnected = false;

// Initialize jPTS for PostgreSQL connection
console.log('Initializing jPTS database connection');
const jpts = jptsAdapter.init();

// Try to check connection status immediately
global.dbConnected = jpts.isConnected();
  
  if (global.dbConnected) {
    console.log('Successfully connected to jPTS database');
    
    // Create models using jPTS adapter
    console.log('Creating jPTS models for data access...');
    global.models = {
      Merchant: jptsAdapter.createModel('merchants'),
      Terminal: jptsAdapter.createModel('terminals'),
      Transaction: jptsAdapter.createModel('transactions'),
      Mcc: require('./models/Mcc'),
      AuditLog: jptsAdapter.createModel('audit_logs'),
      Application: jptsAdapter.createModel('applications'),
      ArchivedAccount: jptsAdapter.createModel('archived_accounts'),
      FeeStructure: jptsAdapter.createModel('fee_structures'),
      FeeRule: jptsAdapter.createModel('fee_rules'),
      VolumeTier: jptsAdapter.createModel('volume_tiers'),
      MerchantVolumeHistory: jptsAdapter.createModel('merchant_volume_history')
    };
    console.log('jPTS models created successfully');
  } else {
    console.log('Failed to connect to jPTS database, will try again shortly');
    
    // Check again after a short delay to allow connection to establish
    setTimeout(() => {
      global.dbConnected = jpts.isConnected();
      
      if (global.dbConnected) {
        console.log('Successfully connected to jPTS database on second attempt');
        
        // Create models using jPTS adapter
        console.log('Creating jPTS models for data access...');
        global.models = {
          Merchant: jptsAdapter.createModel('merchants'),
          Terminal: jptsAdapter.createModel('terminals'),
          Transaction: jptsAdapter.createModel('transactions'),
          Mcc: require('./models/Mcc'),
          AuditLog: jptsAdapter.createModel('audit_logs'),
          Application: jptsAdapter.createModel('applications'),
          ArchivedAccount: jptsAdapter.createModel('archived_accounts'),
          FeeStructure: jptsAdapter.createModel('fee_structures'),
          FeeRule: jptsAdapter.createModel('fee_rules'),
          VolumeTier: jptsAdapter.createModel('volume_tiers'),
          MerchantVolumeHistory: jptsAdapter.createModel('merchant_volume_history')
        };
        console.log('jPTS models created successfully');
      } else {
        console.log('Still failed to connect to jPTS database, will use mock data');
      }
    }, 3000);
  }

// Initialize mock data
const initMockData = () => {
  console.log('Initializing mock data for development...');
  
  // Sample merchants data
  global.merchants = [
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
        { id: 1, serial: 'T1001', model: 'PAX A80', status: 'active', last_ping: '2025-07-29T10:23:15Z' },
        { id: 2, serial: 'T1002', model: 'PAX A60', status: 'inactive', last_ping: '2025-07-25T16:45:22Z' }
      ]
    },
    {
      id: 2,
      name: 'Best Eats',
      email: 'info@besteats.com',
      business_type: 'restaurant',
      docs: 'docA,docB',
      status: 'pending',
      created_at: '2025-07-29T11:22:33.444Z',
      terminals: [
        { id: 3, serial: 'T2001', model: 'Verifone V200c', status: 'active', last_ping: '2025-07-30T08:12:44Z' }
      ]
    }
  ];
  
  // Sample terminals data (unassigned)
  global.terminals = [
    { id: 4, serial: 'T3001', model: 'PAX A80', status: 'available', last_ping: null }
  ];
  
  // Sample transactions data
  global.transactions = [
    { id: 'txn_001', amount: 45.99, status: 'approved', timestamp: '2025-07-30T07:22:15Z', terminal_id: 1, merchant_id: 1 },
    { id: 'txn_002', amount: 129.50, status: 'approved', timestamp: '2025-07-30T09:15:22Z', terminal_id: 1, merchant_id: 1 },
    { id: 'txn_003', amount: 78.25, status: 'approved', timestamp: '2025-07-30T10:05:17Z', terminal_id: 3, merchant_id: 2 }
  ];
  
  // Sample MCCs data
  global.mccs = [
    { code: '5411', description: 'Grocery Stores, Supermarkets', risk_level: 'low' },
    { code: '5812', description: 'Eating Places, Restaurants', risk_level: 'medium' },
    { code: '5999', description: 'Miscellaneous and Specialty Retail Stores', risk_level: 'medium' }
  ];
  
  console.log('Mock data initialized successfully');
};

// Function to initialize the database
const initDatabase = () => {
  if (!global.dbConnected) {
    console.log('jPTS connection not established, using mock data');
    initMockData();
  } else {
    console.log('jPTS database connection successful');
  }
};

// Initialize database
initDatabase();

// Import routes
const merchantsRouter = require('./routes/merchants');
const terminalsRouter = require('./routes/terminals');
const mccsRouter = require('./routes/mccs');
const merchantPricingRouter = require('./routes/merchantPricing');
const transactionsRouter = require('./routes/transactions');
const tranlogsRouter = require('./routes/tranlogs');
const feesRouter = require('./routes/fees');

// Use routes
app.use('/api/merchants', merchantsRouter);
app.use('/api/terminals', terminalsRouter);
app.use('/api/mccs', mccsRouter);
app.use('/api/merchant-pricing', merchantPricingRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/tranlogs', tranlogsRouter);
app.use('/api/fees', feesRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: "Merchant Acquiring API is running",
    endpoints: {
      merchants: "/api/merchants",
      terminals: "/api/terminals",
      mccs: "/api/mccs",
      merchantPricing: "/api/merchant-pricing",
      transactions: "/api/transactions",
      fees: "/api/fees"
    },
    version: "1.0.0",
    mode: global.dbConnected ? 'database' : 'mock',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    database: {
      type: 'PostgreSQL',
      connected: global.dbConnected,
      connectionDetails: jptsAdapter.getConnectionDetails()
    },
    mode: global.dbConnected ? 'database' : 'mock',
    mockData: {
      merchants: global.merchants ? global.merchants.length : 0,
      terminals: global.terminals ? global.terminals.length : 0,
      transactions: global.transactions ? global.transactions.length : 0,
      mccs: global.mccs ? global.mccs.length : 0
    },
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
