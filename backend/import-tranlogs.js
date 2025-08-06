/**
 * Import Tranlogs Script
 *
 * This script imports tranlog data from the provided CSV file into the PostgreSQL database.
 * The script handles proper data type conversion and creates the table if it doesn't exist.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const csv = require('csv-parser');

// Configuration
const config = {
  pg: {
    host: process.env.JPTS_HOST || 'localhost',
    port: process.env.JPTS_PORT || '5432',
    database: process.env.JPTS_DB || 'jpts_dev',
    user: process.env.JPTS_USER || 'postgres',
    password: process.env.JPTS_PASSWORD || 'postgres'
  },
  csvFile: path.resolve(__dirname, '../resources/tranlog_clean.csv')
};

// Create PostgreSQL connection pool
const pool = new Pool(config.pg);

// Function to create the tranlogs table if it doesn't exist
async function createTranlogsTableIfNotExists() {
  const client = await pool.connect();
  try {
    console.log('Checking if tranlogs table exists...');
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'tranlog'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating tranlogs table...');
      
      // Create the table with the structure matching db-dev migrations
      await client.query(`
        CREATE TABLE public.tranlog (
          id BIGSERIAL PRIMARY KEY,
          deleted VARCHAR(1),
          localid BIGINT,
          node VARCHAR(8),
          acquirer VARCHAR(20),
          mid VARCHAR(20),
          tid VARCHAR(20),
          stan VARCHAR(20),
          rrn VARCHAR(20),
          lifecycleindicator VARCHAR(10),
          lifecycletrace VARCHAR(50),
          lifecyclesequence VARCHAR(10),
          lifecycleauthtoken VARCHAR(10),
          ca_name VARCHAR(255),
          ca_city VARCHAR(255),
          ca_region VARCHAR(255),
          ca_country VARCHAR(255),
          ca_address VARCHAR(200),
          ca_postalcode VARCHAR(255),
          ca_phone VARCHAR(20),
          latitude VARCHAR(20),
          longitude VARCHAR(20),
          mcc VARCHAR(10),
          functioncode VARCHAR(10),
          reasoncode VARCHAR(10),
          filename VARCHAR(100),
          responsecode VARCHAR(10),
          approvalnumber VARCHAR(20),
          displaymessage VARCHAR(200),
          reversalcount INT,
          reversalid VARCHAR(50),
          completioncount INT,
          completionid VARCHAR(50),
          voidcount INT,
          voidid VARCHAR(50),
          date TIMESTAMP,
          transmissiondate TIMESTAMP,
          localtransactiondate TIMESTAMP,
          capturedate DATE,
          settlementdate DATE,
          batchnumber BIGINT,
          itc VARCHAR(20),
          irc VARCHAR(10),
          originalitc VARCHAR(20),
          currencycode VARCHAR(3),
          amount NUMERIC(14,2),
          additionalamount NUMERIC(14,2),
          replacementamount NUMERIC(14,2),
          replacementamountcardholderbilling NUMERIC(14,2),
          currencycodecardholderbilling VARCHAR(3),
          amountcardholderbilling NUMERIC(14,2),
          conversionratecardholderbilling VARCHAR(20),
          acquirerfee NUMERIC(14,2),
          electroniccommercepaymentindicator VARCHAR(10),
          cavvresultcode VARCHAR(10),
          cavvdata VARCHAR(200),
          indicator3ds VARCHAR(10),
          issuerfee NUMERIC(14,2),
          returnedbalances VARCHAR(100),
          ss VARCHAR(32),
          ssdata TEXT,
          pdc VARCHAR(20),
          rc VARCHAR(40),
          extrc VARCHAR(255),
          duration INT,
          outstanding INT,
          request TEXT,
          response TEXT,
          additionaldata TEXT,
          localcurrencycode VARCHAR(3),
          localamount NUMERIC(14,2),
          tags TEXT,
          emvdata TEXT,
          cardholder VARCHAR(50),
          card VARCHAR(50),
          wallet VARCHAR(50),
          wallet2 VARCHAR(50),
          networkname VARCHAR(99),
          maskedpan VARCHAR(19),
          acqnetid VARCHAR(10),
          settled VARCHAR(1),
          refid BIGINT,
          account VARCHAR(50),
          account2 VARCHAR(50),
          gltransaction VARCHAR(50),
          clearingid VARCHAR(50),
          settlementstatus VARCHAR(20),
          token VARCHAR(100),
          localamountrate VARCHAR(20),
          localfeeamount NUMERIC(14,2),
          localfeerate NUMERIC(14,2),
          baseamount NUMERIC(14,2),
          basecurrencycode VARCHAR(3),
          riskrule VARCHAR(50),
          riskresult VARCHAR(50),
          riskchecked VARCHAR(1),
          riskentity VARCHAR(50),
          risknrtcheck VARCHAR(10),
          risknrtalert VARCHAR(10),
          terminalcapability VARCHAR(10),
          purposeofpayment VARCHAR(12),
          sourcechannel VARCHAR(20),
          stipreasoncode VARCHAR(10),
          billingcurrencyaccount VARCHAR(3),
          conversionratebillingaccount VARCHAR(20),
          billingamountaccount NUMERIC(14,2),
          importfilename VARCHAR(100),
          isexported VARCHAR(1),
          messagereasoncode VARCHAR(5),
          chiptransactionindicator NUMERIC(4,0),
          digitaltoken VARCHAR(19),
          tokenrequestorid CHAR(11),
          digitaltokentype CHAR(2),
          ispreauth VARCHAR(1),
          additionaldetailstlv VARCHAR(9999),
          additionaldetailsfl VARCHAR(9999),
          deviceid VARCHAR(48),
          expiremanually VARCHAR(1),
          authexpiredby VARCHAR(50),
          additionaldetailsbaseii VARCHAR(9999),
          authexpiredat TIMESTAMP,
          isauthagingapplicable VARCHAR(1),
          tenantversionnumber VARCHAR(10),
          feedetail TEXT,
          notes TEXT,
          tokenexpiry VARCHAR(50),
          externaltoken VARCHAR(100),
          referencenumber VARCHAR(50),
          quoteid VARCHAR(50),
          fxrateid VARCHAR(50),
          toamount NUMERIC(14,2),
          tocurrency VARCHAR(3),
          exchangerate VARCHAR(20),
          bookingtsexternal VARCHAR(50),
          authorizationindicator VARCHAR(10),
          sweepdetails TEXT,
          iscancelled VARCHAR(1),
          forwardinst VARCHAR(20),
          iscashadvance VARCHAR(1),
          created TIMESTAMP,
          modified TIMESTAMP,
          acquirercountrycode VARCHAR(3),
          transfertype VARCHAR(20),
          accounttitle VARCHAR(100),
          wiretype VARCHAR(20),
          fraudtype VARCHAR(50),
          tranauthsource VARCHAR(50),
          fraudtranstatus VARCHAR(20),
          fraudtypeclassification VARCHAR(50),
          amountinpriorityone NUMERIC(14,2),
          advancedfeedetail TEXT,
          destinationcardholder VARCHAR(100),
          holdamount NUMERIC(14,2),
          iscashbackapplied VARCHAR(1),
          returnedbalances2 TEXT,
          externalcardtype VARCHAR(20),
          isaft VARCHAR(1),
          riskscoreandreason VARCHAR(100),
          riskassessmentandconditioncode VARCHAR(100),
          ismigrated VARCHAR(1),
          clearingtype VARCHAR(1),
          creditclass VARCHAR(20),
          atc VARCHAR(20),
          deferred VARCHAR(1),
          referencetxnids TEXT,
          chargebackid VARCHAR(50),
          categorycode VARCHAR(20),
          categoryname VARCHAR(100),
          billercode VARCHAR(20),
          billername VARCHAR(100),
          servicecode VARCHAR(20),
          servicename VARCHAR(100),
          prefundingaccount VARCHAR(50),
          schemerc VARCHAR(2)
        )
      `);
      
      console.log('Tranlog table created successfully');
    } else {
      console.log('Tranlog table already exists');
    }
    
  } catch (error) {
    console.error('Error creating tranlogs table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to import data from CSV
async function importCSVData() {
  try {
    console.log(`Reading CSV file from ${config.csvFile}...`);
    
    // Check if CSV file exists
    if (!fs.existsSync(config.csvFile)) {
      console.error(`CSV file not found at ${config.csvFile}`);
      return false;
    }

    // Clear existing data
    await pool.query('DELETE FROM tranlog');
    console.log('Cleared existing data from tranlogs table');
    
    // Read and process the CSV
    const records = [];
    let count = 0;
    let firstRecordKeys = null;

    // Create a promise that resolves when CSV parsing is complete
    await new Promise((resolve, reject) => {
      fs.createReadStream(config.csvFile)
        .pipe(csv())
        .on('data', (data) => {
          // Trim all keys in the record
          const trimmedRecord = {};
          Object.keys(data).forEach(key => {
            trimmedRecord[key.trim()] = data[key];
          });
          records.push(trimmedRecord);
          count++;
          if (!firstRecordKeys) {
            firstRecordKeys = Object.keys(trimmedRecord);
            console.log('First record keys:', firstRecordKeys);
          }
        })
        .on('end', () => {
          console.log(`CSV parsing complete. Found ${count} records.`);
          resolve();
        })
        .on('error', (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        });
    });

    // Function to sanitize value for SQL insertion
    const sanitizeValue = (value) => {
      if (value === '' || value === 'NULL' || value === undefined || value === null) {
        return null;
      }
      return value;
    };

    // Insert records in batches
    const batchSize = 50;
    let successCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const record of batch) {
          // Debug: Log the value of 'amount' for each record
          console.log('Importing record id:', record.id, 'amount:', record.amount);
          // Convert record to an array of column names
          const columns = Object.keys(record).map(key => 
            // Escape column names with quotes
            '"' + key + '"'
          ).join(', ');
          
          // Create placeholders for parameters ($1, $2, etc)
          const placeholders = Object.keys(record).map((_, index) => 
            '$' + (index + 1)
          ).join(', ');
          
          // Convert record to an array of values
          const values = Object.values(record).map(sanitizeValue);
          
          // Insert record
          await client.query(`
            INSERT INTO tranlog (${columns})
            VALUES (${placeholders})
            ON CONFLICT (id) DO NOTHING
          `, values);
          
          successCount++;
        }
        
        await client.query('COMMIT');
        console.log(`Imported batch ${i/batchSize + 1}/${Math.ceil(records.length/batchSize)}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error importing batch at index ${i}:`, error);
      } finally {
        client.release();
      }
    }

    console.log(`Successfully imported ${successCount} of ${count} records`);
    return true;
  } catch (error) {
    console.error('Error importing CSV data:', error);
    return false;
  }
}

// Main function to orchestrate the import
async function main() {
  try {
    console.log('Starting tranlog import process...');
    
    // Create the table if it doesn't exist
    await createTranlogsTableIfNotExists();
    
    // Import the data
    const success = await importCSVData();
    
    if (success) {
      console.log('Tranlog import completed successfully!');
    } else {
      console.error('Tranlog import completed with errors.');
    }
  } catch (error) {
    console.error('Unhandled error during import:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
