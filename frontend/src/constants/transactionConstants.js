/**
 * Transaction status constants for frontend
 * These are synced with backend definitions
 */

export const TRANSACTION_STATUSES = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
  VOIDED: 'Voided',
  REVERSED: 'Reversed',
  REFUNDED: 'Refunded',
  SETTLED: 'Settled',
  CHARGEBACK: 'Chargeback',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled'
};

export const SYSTEM_STATUSES = {
  OPERATIONAL: 'Operational',
  DEGRADED: 'Degraded',
  OUTAGE: 'Outage',
  MAINTENANCE: 'Maintenance',
  COMPLIANT: 'Compliant',
  NON_COMPLIANT: 'Non-Compliant'
};

export const TRANSACTION_TYPES = {
  PURCHASE: 'Purchase',
  REFUND: 'Refund',
  AUTHORIZATION: 'Authorization',
  CAPTURE: 'Capture',
  VOID: 'Void',
  VERIFICATION: 'Verification'
};

export const STATUS_CATEGORIES = {
  SUCCESS: ['Approved', 'Settled'],
  WARNING: ['Pending', 'Voided', 'Reversed', 'Refunded'],
  ERROR: ['Declined', 'Chargeback', 'Expired', 'Cancelled']
};

// Status color mappings for UI
export const STATUS_COLORS = {
  // Transaction statuses
  [TRANSACTION_STATUSES.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: 'clock'
  },
  [TRANSACTION_STATUSES.APPROVED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'check-circle'
  },
  [TRANSACTION_STATUSES.DECLINED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'x-circle'
  },
  
  // System statuses
  [SYSTEM_STATUSES.OPERATIONAL]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'check-circle',
    altClasses: 'bg-green-500 text-white' // For legacy/highlight badges
  },
  [SYSTEM_STATUSES.DEGRADED]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: 'alert-triangle',
    altClasses: 'bg-yellow-500 text-white' // For legacy/highlight badges
  },
  [SYSTEM_STATUSES.OUTAGE]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'x-circle',
    altClasses: 'bg-red-500 text-white' // For legacy/highlight badges
  },
  [SYSTEM_STATUSES.MAINTENANCE]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: 'tool',
    altClasses: 'bg-blue-500 text-white' // For legacy/highlight badges
  },
  [SYSTEM_STATUSES.COMPLIANT]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'shield',
    altClasses: 'bg-green-500 text-white' // For legacy/highlight badges
  },
  [SYSTEM_STATUSES.NON_COMPLIANT]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'shield-off',
    altClasses: 'bg-red-500 text-white' // For legacy/highlight badges
  },
  [TRANSACTION_STATUSES.VOIDED]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: 'slash'
  },
  [TRANSACTION_STATUSES.REVERSED]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    icon: 'arrow-left'
  },
  [TRANSACTION_STATUSES.REFUNDED]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: 'arrow-up'
  },
  [TRANSACTION_STATUSES.SETTLED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'check'
  },
  [TRANSACTION_STATUSES.CHARGEBACK]: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    icon: 'alert-triangle'
  },
  [TRANSACTION_STATUSES.EXPIRED]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: 'x'
  },
  [TRANSACTION_STATUSES.CANCELLED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'x'
  }
};

// Helper function to get status display configuration
export const getStatusConfig = (status) => {
  if (!status) return STATUS_COLORS[TRANSACTION_STATUSES.PENDING];
  
  const normalizedStatus = typeof status === 'string' 
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : TRANSACTION_STATUSES.PENDING;

  // Handle special cases like "Online" that might come from legacy code
  if (normalizedStatus === 'Online') {
    return STATUS_COLORS[SYSTEM_STATUSES.OPERATIONAL];
  }
  
  if (normalizedStatus === 'Completed') {
    return STATUS_COLORS[TRANSACTION_STATUSES.APPROVED];
  }
    
  return STATUS_COLORS[normalizedStatus] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: 'info',
    altClasses: 'bg-gray-500 text-white' // Default for unknown statuses
  };
};

// Helper function to get category for a status
export const getStatusCategory = (status) => {
  if (!status) return 'WARNING';
  
  const normalizedStatus = typeof status === 'string' 
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : TRANSACTION_STATUSES.PENDING;
    
  if (STATUS_CATEGORIES.SUCCESS.includes(normalizedStatus)) return 'SUCCESS';
  if (STATUS_CATEGORIES.WARNING.includes(normalizedStatus)) return 'WARNING';
  if (STATUS_CATEGORIES.ERROR.includes(normalizedStatus)) return 'ERROR';
  
  return 'WARNING';
};
