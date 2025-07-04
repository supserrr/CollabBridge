// backend/src/config/database.js
const { Pool } = require('pg');

console.log('🗄️  Initializing database connection...');

// Support both individual config variables and DATABASE_URL
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    console.log('📊 Using DATABASE_URL for connection');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }
  
  console.log('📊 Using individual config variables');
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'collabbridge',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
};

let pool;

try {
  pool = new Pool({
    ...getDatabaseConfig(),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
  console.log('✅ Database pool created successfully');
} catch (error) {
  console.error('❌ Failed to create database pool:', error.message);
  throw error;
}

// Test database connection on startup
pool.on('connect', () => {
  console.log('🗄️  Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't exit process in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

// Enhanced query function with better error handling for production
const query = async (text, params) => {
  const start = Date.now();
  let client;
  
  try {
    client = await pool.connect();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Executed query', { 
        text: text.substring(0, 100), 
        duration, 
        rows: res.rowCount 
      });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Database query error:', {
      message: error.message,
      query: text.substring(0, 100),
      params: params ? params.slice(0, 3) : []
    });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Enhanced transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('🗄️  Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
};

// Handle graceful shutdown
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

// Test connection immediately
(async () => {
  try {
    console.log('🔍 Testing database connection...');
    await query('SELECT 1 as test');
    console.log('✅ Database connection test successful');
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('🔧 Please check your DATABASE_URL or database configuration');
  }
})();

module.exports = {
  pool,
  query,
  transaction,
  closePool
};