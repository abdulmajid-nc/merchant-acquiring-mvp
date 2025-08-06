// PostgreSQL model for AuditLog
const jptsAdapter = process.env.DB_TYPE === 'jpts' ? require('../jpts-adapter') : null;

class AuditLogModel {
  constructor() {
    this.tableName = 'audit_logs';
    this.jpts = jptsAdapter ? jptsAdapter.init() : null;
  }

  // Create a new audit log entry
  async create(logData) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      // Ensure timestamp field
      if (!logData.timestamp) {
        logData.timestamp = new Date();
      }
      
      // Convert details to JSON string if it's an object
      if (typeof logData.details === 'object' && logData.details !== null) {
        logData.details = JSON.stringify(logData.details);
      }
      
      const columns = Object.keys(logData);
      const values = Object.values(logData);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) 
                     VALUES (${placeholders}) 
                     RETURNING *`;
                     
      const result = await this.jpts.query(query, values);
      
      // Parse details back to object if it was stringified
      if (typeof result.rows[0].details === 'string') {
        try {
          result.rows[0].details = JSON.parse(result.rows[0].details);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  // Find audit log entries by entity
  async findByEntity(entityType, entityId) {
    try {
      if (!this.jpts) {
        throw new Error('JPTS adapter not initialized');
      }
      
      const query = `SELECT * FROM ${this.tableName} 
                     WHERE entity_type = $1 AND entity_id = $2 
                     ORDER BY timestamp DESC`;
      const result = await this.jpts.query(query, [entityType, entityId]);
      
      // Parse details to objects
      result.rows.forEach(row => {
        if (typeof row.details === 'string') {
          try {
            row.details = JSON.parse(row.details);
          } catch (e) {
            // If parsing fails, keep as string
          }
        }
      });
      
      return result.rows;
    } catch (error) {
      console.error(`Error finding audit logs for ${entityType} ${entityId}:`, error);
      throw error;
    }
  }
}

module.exports = new AuditLogModel();
