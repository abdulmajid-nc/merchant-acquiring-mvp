/**
 * Application constants for the merchant acquiring system
 */

/**
 * Transaction statuses
 * These represent the different states a transaction can be in throughout its lifecycle
 */
const TRANSACTION_STATUSES = {
  PENDING: 'Pending',       // Transaction initiated but not yet completed
  APPROVED: 'Approved',     // Transaction successfully processed and approved
  DECLINED: 'Declined',     // Transaction was declined by the issuer
  VOIDED: 'Voided',         // Transaction was cancelled before settlement
  REVERSED: 'Reversed',     // Transaction was reversed after authorization
  REFUNDED: 'Refunded',     // Transaction amount was returned to cardholder
  SETTLED: 'Settled',       // Transaction has been settled with the network
  CHARGEBACK: 'Chargeback', // Transaction has been disputed by cardholder
  EXPIRED: 'Expired',       // Transaction expired before completion
  CANCELLED: 'Cancelled'    // Transaction was cancelled by merchant or system
};

/**
 * Transaction types
 */
const TRANSACTION_TYPES = {
  PURCHASE: 'Purchase',
  REFUND: 'Refund',
  AUTHORIZATION: 'Authorization',
  CAPTURE: 'Capture',
  VOID: 'Void',
  VERIFICATION: 'Verification'
};

/**
 * Status categories for UI presentation
 */
const STATUS_CATEGORIES = {
  SUCCESS: ['Approved', 'Settled'],
  WARNING: ['Pending', 'Voided', 'Reversed', 'Refunded'],
  ERROR: ['Declined', 'Chargeback', 'Expired', 'Cancelled']
};

module.exports = {
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  STATUS_CATEGORIES
};
