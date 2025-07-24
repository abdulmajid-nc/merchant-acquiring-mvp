const Terminal = require('../models/Terminal');

module.exports = {
  onboard: async (req, res) => {
    // TODO: Implement terminal onboarding
    res.json({ message: 'Terminal onboarding not yet implemented.' });
  },
  updateConfig: async (req, res) => {
    // TODO: Implement terminal config update
    res.json({ message: 'Terminal config update not yet implemented.' });
  },
  getTransactions: async (req, res) => {
    // TODO: Fetch transaction history
    res.json({ transactions: [] });
  },
  voidTransaction: async (req, res) => {
    // TODO: Implement void transaction
    res.json({ message: 'Void transaction not yet implemented.' });
  },
  replaceTerminal: async (req, res) => {
    // TODO: Implement terminal replacement
    res.json({ message: 'Replace terminal not yet implemented.' });
  },
  retireTerminal: async (req, res) => {
    // TODO: Implement terminal retirement
    res.json({ message: 'Retire terminal not yet implemented.' });
  },
  terminateTerminal: async (req, res) => {
    // TODO: Implement terminal termination
    res.json({ message: 'Terminate terminal not yet implemented.' });
  },
  list: async (req, res) => {
    // TODO: List all terminals
    res.json({ terminals: [] });
  }
};
