const express = require('express');
const { body, validationResult, query } = require('express-validator');
const pool = require('../config/database');

const router = express.Router();

// Validation middleware
const validateLead = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('source').isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']).withMessage('Invalid source'),
  body('status').isIn(['new', 'contacted', 'qualified', 'lost', 'won']).withMessage('Invalid status'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('lead_value').isFloat({ min: 0 }).withMessage('Lead value must be a positive number'),
  body('is_qualified').optional().isBoolean().withMessage('is_qualified must be a boolean')
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Create lead
router.post('/', validateLead, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const {
      first_name, last_name, email, phone, company, city, state,
      source, status, score, lead_value, is_qualified
    } = req.body;

    // Check if email already exists
    const existingLead = await pool.query(
      'SELECT id FROM leads WHERE email = $1',
      [email]
    );

    if (existingLead.rows.length > 0) {
      return res.status(409).json({ error: 'Lead with this email already exists' });
    }

    // Create lead
    const result = await pool.query(
      `INSERT INTO leads (
        first_name, last_name, email, phone, company, city, state,
        source, status, score, lead_value, is_qualified, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        first_name, last_name, email, phone, company, city, state,
        source, status, score, lead_value, is_qualified || false, req.user.id
      ]
    );

    res.status(201).json({
      message: 'Lead created successfully',
      lead: result.rows[0]
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leads with pagination and filters
router.get('/', validatePagination, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Build WHERE clause for filters
    let whereClause = 'WHERE user_id = $1';
    let params = [req.user.id];
    let paramCount = 1;

    // Apply filters
    const filters = req.query;
    
    if (filters.email) {
      paramCount++;
      whereClause += ` AND email ILIKE $${paramCount}`;
      params.push(`%${filters.email}%`);
    }

    if (filters.company) {
      paramCount++;
      whereClause += ` AND company ILIKE $${paramCount}`;
      params.push(`%${filters.company}%`);
    }

    if (filters.city) {
      paramCount++;
      whereClause += ` AND city ILIKE $${paramCount}`;
      params.push(`%${filters.city}%`);
    }

    if (filters.status) {
      if (filters.status.includes(',')) {
        // Multiple statuses (in operator)
        const statuses = filters.status.split(',').map(s => s.trim()).filter(s => s);
        if (statuses.length > 0) {
          paramCount++;
          const placeholders = statuses.map((_, i) => `$${paramCount + i}`).join(', ');
          whereClause += ` AND status IN (${placeholders})`;
          params.push(...statuses);
          paramCount += statuses.length - 1;
        }
      } else {
        // Single status (equals operator)
        paramCount++;
        whereClause += ` AND status = $${paramCount}`;
        params.push(filters.status);
      }
    }

    if (filters.source) {
      if (filters.source.includes(',')) {
        // Multiple sources (in operator)
        const sources = filters.source.split(',').map(s => s.trim()).filter(s => s);
        if (sources.length > 0) {
          paramCount++;
          const placeholders = sources.map((_, i) => `$${paramCount + i}`).join(', ');
          whereClause += ` AND source IN (${placeholders})`;
          params.push(...sources);
          paramCount += sources.length - 1;
        }
      } else {
        // Single source (equals operator)
        paramCount++;
        whereClause += ` AND source = $${paramCount}`;
        params.push(filters.source);
      }
    }

    if (filters.score_min !== undefined && filters.score_min !== '') {
      const scoreMin = parseInt(filters.score_min);
      if (!isNaN(scoreMin)) {
        paramCount++;
        whereClause += ` AND score >= $${paramCount}`;
        params.push(scoreMin);
      }
    }

    if (filters.score_max !== undefined && filters.score_max !== '') {
      const scoreMax = parseInt(filters.score_max);
      if (!isNaN(scoreMax)) {
        paramCount++;
        whereClause += ` AND score <= $${paramCount}`;
        params.push(scoreMax);
      }
    }

    if (filters.lead_value_min !== undefined && filters.lead_value_min !== '') {
      const leadValueMin = parseFloat(filters.lead_value_min);
      if (!isNaN(leadValueMin)) {
        paramCount++;
        whereClause += ` AND lead_value >= $${paramCount}`;
        params.push(leadValueMin);
      }
    }

    if (filters.lead_value_max !== undefined && filters.lead_value_max !== '') {
      const leadValueMax = parseFloat(filters.lead_value_max);
      if (!isNaN(leadValueMax)) {
        paramCount++;
        whereClause += ` AND lead_value <= $${paramCount}`;
        params.push(leadValueMax);
      }
    }

    if (filters.is_qualified !== undefined && filters.is_qualified !== '') {
      paramCount++;
      whereClause += ` AND is_qualified = $${paramCount}`;
      params.push(filters.is_qualified === 'true');
    }

    // Date filtering for created_at
    if (filters.created_at_on && filters.created_at_on !== '') {
      paramCount++;
      whereClause += ` AND DATE(created_at) = $${paramCount}`;
      params.push(filters.created_at_on);
    }

    if (filters.created_at_before && filters.created_at_before !== '') {
      paramCount++;
      whereClause += ` AND created_at < $${paramCount}`;
      params.push(filters.created_at_before);
    }

    if (filters.created_at_after && filters.created_at_after !== '') {
      paramCount++;
      whereClause += ` AND created_at > $${paramCount}`;
      params.push(filters.created_at_after);
    }

    if (filters.created_at_from && filters.created_at_from !== '') {
      paramCount++;
      whereClause += ` AND created_at >= $${paramCount}`;
      params.push(filters.created_at_from);
    }

    if (filters.created_at_to && filters.created_at_to !== '') {
      paramCount++;
      whereClause += ` AND created_at <= $${paramCount}`;
      params.push(filters.created_at_to);
    }

    // Date filtering for last_activity_at
    if (filters.last_activity_on && filters.last_activity_on !== '') {
      paramCount++;
      whereClause += ` AND DATE(last_activity_at) = $${paramCount}`;
      params.push(filters.last_activity_on);
    }

    if (filters.last_activity_before && filters.last_activity_before !== '') {
      paramCount++;
      whereClause += ` AND last_activity_at < $${paramCount}`;
      params.push(filters.last_activity_before);
    }

    if (filters.last_activity_after && filters.last_activity_after !== '') {
      paramCount++;
      whereClause += ` AND last_activity_at > $${paramCount}`;
      params.push(filters.last_activity_after);
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM leads ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get leads with pagination
    const leadsResult = await pool.query(
      `SELECT * FROM leads ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: leadsResult.rows,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM leads WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.status(200).json({
      lead: result.rows[0]
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update lead
router.put('/:id', validateLead, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const {
      first_name, last_name, email, phone, company, city, state,
      source, status, score, lead_value, is_qualified
    } = req.body;

    // Check if lead exists and belongs to user
    const existingLead = await pool.query(
      'SELECT id FROM leads WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existingLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check if email already exists for other leads
    const emailCheck = await pool.query(
      'SELECT id FROM leads WHERE email = $1 AND id != $2 AND user_id = $3',
      [email, id, req.user.id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Lead with this email already exists' });
    }

    // Update lead
    const result = await pool.query(
      `UPDATE leads SET 
        first_name = $1, last_name = $2, email = $3, phone = $4, company = $5,
        city = $6, state = $7, source = $8, status = $9, score = $10,
        lead_value = $11, is_qualified = $12, updated_at = NOW()
       WHERE id = $13 AND user_id = $14
       RETURNING *`,
      [
        first_name, last_name, email, phone, company, city, state,
        source, status, score, lead_value, is_qualified || false, id, req.user.id
      ]
    );

    res.status(200).json({
      message: 'Lead updated successfully',
      lead: result.rows[0]
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lead exists and belongs to user
    const existingLead = await pool.query(
      'SELECT id FROM leads WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existingLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Delete lead
    await pool.query(
      'DELETE FROM leads WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.status(200).json({
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
