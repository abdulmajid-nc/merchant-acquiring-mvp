const Terminal = require('../models/Terminal');

module.exports = {
  onboard: async (req, res) => {
    // Create new terminal and associate with merchant
    const terminal = await Terminal.create(req.body);
    res.json({ message: 'Terminal onboarded.', terminal });
  },
  updateConfig: async (req, res) => {
    const { id } = req.params;
    const terminal = await Terminal.findByIdAndUpdate(id, { config: req.body }, { new: true });
    res.json({ message: 'Config updated.', terminal });
  },
  getTransactions: async (req, res) => {
    const { id } = req.params;
    const terminal = await Terminal.findById(id).populate('transactions');
    res.json({ transactions: terminal.transactions });
  },
  voidTransaction: async (req, res) => {
    // Mark transaction as voided (assume Transaction model exists)
    const { transactionId } = req.body;
    // Transaction update logic here
    res.json({ message: 'Transaction voided.', transactionId });
  },
  replaceTerminal: async (req, res) => {
    const { id } = req.params;
    const { newSerial } = req.body;
    const terminal = await Terminal.findByIdAndUpdate(id, { serial: newSerial }, { new: true });
    res.json({ message: 'Terminal replaced.', terminal });
  },
  retireTerminal: async (req, res) => {
    const { id } = req.params;
    const terminal = await Terminal.findByIdAndUpdate(id, { status: 'retired' }, { new: true });
    res.json({ message: 'Terminal retired.', terminal });
  },
  terminateTerminal: async (req, res) => {
    const { id } = req.params;
    const terminal = await Terminal.findByIdAndUpdate(id, { status: 'terminated' }, { new: true });
    res.json({ message: 'Terminal terminated.', terminal });
  },
  list: async (req, res) => {
    const terminals = await Terminal.find();
    res.json({ terminals });
  }
};
