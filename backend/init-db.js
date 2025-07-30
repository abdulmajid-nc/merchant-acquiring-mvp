#!/usr/bin/env node

/**
 * MongoDB Data Initialization Script
 * This script adds sample data to the MongoDB database for testing
 */

const mongoose = require('mongoose');
const path = require('path');

// Import models
const Merchant = require('./models/Merchant');
const Terminal = require('./models/Terminal');
const Mcc = require('./models/Mcc');
const Transaction = require('./models/Transaction');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchant-acquiring-mvp';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB. Adding test data...');
  initData();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to initialize data
async function initData() {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Merchant.deleteMany({}),
      Terminal.deleteMany({}),
      Mcc.deleteMany({}),
      Transaction.deleteMany({})
    ]);
    console.log('Data cleared successfully.');

    // Add MCC data
    console.log('Adding MCC data...');
    const mccs = await Mcc.create([
      { code: '5411', description: 'Grocery Stores, Supermarkets', category: 'Food & Beverage', risk_level: 'low' },
      { code: '5812', description: 'Eating Places, Restaurants', category: 'Food & Beverage', risk_level: 'medium' },
      { code: '5999', description: 'Miscellaneous and Specialty Retail Stores', category: 'Retail', risk_level: 'medium' },
      { code: '4511', description: 'Airlines, Air Carriers', category: 'Travel', risk_level: 'medium' },
      { code: '5311', description: 'Department Stores', category: 'Retail', risk_level: 'low' },
      { code: '5499', description: 'Miscellaneous Food Stores', category: 'Food & Beverage', risk_level: 'low' },
      { code: '5912', description: 'Drug Stores and Pharmacies', category: 'Healthcare', risk_level: 'low' },
      { code: '5122', description: 'Medical Services and Health Practitioners', category: 'Healthcare', risk_level: 'medium' }
    ]);
    console.log(`Added ${mccs.length} MCCs.`);

    // Add Merchants
    console.log('Adding Merchant data...');
    const merchants = await Merchant.create([
      {
        name: 'Acme Retail',
        email: 'acme@retail.com',
        business_type: 'retail',
        mcc: mccs[2]._id, // Miscellaneous and Specialty Retail
        docs: 'doc1,doc2',
        status: 'active',
        created_at: new Date('2025-07-28T07:35:43.560Z'),
        address: '123 Main St, Anytown, USA',
        contact: '555-1234',
        bank_accounts: [{ name: 'Primary', account: '1234567890' }],
        settlement_schedule: 'weekly',
        description: 'A retail store selling various products',
        representative: {
          name: 'John Doe',
          email: 'john@acmeretail.com',
          phone: '555-5678'
        }
      },
      {
        name: 'Best Eats',
        email: 'info@besteats.com',
        business_type: 'restaurant',
        mcc: mccs[1]._id, // Restaurants
        docs: 'docA,docB',
        status: 'pending',
        created_at: new Date('2025-07-29T11:22:33.444Z'),
        address: '456 Food Ave, Cuisine City, USA',
        contact: '555-8765',
        bank_accounts: [{ name: 'Business', account: '9876543210' }],
        settlement_schedule: 'daily',
        description: 'A family restaurant serving delicious meals',
        representative: {
          name: 'Jane Smith',
          email: 'jane@besteats.com',
          phone: '555-4321'
        }
      },
      {
        name: 'Fresh Grocers',
        email: 'sales@freshgrocers.com',
        business_type: 'grocery',
        mcc: mccs[0]._id, // Grocery
        docs: 'docX,docY',
        status: 'active',
        created_at: new Date('2025-07-15T09:12:30.000Z'),
        address: '789 Veggie Blvd, Green Valley, USA',
        contact: '555-9090',
        bank_accounts: [{ name: 'Operations', account: '5555666677' }],
        settlement_schedule: 'weekly',
        description: 'Premium grocery store with fresh produce',
        representative: {
          name: 'Robert Johnson',
          email: 'robert@freshgrocers.com',
          phone: '555-7878'
        }
      }
    ]);
    console.log(`Added ${merchants.length} Merchants.`);

    // Add Terminals
    console.log('Adding Terminal data...');
    const terminals = await Terminal.create([
      {
        merchant: merchants[0]._id, // Acme Retail
        serial: 'T1001',
        model: 'PAX A80',
        status: 'active',
        last_ping: new Date('2025-07-29T10:23:15Z'),
        config: {
          receipt_header: 'Acme Retail',
          receipt_footer: 'Thank you for shopping with us!',
          timezone: 'America/New_York',
          auto_settlement: true,
          settlement_time: '23:00'
        }
      },
      {
        merchant: merchants[0]._id, // Acme Retail
        serial: 'T1002',
        model: 'PAX A60',
        status: 'inactive',
        last_ping: new Date('2025-07-25T16:45:22Z'),
        config: {
          receipt_header: 'Acme Retail',
          receipt_footer: 'Thank you for shopping with us!',
          timezone: 'America/New_York',
          auto_settlement: true,
          settlement_time: '23:00'
        }
      },
      {
        merchant: merchants[1]._id, // Best Eats
        serial: 'T2001',
        model: 'Verifone V200c',
        status: 'active',
        last_ping: new Date('2025-07-30T08:12:44Z'),
        config: {
          receipt_header: 'Best Eats Restaurant',
          receipt_footer: 'Enjoy your meal!',
          timezone: 'America/Chicago',
          auto_settlement: true,
          settlement_time: '22:00'
        }
      },
      {
        serial: 'T3001',
        model: 'PAX A80',
        status: 'available',
        config: {
          timezone: 'UTC',
          auto_settlement: false
        }
      }
    ]);
    console.log(`Added ${terminals.length} Terminals.`);

    // Add Transactions
    console.log('Adding Transaction data...');
    const transactions = await Transaction.create([
      {
        terminal: terminals[0]._id,
        merchant: merchants[0]._id,
        amount: 45.99,
        status: 'approved',
        timestamp: new Date('2025-07-30T07:22:15Z'),
        card_type: 'Visa',
        last_four: '4242',
        auth_code: '123456',
        reference: 'txn_001'
      },
      {
        terminal: terminals[0]._id,
        merchant: merchants[0]._id,
        amount: 129.50,
        status: 'approved',
        timestamp: new Date('2025-07-30T09:15:22Z'),
        card_type: 'Mastercard',
        last_four: '5555',
        auth_code: '234567',
        reference: 'txn_002'
      },
      {
        terminal: terminals[2]._id,
        merchant: merchants[1]._id,
        amount: 78.25,
        status: 'approved',
        timestamp: new Date('2025-07-30T10:05:17Z'),
        card_type: 'Mastercard',
        last_four: '9876',
        auth_code: '345678',
        reference: 'txn_003'
      },
      {
        terminal: terminals[0]._id,
        merchant: merchants[0]._id,
        amount: 67.80,
        status: 'approved',
        timestamp: new Date('2025-07-30T11:30:45Z'),
        card_type: 'Visa',
        last_four: '1111',
        auth_code: '456789',
        reference: 'txn_004'
      },
      {
        terminal: terminals[1]._id,
        merchant: merchants[0]._id,
        amount: 22.50,
        status: 'declined',
        timestamp: new Date('2025-07-25T14:22:10Z'),
        card_type: 'Amex',
        last_four: '8888',
        auth_code: '',
        reference: 'txn_005'
      }
    ]);
    console.log(`Added ${transactions.length} Transactions.`);

    console.log('All test data added successfully!');
    console.log('You can now use the frontend to view this data.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  }
}
