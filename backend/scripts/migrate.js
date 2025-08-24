require('dotenv').config();
const pool = require('../config/database');

const createTables = async () => {
  try {
    console.log('Starting database migration...');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Test connection first
    console.log('Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('Connection test successful');

    // Create users table
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');

    // Create leads table
    console.log('Creating leads table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        company VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        source VARCHAR(50) CHECK (source IN ('website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other')),
        status VARCHAR(50) CHECK (status IN ('new', 'contacted', 'qualified', 'lost', 'won')),
        score INTEGER CHECK (score >= 0 AND score <= 100),
        lead_value DECIMAL(10,2) CHECK (lead_value >= 0),
        last_activity_at TIMESTAMP,
        is_qualified BOOLEAN DEFAULT FALSE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Leads table created');

    // Create indexes for better performance
    console.log('Creating indexes...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)');
    console.log('Indexes created');

    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

createTables();
