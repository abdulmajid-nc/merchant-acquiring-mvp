/**
 * Tranlog Controller
 * 
 * Handles API endpoints for accessing transaction logs (tranlogs) data
 */

// Database connection
const db = require('../jpts-adapter').db;

/**
 * Get paginated list of transaction logs
 */
exports.getTranlogs = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Sorting
    const sortBy = req.query.sort_by || 'date';
    const sortDir = req.query.sort_dir || 'DESC';
    
    // Filtering options
    const filters = [];
    const filterParams = [];
    let paramIndex = 1;
    
    // Add filters based on query parameters
    if (req.query.mid) {
      filters.push(`mid LIKE $${paramIndex++}`);
      filterParams.push(`%${req.query.mid}%`);
    }
    
    if (req.query.tid) {
      filters.push(`tid LIKE $${paramIndex++}`);
      filterParams.push(`%${req.query.tid}%`);
    }
    
    if (req.query.pan) {
      filters.push(`maskedpan LIKE $${paramIndex++}`);
      filterParams.push(`%${req.query.pan}%`);
    }
    
    if (req.query.status) {
      filters.push(`responsecode = $${paramIndex++}`);
      filterParams.push(req.query.status);
    }
    
    if (req.query.date_from) {
      filters.push(`date >= $${paramIndex++}`);
      filterParams.push(req.query.date_from);
    }
    
    if (req.query.date_to) {
      filters.push(`date <= $${paramIndex++}`);
      filterParams.push(req.query.date_to);
    }
    
    // Build the WHERE clause
    const whereClause = filters.length > 0 ? 'WHERE ' + filters.join(' AND ') : '';
    
    // Get the total count
    const countQuery = `SELECT COUNT(*) as total FROM tranlog ${whereClause}`;
    const countResult = await db.query(countQuery, filterParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Get the paginated results
    const query = `
      SELECT 
        id, mid, tid, stan, rrn, date, localtransactiondate,
        amount, currencycode, responsecode, approvalnumber, 
        displaymessage, networkname, maskedpan, mcc, functioncode,
        ca_name, ca_city, ca_country, created, modified
      FROM 
        tranlog
      ${whereClause}
      ORDER BY ${sortBy} ${sortDir}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    const result = await db.query(query, [...filterParams, limit, offset]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    // Return the results
    res.json({
      tranlogs: result.rows,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
        hasNext,
        hasPrev,
        next: hasNext ? page + 1 : null,
        prev: hasPrev ? page - 1 : null
      }
    });
  } catch (error) {
    console.error('Error fetching transaction logs:', error);
    res.status(500).json({
      message: 'Error fetching transaction logs',
      error: error.message
    });
  }
};

/**
 * Get transaction log by ID
 */
exports.getTranlogById = async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      SELECT * FROM tranlog
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Transaction log not found'
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching transaction log by ID:', error);
    res.status(500).json({
      message: 'Error fetching transaction log',
      error: error.message
    });
  }
};

/**
 * Get transaction stats for dashboard
 */
exports.getTranlogStats = async (req, res) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Get various stats in parallel
    const [
      countToday,
      countTotal,
      approvedCount,
      declinedCount,
      pendingCount,
      amountStats
    ] = await Promise.all([
      // Count today's transactions
      db.query(`
        SELECT COUNT(*) as count 
        FROM tranlogs 
        WHERE date::date = $1
      `, [today]),
      
      // Total transaction count
      db.query('SELECT COUNT(*) as count FROM tranlogs'),
      
      // Count approved transactions
      db.query(`
        SELECT COUNT(*) as count 
        FROM tranlogs 
        WHERE responsecode = '0000'
      `),
      
      // Count declined transactions
      db.query(`
        SELECT COUNT(*) as count 
        FROM tranlogs 
        WHERE responsecode != '0000'
      `),
      
      // Count pending transactions
      db.query(`
        SELECT COUNT(*) as count 
        FROM tranlogs 
        WHERE responsecode IS NULL OR responsecode = ''
      `),
      
      // Amount statistics
      db.query(`
        SELECT 
          SUM(CAST(amount AS DECIMAL)) as total_amount,
          AVG(CAST(amount AS DECIMAL)) as avg_amount,
          MAX(CAST(amount AS DECIMAL)) as max_amount
        FROM tranlogs
        WHERE amount IS NOT NULL AND amount != ''
      `)
    ]);
    
    res.json({
      today: {
        count: parseInt(countToday.rows[0].count)
      },
      total: {
        count: parseInt(countTotal.rows[0].count)
      },
      approved: {
        count: parseInt(approvedCount.rows[0].count)
      },
      declined: {
        count: parseInt(declinedCount.rows[0].count)
      },
      pending: {
        count: parseInt(pendingCount.rows[0].count)
      },
      amounts: {
        total: parseFloat(amountStats.rows[0].total_amount || 0),
        average: parseFloat(amountStats.rows[0].avg_amount || 0),
        maximum: parseFloat(amountStats.rows[0].max_amount || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({
      message: 'Error fetching transaction stats',
      error: error.message
    });
  }
};

/**
 * Trigger the import of tranlog data from CSV
 */
exports.importTranlogs = async (req, res) => {
  try {
    // Execute the import script
    const { execSync } = require('child_process');
    const result = execSync('node import-tranlogs.js', { cwd: __dirname + '/..' });
    
    res.json({
      message: 'Tranlog import initiated',
      details: result.toString()
    });
  } catch (error) {
    console.error('Error importing tranlogs:', error);
    res.status(500).json({
      message: 'Error importing tranlogs',
      error: error.message
    });
  }
};
