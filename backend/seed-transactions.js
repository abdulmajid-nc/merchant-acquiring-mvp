const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { db } = require('./jpts-adapter');

async function cleanTables() {
  await db.query('DELETE FROM transactions');
  await db.query('DELETE FROM terminals');
  await db.query('DELETE FROM merchants');
}

// Helper functions to generate realistic data
function generateEmail(name) {
  if (!name) return null;
  // Convert name to lowercase, replace spaces with dots, remove special characters
  const cleanName = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  // Generate random domain from common ones
  const domains = ['gmail.com', 'outlook.com', 'business.com', 'company.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `info@${cleanName}.${domain}`;
}

function generateAddress() {
  const streetNumbers = Math.floor(Math.random() * 9000) + 1000;
  const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Blvd', 'Lake St', 'River Rd'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas'];
  const zipCodes = Math.floor(Math.random() * 90000) + 10000;
  
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  return `${streetNumbers} ${street}, ${city}, ${zipCodes}`;
}

function generatePhone() {
  const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
  const prefix = Math.floor(Math.random() * 900) + 100; // 100-999
  const lineNum = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  
  return `${areaCode}-${prefix}-${lineNum}`;
}

async function seedMerchantsAndTerminals() {
  // Generate 10 merchants and 20 terminals
  const merchants = [];
  const terminals = [];
  
  // Business types to choose from
  const businessTypes = [
    'retail', 'restaurant', 'cafe', 'grocery', 'electronics',
    'clothing', 'furniture', 'pharmacy', 'bakery', 'automotive'
  ];
  
  const statusTypes = ['approved', 'pending', 'review'];
  const settlementSchedules = ['daily', 'weekly', 'biweekly', 'monthly'];
  
  for (let i = 1; i <= 10; i++) {
    const merchantIdStr = `MERCH${i.toString().padStart(2, '0')}`;
    const merchantName = `Merchant ${i}`;
    const email = generateEmail(merchantName);
    const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    const status = statusTypes[Math.floor(Math.random() * statusTypes.length)];
    const address = generateAddress();
    const contact = generatePhone();
    const settlementSchedule = settlementSchedules[Math.floor(Math.random() * settlementSchedules.length)];
    const docs = 'business_license,tax_certificate';
    const createdAt = new Date().toISOString();
    
    // Insert merchant data using only id as the primary key
    const result = await db.query(
      'INSERT INTO merchants (name, email, business_type, status, address, contact, settlement_schedule, created_at, docs, archived) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id', 
      [merchantName, email, businessType, status, address, contact, settlementSchedule, createdAt, docs, false]
    );
    
    const merchantId = result.rows[0].id; // Get the auto-generated numeric ID
    merchants.push({ id: merchantId, name: merchantName });
    
    for (let j = 1; j <= 2; j++) {
      const terminalIdStr = `TERM${i}${j}`;
      // Insert terminal data using only id as the primary key
      const termResult = await db.query('INSERT INTO terminals (serial, merchant_id) VALUES ($1, $2) RETURNING id', 
        [`SN${i}${j}${Date.now().toString().slice(-6)}`, merchantId]);
      const terminalId = termResult.rows[0].id; // Get the auto-generated numeric ID
      terminals.push({ id: terminalId, merchant_id: merchantId, name: `Terminal ${i}-${j}` });
    }
  }
  return { merchants, terminals };
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedTransactions(merchants, terminals, tranlogRows) {
  for (let i = 0; i < 100; i++) {
    // Use tranlog row as reference for realistic values
    const ref = getRandomElement(tranlogRows);
    const merchant = getRandomElement(merchants);
    const terminal = terminals.filter(t => t.merchant_id === merchant.id)[0] || getRandomElement(terminals);

    await db.query(
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
}

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

async function main() {
  await cleanTables();
  const { merchants, terminals } = await seedMerchantsAndTerminals();
  const tranlogRows = await readTranlogCSV();
  await seedTransactions(merchants, terminals, tranlogRows);
  console.log('Seeding complete!');
}

main().catch(console.error);
