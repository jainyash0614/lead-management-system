const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database setup endpoint (for manual triggering)
app.post('/api/setup-database', async (req, res) => {
  try {
    console.log('Manual database setup triggered...');
    
    const { execSync } = require('child_process');
    
    console.log('Running database migration...');
    execSync('npm run db:migrate', { stdio: 'inherit' });
    
    console.log('Running database seeding...');
    execSync('npm run db:seed', { stdio: 'inherit' });
    
    console.log('Database setup completed successfully!');
    res.status(200).json({ 
      message: 'Database setup completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database setup failed:', error.message);
    res.status(500).json({ 
      error: 'Database setup failed',
      details: error.message
    });
  }
});

// Auto-setup database in production
if (process.env.NODE_ENV === 'production') {
  const setupDatabase = async () => {
    try {
      console.log('Setting up database in production...');
      
      // Import and run migration
      const { execSync } = require('child_process');
      console.log('Running database migration...');
      execSync('npm run db:migrate', { stdio: 'inherit' });
      
      console.log('Running database seeding...');
      execSync('npm run db:seed', { stdio: 'inherit' });
      
      console.log('Database setup completed successfully!');
    } catch (error) {
      console.error('Database setup failed:', error.message);
      // Don't exit - let the server continue running
    }
  };
  
  // Run database setup after a short delay
  setTimeout(setupDatabase, 5000);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', authenticateToken, leadRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
