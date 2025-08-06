/**
 * jPTS Data Initialization Script
 * This script initializes data in the jPTS database for the merchant acquiring MVP
 */

const jptsAdapter = require('./jpts-adapter');

// Initialize the jPTS adapter
const jpts = jptsAdapter.init();
const logger = jptsAdapter.logger;

/**
 * Check if tables exist and create them if they don't
 */
async function checkAndCreateTables() {
  logger.log('Checking for merchant tables in jPTS database...');
  
  // Wait a bit for connection to establish
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Check if merchants table exists
    const merchantTableCheck = await jpts.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'merchants'
      );
    `);
    
    const merchantsTableExists = merchantTableCheck.rows[0].exists;
    
    if (!merchantsTableExists) {
      logger.log('Creating merchants table...');
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
      `);
      logger.log('Merchants table created successfully');
    } else {
      logger.log('Merchants table already exists');
    }
    
    // Check if terminals table exists
    const terminalsTableCheck = await jpts.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'terminals'
      );
    `);
    
    const terminalsTableExists = terminalsTableCheck.rows[0].exists;
    
    if (!terminalsTableExists) {
      logger.log('Creating terminals table...');
      await jpts.query(`
        CREATE TABLE terminals (
          id SERIAL PRIMARY KEY,
          serial VARCHAR(50) NOT NULL,
          model VARCHAR(50),
          status VARCHAR(20),
          last_ping TIMESTAMP,
          merchant_id INTEGER REFERENCES merchants(id)
        );
      `);
      logger.log('Terminals table created successfully');
    } else {
      logger.log('Terminals table already exists');
    }
    
    // Check if mccs table exists
    const mccsTableCheck = await jpts.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'mccs'
      );
    `);
    
    const mccsTableExists = mccsTableCheck.rows[0].exists;
    
    if (!mccsTableExists) {
      logger.log('Creating MCCs table...');
      await jpts.query(`
        CREATE TABLE mccs (
          id SERIAL PRIMARY KEY,
          code VARCHAR(10) NOT NULL UNIQUE,
          description TEXT,
          category VARCHAR(50),
          risk_level VARCHAR(20)
        );
      `);
      logger.log('MCCs table created successfully');
    } else {
      logger.log('MCCs table already exists');
      
      // Check if the category column exists and add it if missing
      const categoryColumnCheck = await jpts.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public'
          AND table_name = 'mccs'
          AND column_name = 'category'
        );
      `);
      
      const categoryColumnExists = categoryColumnCheck.rows[0].exists;
      
      if (!categoryColumnExists) {
        logger.log('Adding missing category column to MCCs table...');
        await jpts.query(`ALTER TABLE mccs ADD COLUMN category VARCHAR(50);`);
        logger.log('Category column added to MCCs table');
      }
    }
    
    // Check if transactions table exists
    const transactionsTableCheck = await jpts.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'transactions'
      );
    `);
    
    const transactionsTableExists = transactionsTableCheck.rows[0].exists;
    
    // Check if audit_logs table exists
    const auditLogsTableCheck = await jpts.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'audit_logs'
      );
    `);
    
    const auditLogsTableExists = auditLogsTableCheck.rows[0].exists;
    
    if (!transactionsTableExists) {
      logger.log('Creating transactions table...');
      await jpts.query(`
        CREATE TABLE transactions (
          id SERIAL PRIMARY KEY,
          merchant_id INTEGER REFERENCES merchants(id),
          terminal_id INTEGER REFERENCES terminals(id),
          merchant_id_text VARCHAR(15),
          terminal_id_text VARCHAR(16),
          
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
          masked_pan VARCHAR(20),
          
          mcc VARCHAR(4),
          pos_entry_mode VARCHAR(10),
          is_international BOOLEAN DEFAULT FALSE,
          
          original_transaction_id INTEGER REFERENCES transactions(id),
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP,
          settled_at TIMESTAMP,
          
          details JSONB
        );
        
        CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
        CREATE INDEX idx_transactions_status_created ON transactions(status, created_at DESC);
        CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
        CREATE INDEX idx_transactions_terminal_id ON transactions(terminal_id);
        CREATE INDEX idx_transactions_merchant_id_text ON transactions(merchant_id_text);
        CREATE INDEX idx_transactions_terminal_id_text ON transactions(terminal_id_text);
      `);
      logger.log('Transactions table created successfully');
    } else {
      logger.log('Transactions table already exists');
    }
    
    if (!auditLogsTableExists) {
      logger.log('Creating audit_logs table...');
      await jpts.query(`
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
      `);
      logger.log('Audit_logs table created successfully');
    } else {
      logger.log('Audit_logs table already exists');
    }
    
    return true;
  } catch (error) {
    logger.error(`Error checking/creating tables: ${error.message}`);
    logger.error(error.stack);
    return false;
  }
}

/**
 * Seed sample data if tables are empty
 */
async function seedSampleData() {
  try {
    // Check if merchants table is empty
    const merchantCount = await jpts.query('SELECT COUNT(*) FROM merchants');
    
    if (parseInt(merchantCount.rows[0].count) === 0) {
      logger.log('Seeding sample merchant data...');
      
      // Sample merchants
      const merchantData = [
        {
          name: 'Acme Retail',
          email: 'acme@retail.com',
          business_type: 'retail',
          status: 'approved',
          address: '123 Main St',
          contact: '555-1234',
          settlement_schedule: 'weekly'
        },
        {
          name: 'Best Eats',
          email: 'info@besteats.com',
          business_type: 'restaurant',
          status: 'pending',
          address: '456 Food Ave',
          contact: '555-5678',
          settlement_schedule: 'daily'
        }
      ];
      
      // Insert sample merchants
      for (const merchant of merchantData) {
        await jpts.query(`
          INSERT INTO merchants 
          (name, email, business_type, status, address, contact, settlement_schedule, _id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          merchant.name, 
          merchant.email, 
          merchant.business_type,
          merchant.status,
          merchant.address,
          merchant.contact,
          merchant.settlement_schedule,
          `merchant_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        ]);
      }
      
      logger.log('Sample merchants created successfully');
    } else {
      logger.log(`Found ${merchantCount.rows[0].count} existing merchants, skipping sample data`);
    }
    
    // Check if MCCs table is empty
    const mccCount = await jpts.query('SELECT COUNT(*) FROM mccs');
    
    if (parseInt(mccCount.rows[0].count) === 0) {
      logger.log('Seeding sample MCC data...');
      
      // Sample MCCs
      const mccData = [
        { code: '5411', description: 'Grocery Stores, Supermarkets', risk_level: 'low' },
        { code: '5812', description: 'Eating Places, Restaurants', risk_level: 'medium' },
        { code: '5999', description: 'Miscellaneous and Specialty Retail Stores', risk_level: 'medium' }
      ];
      
      // Insert sample MCCs
      for (const mcc of mccData) {
        await jpts.query(`
          INSERT INTO mccs 
          (code, description, risk_level, _id)
          VALUES ($1, $2, $3, $4)
        `, [
          mcc.code, 
          mcc.description, 
          mcc.risk_level,
          `mcc_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        ]);
      }
      
      logger.log('Sample MCCs created successfully');
    }
  } catch (error) {
    logger.error(`Error seeding sample data: ${error.message}`);
    logger.error(error.stack);
  }
}

/**
 * Main initialization function
 */
async function initData() {
  logger.log('Starting jPTS data initialization for PostgreSQL...');
  
  try {
    // Check and create tables
    const tablesCreated = await checkAndCreateTables();
    
    if (tablesCreated) {
      // Seed sample data
      await seedSampleData();
      
      // Seed transactions
      logger.log('Seeding transaction data...');
      try {
        const { seedJptsTransactions } = require('./seed-transactions');
        
        // First get merchants and terminals
        const merchantsResult = await jpts.query('SELECT * FROM merchants');
        const merchants = merchantsResult.rows;
        
        const terminalsResult = await jpts.query('SELECT * FROM terminals');
        const terminals = terminalsResult.rows;
        
        if (merchants.length > 0 && terminals.length > 0) {
          const { generateTransactions } = require('./seed-transactions');
          const transactions = await generateTransactions(merchants, terminals);
          
          await seedJptsTransactions(transactions);
          logger.log('Transaction data seeded successfully');
        } else {
          logger.log('Cannot seed transactions: No merchants or terminals found');
        }
      } catch (error) {
        logger.error(`Error seeding transaction data: ${error.message}`);
        logger.error(error.stack);
      }
    }
    
    logger.log('jPTS data initialization completed successfully');
  } catch (error) {
    logger.error(`Error initializing jPTS data: ${error.message}`);
    logger.error(error.stack);
  }
}

// Ensure the adapter has time to connect before initializing
setTimeout(() => {
  // Run the initialization
  initData()
    .then(() => {
      logger.log('Data initialization process completed');
      // Give PostgreSQL connection pool time to close properly
      setTimeout(() => {
        if (jpts.disconnect) {
          jpts.disconnect();
        }
        process.exit(0);
      }, 1000);
    })
    .catch(err => {
      logger.error(`Fatal error during data initialization: ${err.message}`);
      if (jpts.disconnect) {
        jpts.disconnect();
      }
      process.exit(1);
    });
}, 2000); // Wait 2 seconds for connection to establish
