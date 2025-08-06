const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { db } = require('./jpts-adapter');

async function cleanTables() {
  await db.query('DELETE FROM transactions');
  await db.query('DELETE FROM terminals');
  await db.query('DELETE FROM merchants');
}

async function seedMerchantsAndTerminals() {
  // Generate 10 merchants and 20 terminals
  const merchants = [];
  const terminals = [];
  for (let i = 1; i <= 10; i++) {
    const merchantIdStr = `MERCH${i.toString().padStart(2, '0')}`;
    // Insert into _id (string) field and let the id (integer) auto-increment
    const result = await db.query('INSERT INTO merchants (_id, name) VALUES ($1, $2) RETURNING id', [merchantIdStr, `Merchant ${i}`]);
    const merchantId = result.rows[0].id; // Get the auto-generated numeric ID
    merchants.push({ id: merchantId, _id: merchantIdStr, name: `Merchant ${i}` });
    
    for (let j = 1; j <= 2; j++) {
      const terminalIdStr = `TERM${i}${j}`;
      // Insert into _id (string) field and let the id (integer) auto-increment
      const termResult = await db.query('INSERT INTO terminals (_id, serial, merchant_id) VALUES ($1, $2, $3) RETURNING id', 
        [terminalIdStr, `SN${i}${j}${Date.now().toString().slice(-6)}`, merchantId]);
      const terminalId = termResult.rows[0].id; // Get the auto-generated numeric ID
      terminals.push({ id: terminalId, _id: terminalIdStr, merchant_id: merchantId, name: `Terminal ${i}-${j}` });
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
      `INSERT INTO transactions (_id, merchant_id, terminal_id, amount, currency, card_number, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        `TXN${Date.now()}${i}`,
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
