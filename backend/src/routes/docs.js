/**
 * Documentation Routes
 * Serves auto-generated API documentation
 * Base: /api/docs
 */

import express from 'express';
import ConnectorService from '../models/ConnectorService.js';
import DocumentationGenerator from '../utils/DocumentationGenerator.js';

const router = express.Router();

/**
 * GET /api/docs
 * List all available documentation
 */
router.get('/', async (req, res) => {
  try {
    const result = await ConnectorService.list({ status: 'active' });

    if (!result.success) {
      return res.status(400).json(result);
    }

    const docs = result.data.map(connector => ({
      id: connector.id,
      name: connector.name,
      description: connector.description,
      endpoint: connector.endpoint_path,
      provider: connector.provider,
      model: connector.model,
      doc_url: `/api/docs/${connector.id}`,
      html_url: `/api/docs/${connector.id}/html`,
    }));

    res.json({
      success: true,
      data: docs,
      count: docs.length,
    });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documentation',
    });
  }
});

/**
 * GET /api/docs/:id
 * Get JSON documentation for a connector
 */
router.get('/:id', async (req, res) => {
  try {
    const connectorResult = await ConnectorService.getById(req.params.id);

    if (!connectorResult.success) {
      return res.status(404).json(connectorResult);
    }

    const apiBaseUrl = `${req.protocol}://${req.get('host')}`;
    const doc = DocumentationGenerator.generateConnectorDoc(
      connectorResult.data,
      apiBaseUrl
    );

    res.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error('Error generating documentation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate documentation',
    });
  }
});

/**
 * GET /api/docs/:id/html
 * Get HTML documentation for a connector
 */
router.get('/:id/html', async (req, res) => {
  try {
    const connectorResult = await ConnectorService.getById(req.params.id);

    if (!connectorResult.success) {
      return res.status(404).json(connectorResult);
    }

    const apiBaseUrl = `${req.protocol}://${req.get('host')}`;
    const html = DocumentationGenerator.generateHTMLDoc(
      connectorResult.data,
      apiBaseUrl
    );

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error generating HTML documentation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate documentation',
    });
  }
});

export default router;
