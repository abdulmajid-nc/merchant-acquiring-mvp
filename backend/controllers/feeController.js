/**
 * Fee Controller
 * Handles API endpoints for fee structures and fee calculations
 */

const jptsAdapter = require('../jpts-adapter');
const FeeService = require('../services/feeService');

class FeeController {
  constructor() {
    this.jpts = jptsAdapter.init();
    this.feeService = new FeeService();
  }

  /**
   * Get all fee structures
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllFeeStructures(req, res) {
    try {
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }

      const query = `
        SELECT * FROM fee_structures
        ORDER BY created_at DESC
      `;
      
      const result = await this.jpts.query(query);
      const feeStructures = result.rows;
      
      // For each fee structure, get the related rules and volume tiers
      for (const structure of feeStructures) {
        // Get fee rules
        const rulesQuery = `
          SELECT * FROM fee_rules
          WHERE fee_structure_id = $1
          ORDER BY id DESC
        `;
        const rulesResult = await this.jpts.query(rulesQuery, [structure.id]);
        structure.fee_rules = rulesResult.rows;
        
        // Get volume tiers if the fee structure is volume-based
        if (structure.is_volume_based && structure.fee_rules && structure.fee_rules.length > 0) {
          // Get all rule IDs for this structure
          const ruleIds = structure.fee_rules.map(rule => rule.id);
          
          // Get volume tiers for all fee rules in this structure
          const tiersQuery = `
            SELECT * FROM volume_tiers
            WHERE fee_rule_id = ANY($1::int[])
            ORDER BY min_volume ASC
          `;
          const tiersResult = await this.jpts.query(tiersQuery, [ruleIds]);
          structure.volume_tiers = tiersResult.rows;
        } else {
          structure.volume_tiers = [];
        }
      }
      
      res.json(feeStructures);
    } catch (error) {
      console.error('Error getting fee structures:', error);
      
      // Return the error instead of falling back to mock data
      res.status(500).json({ error: error.message || 'Error retrieving fee structures' });
    }
  }

  /**
   * Get a fee structure by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFeeStructureById(req, res) {
    try {
      const { id } = req.params;
      
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }
      
      const query = `
        SELECT * FROM fee_structures
        WHERE id = $1
      `;
      
      const result = await this.jpts.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Fee structure with ID ${id} not found` });
      }
      
      const feeStructure = result.rows[0];
      
      // Get fee rules
      const rulesQuery = `
        SELECT * FROM fee_rules
        WHERE fee_structure_id = $1
        ORDER BY id DESC
      `;
      const rulesResult = await this.jpts.query(rulesQuery, [id]);
      feeStructure.fee_rules = rulesResult.rows;
      
      // Get volume tiers if the fee structure is volume-based
      if (feeStructure.is_volume_based && feeStructure.fee_rules && feeStructure.fee_rules.length > 0) {
        // Get all rule IDs for this structure
        const ruleIds = feeStructure.fee_rules.map(rule => rule.id);
        
        // Get volume tiers for all fee rules in this structure
        const tiersQuery = `
          SELECT * FROM volume_tiers
          WHERE fee_rule_id = ANY($1::int[])
          ORDER BY min_volume ASC
        `;
        const tiersResult = await this.jpts.query(tiersQuery, [ruleIds]);
        feeStructure.volume_tiers = tiersResult.rows;
      } else {
        feeStructure.volume_tiers = [];
      }
      
      // Check if res is a simple object (for internal use) or an Express response
      if (res.json && typeof res.json === 'function') {
        return res.json(feeStructure);
      }
      
      // For internal use, just return the data
      return feeStructure;
    } catch (error) {
      console.error('Error getting fee structure by ID:', error);
      
      // Check if res is a simple object (for internal use) or an Express response
      if (res.json && typeof res.json === 'function') {
        return res.status(500).json({ error: error.message || 'Error retrieving fee structure' });
      }
      
      // For internal use, throw the error
      throw new Error(`Error retrieving fee structure: ${error.message}`);
    }
  }

  /**
   * Create a new fee structure
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createFeeStructure(req, res) {
    try {
      const { feeStructure, volumeTiers = [], feeRules = [] } = req.body;
      
      if (!feeStructure || !feeStructure.name) {
        return res.status(400).json({ error: 'Fee structure name is required' });
      }
      
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }
      
      // Start a transaction
      await this.jpts.query('BEGIN');

      try {
        // Insert the fee structure (matching the actual database schema)
        const feeStructureQuery = `
          INSERT INTO fee_structures (
            name, description, is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING *
        `;

        const feeStructureValues = [
          feeStructure.name,
          feeStructure.description || '',
          feeStructure.is_active !== undefined ? feeStructure.is_active : true
        ];

        const feeStructureResult = await this.jpts.query(feeStructureQuery, feeStructureValues);
        const createdFeeStructure = feeStructureResult.rows[0];

        // Insert fee rules if provided
        let primaryFeeRuleId = null;
        if (feeRules && feeRules.length > 0) {
          for (const rule of feeRules) {
            const feeRuleQuery = `
              INSERT INTO fee_rules (
                fee_structure_id, rule_type, parameter_name, condition_type, condition_value,
                fee_value, created_at, updated_at
              )
              VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
              RETURNING *
            `;

            const feeRuleValues = [
              createdFeeStructure.id,
              rule.rule_type || 'percentage',
              rule.parameter_name || 'transaction_fee',
              rule.condition_type,
              rule.condition_value,
              rule.fee_value || rule.override_percentage || 0
            ];

            const ruleResult = await this.jpts.query(feeRuleQuery, feeRuleValues);
            if (!createdFeeStructure.fee_rules) {
              createdFeeStructure.fee_rules = [];
            }
            
            createdFeeStructure.fee_rules.push(ruleResult.rows[0]);
            
            // Remember the first rule ID to associate volume tiers
            if (primaryFeeRuleId === null) {
              primaryFeeRuleId = ruleResult.rows[0].id;
            }
          }
        } else {
          createdFeeStructure.fee_rules = [];
        }
        
        // Insert volume tiers if provided and fee structure is volume-based
        if (feeStructure.is_volume_based && volumeTiers && volumeTiers.length > 0 && primaryFeeRuleId !== null) {
          for (const tier of volumeTiers) {
            const volumeTierQuery = `
              INSERT INTO volume_tiers (
                fee_rule_id, min_volume, max_volume, fee_value,
                created_at, updated_at
              )
              VALUES ($1, $2, $3, $4, NOW(), NOW())
              RETURNING *
            `;

            const volumeTierValues = [
              primaryFeeRuleId, 
              tier.min_volume,
              tier.max_volume || null,
              tier.fee_value || 0
            ];

            const tierResult = await this.jpts.query(volumeTierQuery, volumeTierValues);
            if (!createdFeeStructure.volume_tiers) {
              createdFeeStructure.volume_tiers = [];
            }
            createdFeeStructure.volume_tiers.push(tierResult.rows[0]);
          }
        } else {
          createdFeeStructure.volume_tiers = [];
        }

        // Commit the transaction
        await this.jpts.query('COMMIT');
        res.status(201).json(createdFeeStructure);
      } catch (error) {
        // Rollback in case of error
        await this.jpts.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error creating fee structure:', error);
      res.status(500).json({ error: error.message || 'Error creating fee structure' });
    }
  }

  /**
   * Assign a fee structure to a merchant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async assignFeeStructureToMerchant(req, res) {
    try {
      const { merchantId, feeStructureId } = req.body;
      
      if (!merchantId || !feeStructureId) {
        return res.status(400).json({ error: 'Merchant ID and fee structure ID are required' });
      }
      
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }
      
      // Check if fee structure exists
      const feeStructureQuery = `
        SELECT * FROM fee_structures 
        WHERE id = $1
      `;
      const feeStructureResult = await this.jpts.query(feeStructureQuery, [feeStructureId]);
      
      if (feeStructureResult.rows.length === 0) {
        return res.status(404).json({ error: `Fee structure with ID ${feeStructureId} not found` });
      }

      // Check if merchant exists
      const merchantQuery = `
        SELECT * FROM merchants 
        WHERE id = $1
      `;
      const merchantResult = await this.jpts.query(merchantQuery, [merchantId]);
      
      if (merchantResult.rows.length === 0) {
        return res.status(404).json({ error: `Merchant with ID ${merchantId} not found` });
      }

      // Update merchant with fee structure ID
      const updateQuery = `
        UPDATE merchants
        SET fee_structure_id = $1
        WHERE id = $2
        RETURNING *
      `;
      const updateResult = await this.jpts.query(updateQuery, [feeStructureId, merchantId]);
      
      res.json(updateResult.rows[0]);
    } catch (error) {
      console.error('Error assigning fee structure to merchant:', error);
      res.status(500).json({ error: error.message || 'Error assigning fee structure' });
    }
  }

  /**
   * Update an existing fee structure
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateFeeStructure(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        description, 
        is_active,
        fee_rules = [] 
      } = req.body;
      
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Fee structure name is required' });
      }
      
      // Validate that the fee structure exists
      const checkQuery = `SELECT * FROM fee_structures WHERE id = $1`;
      const checkResult = await this.jpts.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: `Fee structure with ID ${id} not found` });
      }

      // Start a transaction
      await this.jpts.query('BEGIN');
      
      try {
        // Update fee structure (matching the actual database schema)
        const updateQuery = `
          UPDATE fee_structures
          SET name = $1,
              description = $2,
              is_active = $3,
              updated_at = NOW()
          WHERE id = $4
          RETURNING *
        `;
        
        const updateResult = await this.jpts.query(updateQuery, [
          name,
          description,
          is_active !== undefined ? is_active : true,
          id
        ]);
        
        // Delete existing fee rules for this structure
        await this.jpts.query(`DELETE FROM fee_rules WHERE fee_structure_id = $1`, [id]);
        
        // Insert new fee rules
        for (const rule of fee_rules) {
          const { 
            rule_type, 
            fee_value, 
            parameter_name = rule_type, // Use rule_type as parameter_name if not provided
            condition_type = null,
            condition_value = null,
            min_fee = null,
            max_fee = null,
            effective_from = null,
            effective_to = null
          } = rule;
          
          if (!rule_type) {
            console.warn('Skipping fee rule with missing rule_type');
            continue;
          }

          if (fee_value === undefined || fee_value === null) {
            console.warn(`Skipping fee rule of type ${rule_type} with missing fee_value`);
            continue;
          }

          try {
            const parsedFeeValue = parseFloat(fee_value);
            if (isNaN(parsedFeeValue)) {
              console.warn(`Invalid fee_value for rule type ${rule_type}: ${fee_value}`);
              continue;
            }

            const ruleQuery = `
              INSERT INTO fee_rules (
                fee_structure_id, 
                rule_type, 
                fee_value, 
                parameter_name,
                condition_type,
                condition_value,
                min_fee,
                max_fee,
                effective_from,
                effective_to
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING *
            `;
            
            await this.jpts.query(ruleQuery, [
              id, 
              rule_type, 
              parsedFeeValue,
              parameter_name,
              condition_type,
              condition_value,
              min_fee,
              max_fee,
              effective_from,
              effective_to
            ]);
          } catch (ruleError) {
            console.error(`Error inserting fee rule of type ${rule_type}:`, ruleError);
            // Continue with next rule rather than failing the whole update
            // We'll log but not throw to keep processing other rules
          }
        }
        
        // Volume tiers are not supported in the current implementation
        // so we're skipping that part of the code
        
        // Commit the transaction
        await this.jpts.query('COMMIT');
        
        // Get the updated fee structure
        // Get the updated fee structure with detailed info
        const result = await this.getFeeStructureById({ params: { id } }, {});
        
        res.json(result);
      } catch (error) {
        // Roll back the transaction in case of error
        await this.jpts.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error updating fee structure:', error);
      
      // Check for specific database errors
      if (error.code === '42703') {
        // Column does not exist error
        console.error('Database schema error:', error.message);
        return res.status(500).json({ 
          error: 'Database schema error. Please contact the administrator.',
          details: error.message
        });
      } else if (error.code === '23505') {
        // Unique violation
        return res.status(400).json({
          error: 'A fee structure with this name already exists.',
          details: error.detail
        });
      } else if (error.code === '23502') {
        // Not null violation
        return res.status(400).json({
          error: 'Required field is missing.',
          details: error.detail
        });
      } else if (error.code === '22P02') {
        // Invalid text representation (usually for numeric fields)
        return res.status(400).json({
          error: 'Invalid numeric value provided.',
          details: error.detail || error.message
        });
      } else if (error.code === '23503') {
        // Foreign key violation
        return res.status(400).json({
          error: 'Invalid reference to another record.',
          details: error.detail
        });
      }
      
      // Provide detailed error information to help with debugging
      const errorDetails = {
        message: error.message || 'Error updating fee structure',
        code: error.code,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      };
      
      res.status(500).json({ 
        error: 'Failed to save fee structure. Please try again.',
        details: errorDetails
      });
    }
  }

  /**
   * Delete a fee structure by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteFeeStructure(req, res) {
    try {
      const { id } = req.params;
      
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }
      
      // Check if fee structure exists
      const checkQuery = `SELECT * FROM fee_structures WHERE id = $1`;
      const checkResult = await this.jpts.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: `Fee structure with ID ${id} not found` });
      }
      
      // Check if any merchants are using this fee structure
      const merchantCheckQuery = `SELECT COUNT(*) FROM merchants WHERE fee_structure_id = $1`;
      const merchantCheckResult = await this.jpts.query(merchantCheckQuery, [id]);
      
      if (parseInt(merchantCheckResult.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: `Cannot delete fee structure: It is currently assigned to ${merchantCheckResult.rows[0].count} merchant(s)` 
        });
      }
      
      // Start a transaction
      await this.jpts.query('BEGIN');
      
      try {
        // Get fee rules for this structure
        const feeRulesQuery = `SELECT id FROM fee_rules WHERE fee_structure_id = $1`;
        const feeRulesResult = await this.jpts.query(feeRulesQuery, [id]);
        
        // Delete volume tiers associated with these fee rules
        for (const feeRule of feeRulesResult.rows) {
          await this.jpts.query(`DELETE FROM volume_tiers WHERE fee_rule_id = $1`, [feeRule.id]);
        }
        
        // Delete fee rules
        await this.jpts.query(`DELETE FROM fee_rules WHERE fee_structure_id = $1`, [id]);
        
        // Delete fee structure
        const deleteQuery = `DELETE FROM fee_structures WHERE id = $1 RETURNING id`;
        const deleteResult = await this.jpts.query(deleteQuery, [id]);
        
        // Commit the transaction
        await this.jpts.query('COMMIT');
        
        res.json({
          success: true,
          message: `Fee structure with ID ${id} has been deleted`,
          id: deleteResult.rows[0].id
        });
      } catch (error) {
        // Roll back the transaction in case of error
        await this.jpts.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      res.status(500).json({ error: error.message || 'Error deleting fee structure' });
    }
  }
  
  /**
   * Calculate fees for a transaction
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async calculateFees(req, res) {
    try {
      const { merchantId, amount, transactionType } = req.body;
      
      if (!merchantId || !amount || isNaN(amount)) {
        return res.status(400).json({ 
          error: 'Merchant ID and valid transaction amount are required' 
        });
      }
      
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }
      
      const fees = await this.feeService.calculateTransactionFees(
        merchantId,
        parseFloat(amount),
        transactionType || 'purchase'
      );
      
      res.json(fees);
    } catch (error) {
      console.error('Error calculating fees:', error);
      
      // Fallback to a simple calculation if there's a database error
      const amountNumber = parseFloat(req.body.amount);
      const percentageFee = amountNumber * 0.025; // 2.5%
      const fixedFee = 0.30;
      
      res.json({
        merchant_id: req.body.merchantId,
        transaction_amount: amountNumber,
        transaction_type: req.body.transactionType || 'purchase',
        fee_structure_name: 'Default (Fallback)',
        percentage_fee: 2.5,
        percentage_amount: percentageFee,
        fixed_amount: fixedFee,
        total_fee: percentageFee + fixedFee,
        error: 'Error in fee calculation: ' + error.message
      });
    }
  }

  /**
   * Get mock fee structures for development/testing
   * This is a fallback method when the database is not available
   */
  async getMockFeeStructures(req, res) {
    try {
      console.warn('Using mock fee structures due to database error');
      
      const mockFeeStructures = [
        {
          id: 'fs-001',
          name: 'Standard Fee Structure',
          description: 'Standard fee structure for most merchants',
          base_percentage: 2.5,
          base_fixed_amount: 0.30,
          is_volume_based: false,
          minimum_fee: 1.00,
          maximum_fee: null,
          created_at: new Date(),
          volume_tiers: [],
          fee_rules: [
            {
              id: 'fr-001',
              rule_type: 'percentage',
              parameter_name: 'transaction_fee',
              condition_type: 'transaction_amount_gt',
              condition_value: '1000',
              fee_value: 2.0
            }
          ]
        },
        {
          id: 'fs-002',
          name: 'Volume-Based Pricing',
          description: 'Tiered fee structure based on monthly volume',
          base_percentage: 2.9,
          base_fixed_amount: 0.30,
          is_volume_based: true,
          minimum_fee: 0.50,
          maximum_fee: null,
          created_at: new Date(),
          volume_tiers: [
            {
              id: 'vt-001',
              min_volume: 0,
              max_volume: 10000,
              percentage_fee: 2.9,
              fixed_fee: 0.30
            },
            {
              id: 'vt-002',
              min_volume: 10000.01,
              max_volume: 50000,
              percentage_fee: 2.6,
              fixed_fee: 0.30
            },
            {
              id: 'vt-003',
              min_volume: 50000.01,
              max_volume: null,
              percentage_fee: 2.3,
              fixed_fee: 0.25
            }
          ],
          fee_rules: []
        }
      ];
      
      res.json(mockFeeStructures);
    } catch (error) {
      console.error('Error getting mock fee structures:', error);
      res.status(500).json({ error: 'Error getting fee structures' });
    }
  }

  /**
   * Get a specific mock fee structure by ID
   * This is a fallback method when the database is not available
   */
  async getMockFeeStructureById(req, res) {
    console.warn('Using mock fee structure due to database error');
    
    const { id } = req.params;
    
    // Mock fee structures
    const mockFeeStructures = {
      'fs-001': {
        id: 'fs-001',
        name: 'Standard Fee Structure',
        description: 'Standard fee structure for most merchants',
        base_percentage: 2.5,
        base_fixed_amount: 0.30,
        is_volume_based: false,
        minimum_fee: 1.00,
        maximum_fee: null,
        created_at: new Date(),
        volume_tiers: [],
        fee_rules: [
          {
            id: 'fr-001',
            name: 'High Value Transaction Discount',
            condition_type: 'transaction_amount_gt',
            condition_value: '1000',
            rule_type: 'percentage',
            parameter_name: 'transaction_fee',
            fee_value: 2.0
          }
        ]
      },
      'fs-002': {
        id: 'fs-002',
        name: 'Volume-Based Pricing',
        description: 'Tiered fee structure based on monthly volume',
        base_percentage: 2.9,
        base_fixed_amount: 0.30,
        is_volume_based: true,
        minimum_fee: 0.50,
        maximum_fee: null,
        created_at: new Date(),
        volume_tiers: [
          {
            id: 'vt-001',
            min_volume: 0,
            max_volume: 10000,
            percentage_fee: 2.9,
            fixed_fee: 0.30
          },
          {
            id: 'vt-002',
            min_volume: 10000.01,
            max_volume: 50000,
            percentage_fee: 2.6,
            fixed_fee: 0.30
          },
          {
            id: 'vt-003',
            min_volume: 50000.01,
            max_volume: null,
            percentage_fee: 2.3,
            fixed_fee: 0.25
          }
        ],
        fee_rules: []
      }
    };
    
    if (mockFeeStructures[id]) {
      res.json(mockFeeStructures[id]);
    } else {
      res.status(404).json({ error: `Fee structure with ID ${id} not found` });
    }
  }
  
  /**
   * Get volume tiers for a fee structure
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getVolumeTiersForFeeStructure(req, res) {
    try {
      const { id } = req.params;
      
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }
      
      // Check if the fee structure exists
      const checkQuery = `SELECT * FROM fee_structures WHERE id = $1`;
      const checkResult = await this.jpts.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: `Fee structure with ID ${id} not found` });
      }
      
      // Get fee rules for this structure to find associated volume tiers
      const feeRulesQuery = `SELECT id FROM fee_rules WHERE fee_structure_id = $1`;
      const feeRulesResult = await this.jpts.query(feeRulesQuery, [id]);
      
      if (feeRulesResult.rows.length === 0) {
        return res.json([]);
      }
      
      // Get volume tiers for all fee rules in this structure
      const ruleIds = feeRulesResult.rows.map(rule => rule.id);
      
      const tiersQuery = `
        SELECT * FROM volume_tiers
        WHERE fee_rule_id = ANY($1::int[])
        ORDER BY min_volume ASC
      `;
      
      const tiersResult = await this.jpts.query(tiersQuery, [ruleIds]);
      
      res.json(tiersResult.rows);
    } catch (error) {
      console.error('Error getting volume tiers:', error);
      res.status(500).json({ error: error.message || 'Error getting volume tiers' });
    }
  }
  
  /**
   * Create a new volume tier
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createVolumeTier(req, res) {
    try {
      const { feeStructureId, minVolume, maxVolume, feePercentage, feeFixed } = req.body;
      
      if (!feeStructureId || minVolume === undefined) {
        return res.status(400).json({ error: 'Fee structure ID and minimum volume are required' });
      }
      
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }
      
      // Check if the fee structure exists and get its primary fee rule
      const feeRuleQuery = `
        SELECT id FROM fee_rules 
        WHERE fee_structure_id = $1
        ORDER BY id ASC
        LIMIT 1
      `;
      
      const feeRuleResult = await this.jpts.query(feeRuleQuery, [feeStructureId]);
      
      if (feeRuleResult.rows.length === 0) {
        return res.status(404).json({ error: `No fee rules found for fee structure ID ${feeStructureId}` });
      }
      
      const feeRuleId = feeRuleResult.rows[0].id;
      
      // Insert the volume tier
      const volumeTierQuery = `
        INSERT INTO volume_tiers (
          fee_rule_id, min_volume, max_volume, fee_value,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;
      
      const volumeTierValues = [
        feeRuleId,
        parseFloat(minVolume),
        maxVolume ? parseFloat(maxVolume) : null,
        parseFloat(feePercentage || feeFixed || 0)
      ];
      
      const volumeTierResult = await this.jpts.query(volumeTierQuery, volumeTierValues);
      
      res.status(201).json(volumeTierResult.rows[0]);
    } catch (error) {
      console.error('Error creating volume tier:', error);
      res.status(500).json({ error: error.message || 'Error creating volume tier' });
    }
  }
  
  /**
   * Update a volume tier
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateVolumeTier(req, res) {
    try {
      const { id } = req.params;
      const { minVolume, maxVolume, feePercentage, feeFixed } = req.body;
      
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }
      
      // Check if the volume tier exists
      const checkQuery = `SELECT * FROM volume_tiers WHERE id = $1`;
      const checkResult = await this.jpts.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: `Volume tier with ID ${id} not found` });
      }
      
      // Update the volume tier
      const updateQuery = `
        UPDATE volume_tiers
        SET min_volume = $1,
            max_volume = $2,
            fee_value = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
      
      const updateValues = [
        parseFloat(minVolume),
        maxVolume ? parseFloat(maxVolume) : null,
        parseFloat(feePercentage || feeFixed || 0),
        id
      ];
      
      const updateResult = await this.jpts.query(updateQuery, updateValues);
      
      res.json(updateResult.rows[0]);
    } catch (error) {
      console.error('Error updating volume tier:', error);
      res.status(500).json({ error: error.message || 'Error updating volume tier' });
    }
  }
  
  /**
   * Delete a volume tier
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteVolumeTier(req, res) {
    try {
      const { id } = req.params;
      
      if (!global.dbConnected) {
        return res.status(503).json({ error: 'Database connection not available' });
      }
      
      // Check if the volume tier exists
      const checkQuery = `SELECT * FROM volume_tiers WHERE id = $1`;
      const checkResult = await this.jpts.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: `Volume tier with ID ${id} not found` });
      }
      
      // Delete the volume tier
      const deleteQuery = `DELETE FROM volume_tiers WHERE id = $1`;
      await this.jpts.query(deleteQuery, [id]);
      
      res.json({ message: `Volume tier with ID ${id} has been deleted` });
    } catch (error) {
      console.error('Error deleting volume tier:', error);
      res.status(500).json({ error: error.message || 'Error deleting volume tier' });
    }
  }
}

module.exports = new FeeController();
