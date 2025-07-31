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
    try {
      // Pagination params
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      // Check if we're connected to the database
      if (global.dbConnected) {
        console.log('Using MongoDB for terminals list with pagination');
        const total = await Terminal.countDocuments();
        const terminals = await Terminal.find().skip(skip).limit(limit);
        return res.json({
          terminals,
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
          source: 'database'
        });
      }

      // Using in-memory data
      console.log('Using mock data for terminals list with pagination');
      // Collect all terminals from merchants
      const merchants = Array.isArray(global.merchants) ? global.merchants : [];
      const assignedTerminals = merchants
        .filter(m => m.terminals && m.terminals.length)
        .flatMap(m => m.terminals.map(t => ({
          ...t,
          merchant: m.id,
          merchantName: m.name
        })));

      // Get unassigned terminals
      const terminalsArr = Array.isArray(global.terminals) ? global.terminals : [];
      const unassignedTerminals = terminalsArr.map(t => ({ ...t, merchant: '', merchantName: '' }));

      let allTerminals = [...assignedTerminals, ...unassignedTerminals];
      const total = allTerminals.length;
      const totalPages = Math.ceil(total / limit);

      // Filter terminals if requested
      if (req.query.filter === 'available') {
        // Return only available/unassigned terminals, paginated
        const paged = unassignedTerminals.slice(skip, skip + limit);
        return res.json({
          terminals: paged,
          total: unassignedTerminals.length,
          page,
          pageSize: limit,
          totalPages: Math.ceil(unassignedTerminals.length / limit),
          unassigned: unassignedTerminals.length,
          source: 'mock'
        });
      }

      // Return paginated terminals
      const paged = allTerminals.slice(skip, skip + limit);
      return res.json({
        terminals: paged,
        total,
        page,
        pageSize: limit,
        totalPages,
        assigned: assignedTerminals.length,
        unassigned: unassignedTerminals.length,
        source: 'mock'
      });
    } catch (error) {
      console.error('Error fetching terminals:', error);
      // Return mock data even on error
      console.log('Error occurred, using mock data for terminals list');

      try {
        const merchants = Array.isArray(global.merchants) ? global.merchants : [];
        const assignedTerminals = merchants
          .filter(m => m.terminals && m.terminals.length)
          .flatMap(m => m.terminals.map(t => ({
            ...t,
            merchant: m.id,
            merchantName: m.name
          })));
        const terminalsArr = Array.isArray(global.terminals) ? global.terminals : [];
        const unassignedTerminals = terminalsArr.map(t => ({ ...t, merchant: '', merchantName: '' }));
        const allTerminals = [...assignedTerminals, ...unassignedTerminals];
        const total = allTerminals.length;
        const totalPages = Math.ceil(total / (parseInt(req.query.limit, 10) || 20));
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const paged = allTerminals.slice(skip, skip + limit);
        return res.json({
          terminals: paged,
          total,
          page,
          pageSize: limit,
          totalPages,
          assigned: assignedTerminals.length,
          unassigned: unassignedTerminals.length,
          source: 'mock',
          error: error.message
        });
      } catch (fallbackError) {
        // If even the mock data fails
        return res.status(500).json({
          message: 'Failed to fetch terminals',
          error: error.message,
          fallbackError: fallbackError.message
        });
      }
    }
  }
};
