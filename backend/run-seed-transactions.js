#!/usr/bin/env node

/**
 * Run Transaction Seeding Script
 * 
 * This script seeds 100 realistic transaction records into the database.
 * It can be run separately to add transactions to an existing database.
 * 
 * IMPORTANT: This script has been updated to avoid using tranlog data
 */

const { Pool } = require('pg');

// Configuration
const config = {
  jpts: {
    host: process.env.JPTS_HOST || 'localhost',
    port: process.env.JPTS_PORT || '5432',
    database: process.env.JPTS_DB || 'jpts_dev',
    user: process.env.JPTS_USER || 'postgres',
    password: process.env.JPTS_PASSWORD || 'postgres'
  }
};

// Generate transaction data without using tranlog
function generateTransactions(merchants, terminals) {
  const transactions = [];
  const transactionCount = 100;
  
  // Sample data for generating realistic transactions
  const statuses = ['approved', 'pending', 'declined', 'refunded'];
  const cardSchemes = ['visa', 'mastercard', 'amex', 'discover'];
  const currencies = ['USD', 'EUR', 'GBP', 'AED', 'JPY'];
  
  for (let i = 0; i < transactionCount; i++) {
    // Pick a random merchant and one of its terminals
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const merchantTerminals = terminals.filter(t => t.merchant_id === merchant.id);
    const terminal = merchantTerminals.length > 0 
      ? merchantTerminals[Math.floor(Math.random() * merchantTerminals.length)]
      : terminals[Math.floor(Math.random() * terminals.length)];
    
    // Generate transaction data
    const amount = (Math.random() * 1000 + 5).toFixed(2);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const cardScheme = cardSchemes[Math.floor(Math.random() * cardSchemes.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const maskedPan = cardScheme === 'amex' 
      ? `3${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}********${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      : `${cardScheme === 'visa' ? '4' : cardScheme === 'mastercard' ? '5' : '6'}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}********${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create date between 1-90 days ago
    const daysAgo = Math.floor(Math.random() * 90) + 1;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    transactions.push({
      id: `TXN${Date.now()}${i}`,
      merchant_id: merchant.id,
      terminal_id: terminal.id,
      amount: amount,
      currency: currency,
      card_number: maskedPan,
      card_scheme: cardScheme,
      status: status,
      type: status === 'refunded' ? 'refund' : 'purchase',
      created_at: createdAt.toISOString()
    });
  }
  
  return transactions;
}

// Seed transactions to database
async function seedTransactions(pool, transactions) {
  console.log(`Seeding ${transactions.length} transactions...`);
  
  for (const transaction of transactions) {
    await pool.query(
      `INSERT INTO transactions (_id, merchant_id, terminal_id, amount, currency, 
                               card_number, status, type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        transaction.id,
        transaction.merchant_id,
        transaction.terminal_id,
        transaction.amount,
        transaction.currency,
        transaction.card_number,
        transaction.status,
        transaction.type,
        transaction.created_at
      ]
    );
  }
  
  console.log('Transaction seeding complete!');
}

async function main() {
  console.log('Using jPTS adapter (PostgreSQL) for seeding');
  
  let merchants = [];
  let terminals = [];
  
  // Create PostgreSQL connection pool
  const pool = new Pool({
    host: config.jpts.host,
    port: config.jpts.port,
    database: config.jpts.database,
    user: config.jpts.user,
    password: config.jpts.password
  });
  
  try {
    // Load merchants and terminals data
    const merchantsResult = await pool.query('SELECT * FROM merchants');
    merchants = merchantsResult.rows;
    
    const terminalsResult = await pool.query('SELECT * FROM terminals');
    terminals = terminalsResult.rows;
    
    if (merchants.length === 0 || terminals.length === 0) {
      console.error('Cannot seed transactions: No merchants or terminals found in the database');
      return;
    }
    
    console.log(`Found ${merchants.length} merchants and ${terminals.length} terminals`);
    
    // Generate and seed transaction data (without using tranlog data)
    const transactions = generateTransactions(merchants, terminals);
    await seedTransactions(pool, transactions);
    
    console.log('Transaction seeding process complete');
  } catch (err) {
    console.error('Error during transaction seeding:', err);
  } finally {
    await pool.end();
  }
}

// Run the main function
main().catch(err => {
  console.error('Error in main execution:', err);
  process.exit(1);
});
