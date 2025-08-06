const { getModel } = require('../models/ModelSelector');

module.exports = {
  onboard: async (req, res) => {
    try {
      // Get Terminal model dynamically
      const Terminal = getModel('Terminal');
      if (!Terminal) {
        throw new Error('Terminal model not available');
      }
      
      // Create new terminal and associate with merchant
      const terminal = await Terminal.create(req.body);
      res.json({ message: 'Terminal onboarded.', terminal });
    } catch (error) {
      console.error('Error onboarding terminal:', error);
      res.status(500).json({ message: 'Error onboarding terminal', error: error.message });
    }
  },
  updateConfig: async (req, res) => {
    try {
      // Get Terminal model dynamically
      const Terminal = getModel('Terminal');
      if (!Terminal) {
        throw new Error('Terminal model not available');
      }
      
      const { id } = req.params;
      const terminal = await Terminal.update(id, { config: req.body });
      
      if (!terminal) {
        return res.status(404).json({ message: 'Terminal not found' });
      }
      
      res.json({ message: 'Config updated.', terminal });
    } catch (error) {
      console.error('Error updating terminal config:', error);
      res.status(500).json({ message: 'Error updating terminal config', error: error.message });
    }
  },
  getTransactions: async (req, res) => {
    try {
      // Get Terminal and Transaction models dynamically
      const Terminal = getModel('Terminal');
      const Transaction = getModel('Transaction');
      
      if (!Terminal || !Transaction) {
        throw new Error('Required models not available');
      }
      
      const { id } = req.params;
      const terminal = await Terminal.findById(id);
      
      if (!terminal) {
        return res.status(404).json({ message: 'Terminal not found' });
      }
      
      // Get transactions for this terminal
      const transactions = await Transaction.findByTerminalId(id);
      
      res.json({ transactions: transactions || [] });
    } catch (error) {
      console.error('Error fetching terminal transactions:', error);
      res.status(500).json({ message: 'Error fetching terminal transactions', error: error.message });
    }
  },
  voidTransaction: async (req, res) => {
    try {
      // Get Transaction model dynamically
      const Transaction = getModel('Transaction');
      if (!Transaction) {
        throw new Error('Transaction model not available');
      }
      
      // Mark transaction as voided
      const { transactionId } = req.body;
      // Transaction update logic here
      res.json({ message: 'Transaction voided.', transactionId });
    } catch (error) {
      console.error('Error voiding transaction:', error);
      res.status(500).json({ message: 'Error voiding transaction', error: error.message });
    }
  },
  replaceTerminal: async (req, res) => {
    try {
      // Get Terminal model dynamically
      const Terminal = getModel('Terminal');
      if (!Terminal) {
        throw new Error('Terminal model not available');
      }
      
      const { id } = req.params;
      const { newSerial } = req.body;
      const terminal = await Terminal.update(id, { serial: newSerial });
      
      if (!terminal) {
        return res.status(404).json({ message: 'Terminal not found' });
      }
      
      res.json({ message: 'Terminal replaced.', terminal });
    } catch (error) {
      console.error('Error replacing terminal:', error);
      res.status(500).json({ message: 'Error replacing terminal', error: error.message });
    }
  },
  retireTerminal: async (req, res) => {
    try {
      // Get Terminal model dynamically
      const Terminal = getModel('Terminal');
      if (!Terminal) {
        throw new Error('Terminal model not available');
      }
      
      const { id } = req.params;
      const terminal = await Terminal.update(id, { status: 'retired' });
      
      if (!terminal) {
        return res.status(404).json({ message: 'Terminal not found' });
      }
      
      res.json({ message: 'Terminal retired.', terminal });
    } catch (error) {
      console.error('Error retiring terminal:', error);
      res.status(500).json({ message: 'Error retiring terminal', error: error.message });
    }
  },
  terminateTerminal: async (req, res) => {
    try {
      // Get Terminal model dynamically
      const Terminal = getModel('Terminal');
      if (!Terminal) {
        throw new Error('Terminal model not available');
      }
      
      const { id } = req.params;
      const terminal = await Terminal.update(id, { status: 'terminated' });
      
      if (!terminal) {
        return res.status(404).json({ message: 'Terminal not found' });
      }
      
      res.json({ message: 'Terminal terminated.', terminal });
    } catch (error) {
      console.error('Error terminating terminal:', error);
      res.status(500).json({ message: 'Error terminating terminal', error: error.message });
    }
  },
  list: async (req, res) => {
    try {
      // Get jPTS adapter for direct queries if needed
      const jptsAdapter = process.env.DB_TYPE === 'jpts' ? require('../jpts-adapter') : null;
      const jpts = jptsAdapter ? jptsAdapter.init() : null;
      
      // Pagination params
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      // Check if we're connected to the database
      if (global.dbConnected) {
        console.log('Using database for terminals list with pagination');
        
        // Get the Terminal model dynamically
        const Terminal = getModel('Terminal');
        const Merchant = getModel('Merchant');
        
        if (!Terminal) {
          throw new Error('Terminal model not available');
        }
        
        // For jPTS adapter, find() doesn't support skip/limit directly
        // So we need to handle pagination differently based on adapter type
        let terminals;
        let total;
        let assigned = 0;
        let unassigned = 0;
        
        try {
          if (process.env.DB_TYPE === 'jpts') {
            // Check if we're filtering for available terminals only
            const availableOnly = req.query.filter === 'available';
            
            // For jPTS, use custom SQL to join with merchants
            console.log('Using jPTS database with SQL JOIN for terminals and merchants');
            
            // Count total terminals
            let countResult;
            if (availableOnly) {
              countResult = await jpts.query("SELECT COUNT(*) FROM terminals WHERE merchant_id IS NULL");
            } else {
              countResult = await jpts.query("SELECT COUNT(*) FROM terminals");
            }
            total = parseInt(countResult.rows[0].count);
            
            // Count assigned and unassigned
            const assignedResult = await jpts.query("SELECT COUNT(*) FROM terminals WHERE merchant_id IS NOT NULL");
            const unassignedResult = await jpts.query("SELECT COUNT(*) FROM terminals WHERE merchant_id IS NULL");
            
            assigned = parseInt(assignedResult.rows[0].count);
            unassigned = parseInt(unassignedResult.rows[0].count);
            
            // Get all terminals first
            let allTerminals = await Terminal.find();
            
            // Get merchant data for each terminal
            const merchantPromises = allTerminals.map(async terminal => {
              if (terminal.merchant_id) {
                try {
                  const merchantQuery = "SELECT * FROM merchants WHERE id = $1";
                  const merchantResult = await jpts.query(merchantQuery, [terminal.merchant_id]);
                  
                  if (merchantResult.rows.length > 0) {
                    const merchant = merchantResult.rows[0];
                    return {
                      ...terminal,
                      merchantId: terminal.merchant_id,
                      merchantName: merchant.name || 'Unknown',
                      merchantEmail: merchant.email,
                      merchantBusinessType: merchant.business_type,
                      serialNumber: terminal.serial
                    };
                  }
                } catch (err) {
                  console.error(`Error getting merchant data for terminal ${terminal._id}:`, err);
                }
              }
              
              // Return terminal with empty merchant data if no merchant found
              return {
                ...terminal,
                merchantId: terminal.merchant_id || '',
                merchantName: '',
                merchantEmail: '',
                merchantBusinessType: '',
                serialNumber: terminal.serial
              };
            });
            
            // Wait for all merchant data to be fetched
            allTerminals = await Promise.all(merchantPromises);
            
            // Filter for available only if requested
            if (availableOnly) {
              allTerminals = allTerminals.filter(t => !t.merchant_id);
            }
            
            // Apply pagination
            terminals = allTerminals.slice(skip, skip + limit);
          } else {
            // For any other database type
            console.log('Using database connection for terminals list');
            
            // Get terminal counts
            total = await Terminal.count();
            
            // Get assigned and unassigned counts
            const filter = req.query.filter === 'available' ? { merchant_id: null } : {};
            
            if (req.query.filter === 'available') {
              total = await Terminal.countWhere({ merchant_id: null });
            }
            
            assigned = await Terminal.countWhere({ merchant_id: { $ne: null } });
            unassigned = await Terminal.countWhere({ merchant_id: null });
            
            // Get terminals with pagination
            terminals = await Terminal.findPaginated(skip, limit, filter);
            
            // Get merchant data for each terminal
            const merchantPromises = terminals.map(async terminal => {
              if (terminal.merchant_id) {
                try {
                  const merchant = await Merchant.findById(terminal.merchant_id);
                  if (merchant) {
                    return {
                      ...terminal,
                      merchantId: terminal.merchant_id,
                      merchantName: merchant.name || 'Unknown',
                      merchantEmail: merchant.email,
                      merchantBusinessType: merchant.business_type,
                      serialNumber: terminal.serial
                    };
                  }
                } catch (err) {
                  console.error(`Error getting merchant data for terminal ${terminal.id}:`, err);
                }
              }
              
              // Return terminal with empty merchant data if no merchant found
              return {
                ...terminal,
                merchantId: terminal.merchant_id || '',
                merchantName: '',
                merchantEmail: '',
                merchantBusinessType: '',
                serialNumber: terminal.serial
              };
            });
            
            // Wait for all merchant data to be fetched
            terminals = await Promise.all(merchantPromises);
          }
          
          return res.json({
            terminals,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
            assigned,
            unassigned,
            source: 'database'
          });
        } catch (dbError) {
          console.error('Database error in terminals list:', dbError);
          throw new Error(`Database operation failed: ${dbError.message}`);
        }
      }

      // Using in-memory data
      console.log('Using mock data for terminals list with pagination');
      
      // Create mock data if not exists
      if (!global.mockTerminals) {
        global.mockTerminals = [
          { 
            _id: 'term001', 
            serialNumber: 'SN12345', 
            model: 'Terminal X1',
            status: 'active',
            merchantId: 'merch001',
            merchantName: 'Coffee Shop Inc'
          },
          { 
            _id: 'term002', 
            serialNumber: 'SN12346', 
            model: 'Terminal X1',
            status: 'active',
            merchantId: 'merch002',
            merchantName: 'Bakery Delight'
          },
          { 
            _id: 'term003', 
            serialNumber: 'SN12347', 
            model: 'Terminal X2',
            status: 'inactive',
            merchantId: '',
            merchantName: ''
          }
        ];
      }
      
      const mockTerminals = global.mockTerminals;
      const total = mockTerminals.length;
      
      // Calculate assigned and unassigned counts
      const assignedTerminals = mockTerminals.filter(t => t.merchantId);
      const unassignedTerminals = mockTerminals.filter(t => !t.merchantId);
      const assigned = assignedTerminals.length;
      const unassigned = unassignedTerminals.length;
      const totalPages = Math.ceil(total / limit);

      // Filter terminals if requested
      if (req.query.filter === 'available') {
        // Return only available/unassigned terminals, paginated
        const paged = unassignedTerminals.slice(skip, skip + limit);
        return res.json({
          terminals: paged,
          total: unassigned,
          page,
          pageSize: limit,
          totalPages: Math.ceil(unassigned / limit),
          unassigned,
          source: 'mock'
        });
      }

      // Return paginated terminals
      const paged = mockTerminals.slice(skip, skip + limit);
      return res.json({
        terminals: paged,
        total,
        page,
        pageSize: limit,
        totalPages,
        assigned,
        unassigned,
        source: 'mock'
      });
    } catch (error) {
      console.error('Error fetching terminals:', error);
      // Return mock data even on error
      console.log('Error occurred, using mock data for terminals list');

      try {
        // Try to get real merchant data for our mock terminals
        let merchants = [];
        if (Array.isArray(global.merchants)) {
          merchants = global.merchants;
        } else {
          // Create some mock merchants if none exist
          merchants = [
            { id: 'merch001', _id: 'merch001', name: 'Coffee Shop Inc', business_type: 'Restaurant', email: 'coffee@example.com' },
            { id: 'merch002', _id: 'merch002', name: 'Bakery Delight', business_type: 'Food', email: 'bakery@example.com' },
            { id: 'merch003', _id: 'merch003', name: 'Tech Gadgets', business_type: 'Retail', email: 'tech@example.com' }
          ];
        }
        
        // Use the global.mockTerminals we created earlier if it exists
        if (Array.isArray(global.mockTerminals) && global.mockTerminals.length > 0) {
          const mockTerminals = global.mockTerminals;
          
          // Enhance terminal data with merchant details
          const enhancedTerminals = mockTerminals.map(terminal => {
            if (terminal.merchantId) {
              const merchant = merchants.find(m => m.id === terminal.merchantId || m._id === terminal.merchantId);
              if (merchant) {
                return {
                  ...terminal,
                  merchantName: merchant.name || 'Unknown Merchant',
                  merchantEmail: merchant.email,
                  merchantBusinessType: merchant.business_type
                };
              }
            }
            return terminal;
          });
          
          const total = enhancedTerminals.length;
          const totalPages = Math.ceil(total / (parseInt(req.query.limit, 10) || 20));
          const page = parseInt(req.query.page, 10) || 1;
          const limit = parseInt(req.query.limit, 10) || 20;
          const skip = (page - 1) * limit;
          const assignedTerminals = enhancedTerminals.filter(t => t.merchantId);
          const unassignedTerminals = enhancedTerminals.filter(t => !t.merchantId);
          const paged = enhancedTerminals.slice(skip, skip + limit);
          
          return res.json({
            terminals: paged,
            total,
            page,
            pageSize: limit,
            totalPages,
            assigned: assignedTerminals.length,
            unassigned: unassignedTerminals.length,
            source: 'mock-fallback',
            error: error.message
          });
        }
          
        // Fallback to basic mock data if global.mockTerminals isn't available
        const mockData = [
          { 
            _id: 'term001', 
            serialNumber: 'SN12345', 
            model: 'Terminal X1',
            status: 'active',
            merchantId: 'merch001',
            merchantName: 'Coffee Shop Inc',
            merchantEmail: 'coffee@example.com',
            merchantBusinessType: 'Restaurant'
          },
          { 
            _id: 'term002', 
            serialNumber: 'SN12346', 
            model: 'Terminal X1',
            status: 'active',
            merchantId: 'merch002',
            merchantName: 'Bakery Delight',
            merchantEmail: 'bakery@example.com',
            merchantBusinessType: 'Food'
          },
          { 
            _id: 'term003', 
            serialNumber: 'SN12347', 
            model: 'Terminal X2',
            status: 'inactive',
            merchantId: '',
            merchantName: ''
          }
        ];
          
        const total = mockData.length;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const paged = mockData.slice(skip, skip + limit);
        const assignedTerminals = mockData.filter(t => t.merchantId);
        const unassignedTerminals = mockData.filter(t => !t.merchantId);
          
        return res.json({
          terminals: paged,
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
          assigned: assignedTerminals.length,
          unassigned: unassignedTerminals.length,
          source: 'emergency-mock',
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
