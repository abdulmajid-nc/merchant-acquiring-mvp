/**
 * Fee Service
 * Handles fee structure management and fee calculations
 */
const jptsAdapter = require('../jpts-adapter');

class FeeService {
  constructor() {
    this.jpts = jptsAdapter.init();
  }

  /**
   * Calculate transaction fees for a merchant
   * @param {string} merchantId - Merchant ID
   * @param {number} amount - Transaction amount
   * @param {string} transactionType - Type of transaction (e.g., 'purchase', 'refund')
   * @returns {Promise<Object>} - Fee calculation result
   */
  async calculateTransactionFees(merchantId, amount, transactionType) {
    try {
      // Get the merchant's fee structure
      const feeStructureQuery = `
        SELECT fs.*
        FROM fee_structures fs
        INNER JOIN merchants m ON m.fee_structure_id = fs.id
        WHERE m.id = $1
        LIMIT 1
      `;
      const feeStructureResult = await this.jpts.query(feeStructureQuery, [merchantId]);
      
      // If no fee structure is assigned, use default fee rates
      let feeStructure = feeStructureResult.rows[0];
      if (!feeStructure) {
        console.log(`No fee structure assigned to merchant ${merchantId}. Using default fees.`);
        feeStructure = {
          name: 'Default Fee Structure',
          base_percentage: 2.5,
          base_fixed_amount: 0.3,
          is_volume_based: false,
          minimum_fee: 0.5,
          maximum_fee: null
        };
      }

      // Get volume-based tiers if applicable
      let volumeTiers = [];
      if (feeStructure.is_volume_based) {
        const volumeTiersQuery = `
          SELECT * FROM volume_tiers 
          WHERE fee_structure_id = $1
          ORDER BY min_volume ASC
        `;
        const volumeTiersResult = await this.jpts.query(volumeTiersQuery, [feeStructure.id]);
        volumeTiers = volumeTiersResult.rows;
      }

      // Get specific fee rules
      const feeRulesQuery = `
        SELECT * FROM fee_rules
        WHERE fee_structure_id = $1
        ORDER BY id DESC
      `;
      const feeRulesResult = await this.jpts.query(feeRulesQuery, [feeStructure.id]);
      const feeRules = feeRulesResult.rows;

      // Get merchant's monthly volume for volume-based pricing
      let merchantMonthlyVolume = 0;
      if (feeStructure.is_volume_based) {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const volumeQuery = `
          SELECT SUM(amount) as monthly_volume
          FROM transactions
          WHERE merchant_id = $1
            AND created_at >= $2
            AND status = 'completed'
        `;
        const volumeResult = await this.jpts.query(volumeQuery, [merchantId, firstDayOfMonth]);
        merchantMonthlyVolume = parseFloat(volumeResult.rows[0]?.monthly_volume || 0);
      }

      // Extract percentage and fixed fee from fee_rules
      let applicablePercentage = 0;
      let applicableFixed = 0;
      
      // Find base fees in the fee rules
      for (const rule of feeRules) {
        if (rule.condition_type === 'base') {
          if (rule.rule_type === 'percentage') {
            applicablePercentage = parseFloat(rule.fee_value);
          } else if (rule.rule_type === 'fixed') {
            applicableFixed = parseFloat(rule.fee_value);
          }
        }
      }
      
      // Apply volume-based tiers if applicable
      if (volumeTiers.length > 0) {
        // Find applicable volume tier
        for (const tier of volumeTiers) {
          if (merchantMonthlyVolume >= tier.min_volume && 
              (!tier.max_volume || merchantMonthlyVolume <= tier.max_volume)) {
            applicablePercentage = tier.percentage_fee;
            applicableFixed = tier.fixed_fee;
            break;
          }
        }
      }

      // Check if any special fee rules apply
      for (const rule of feeRules) {
        let ruleApplies = false;
        
        // Check conditions based on rule type
        switch (rule.condition_type) {
          case 'transaction_type':
            ruleApplies = rule.condition_value === transactionType;
            break;
          case 'transaction_amount_gt':
            ruleApplies = amount > parseFloat(rule.condition_value);
            break;
          case 'transaction_amount_lt':
            ruleApplies = amount < parseFloat(rule.condition_value);
            break;
          default:
            ruleApplies = false;
        }

        // Apply the rule if conditions are met
        if (ruleApplies) {
          if (rule.override_percentage !== null) {
            applicablePercentage = rule.override_percentage;
          }
          if (rule.override_fixed_amount !== null) {
            applicableFixed = rule.override_fixed_amount;
          }
          // If rule has a higher priority, stop checking other rules
          if (rule.break_on_match) {
            break;
          }
        }
      }

      // Calculate the fees
      const percentageFee = amount * (applicablePercentage / 100);
      const totalFee = percentageFee + applicableFixed;
      
      // Apply minimum/maximum fee constraints if defined
      let finalFee = totalFee;
      if (feeStructure.minimum_fee !== null && totalFee < feeStructure.minimum_fee) {
        finalFee = feeStructure.minimum_fee;
      }
      if (feeStructure.maximum_fee !== null && totalFee > feeStructure.maximum_fee) {
        finalFee = feeStructure.maximum_fee;
      }

      // Return the fee calculation breakdown
      return {
        merchant_id: merchantId,
        transaction_amount: amount,
        transaction_type: transactionType,
        fee_structure_name: feeStructure.name,
        fee_structure_id: feeStructure.id,
        percentage_fee: applicablePercentage,
        percentage_amount: percentageFee,
        fixed_amount: applicableFixed,
        total_fee: finalFee,
        monthly_volume: merchantMonthlyVolume,
        is_volume_based: feeStructure.is_volume_based
      };
    } catch (error) {
      console.error('Error calculating transaction fees:', error);
      // Return default fee in case of error
      return {
        merchant_id: merchantId,
        transaction_amount: amount,
        transaction_type: transactionType,
        fee_structure_name: 'Default (Error Fallback)',
        percentage_fee: 2.5,
        percentage_amount: amount * 0.025,
        fixed_amount: 0.3,
        total_fee: amount * 0.025 + 0.3,
        is_volume_based: false,
        error: error.message
      };
    }
  }

  /**
   * Save a new fee structure
   * @param {Object} feeStructureData - Fee structure data
   * @param {Array} volumeTiers - Optional volume tiers for the fee structure
   * @param {Array} feeRules - Optional fee rules for the fee structure
   * @returns {Promise<Object>} - Created fee structure with its ID
   */
  async saveFeeStructure(feeStructureData, volumeTiers = [], feeRules = []) {
    try {
      // Start a transaction
      await this.jpts.query('BEGIN');

      // Insert the fee structure
      const feeStructureQuery = `
        INSERT INTO fee_structures (
          name, description, base_percentage, base_fixed_amount, 
          is_volume_based, minimum_fee, maximum_fee, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;

      const feeStructureValues = [
        feeStructureData.name,
        feeStructureData.description || '',
        feeStructureData.base_percentage,
        feeStructureData.base_fixed_amount || 0,
        feeStructureData.is_volume_based || false,
        feeStructureData.minimum_fee,
        feeStructureData.maximum_fee
      ];

      const feeStructureResult = await this.jpts.query(feeStructureQuery, feeStructureValues);
      const feeStructure = feeStructureResult.rows[0];

      // Insert volume tiers if provided and fee structure is volume-based
      if (feeStructureData.is_volume_based && volumeTiers && volumeTiers.length > 0) {
        for (const tier of volumeTiers) {
          const volumeTierQuery = `
            INSERT INTO volume_tiers (
              fee_structure_id, min_volume, max_volume, 
              percentage_fee, fixed_fee, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          `;

          const volumeTierValues = [
            feeStructure.id,
            tier.min_volume,
            tier.max_volume,
            tier.percentage_fee,
            tier.fixed_fee || 0
          ];

          await this.jpts.query(volumeTierQuery, volumeTierValues);
        }
      }

      // Insert fee rules if provided
      if (feeRules && feeRules.length > 0) {
        for (const rule of feeRules) {
          const feeRuleQuery = `
            INSERT INTO fee_rules (
              fee_structure_id, rule_type, parameter_name, condition_type, condition_value,
              fee_value, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          `;

          const feeRuleValues = [
            feeStructure.id,
            rule.rule_type || 'percentage',
            rule.parameter_name || 'transaction_fee',
            rule.condition_type,
            rule.condition_value,
            rule.fee_value || rule.override_percentage || 0
          ];

          await this.jpts.query(feeRuleQuery, feeRuleValues);
        }
      }

      // Commit the transaction
      await this.jpts.query('COMMIT');

      // Return the created fee structure with its ID
      return {
        ...feeStructure,
        volume_tiers: volumeTiers,
        fee_rules: feeRules
      };
    } catch (error) {
      // Rollback in case of error
      await this.jpts.query('ROLLBACK');
      console.error('Error saving fee structure:', error);
      throw error;
    }
  }

  /**
   * Assign a fee structure to a merchant
   * @param {string} merchantId - Merchant ID
   * @param {string} feeStructureId - Fee structure ID
   * @returns {Promise<Object>} - Updated merchant
   */
  async assignFeeStructureToMerchant(merchantId, feeStructureId) {
    try {
      // Check if fee structure exists
      const feeStructureQuery = `SELECT * FROM fee_structures WHERE id = $1`;
      const feeStructureResult = await this.jpts.query(feeStructureQuery, [feeStructureId]);
      
      if (feeStructureResult.rows.length === 0) {
        throw new Error(`Fee structure with ID ${feeStructureId} not found`);
      }

      // Update merchant with fee structure ID
      const updateQuery = `
        UPDATE merchants
        SET fee_structure_id = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      const updateResult = await this.jpts.query(updateQuery, [feeStructureId, merchantId]);
      
      if (updateResult.rows.length === 0) {
        throw new Error(`Merchant with ID ${merchantId} not found`);
      }

      // Create an entry in merchant_volume_history if it doesn't exist
      const volumeHistoryQuery = `
        INSERT INTO merchant_volume_history (merchant_id, month_year, monthly_volume, created_at, updated_at)
        VALUES ($1, $2, 0, NOW(), NOW())
        ON CONFLICT (merchant_id, month_year) DO NOTHING
      `;
      
      const currentDate = new Date();
      const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      await this.jpts.query(volumeHistoryQuery, [merchantId, monthYear]);

      return updateResult.rows[0];
    } catch (error) {
      console.error('Error assigning fee structure to merchant:', error);
      throw error;
    }
  }

  /**
   * Get all fee structures
   * @returns {Promise<Array>} - List of fee structures
   */
  async getAllFeeStructures() {
    try {
      const query = `
        SELECT * FROM fee_structures
        ORDER BY created_at DESC
      `;
      const result = await this.jpts.query(query);
      
      // For each fee structure, get its volume tiers and fee rules
      const feeStructures = [];
      
      for (const structure of result.rows) {
        // Get volume tiers
        const volumeTiersQuery = `
          SELECT * FROM volume_tiers
          WHERE fee_structure_id = $1
          ORDER BY min_volume ASC
        `;
        const volumeTiersResult = await this.jpts.query(volumeTiersQuery, [structure.id]);
        
        // Get fee rules
        const feeRulesQuery = `
          SELECT * FROM fee_rules
          WHERE fee_structure_id = $1
          ORDER BY id DESC
        `;
        const feeRulesResult = await this.jpts.query(feeRulesQuery, [structure.id]);
        
        // Add to list with related data
        feeStructures.push({
          ...structure,
          volume_tiers: volumeTiersResult.rows,
          fee_rules: feeRulesResult.rows
        });
      }
      
      return feeStructures;
    } catch (error) {
      console.error('Error getting fee structures:', error);
      throw error;
    }
  }

  /**
   * Get a fee structure by ID with its volume tiers and rules
   * @param {string} feeStructureId - Fee structure ID
   * @returns {Promise<Object>} - Fee structure with volume tiers and rules
   */
  async getFeeStructureById(feeStructureId) {
    try {
      // Get fee structure
      const feeStructureQuery = `SELECT * FROM fee_structures WHERE id = $1`;
      const feeStructureResult = await this.jpts.query(feeStructureQuery, [feeStructureId]);
      
      if (feeStructureResult.rows.length === 0) {
        throw new Error(`Fee structure with ID ${feeStructureId} not found`);
      }
      
      const feeStructure = feeStructureResult.rows[0];
      
      // Get volume tiers
      const volumeTiersQuery = `
        SELECT * FROM volume_tiers
        WHERE fee_structure_id = $1
        ORDER BY min_volume ASC
      `;
      const volumeTiersResult = await this.jpts.query(volumeTiersQuery, [feeStructureId]);
      
      // Get fee rules
      const feeRulesQuery = `
        SELECT * FROM fee_rules
        WHERE fee_structure_id = $1
        ORDER BY id DESC
      `;
      const feeRulesResult = await this.jpts.query(feeRulesQuery, [feeStructureId]);
      
      // Return with related data
      return {
        ...feeStructure,
        volume_tiers: volumeTiersResult.rows,
        fee_rules: feeRulesResult.rows
      };
    } catch (error) {
      console.error('Error getting fee structure by ID:', error);
      throw error;
    }
  }
}

module.exports = FeeService;
