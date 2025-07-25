const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 4000;

// In-memory database for MVP
let merchants = [
  {
    id: 1,
    name: 'Acme Retail',
    email: 'acme@retail.com',
    business_type: 'retail',
    docs: 'doc1,doc2',
    status: 'approved',
    created_at: new Date().toISOString(),
    address: '123 Main St',
    contact: '555-1234',
    bank_accounts: [{ account: '123456789', bank: 'Bank A' }],
    catalog: [{ id: 1, name: 'Product A', price: 10 }],
    archived: false,
    settlement_schedule: 'weekly',
    logo: '',
    theme: '',
    white_label: false,
    terminals: [
      {
        id: 101,
        serial: 'POS-1001',
        status: 'active',
        model: 'Verifone VX520',
        location: 'Main Store',
        transactions: [
          { id: 'tx1011', amount: 120.50, currency: 'USD', status: 'Completed', date: '2025-07-20' },
          { id: 'tx1012', amount: 75.00, currency: 'USD', status: 'Pending', date: '2025-07-21' }
        ]
      },
      {
        id: 102,
        serial: 'POS-1002',
        status: 'inactive',
        model: 'Ingenico iWL250',
        location: 'Branch 1',
        transactions: [
          { id: 'tx1021', amount: 200.00, currency: 'EUR', status: 'Completed', date: '2025-07-19' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Best Eats',
    email: 'info@besteats.com',
    business_type: 'restaurant',
    docs: 'docA,docB',
    status: 'pending',
    created_at: new Date().toISOString(),
    address: '456 Market St',
    contact: '555-5678',
    bank_accounts: [{ account: '987654321', bank: 'Bank B' }],
    catalog: [{ id: 2, name: 'Service B', price: 20 }],
    archived: false,
    settlement_schedule: 'monthly',
    logo: '',
    theme: '',
    white_label: false,
    terminals: [
      {
        id: 201,
        serial: 'POS-2001',
        status: 'active',
        model: 'PAX S80',
        location: 'Downtown',
        transactions: [
          { id: 'tx2011', amount: 50.00, currency: 'USD', status: 'Completed', date: '2025-07-18' },
          { id: 'tx2012', amount: 30.00, currency: 'USD', status: 'Voided', date: '2025-07-19' }
        ]
      }
    ]
  }
];
let merchantIdCounter = 3;

// Middleware
app.use(bodyParser.json());

// Use official cors package for cross-origin requests
const cors = require('cors');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: "Merchant Acquiring API is running",
    endpoints: {
      merchantList: "/api/merchants",
      merchantStatus: "/api/merchant/:id",
      register: "/api/merchant/register (POST)",
      updateStatus: "/api/merchant/:id/status (PUT)"
    },
    version: "1.0.0"
  });
});

// Register a new merchant (self-service) with risk-based onboarding
app.post('/api/merchant/register', (req, res) => {
  const { name, email, business_type, docs, address, contact } = req.body;
  if (!name || !email || !business_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Basic risk logic: auto-approve retail, manual for others
  let status = 'pending';
  let riskFlag = false;
  if (business_type === 'retail') {
    status = 'approved';
  } else if (business_type === 'service') {
    riskFlag = true;
  }
  const newMerchant = {
    id: merchantIdCounter++,
    name,
    email,
    business_type,
    docs: docs || '',
    address: address || '',
    contact: contact || '',
    status,
    riskFlag,
    created_at: new Date().toISOString(),
    bank_accounts: [],
    catalog: [],
    archived: false,
    settlement_schedule: 'monthly',
    logo: '',
    theme: '',
    white_label: false,
    terminals: []
  };
  merchants.push(newMerchant);
  res.status(201).json({ id: newMerchant.id, status: newMerchant.status, riskFlag });
});


// Update merchant business info
app.put('/api/merchant/:id/business', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  const { name, address, contact } = req.body;
  if (name) merchant.name = name;
  if (address) merchant.address = address;
  if (contact) merchant.contact = contact;
  res.json({ merchant });
});

// Custom fee structure logic
app.post('/api/merchant/:id/fee', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  const { volume, industry } = req.body;
  let fee = 0.03; // default 3%
  if (volume > 10000) fee = 0.02; // volume discount
  if (industry === 'restaurant') fee = 0.025;
  merchant.fee = fee;
  res.json({ fee });
});

// Payment settlement schedule logic
app.post('/api/merchant/:id/settle', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  const { schedule } = req.body;
  merchant.settlement_schedule = schedule;
  res.json({ settlement_schedule: merchant.settlement_schedule });
});

// Bank account add
app.post('/api/merchant/:id/bank', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  const { account, bank } = req.body;
  if (!account || !bank) return res.status(400).json({ error: 'Missing account/bank' });
  merchant.bank_accounts.push({ account, bank });
  res.json({ bank_accounts: merchant.bank_accounts });
});

// Bank account delete
app.delete('/api/merchant/:id/bank/:account', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  merchant.bank_accounts = merchant.bank_accounts.filter(b => b.account !== req.params.account);
  res.json({ bank_accounts: merchant.bank_accounts });
});

// Product/Service catalog CRUD
app.get('/api/merchant/:id/catalog', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  res.json({ catalog: merchant.catalog });
});
app.post('/api/merchant/:id/catalog', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Missing name/price' });
  const newItem = { id: Date.now(), name, price };
  merchant.catalog.push(newItem);
  res.json({ catalog: merchant.catalog });
});
app.put('/api/merchant/:id/catalog/:itemId', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  const item = merchant.catalog.find(i => i.id == req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const { name, price } = req.body;
  if (name) item.name = name;
  if (price) item.price = price;
  res.json({ catalog: merchant.catalog });
});
app.delete('/api/merchant/:id/catalog/:itemId', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  merchant.catalog = merchant.catalog.filter(i => i.id != req.params.itemId);
  res.json({ catalog: merchant.catalog });
});

// Archive merchant
app.post('/api/merchant/:id/archive', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  merchant.archived = true;
  res.json({ archived: true });
});

// View archived merchants
app.get('/api/merchants/archived', (req, res) => {
  const archived = merchants.filter(m => m.archived);
  res.json({ archived });
});

// Update settlement schedule
app.put('/api/merchant/:id/settlement', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  const { schedule } = req.body;
  merchant.settlement_schedule = schedule;
  res.json({ settlement_schedule: merchant.settlement_schedule });
});

// Update logo/theme/white-label
app.put('/api/merchant/:id/branding', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
  const { logo, theme, white_label } = req.body;
  if (logo) merchant.logo = logo;
  if (theme) merchant.theme = theme;
  if (typeof white_label !== 'undefined') merchant.white_label = white_label;
  res.json({ logo: merchant.logo, theme: merchant.theme, white_label: merchant.white_label });
});

// Get all merchants (admin)
app.get('/api/merchants', (req, res) => {
  res.json(merchants);
});

// Get all POS terminals (admin) with optional filters
app.get('/api/terminals', (req, res) => {
  let terminals = merchants.flatMap(m => (m.terminals || []).map(t => ({
    ...t,
    merchant: m.name,
    merchant_id: m.id
  })));
  // Filter by status, merchant, transaction limit
  const { status, merchant, limit } = req.query;
  if (status) terminals = terminals.filter(t => t.status === status);
  if (merchant) terminals = terminals.filter(t => t.merchant === merchant);
  if (limit) terminals = terminals.filter(t => t.transaction_limit == limit);
  res.json({ terminals });
});

// Terminal activation/initiation
app.post('/api/terminals/:id/activate', (req, res) => {
  const termId = parseInt(req.params.id);
  for (const m of merchants) {
    const t = (m.terminals || []).find(tt => tt.id === termId);
    if (t) {
      t.status = 'active';
      res.json({ message: 'Terminal activated', id: termId });
      return;
    }
  }
  res.status(404).json({ error: 'Terminal not found' });
});

// Update transaction limit
app.put('/api/terminals/:id/limit', (req, res) => {
  const termId = parseInt(req.params.id);
  const { limit } = req.body;
  for (const m of merchants) {
    const t = (m.terminals || []).find(tt => tt.id === termId);
    if (t) {
      t.transaction_limit = limit;
      res.json({ transaction_limit: t.transaction_limit });
      return;
    }
  }
  res.status(404).json({ error: 'Terminal not found' });
});


// Get transactions for a terminal
app.get('/api/terminals/:id/transactions', (req, res) => {
  const termId = parseInt(req.params.id);
  let found = null;
  for (const m of merchants) {
    const t = (m.terminals || []).find(tt => tt.id === termId);
    if (t) {
      found = t.transactions || [];
      break;
    }
  }
  res.json({ transactions: found || [] });
});

// Void a transaction for a terminal
app.post('/api/terminals/:id/void', (req, res) => {
  const termId = parseInt(req.params.id);
  const { transactionId } = req.body;
  let voided = false;
  for (const m of merchants) {
    const t = (m.terminals || []).find(tt => tt.id === termId);
    if (t && t.transactions) {
      const tx = t.transactions.find(txn => txn.id === transactionId);
      if (tx && tx.status !== 'Voided') {
        tx.status = 'Voided';
        voided = true;
        res.json({ message: 'Transaction voided', transactionId });
        return;
      }
    }
  }
  res.status(404).json({ error: 'Transaction not found or already voided' });
});

// Get merchant status by ID
app.get('/api/merchant/:id', (req, res) => {
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant not found' });
  }
  
  res.json({ id: merchant.id, status: merchant.status });
});

// Update merchant status (admin)
app.put('/api/merchant/:id/status', (req, res) => {
  const { status } = req.body;
  const merchant = merchants.find(m => m.id === parseInt(req.params.id));
  
  if (!merchant) {
    return res.status(404).json({ error: 'Merchant not found' });
  }
  
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  merchant.status = status;
  res.json({ id: merchant.id, status: merchant.status });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
