require('dotenv').config();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('Starting database seeding...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Test connection first
    console.log('Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('Connection test successful');

    // Create test user (or get existing one)
    console.log('Checking for existing test user...');
    let userId;
    
    // Check if test user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['test@example.com']
    );
    
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      console.log('Using existing test user: test@example.com / test123');
      
      // Clear existing leads for this user to avoid duplicates
      console.log('Clearing existing leads for test user...');
      await pool.query('DELETE FROM leads WHERE user_id = $1', [userId]);
      console.log('Existing leads cleared');
    } else {
      console.log('Creating new test user...');
      const hashedPassword = await bcrypt.hash('test123', 12);
      const userResult = await pool.query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
        ['test@example.com', hashedPassword, 'Test', 'User']
      );
      userId = userResult.rows[0].id;
      console.log('Test user created: test@example.com / test123');
    }

    // Sample data for leads
    const companies = [
      'TechCorp', 'InnovateLabs', 'Digital Solutions', 'Future Systems', 'SmartTech',
      'Global Innovations', 'NextGen Corp', 'Elite Solutions', 'Prime Technologies', 'Apex Systems'
    ];

    const cities = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
      'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus'
    ];

    const states = [
      'NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA'
    ];

    const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
    const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];

    // Generate 100+ leads
    console.log('Generating sample leads...');
    const leads = [];
    for (let i = 1; i <= 120; i++) {
      const firstName = `Lead${i}`;
      const lastName = `User${i}`;
      const email = `lead${i}@example.com`;
      const company = companies[Math.floor(Math.random() * companies.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const score = Math.floor(Math.random() * 101);
      const leadValue = Math.floor(Math.random() * 10000) + 100;
      const isQualified = Math.random() > 0.7;
      const lastActivity = Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null;

      leads.push([
        firstName, lastName, email, `+1-555-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        company, city, state, source, status, score, leadValue, userId
      ]);
    }

    // Insert leads in batches
    console.log('Inserting leads into database...');
    const batchSize = 20;
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      const placeholders = batch.map((_, batchIndex) => {
        const start = batchIndex * 12;
        return `($${start + 1}, $${start + 2}, $${start + 3}, $${start + 4}, $${start + 5}, $${start + 6}, $${start + 7}, $${start + 8}, $${start + 9}, $${start + 10}, $${start + 11}, $${start + 12})`;
      }).join(', ');

      const values = batch.flat();
      await pool.query(
        `INSERT INTO leads (
          first_name, last_name, email, phone, company, city, state,
          source, status, score, lead_value, user_id
        ) VALUES ${placeholders}`,
        values
      );
    }

    console.log(`${leads.length} leads created successfully`);
    console.log('Database seeding completed!');
    console.log('\nTest Account:');
    console.log('Email: test@example.com');
    console.log('Password: test123');
    console.log(`Total Leads: ${leads.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
