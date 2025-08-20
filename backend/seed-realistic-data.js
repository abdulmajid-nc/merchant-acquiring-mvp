const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
// Helper to get a random element from an array
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Read transaction log CSV for realistic transaction data
async function readTranlogCSV() {
  const rows = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '../resources/tranlog.csv'))
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}
/**
 * seed-realistic-data.js
 * This script seeds realistic merchant and terminal data into the jPTS database
 */

const jptsAdapter = require('./jpts-adapter');

// Initialize the jPTS adapter
const jpts = jptsAdapter.init();
const logger = jptsAdapter.logger;

// Realistic merchant names and business types
const merchantTemplates = [
  // Retail
  { prefix: 'Metro', suffix: 'Mart', business_type: 'retail', settlement_schedule: 'weekly' },
  { prefix: 'Quick', suffix: 'Shop', business_type: 'convenience', settlement_schedule: 'daily' },
  { prefix: 'City', suffix: 'Market', business_type: 'grocery', settlement_schedule: 'weekly' },
  { prefix: 'Urban', suffix: 'Outfitters', business_type: 'clothing', settlement_schedule: 'biweekly' },
  { prefix: 'Bright', suffix: 'Electronics', business_type: 'electronics', settlement_schedule: 'weekly' },
  { prefix: 'The', suffix: 'Pharmacy', business_type: 'pharmacy', settlement_schedule: 'daily' },
  { prefix: 'Garden', suffix: 'Center', business_type: 'garden', settlement_schedule: 'biweekly' },
  { prefix: 'Home', suffix: 'Furnishings', business_type: 'furniture', settlement_schedule: 'monthly' },
  { prefix: 'Fashion', suffix: 'Boutique', business_type: 'clothing', settlement_schedule: 'biweekly' },
  { prefix: 'Sport', suffix: 'Zone', business_type: 'sporting_goods', settlement_schedule: 'weekly' },
  
  // Food & Beverage
  { prefix: 'Cafe', suffix: 'Corner', business_type: 'cafe', settlement_schedule: 'daily' },
  { prefix: 'Tasty', suffix: 'Bites', business_type: 'restaurant', settlement_schedule: 'daily' },
  { prefix: 'Gourmet', suffix: 'Kitchen', business_type: 'restaurant', settlement_schedule: 'daily' },
  { prefix: 'Healthy', suffix: 'Eats', business_type: 'restaurant', settlement_schedule: 'daily' },
  { prefix: 'Sweet', suffix: 'Bakery', business_type: 'bakery', settlement_schedule: 'daily' },
  { prefix: 'Fresh', suffix: 'Juice', business_type: 'beverage', settlement_schedule: 'daily' },
  { prefix: 'Pizza', suffix: 'Palace', business_type: 'restaurant', settlement_schedule: 'daily' },
  { prefix: 'Sushi', suffix: 'Express', business_type: 'restaurant', settlement_schedule: 'daily' },
  { prefix: 'Burger', suffix: 'Joint', business_type: 'fast_food', settlement_schedule: 'daily' },
  { prefix: 'Coffee', suffix: 'House', business_type: 'cafe', settlement_schedule: 'daily' },
  
  // Services
  { prefix: 'Luxury', suffix: 'Hotel', business_type: 'hospitality', settlement_schedule: 'weekly' },
  { prefix: 'Quick', suffix: 'Car Wash', business_type: 'auto_service', settlement_schedule: 'weekly' },
  { prefix: 'City', suffix: 'Cleaners', business_type: 'laundry', settlement_schedule: 'biweekly' },
  { prefix: 'Elite', suffix: 'Hair Salon', business_type: 'salon', settlement_schedule: 'weekly' },
  { prefix: 'Family', suffix: 'Dental', business_type: 'healthcare', settlement_schedule: 'biweekly' },
  { prefix: 'Express', suffix: 'Transport', business_type: 'transportation', settlement_schedule: 'weekly' },
  { prefix: 'Secure', suffix: 'Storage', business_type: 'storage', settlement_schedule: 'monthly' },
  { prefix: 'Tech', suffix: 'Repairs', business_type: 'repair', settlement_schedule: 'biweekly' },
  { prefix: 'Green', suffix: 'Landscaping', business_type: 'landscaping', settlement_schedule: 'biweekly' },
  { prefix: 'Smart', suffix: 'Education', business_type: 'education', settlement_schedule: 'monthly' }
];

// Terminal models and manufacturers
const terminalModels = [
  'Verifone V200c',
  'Verifone P400',
  'Verifone M400',
  'Verifone Carbon 10',
  'Ingenico Lane 3000',
  'Ingenico Lane 5000',
  'Ingenico Lane 7000',
  'Ingenico Lane 8000',
  'PAX A80',
  'PAX A920',
  'PAX A60',
  'PAX A50',
  'PAX E700',
  'Clover Flex',
  'Clover Mini',
  'Clover Station',
  'Square Terminal',
  'Square Register',
  'Dejavoo Z11',
  'Dejavoo Z9'
];

// Address components
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Washington Blvd', 'Park Ave', 'Cedar Ln', 'Lake St', 'Pine Dr', 'Elm St', 'River Rd'];

// Generate a random address
function generateAddress() {
  const streetNum = Math.floor(Math.random() * 9900) + 100; // 100-9999
  const streetIndex = Math.floor(Math.random() * streets.length);
  const cityIndex = Math.floor(Math.random() * cities.length);
  const zip = Math.floor(Math.random() * 90000) + 10000; // 10000-99999
  
  return `${streetNum} ${streets[streetIndex]}, ${cities[cityIndex]}, ${zip}`;
}

// Generate a random email based on business name
function generateEmail(name) {
  // Remove spaces and special characters
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'business.com', 'company.net'];
  const domainIndex = Math.floor(Math.random() * domains.length);
  
  return `info@${cleanName}.${domains[domainIndex].split('.')[0]}.com`;
}

// Generate a random phone number
function generatePhone() {
  const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
  const prefix = Math.floor(Math.random() * 900) + 100; // 100-999
  const lineNum = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  
  return `${areaCode}-${prefix}-${lineNum}`;
}

// Generate a random terminal serial number
function generateSerialNumber(model, index) {
  // Extract manufacturer from model
  let manufacturer = 'TRM';
  if (model.includes('Verifone')) manufacturer = 'VFN';
  else if (model.includes('Ingenico')) manufacturer = 'ING';
  else if (model.includes('PAX')) manufacturer = 'PAX';
  else if (model.includes('Clover')) manufacturer = 'CLV';
  else if (model.includes('Square')) manufacturer = 'SQR';
  else if (model.includes('Dejavoo')) manufacturer = 'DJV';
  
  const year = 20 + Math.floor(Math.random() * 5); // 2020-2024
  const batch = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  const seq = (10000 + index).toString().slice(-5); // 00000-99999
  
  return `${manufacturer}${year}${batch}${seq}`;
}

/**
 * Seed merchants data
 */
async function seedMerchants(count = 100) {
  try {
    logger.log(`Seeding ${count} realistic merchants...`);
    
    // Check existing merchants count
    const merchantCount = await jpts.query('SELECT COUNT(*) FROM merchants');
    const existingCount = parseInt(merchantCount.rows[0].count);
    
    if (existingCount >= count) {
      logger.log(`Already have ${existingCount} merchants, skipping seed`);
      return existingCount;
    }
    
    const needToCreate = count - existingCount;
    logger.log(`Creating ${needToCreate} additional merchants`);
    
    const batchSize = 10;
    const batches = Math.ceil(needToCreate / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchMerchants = [];
      const batchSize = Math.min(10, needToCreate - batch * 10);
      
      for (let i = 0; i < batchSize; i++) {
        const templateIndex = Math.floor(Math.random() * merchantTemplates.length);
        const template = merchantTemplates[templateIndex];
        
        // Generate merchant name with a random middle word
        const middleWords = ['Super', 'Express', 'Prime', 'Value', 'Global', 'Royal', 'Quality', 'Premium', 'Star', ''];
        const middleWordIndex = Math.floor(Math.random() * middleWords.length);
        const middleWord = middleWords[middleWordIndex] ? middleWords[middleWordIndex] + ' ' : '';
        const name = `${template.prefix} ${middleWord}${template.suffix}`;
        
        // Generate unique identifier for the merchant
        const uniqueId = `m_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const status = Math.random() > 0.15 ? 'approved' : (Math.random() > 0.5 ? 'pending' : 'review');
        
        const merchant = {
          name,
          email: generateEmail(name),
          business_type: template.business_type,
          status,
          address: generateAddress(),
          contact: generatePhone(),
          settlement_schedule: template.settlement_schedule,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
          docs: 'business_license,tax_certificate',
          archived: false
        };
        
        batchMerchants.push(merchant);
      }
      
      // Insert batch of merchants
      for (const merchant of batchMerchants) {
        await jpts.query(`
          INSERT INTO merchants 
          (name, email, business_type, status, address, contact, settlement_schedule, created_at, docs, archived)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          merchant.name, 
          merchant.email,
          merchant.business_type,
          merchant.status,
          merchant.address,
          merchant.contact,
          merchant.settlement_schedule,
          merchant.created_at,
          merchant.docs,
          merchant.archived
        ]);
      }
      
      logger.log(`Created batch ${batch + 1}/${batches} of merchants`);
    }
    
    // Get final count
    const finalCount = await jpts.query('SELECT COUNT(*) FROM merchants');
    logger.log(`Finished seeding merchants. Total count: ${finalCount.rows[0].count}`);
    return parseInt(finalCount.rows[0].count);
    
  } catch (error) {
    logger.error(`Error seeding merchants: ${error.message}`);
    logger.error(error.stack);
    return 0;
  }
}

/**
 * Seed terminals data
 */
async function seedTerminals(count = 100, merchantCount) {
  try {
    logger.log(`Seeding ${count} realistic terminals...`);
    
    // Check existing terminals count
    const terminalCount = await jpts.query('SELECT COUNT(*) FROM terminals');
    const existingCount = parseInt(terminalCount.rows[0].count);
    
    if (existingCount >= count) {
      logger.log(`Already have ${existingCount} terminals, skipping seed`);
      return;
    }
    
    // Get all merchant IDs
    const merchantResult = await jpts.query('SELECT id FROM merchants');
    const merchantIds = merchantResult.rows.map(row => row.id);
    
    if (merchantIds.length === 0) {
      logger.error('No merchants found. Cannot create terminals without merchants.');
      return;
    }
    
    const needToCreate = count - existingCount;
    logger.log(`Creating ${needToCreate} additional terminals`);
    
    const batchSize = 20;
    const batches = Math.ceil(needToCreate / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchTerminals = [];
      const currentBatchSize = Math.min(batchSize, needToCreate - batch * batchSize);
      
      for (let i = 0; i < currentBatchSize; i++) {
        // Pick a random model and merchant
        const modelIndex = Math.floor(Math.random() * terminalModels.length);
        const merchantIdIndex = Math.floor(Math.random() * merchantIds.length);
        
        const model = terminalModels[modelIndex];
        const merchantId = merchantIds[merchantIdIndex];
        const serial = generateSerialNumber(model, existingCount + batch * batchSize + i);
        
        // Generate random status weighted towards active
        const statusRandom = Math.random();
        let status;
        if (statusRandom > 0.85) status = 'inactive';
        else if (statusRandom > 0.75) status = 'maintenance';
        else if (statusRandom > 0.70) status = 'pending';
        else status = 'active';
        
        // Generate last ping time for active terminals
        const lastPing = status === 'active' ? 
          new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString() : null;
        
        // No need for a unique ID string anymore
        
        const terminal = {
          serial,
          model,
          status,
          last_ping: lastPing,
          merchant_id: merchantId
        };
        
        batchTerminals.push(terminal);
      }
      
      // Insert batch of terminals
      for (const terminal of batchTerminals) {
        await jpts.query(`
          INSERT INTO terminals 
          (serial, model, status, last_ping, merchant_id)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          terminal.serial,
          terminal.model,
          terminal.status,
          terminal.last_ping,
          terminal.merchant_id
        ]);
      }
      
      logger.log(`Created batch ${batch + 1}/${batches} of terminals`);
    }
    
    // Get final count
    const finalCount = await jpts.query('SELECT COUNT(*) FROM terminals');
    logger.log(`Finished seeding terminals. Total count: ${finalCount.rows[0].count}`);
    
  } catch (error) {
    logger.error(`Error seeding terminals: ${error.message}`);
    logger.error(error.stack);
  }
}

/**
 * Main function to seed all data
 */
async function seedData() {
  logger.log('Starting realistic data seeding process...');
  
  try {
    // Wait a bit for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Seed merchants first
    const merchantCount = await seedMerchants(10); // match old logic for 10 merchants

    // Then seed terminals (2 per merchant, 20 total)
    await seedTerminals(20, merchantCount);

    // Get all merchant and terminal IDs for transaction seeding
    const merchantResult = await jpts.query('SELECT id FROM merchants');
    const terminalResult = await jpts.query('SELECT id, merchant_id FROM terminals');
    const merchants = merchantResult.rows;
    const terminals = terminalResult.rows;

    // Read transaction log CSV
    const tranlogRows = await readTranlogCSV();

    // Seed transactions (100)
    for (let i = 0; i < 100; i++) {
      const ref = getRandomElement(tranlogRows);
      const merchant = getRandomElement(merchants);
      const terminal = terminals.filter(t => t.merchant_id === merchant.id)[0] || getRandomElement(terminals);
      await jpts.query(
        `INSERT INTO transactions (merchant_id, terminal_id, amount, currency, card_number, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          merchant.id,
          terminal.id,
          ref.amount || (Math.random() * 100).toFixed(2),
          ref.currencycode || 'USD',
          ref.maskedpan || '4111********1111',
          ref.responsecode === '0000' ? 'Approved' : 'Pending',
          ref.date || new Date().toISOString()
        ]
      );
    }

    logger.log('Realistic data seeding completed successfully');
  } catch (error) {
    logger.error(`Error during data seeding: ${error.message}`);
    logger.error(error.stack);
  }
}

// Export the seeding function for use in main init script
module.exports = seedData;
