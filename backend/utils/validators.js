// Validation function for fee structures
function validateFeeStructure(data) {
  const errors = [];

  // Validate basic fields
  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }

  // Validate rules if present
  if (data.rules && Array.isArray(data.rules)) {
    data.rules.forEach((rule, index) => {
      // Required fields
      if (!rule.rule_type) {
        errors.push(`Rule ${index + 1}: rule_type is required`);
      } else if (!['percentage', 'fixed', 'tiered'].includes(rule.rule_type)) {
        errors.push(`Rule ${index + 1}: Invalid rule_type "${rule.rule_type}"`);
      }

      if (!rule.parameter_name) {
        errors.push(`Rule ${index + 1}: parameter_name is required`);
      }

      if (rule.fee_value === undefined || rule.fee_value === null) {
        errors.push(`Rule ${index + 1}: fee_value is required`);
      }

      // If tiered, validate tiers
      if (rule.rule_type === 'tiered' && rule.tiers && Array.isArray(rule.tiers)) {
        if (rule.tiers.length === 0) {
          errors.push(`Rule ${index + 1}: Tiered rule must have at least one tier`);
        }

        rule.tiers.forEach((tier, tierIndex) => {
          if (tier.min_volume === undefined || tier.min_volume === null) {
            errors.push(`Rule ${index + 1}, Tier ${tierIndex + 1}: min_volume is required`);
          }

          if (tier.fee_value === undefined || tier.fee_value === null) {
            errors.push(`Rule ${index + 1}, Tier ${tierIndex + 1}: fee_value is required`);
          }
        });
      }

      // Validate dates if present
      if (rule.effective_from && rule.effective_to) {
        const fromDate = new Date(rule.effective_from);
        const toDate = new Date(rule.effective_to);

        if (fromDate > toDate) {
          errors.push(`Rule ${index + 1}: effective_from must be before effective_to`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateFeeStructure
};
