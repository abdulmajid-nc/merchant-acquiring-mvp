
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
const businessTypes = [
  'Retail', 'Restaurant', 'Supermarket', 'Pharmacy', 'Electronics', 'Clothing', 'Cafe', 'Bakery', 'Bookstore', 'Gas Station', 'Salon', 'Gym', 'Hotel', 'Ecommerce', 'Service'
];
const merchantNames = [
  'Acme Retail', 'Best Eats', 'SuperMart', 'HealthPlus Pharmacy', 'Tech World', 'Fashion Hub', 'Cafe Aroma', 'Sweet Treats Bakery',
  'Readers Corner', 'Fuel Express', 'Urban Salon', 'FitLife Gym', 'Grand Hotel', 'ShopOnline', 'QuickFix Services'
];
const terminalModels = ['PAX A80', 'PAX A60', 'Verifone V200c', 'Ingenico iWL250', 'Clover Flex', 'Square Terminal'];

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
    const name = merchantNames[i % merchantNames.length] + (i < merchantNames.length ? '' : ` ${Math.floor(i/merchantNames.length)+1}`);
    const email = name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '@example.com';
    const business_type = businessTypes[i % businessTypes.length];
    // More 'approved' and 'settled', fewer 'declined'
    const statusRand = Math.random();
    let status = 'approved';
    if (statusRand < 0.1) status = 'declined';
    else if (statusRand < 0.2) status = 'pending';
    else if (statusRand < 0.5) status = 'settled';
    merchants.push({
      name,
      email,
      business_type,
      status,
      created_at: randomDate(new Date(2024, 0, 1), new Date())
    });
  }
  const merchantDocs = await Merchant.insertMany(merchants);
  console.log('Inserted 1000 merchants');

  // 2. Terminals
  const terminals = [];
  for (let i = 0; i < 1000; i++) {
    const model = terminalModels[i % terminalModels.length];
    // Serial: Model initials + random string
    const initials = model.split(' ').map(w => w[0]).join('').toUpperCase();
    const serial = `${initials}${randomString(6)}`;
    // More 'active', fewer 'declined'
    const statusRand = Math.random();
    let status = 'approved';
    if (statusRand < 0.1) status = 'declined';
    else if (statusRand < 0.2) status = 'pending';
    else if (statusRand < 0.5) status = 'settled';
    terminals.push({
      serial,
      model,
      status,
      last_ping: randomDate(new Date(2024, 0, 1), new Date())
    });
  }
  const terminalDocs = await Terminal.insertMany(terminals);
  console.log('Inserted 1000 terminals');

  // 3. Transactions
  const txns = [];
  for (let i = 0; i < 1000; i++) {
    // Amount: 60% small (<$100), 30% medium (<$500), 10% large (<$2000)
    let amount;
    const amtRand = Math.random();
    if (amtRand < 0.6) amount = parseFloat((Math.random() * 90 + 10).toFixed(2));
    else if (amtRand < 0.9) amount = parseFloat((Math.random() * 400 + 100).toFixed(2));
    else amount = parseFloat((Math.random() * 1800 + 200).toFixed(2));
    // Status: more 'approved' and 'settled', fewer 'declined'
    const statusRand = Math.random();
    let status = 'approved';
    if (statusRand < 0.1) status = 'declined';
    else if (statusRand < 0.2) status = 'pending';
    else if (statusRand < 0.5) status = 'settled';
    txns.push({
      terminal: terminalDocs[Math.floor(Math.random() * terminalDocs.length)]._id,
      merchant: merchantDocs[Math.floor(Math.random() * merchantDocs.length)]._id,
      amount,
      status,
      created_at: randomDate(new Date(2024, 0, 1), new Date()),
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
