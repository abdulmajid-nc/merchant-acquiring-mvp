const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

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

// Connect to MongoDB Atlas or local MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchant-acquiring-mvp';

// Initialize mock data in global scope for fallback
global.dbConnected = false;

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

// Function to connect to MongoDB with retry
const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Reduce timeout to 5 seconds
  })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    global.dbConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Using in-memory data mode for development...');
    initMockData();
    
    // Set up a health check to reconnect if MongoDB becomes available
    setTimeout(() => {
      if (!global.dbConnected) {
        console.log('Checking if MongoDB is now available...');
        mongoose.connection.close(); // Close any existing connections
        connectWithRetry(); // Try to connect again
      }
    }, 30000); // Check every 30 seconds
  });
};

// Initial connection attempt
connectWithRetry();

// Import routes
const merchantsRouter = require('./routes/merchants');
const terminalsRouter = require('./routes/terminals');
const mccsRouter = require('./routes/mccs');
const merchantPricingRouter = require('./routes/merchantPricing');
const transactionsRouter = require('./routes/transactions');

// Use routes
app.use('/api/merchants', merchantsRouter);
app.use('/api/terminals', terminalsRouter);
app.use('/api/mccs', mccsRouter);
app.use('/api/merchant-pricing', merchantPricingRouter);
app.use('/api/transactions', transactionsRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: "Merchant Acquiring API is running",
    endpoints: {
      merchants: "/api/merchants",
      terminals: "/api/terminals",
      mccs: "/api/mccs",
      merchantPricing: "/api/merchant-pricing",
      transactions: "/api/transactions"
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
    mongodb: {
      connected: global.dbConnected,
      connectionString: MONGO_URI.replace(/\/\/([^:]+):[^@]+@/, '//***:***@'), // Mask credentials
      readyState: mongoose.connection.readyState
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
