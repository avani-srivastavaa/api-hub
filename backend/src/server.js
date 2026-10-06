import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import { getAvailableProviders } from './providers/index.js';

// Import routes
import adminRoutes from './routes/admin.js';
import apiRoutes from './routes/api.js';
import docsRoutes from './routes/docs.js';
import testRoutes from './routes/test.js';

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
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
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
        name: 'Universal AI API Connector & API Hub',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      providers: {
        available: providers,
        count: providers.length,
        configured: Object.fromEntries(
          providers.map((provider) => [
            provider,
            Boolean(process.env[`${provider.toUpperCase()}_API_KEY`]),
          ])
        ),
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
// API ROUTES
// ============================================

/**
 * Admin routes: /api/admin/*
 * CRUD operations for connectors
 */
app.use('/api/admin', adminRoutes);

/**
 * Connector test routes: /api/admin/test/*
 * Test connectors from admin interface
 */
app.use('/api/admin/test', testRoutes);

/**
 * Documentation routes: /api/docs/*
 * Auto-generated API documentation
 */
app.use('/api/docs', docsRoutes);

/**
 * Dynamic API routes: /api/connectors/*
 * Generated connector endpoints
 */
app.use('/api/connectors', apiRoutes);

// ============================================
// DEFAULT ROUTES
// ============================================

/**
 * API root - list all available endpoints
 * GET /api
 */
app.get('/api', (req, res) => {
  res.json({
    success: true,
    service: 'Universal AI API Hub',
    version: '1.0.0',
    endpoints: {
      system: {
        'GET /health': 'Health check',
        'GET /api/db-test': 'Database connection test',
        'GET /api/system': 'System information',
      },
      admin: {
        'POST /api/admin/connectors': 'Create connector',
        'GET /api/admin/connectors': 'List all connectors',
        'GET /api/admin/connectors/:id': 'Get connector details',
        'PUT /api/admin/connectors/:id': 'Update connector',
        'DELETE /api/admin/connectors/:id': 'Delete connector',
        'POST /api/admin/connectors/:id/disable': 'Disable connector',
        'POST /api/admin/connectors/:id/enable': 'Enable connector',
        'GET /api/admin/connectors/:id/stats': 'Get connector statistics',
        'GET /api/admin/connectors/:id/logs': 'Get connector request logs',
        'GET /api/admin/stats': 'Get all statistics',
      },
      testing: {
        'POST /api/admin/test/:connector_id': 'Test a connector',
        'POST /api/admin/test/quick/:connector_id': 'Quick test (no logging)',
      },
      documentation: {
        'GET /api/docs': 'List all documentation',
        'GET /api/docs/:id': 'Get JSON documentation',
        'GET /api/docs/:id/html': 'Get HTML documentation',
      },
      dynamic: {
        'POST /api/connectors/:endpoint': 'Call generated connector endpoint',
      },
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
    hint: 'Visit GET /api to see all available endpoints',
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
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
