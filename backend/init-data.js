
// backend/init-data.js
// Script to insert 1000+ mock merchants, terminals, and transactions into MongoDB

const mongoose = require('mongoose');
const { Schema } = mongoose;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchant-acquiring-mvp';

// Schemas
const merchantSchema = new Schema({
  name: String,
  email: String,
  business_type: String,
  status: String,
  created_at: Date
});
const terminalSchema = new Schema({
  serial: String,
  model: String,
  status: String,
  last_ping: Date
});
const transactionSchema = new Schema({
  terminal: { type: Schema.Types.ObjectId, ref: 'Terminal' },
  merchant: { type: Schema.Types.ObjectId, ref: 'Merchant' },
  amount: Number,
  status: String,
  created_at: Date,
  __v: { type: Number, default: 0 }
});

const Merchant = mongoose.model('Merchant', merchantSchema);
const Terminal = mongoose.model('Terminal', terminalSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

const statuses = ['approved', 'declined', 'pending', 'settled'];
const businessTypes = ['retail', 'restaurant', 'service', 'ecommerce'];
const terminalModels = ['PAX A80', 'PAX A60', 'Verifone V200c', 'Ingenico iWL250'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function seedAllData() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB');

  // Uncomment to clear collections first:
  // await Merchant.deleteMany({});
  // await Terminal.deleteMany({});
  // await Transaction.deleteMany({});

  // 1. Merchants
  const merchants = [];
  for (let i = 0; i < 1000; i++) {
    merchants.push({
      name: `Merchant ${i+1}`,
      email: `merchant${i+1}@example.com`,
      business_type: businessTypes[Math.floor(Math.random() * businessTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: randomDate(new Date(2025, 0, 1), new Date())
    });
  }
  const merchantDocs = await Merchant.insertMany(merchants);
  console.log('Inserted 1000 merchants');

  // 2. Terminals
  const terminals = [];
  for (let i = 0; i < 1000; i++) {
    terminals.push({
      serial: `T${randomString(8)}`,
      model: terminalModels[Math.floor(Math.random() * terminalModels.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      last_ping: randomDate(new Date(2025, 0, 1), new Date())
    });
  }
  const terminalDocs = await Terminal.insertMany(terminals);
  console.log('Inserted 1000 terminals');

  // 3. Transactions
  const txns = [];
  for (let i = 0; i < 1000; i++) {
    txns.push({
      terminal: terminalDocs[Math.floor(Math.random() * terminalDocs.length)]._id,
      merchant: merchantDocs[Math.floor(Math.random() * merchantDocs.length)]._id,
      amount: parseFloat((Math.random() * 500 + 10).toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: randomDate(new Date(2025, 0, 1), new Date()),
      __v: 0
    });
  }
  await Transaction.insertMany(txns);
  console.log('Inserted 1000+ transactions');

  await mongoose.disconnect();
  console.log('Done!');
}

seedAllData().catch(err => {
  console.error(err);
  process.exit(1);
});
