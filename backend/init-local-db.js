/**
 * Local DB initialization script
 * Drops all tables, recreates schema, and seeds with basic data for local development.
 * Usage: node init-local-db.js
 */

const jptsAdapter = require('./jpts-adapter');
const seedMccs = require('./seed-mccs');
const seedRealisticData = require('./seed-realistic-data');
const seedTransactions = require('./seed-transactions');

async function dropTables(jpts) {
  console.log('Dropping all tables (if exist)...');
  await jpts.query(`
    DROP TABLE IF EXISTS audit_logs CASCADE;
    DROP TABLE IF EXISTS transactions CASCADE;
    DROP TABLE IF EXISTS terminals CASCADE;
    DROP TABLE IF EXISTS merchants CASCADE;
    DROP TABLE IF EXISTS mccs CASCADE;
  `);
  console.log('All tables dropped.');
}

async function createTables(jpts) {
  console.log('Creating tables...');
  await jpts.query(`
    CREATE TABLE merchants (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      business_type VARCHAR(50),
      docs TEXT,
      status VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      address TEXT,
      contact VARCHAR(50),
      settlement_schedule VARCHAR(20),
      archived BOOLEAN DEFAULT false
    );
    CREATE TABLE terminals (
      id SERIAL PRIMARY KEY,
      serial VARCHAR(50) NOT NULL,
      model VARCHAR(50),
      status VARCHAR(20),
      last_ping TIMESTAMP,
      merchant_id INTEGER REFERENCES merchants(id)
    );
    CREATE TABLE mccs (
      id SERIAL PRIMARY KEY,
      code VARCHAR(10) NOT NULL UNIQUE,
      description TEXT,
      category VARCHAR(50),
      risk_level VARCHAR(20)
    );
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      merchant_id INTEGER REFERENCES merchants(id),
      terminal_id INTEGER REFERENCES terminals(id),
      amount DECIMAL(12, 2) NOT NULL,
      currency VARCHAR(3) NOT NULL,
      settlement_amount DECIMAL(12, 2),
      settlement_currency VARCHAR(3),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      response_code VARCHAR(10),
      approval_code VARCHAR(10),
      reference VARCHAR(50),
      trace VARCHAR(20),
      batch_id VARCHAR(20),
      transaction_type VARCHAR(20),
      card_scheme VARCHAR(20),
      card_number VARCHAR(20),
      mcc VARCHAR(4),
      pos_entry_mode VARCHAR(10),
      is_international BOOLEAN DEFAULT FALSE,
      original_transaction_id INTEGER REFERENCES transactions(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP,
      settled_at TIMESTAMP,
      details JSONB
    );
    CREATE TABLE audit_logs (
      id SERIAL PRIMARY KEY,
      _id VARCHAR(50) UNIQUE,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(50),
      action VARCHAR(50) NOT NULL,
      username VARCHAR(100),
      details JSONB,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
    CREATE INDEX idx_transactions_status_created ON transactions(status, created_at DESC);
    CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
    CREATE INDEX idx_transactions_terminal_id ON transactions(terminal_id);
  `);
  console.log('All tables created.');
}

async function main() {
  const jpts = jptsAdapter.init();
  try {
    await dropTables(jpts);
    await createTables(jpts);
    if (typeof seedMccs === 'function') await seedMccs();
    if (typeof seedRealisticData === 'function') await seedRealisticData();
    console.log('Local DB initialized and seeded successfully!');
  } catch (err) {
    console.error('Error initializing local DB:', err);
  } finally {
    if (jpts.disconnect) {
      jpts.disconnect();
      console.log('PostgreSQL connection pool closed');
    }
    process.exit(0);
  }
}

main();
