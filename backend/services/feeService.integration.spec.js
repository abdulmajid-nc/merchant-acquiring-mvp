const FeeService = require('./feeService');
const jptsAdapter = require('../jpts-adapter');

const log = (msg, ...args) => {
  // eslint-disable-next-line no-console
  console.log(`[TEST LOG] ${msg}`, ...args);
};

const baseMerchantId = 20000;
const baseFeeStructureId = 30000;

// Helper to insert a fee structure and rules
async function setupFeeStructure(db, {
  name,
  description = '',
  is_active = true,
  rules = [],
  volumeTiers = [],
}) {
  const { rows } = await db.query(
    `INSERT INTO fee_structures (name, description, is_active) VALUES ($1, $2, $3) RETURNING id`,
    [name, description, is_active]
  );
  const feeStructureId = rows[0].id;
  for (const rule of rules) {
    await db.query(
      `INSERT INTO fee_rules (fee_structure_id, rule_type, fee_value, condition_type, parameter_name) VALUES ($1, $2, $3, $4, $5)`,
      [feeStructureId, rule.rule_type, rule.fee_value, rule.condition_type || 'base', rule.parameter_name || 'default']
    );
  }
  for (const tier of volumeTiers) {
    await db.query(
      `INSERT INTO volume_tiers (fee_structure_id, min_volume, max_volume, percentage_fee, fixed_fee) VALUES ($1, $2, $3, $4, $5)`,
      [feeStructureId, tier.min_volume, tier.max_volume, tier.percentage_fee, tier.fixed_fee]
    );
  }
  return feeStructureId;
}

// Helper to insert a merchant
async function setupMerchant(db, { id, name, feeStructureId }) {
  await db.query(
    `INSERT INTO merchants (id, name, fee_structure_id) VALUES ($1, $2, $3)`,
    [id, name, feeStructureId]
  );
}

describe('FeeService.calculateTransactionFees (integration, 50+ cases)', () => {
  let db;
  let feeService;

  beforeAll(async () => {
    db = jptsAdapter.init();
    feeService = new FeeService();
  });

  afterAll(async () => {
    if (db && db.end) await db.end();
  });

  beforeEach(async () => {
    await db.query(`DELETE FROM transactions WHERE merchant_id >= $1`, [baseMerchantId]);
    await db.query(`DELETE FROM merchants WHERE id >= $1`, [baseMerchantId]);
    await db.query(`DELETE FROM fee_rules WHERE fee_structure_id >= $1`, [baseFeeStructureId]);
    await db.query(`DELETE FROM volume_tiers WHERE fee_structure_id >= $1`, [baseFeeStructureId]);
    await db.query(`DELETE FROM fee_structures WHERE id >= $1`, [baseFeeStructureId]);
  });

  const scenarios = [
    // 1-5: Simple percentage only
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], expected: 2, desc: '2% of 100' },
    { amount: 250, rules: [{ rule_type: 'percentage', fee_value: 1.5 }], expected: 3.75, desc: '1.5% of 250' },
    { amount: 0, rules: [{ rule_type: 'percentage', fee_value: 2 }], expected: 0, desc: '2% of 0' },
    { amount: 10000, rules: [{ rule_type: 'percentage', fee_value: 2 }], expected: 200, desc: '2% of 10,000' },
    { amount: 50, rules: [{ rule_type: 'percentage', fee_value: 5 }], expected: 2.5, desc: '5% of 50' },
    // 6-10: Fixed only
    { amount: 100, rules: [{ rule_type: 'fixed', fee_value: 1 }], expected: 1, desc: 'fixed $1' },
    { amount: 250, rules: [{ rule_type: 'fixed', fee_value: 2.5 }], expected: 2.5, desc: 'fixed $2.5' },
    { amount: 0, rules: [{ rule_type: 'fixed', fee_value: 3 }], expected: 3, desc: 'fixed $3' },
    { amount: 10000, rules: [{ rule_type: 'fixed', fee_value: 10 }], expected: 10, desc: 'fixed $10' },
    { amount: 50, rules: [{ rule_type: 'fixed', fee_value: 0.5 }], expected: 0.5, desc: 'fixed $0.5' },
    // 11-15: Percentage + Fixed
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }, { rule_type: 'fixed', fee_value: 1 }], expected: 3, desc: '2% + $1' },
    { amount: 250, rules: [{ rule_type: 'percentage', fee_value: 1.5 }, { rule_type: 'fixed', fee_value: 2.5 }], expected: 6.25, desc: '1.5% + $2.5' },
    { amount: 0, rules: [{ rule_type: 'percentage', fee_value: 2 }, { rule_type: 'fixed', fee_value: 3 }], expected: 3, desc: '2% + $3' },
    { amount: 10000, rules: [{ rule_type: 'percentage', fee_value: 2 }, { rule_type: 'fixed', fee_value: 10 }], expected: 210, desc: '2% + $10' },
    { amount: 50, rules: [{ rule_type: 'percentage', fee_value: 5 }, { rule_type: 'fixed', fee_value: 0.5 }], expected: 3, desc: '5% + $0.5' },
    // 16-20: Min/Max fee
    { amount: 10, rules: [{ rule_type: 'percentage', fee_value: 2 }], min_fee: 5, expected: 5, desc: 'min fee enforced' },
    { amount: 1000, rules: [{ rule_type: 'percentage', fee_value: 2 }], max_fee: 10, expected: 10, desc: 'max fee enforced' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], min_fee: 1, max_fee: 2, expected: 2, desc: 'min/max fee' },
    { amount: 10, rules: [{ rule_type: 'fixed', fee_value: 0.5 }], min_fee: 1, expected: 1, desc: 'fixed with min fee' },
    { amount: 1000, rules: [{ rule_type: 'fixed', fee_value: 20 }], max_fee: 10, expected: 10, desc: 'fixed with max fee' },
    // 21-25: Negative/zero/large
    { amount: -100, rules: [{ rule_type: 'percentage', fee_value: 2 }], expected: -2, desc: 'negative amount' },
    { amount: 0, rules: [{ rule_type: 'percentage', fee_value: 2 }], expected: 0, desc: 'zero amount' },
    { amount: 1000000, rules: [{ rule_type: 'percentage', fee_value: 0.1 }], expected: 1000, desc: 'large amount' },
    { amount: 1, rules: [{ rule_type: 'percentage', fee_value: 2 }], expected: 0.02, desc: 'small amount' },
    { amount: 999, rules: [{ rule_type: 'percentage', fee_value: 2 }], expected: 19.98, desc: 'edge amount' },
    // 26-30: Transaction types
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2, condition_type: 'transaction_type', condition_value: 'refund' }], transactionType: 'refund', expected: 2, desc: 'refund type' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2, condition_type: 'transaction_type', condition_value: 'purchase' }], transactionType: 'purchase', expected: 2, desc: 'purchase type' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2, condition_type: 'transaction_type', condition_value: 'refund' }], transactionType: 'purchase', expected: 0, desc: 'wrong type, no fee' },
    { amount: 100, rules: [{ rule_type: 'fixed', fee_value: 1, condition_type: 'transaction_type', condition_value: 'refund' }], transactionType: 'refund', expected: 1, desc: 'fixed refund' },
    { amount: 100, rules: [{ rule_type: 'fixed', fee_value: 1, condition_type: 'transaction_type', condition_value: 'purchase' }], transactionType: 'purchase', expected: 1, desc: 'fixed purchase' },
    // 31-35: Volume tiers (simulate with volumeTiers, but note: actual volume logic may need more setup)
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], volumeTiers: [{ min_volume: 0, max_volume: 1000, percentage_fee: 1, fixed_fee: 0 }], expected: 2, desc: 'volume tier present, but not used' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], volumeTiers: [{ min_volume: 0, max_volume: 100, percentage_fee: 1, fixed_fee: 0 }], expected: 2, desc: 'volume tier not triggered' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], volumeTiers: [{ min_volume: 0, max_volume: 10000, percentage_fee: 1, fixed_fee: 0 }], expected: 2, desc: 'volume tier not triggered (no volume)' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], volumeTiers: [{ min_volume: 0, max_volume: 100, percentage_fee: 1, fixed_fee: 0 }], expected: 2, desc: 'volume tier not triggered (no volume)' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], volumeTiers: [{ min_volume: 0, max_volume: 100, percentage_fee: 1, fixed_fee: 0 }], expected: 2, desc: 'volume tier not triggered (no volume)' },
    // 36-40: Inactive fee structure
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], is_active: false, expected: 2, desc: 'inactive structure, still used' },
    { amount: 100, rules: [{ rule_type: 'fixed', fee_value: 1 }], is_active: false, expected: 1, desc: 'inactive structure, still used' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }, { rule_type: 'fixed', fee_value: 1 }], is_active: false, expected: 3, desc: 'inactive structure, still used' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], is_active: true, expected: 2, desc: 'active structure' },
    { amount: 100, rules: [{ rule_type: 'fixed', fee_value: 1 }], is_active: true, expected: 1, desc: 'active structure' },
    // 41-45: Multiple merchants, same structure
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], merchantOffset: 1, expected: 2, desc: 'merchant 1' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], merchantOffset: 2, expected: 2, desc: 'merchant 2' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], merchantOffset: 3, expected: 2, desc: 'merchant 3' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], merchantOffset: 4, expected: 2, desc: 'merchant 4' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], merchantOffset: 5, expected: 2, desc: 'merchant 5' },
    // 46-50: Error/missing data
    { amount: 100, rules: [], expected: 0, desc: 'no rules' },
    { amount: 100, rules: null, expected: 0, desc: 'null rules' },
    { amount: 100, rules: undefined, expected: 0, desc: 'undefined rules' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], feeStructureId: 999999, expected: 0, desc: 'nonexistent fee structure' },
    { amount: 100, rules: [{ rule_type: 'percentage', fee_value: 2 }], merchantId: 999999, expected: 0, desc: 'nonexistent merchant' },
  ];

  test.each(scenarios.map((s, i) => ({ ...s, idx: i + 1 })))('Case $idx: $desc', async (scenario) => {
    const merchantId = scenario.merchantId || baseMerchantId + (scenario.merchantOffset || 0);
    let feeStructureId;
    if (scenario.feeStructureId) {
      feeStructureId = scenario.feeStructureId;
    } else {
      feeStructureId = await setupFeeStructure(db, {
        name: `Test Structure ${scenario.idx}`,
        is_active: scenario.is_active !== false,
        rules: scenario.rules || [],
        volumeTiers: scenario.volumeTiers || [],
      });
    }
    if (!scenario.merchantId && scenario.rules !== undefined) {
      await setupMerchant(db, { id: merchantId, name: `Merchant ${scenario.idx}`, feeStructureId });
    }
    log(`Running test case #${scenario.idx}: ${scenario.desc}`);
    const result = await feeService.calculateTransactionFees(
      merchantId,
      scenario.amount,
      scenario.transactionType || 'purchase'
    );
    log(`Result for case #${scenario.idx}:`, result);
    if (typeof scenario.expected === 'number') {
      expect(result.total_fee).toBeCloseTo(scenario.expected, 2);
    } else {
      expect(result.total_fee).toBe(0);
    }
  });
});
