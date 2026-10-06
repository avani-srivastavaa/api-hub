/**
 * Admin Routes
 * Handles connector management (CRUD operations)
 * Base: /api/admin
 */

import express from 'express';
import ConnectorService from '../models/ConnectorService.js';
import RequestLogService from '../models/RequestLogService.js';
import { validateConnector } from '../middleware/validation.js';

const router = express.Router();

// ============================================
// POST - Create Connector
// ============================================
/**
 * POST /api/admin/connectors
 * Create a new connector
 *
 * Body:
 * {
 *   "name": "Card Scanner",
 *   "description": "Extracts contact from business card image",
 *   "provider": "anthropic",
 *   "model": "claude-3-5-sonnet-20241022",
 *   "system_prompt": "You are a business card scanner...",
 *   "input_schema": [
 *     {
 *       "name": "image_data",
 *       "type": "image",
 *       "required": true,
 *       "description": "Business card image"
 *     }
 *   ],
 *   "output_schema": {
 *     "type": "object",
 *     "properties": {
 *       "name": { "type": "string" },
 *       "company": { "type": "string" },
 *       "email": { "type": "string" }
 *     },
 *     "required": ["name", "company", "email"]
 *   }
 * }
 */
router.post('/connectors', validateConnector, async (req, res) => {
  try {
    const result = await ConnectorService.create(req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error('Error creating connector:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create connector',
    });
  }
});

// ============================================
// GET - List All Connectors
// ============================================
/**
 * GET /api/admin/connectors
 * List all connectors with optional filtering
 *
 * Query params:
 * - status=active|disabled
 * - provider=anthropic|openai|gemini
 */
router.get('/connectors', async (req, res) => {
  try {
    const { status, provider } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (provider) filters.provider = provider;

    const result = await ConnectorService.list(filters);

    res.json(result);
  } catch (error) {
    console.error('Error listing connectors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list connectors',
    });
  }
});

// ============================================
// GET - Get Single Connector
// ============================================
/**
 * GET /api/admin/connectors/:id
 * Get a specific connector by ID
 */
router.get('/connectors/:id', async (req, res) => {
  try {
    const result = await ConnectorService.getById(req.params.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching connector:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch connector',
    });
  }
});

// ============================================
// PUT - Update Connector
// ============================================
/**
 * PUT /api/admin/connectors/:id
 * Update a connector (partial update supported)
 *
 * Body: Any fields from the connector schema
 */
router.put('/connectors/:id', async (req, res) => {
  try {
    const result = await ConnectorService.update(req.params.id, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error('Error updating connector:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update connector',
    });
  }
});

// ============================================
// DELETE - Delete Connector
// ============================================
/**
 * DELETE /api/admin/connectors/:id
 * Delete a connector permanently
 */
router.delete('/connectors/:id', async (req, res) => {
  try {
    const result = await ConnectorService.delete(req.params.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error deleting connector:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete connector',
    });
  }
});

// ============================================
// POST - Disable Connector
// ============================================
/**
 * POST /api/admin/connectors/:id/disable
 * Disable a connector (soft delete)
 */
router.post('/connectors/:id/disable', async (req, res) => {
  try {
    const result = await ConnectorService.disable(req.params.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error disabling connector:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable connector',
    });
  }
});

// ============================================
// POST - Enable Connector
// ============================================
/**
 * POST /api/admin/connectors/:id/enable
 * Enable a disabled connector
 */
router.post('/connectors/:id/enable', async (req, res) => {
  try {
    const result = await ConnectorService.enable(req.params.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error enabling connector:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable connector',
    });
  }
});

// ============================================
// GET - Connector Statistics
// ============================================
/**
 * GET /api/admin/connectors/:id/stats
 * Get statistics for a specific connector
 */
router.get('/connectors/:id/stats', async (req, res) => {
  try {
    const result = await RequestLogService.getConnectorStats(req.params.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

// ============================================
// GET - Connector Request Logs
// ============================================
/**
 * GET /api/admin/connectors/:id/logs
 * Get request logs for a connector
 *
 * Query params:
 * - limit=50 (default)
 * - offset=0 (default)
 */
router.get('/connectors/:id/logs', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await RequestLogService.getConnectorLogs(
      req.params.id,
      parseInt(limit),
      parseInt(offset)
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logs',
    });
  }
});

// ============================================
// GET - All Statistics
// ============================================
/**
 * GET /api/admin/stats
 * Get statistics for all connectors
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await RequestLogService.getAllStats();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching all stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

export default router;
