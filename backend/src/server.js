import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import { getAvailableProviders } from './providers/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH & STATUS ROUTES
// ============================================

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'API Hub Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Database connection test
 * GET /api/db-test
 */
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as timestamp, version() as database');
    res.json({
      status: 'connected',
      database: result.rows[0],
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      environment: process.env.NODE_ENV || 'development',
    });
  }
});

/**
 * System information
 * GET /api/system
 */
app.get('/api/system', async (req, res) => {
  try {
    // Get provider info
    const providers = getAvailableProviders();

    // Get database stats
    const connectorStats = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = \'active\' THEN 1 ELSE 0 END) as active FROM connectors'
    );

    res.json({
      status: 'ok',
      service: {
        name: 'Universal AI API Hub',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      providers: {
        available: providers,
        count: providers.length,
      },
      database: {
        status: 'connected',
        connectors: {
          total: parseInt(connectorStats.rows[0].total) || 0,
          active: parseInt(connectorStats.rows[0].active) || 0,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
});

// ============================================
// PLACEHOLDER ROUTES (To be implemented in Phase 2)
// ============================================

/**
 * Admin API routes (CRUD connectors)
 * POST /api/admin/connectors
 * GET /api/admin/connectors
 * GET /api/admin/connectors/:id
 * PUT /api/admin/connectors/:id
 * DELETE /api/admin/connectors/:id
 */
app.get('/api/admin/connectors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, provider, model, status, created_at FROM connectors ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/**
 * Get connector stats
 * GET /api/stats
 */
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM connector_stats ORDER BY total_requests DESC');
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /health',
      'GET /api/db-test',
      'GET /api/system',
      'GET /api/admin/connectors',
      'GET /api/stats',
    ],
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const server = app.listen(PORT, () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     🚀 Universal AI API Hub Backend Started 🚀         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n📍 Server running on:  http://localhost:${PORT}`);
  console.log(`🌍 Environment:        ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📊 Available endpoints:`);
  console.log(`   • Health check:     http://localhost:${PORT}/health`);
  console.log(`   • DB Test:          http://localhost:${PORT}/api/db-test`);
  console.log(`   • System Info:      http://localhost:${PORT}/api/system`);
  console.log(`   • Connectors:       http://localhost:${PORT}/api/admin/connectors`);
  console.log(`   • Statistics:       http://localhost:${PORT}/api/stats`);
  console.log(`\n💡 Providers available: ${getAvailableProviders().join(', ')}`);
  console.log(`\n⏳ Waiting for requests...\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    pool.end(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});

export default app;
