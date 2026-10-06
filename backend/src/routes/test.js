/**
 * Test Routes
 * Allows testing connectors from the admin interface
 * Base: /api/admin/test
 */

import express from 'express';
import ConnectorService from '../models/ConnectorService.js';
import RequestLogService from '../models/RequestLogService.js';
import { getProvider } from '../providers/index.js';

const router = express.Router();

/**
 * POST /api/admin/test/:connector_id
 * Test a connector with sample input
 *
 * Body: {
 *   "test_input": { ... }  // Input matching the connector's input_schema
 * }
 *
 * Response includes:
 * - status (success/failed)
 * - data (response from AI)
 * - metadata (timing, tokens, cost)
 * - error (if failed)
 */
router.post('/:connector_id', async (req, res) => {
  const startTime = Date.now();
  const { test_input = {} } = req.body;
  const userIp = req.ip || req.connection.remoteAddress;

  try {
    // Step 1: Get connector
    const connectorResult = await ConnectorService.getById(req.params.connector_id);

    if (!connectorResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Connector not found',
      });
    }

    const connector = connectorResult.data;

    // Step 2: Get API key
    const apiKey = process.env[`${connector.provider.toUpperCase()}_API_KEY`];
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: `API key not configured for provider: ${connector.provider}`,
      });
    }

    // Step 3: Call provider
    const provider = getProvider(connector.provider, apiKey);

    const aiResult = await provider.callAPI(
      connector.system_prompt,
      test_input,
      connector.model
    );

    if (!aiResult.success) {
      const responseTime = Date.now() - startTime;

      // Log failed test
      await RequestLogService.log({
        connector_id: connector.id,
        status: 'failed',
        request_body: test_input,
        error_message: aiResult.error,
        response_time_ms: responseTime,
        provider: connector.provider,
        model: connector.model,
        user_ip: userIp,
      });

      return res.status(500).json({
        success: false,
        error: aiResult.error,
        test_status: 'failed',
      });
    }

    // Step 4: Validate response
    const validationResult = provider.validateResponse(
      aiResult.data,
      connector.output_schema
    );

    // Step 5: Extract usage
    const usage = provider.extractTokenUsage(aiResult.rawResponse);
    const estimatedCost = provider.estimateCost(usage);
    const responseTime = Date.now() - startTime;

    // Step 6: Log successful test
    await RequestLogService.log({
      connector_id: connector.id,
      status: validationResult.valid ? 'success' : 'failed',
      request_body: test_input,
      response_body: validationResult.data,
      error_message: validationResult.valid ? null : validationResult.error,
      response_time_ms: responseTime,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      total_tokens: usage.totalTokens,
      estimated_cost: estimatedCost,
      provider: connector.provider,
      model: connector.model,
      user_ip: userIp,
    });

    // Step 7: Return results
    res.json({
      success: true,
      test_status: validationResult.valid ? 'passed' : 'failed',
      data: validationResult.data,
      validation_error: validationResult.valid ? null : validationResult.error,
      metadata: {
        connector_id: connector.id,
        connector_name: connector.name,
        provider: connector.provider,
        model: connector.model,
        response_time_ms: responseTime,
        tokens_used: usage.totalTokens,
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
        estimated_cost: estimatedCost,
      },
    });
  } catch (error) {
    console.error('Error testing connector:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to test connector',
      test_status: 'error',
    });
  }
});

/**
 * POST /api/admin/quick-test/:connector_id
 * Quick test without logging
 * Useful for rapid iteration during development
 */
router.post('/quick/:connector_id', async (req, res) => {
  const startTime = Date.now();
  const { test_input = {} } = req.body;

  try {
    const connectorResult = await ConnectorService.getById(req.params.connector_id);

    if (!connectorResult.success) {
      return res.status(404).json(connectorResult);
    }

    const connector = connectorResult.data;
    const apiKey = process.env[`${connector.provider.toUpperCase()}_API_KEY`];

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: `API key not configured for provider: ${connector.provider}`,
      });
    }

    const provider = getProvider(connector.provider, apiKey);
    const aiResult = await provider.callAPI(
      connector.system_prompt,
      test_input,
      connector.model
    );

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: aiResult.error,
      });
    }

    const validationResult = provider.validateResponse(
      aiResult.data,
      connector.output_schema
    );

    const usage = provider.extractTokenUsage(aiResult.rawResponse);
    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      data: validationResult.data,
      response_time_ms: responseTime,
      tokens: usage.totalTokens,
    });
  } catch (error) {
    console.error('Error in quick test:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
