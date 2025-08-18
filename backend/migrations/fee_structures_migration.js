const jptsAdapter = require('../jpts-adapter');

async function up() {
  try {
    console.log('Starting fee structures migration...');
    const jpts = jptsAdapter.init();
    
    // Create fee_structures table
    await jpts.query(`
      CREATE TABLE IF NOT EXISTS fee_structures (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        industry_category VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create fee_rules table
    await jpts.query(`
      CREATE TABLE IF NOT EXISTS fee_rules (
        id SERIAL PRIMARY KEY,
        fee_structure_id INTEGER REFERENCES fee_structures(id) ON DELETE CASCADE,
        rule_type VARCHAR(50) NOT NULL,
        parameter_name VARCHAR(50) NOT NULL,
        condition_type VARCHAR(50),
        condition_value TEXT,
        fee_value DECIMAL(10, 4) NOT NULL,
        min_fee DECIMAL(10, 2),
        max_fee DECIMAL(10, 2),
        effective_from DATE,
        effective_to DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create volume_tiers table
    await jpts.query(`
      CREATE TABLE IF NOT EXISTS volume_tiers (
        id SERIAL PRIMARY KEY,
        fee_rule_id INTEGER REFERENCES fee_rules(id) ON DELETE CASCADE,
        min_volume DECIMAL(14, 2) NOT NULL,
        max_volume DECIMAL(14, 2),
        fee_value DECIMAL(10, 4) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add fee structure columns to merchants table
    await jpts.query(`
      ALTER TABLE merchants
      ADD COLUMN IF NOT EXISTS fee_structure_id INTEGER REFERENCES fee_structures(id),
      ADD COLUMN IF NOT EXISTS custom_fee_notes TEXT,
      ADD COLUMN IF NOT EXISTS fee_effective_from DATE
    `);
    
    // Create merchant_volume_history table
    await jpts.query(`
      CREATE TABLE IF NOT EXISTS merchant_volume_history (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        total_volume DECIMAL(14, 2) NOT NULL,
        total_transactions INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add fee details to transactions table
    await jpts.query(`
      ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS fee_breakdown JSONB
    `);
    
    // Create a default fee structure
    await jpts.query(`
      INSERT INTO fee_structures (name, description, is_active)
      VALUES ('Standard Fee Structure', 'Default fee structure for all merchants', true)
    `);
    
    const result = await jpts.query('SELECT id FROM fee_structures ORDER BY id LIMIT 1');
    const defaultFeeStructureId = result.rows[0].id;
    
    // Add a basic percentage fee rule
    await jpts.query(`
      INSERT INTO fee_rules 
        (fee_structure_id, rule_type, parameter_name, fee_value)
      VALUES 
        ($1, 'percentage', 'transaction_fee', 2.9)
    `, [defaultFeeStructureId]);
    
    // Add a fixed fee rule
    await jpts.query(`
      INSERT INTO fee_rules 
        (fee_structure_id, rule_type, parameter_name, fee_value)
      VALUES 
        ($1, 'fixed', 'transaction_fee', 0.30)
    `, [defaultFeeStructureId]);
    
    console.log('Fee structures migration completed successfully');
  } catch (error) {
    console.error('Error during fee structures migration:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('Rolling back fee structures migration...');
    const jpts = jptsAdapter.init();
    
    // Remove added columns from transactions table
    await jpts.query(`
      ALTER TABLE transactions
      DROP COLUMN IF EXISTS fee_amount,
      DROP COLUMN IF EXISTS fee_breakdown
    `);
    
    // Remove added columns from merchants table
    await jpts.query(`
      ALTER TABLE merchants
      DROP COLUMN IF EXISTS fee_structure_id,
      DROP COLUMN IF EXISTS custom_fee_notes,
      DROP COLUMN IF EXISTS fee_effective_from
    `);
    
    // Drop tables in reverse order of creation
    await jpts.query('DROP TABLE IF EXISTS merchant_volume_history');
    await jpts.query('DROP TABLE IF EXISTS volume_tiers');
    await jpts.query('DROP TABLE IF EXISTS fee_rules');
    await jpts.query('DROP TABLE IF EXISTS fee_structures');
    
    console.log('Fee structures rollback completed successfully');
  } catch (error) {
    console.error('Error during fee structures rollback:', error);
    throw error;
  }
}

module.exports = { up, down };
