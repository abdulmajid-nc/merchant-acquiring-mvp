const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 4000;

// In-memory database for MVP
let merchants = [];
let merchantIdCounter = 1;

// Middleware
app.use(bodyParser.json());

// Use official cors package for cross-origin requests
const cors = require('cors');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
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

// Register a new merchant
app.post('/api/merchant/register', (req, res) => {
  const { name, email, business_type, docs } = req.body;
  
  if (!name || !email || !business_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newMerchant = {
    id: merchantIdCounter++,
    name,
    email,
    business_type,
    docs: docs || '',
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  merchants.push(newMerchant);
  res.status(201).json({ id: newMerchant.id, status: newMerchant.status });
});

// Get all merchants (admin)
app.get('/api/merchants', (req, res) => {
  res.json(merchants);
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
