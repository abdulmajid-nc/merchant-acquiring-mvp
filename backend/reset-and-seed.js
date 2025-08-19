/**
 * Script to clear all data from the remote PostgreSQL database and reseed it.
 * Usage: node reset-and-seed.js
 */

const { up } = require('./migrations/fee_structures_migration');
const seedMccs = require('./seed-mccs');
const seedRealisticData = require('./seed-realistic-data');
const seedTransactions = require('./run-seed-transactions');
const jptsAdapter = require('./jpts-adapter');

async function clearDatabase() {
  const jpts = jptsAdapter.init();
  console.log('Clearing all data from tables...');
  // Disable referential integrity temporarily
  await jpts.query('TRUNCATE TABLE merchant_volume_history, volume_tiers, fee_rules, fee_structures, transactions, merchants, terminals, mccs, audit_logs RESTART IDENTITY CASCADE');
  console.log('All tables truncated.');
}

async function main() {
  try {
    // 1. Ensure tables exist (run migration)
    console.log('Ensuring tables exist (running migration)...');
    await up();
    // 2. Clear all data
    await clearDatabase();
    // 3. Run migration again to ensure structure (optional, but safe)
    await up();
    // 4. Seed data
    if (typeof seedMccs === 'function') {
      await seedMccs();
    } else if (seedMccs && typeof seedMccs.default === 'function') {
      await seedMccs.default();
    }
    if (typeof seedRealisticData === 'function') {
      await seedRealisticData();
    } else if (seedRealisticData && typeof seedRealisticData.default === 'function') {
      await seedRealisticData.default();
    }
    if (typeof seedTransactions === 'function') {
      await seedTransactions();
    } else if (seedTransactions && typeof seedTransactions.default === 'function') {
      await seedTransactions.default();
    }
    console.log('Database reset and seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during reset and seeding:', error);
    process.exit(1);
  }
}

main();
