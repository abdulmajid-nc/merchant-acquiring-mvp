/**
 * Run the fee structures migration to set up database tables
 */

const path = require('path');
const { up } = require('./migrations/fee_structures_migration');

async function main() {
  try {
    console.log('Running fee structures migration...');
    await up();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
