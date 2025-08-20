/**
 * Remote DB initialization script
 * Runs migrations, truncates all tables, and seeds with realistic data for remote/staging/production.
 * Usage: node init-remote-db.js
 */

const { up } = require('./migrations/fee_structures_migration');
const seedMccs = require('./seed-mccs');
const seedRealisticData = require('./seed-realistic-data');
const jptsAdapter = require('./jpts-adapter');

async function clearDatabase(jpts) {
  console.log('Truncating all tables...');
  await jpts.query('TRUNCATE TABLE merchant_volume_history, volume_tiers, fee_rules, fee_structures, transactions, merchants, terminals, mccs, audit_logs RESTART IDENTITY CASCADE');
  console.log('All tables truncated.');
}

async function main() {
  const jpts = jptsAdapter.init();
  try {
    // 1. Ensure tables exist (run migration)
    console.log('Ensuring tables exist (running migration)...');
    await up();
    // 2. Clear all data
    await clearDatabase(jpts);
    // 3. Run migration again to ensure structure (optional, but safe)
    await up();
    // 4. Seed data
    if (typeof seedMccs === 'function') await seedMccs();
    if (typeof seedRealisticData === 'function') await seedRealisticData();
    console.log('Remote DB reset and seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during remote DB reset and seeding:', error);
    process.exit(1);
  }
}

main();
