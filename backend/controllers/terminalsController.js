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
      // Check if we're connected to the database
      if (global.dbConnected) {
        console.log('Using MongoDB for terminals list');
        const terminals = await Terminal.find();
        return res.json({ 
          terminals, 
          total: terminals.length,
          source: 'database'
        });
      }
      
      // Using in-memory data
      console.log('Using mock data for terminals list');
      // Collect all terminals from merchants
      const assignedTerminals = global.merchants
        .filter(m => m.terminals && m.terminals.length)
        .flatMap(m => m.terminals.map(t => ({
          ...t,
          merchant: m.id,
          merchantName: m.name
        })));
      
      // Get unassigned terminals
      const unassignedTerminals = global.terminals.map(t => ({...t, merchant: '', merchantName: ''}));
      
      // Filter terminals if requested
      if (req.query.filter === 'available') {
        // Return only available/unassigned terminals
        return res.json({ 
          terminals: unassignedTerminals,
          total: unassignedTerminals.length,
          unassigned: unassignedTerminals.length,
          source: 'mock'
        });
      }
      
      // Return all terminals
      return res.json({ 
        terminals: [...assignedTerminals, ...unassignedTerminals],
        total: assignedTerminals.length + unassignedTerminals.length,
        assigned: assignedTerminals.length,
        unassigned: unassignedTerminals.length,
        source: 'mock'
      });
    } catch (error) {
      console.error('Error fetching terminals:', error);
      // Return mock data even on error
      console.log('Error occurred, using mock data for terminals list');
      
      try {
        const assignedTerminals = global.merchants
          .filter(m => m.terminals && m.terminals.length)
          .flatMap(m => m.terminals.map(t => ({
            ...t,
            merchant: m.id,
            merchantName: m.name
          })));
        
        const unassignedTerminals = global.terminals.map(t => ({...t, merchant: '', merchantName: ''}));
        
        return res.json({ 
          terminals: [...assignedTerminals, ...unassignedTerminals],
          total: assignedTerminals.length + unassignedTerminals.length,
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
