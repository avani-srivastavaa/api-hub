/**
 * Dynamic API Routes
 * Handles requests to generated connector endpoints
 * Base: /api/connectors
 */

import express from 'express';
import ConnectorService from '../models/ConnectorService.js';
import RequestLogService from '../models/RequestLogService.js';
import { getProvider } from '../providers/index.js';

const router = express.Router();

/**
 * Dynamic route handler
 * POST /api/connectors/:endpoint
 *
 * This is a catch-all route that:
 * 1. Finds the connector by endpoint path
 * 2. Validates the request against input_schema
 * 3. Calls the appropriate AI provider
 * 4. Validates response against output_schema
 * 5. Logs the request
 * 6. Returns structured response
 */
router.post('/:endpoint', async (req, res) => {
  const startTime = Date.now();
  const endpoint = `/api/connectors/${req.params.endpoint}`;
  const userIp = req.ip || req.connection.remoteAddress;

  let logId = null;
  let connector = null;

  try {
    // Step 1: Find connector by endpoint path
    const connectorResult = await ConnectorService.getByEndpoint(endpoint);

    if (!connectorResult.success) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found',
      });
    }

    connector = connectorResult.data;

    // Step 2: Create initial log entry
    const logResult = await RequestLogService.log({
      connector_id: connector.id,
      status: 'pending',
      request_body: req.body,
      provider: connector.provider,
      model: connector.model,
      user_ip: userIp,
    });

    if (logResult.success) {
      logId = logResult.id;
    }

    // Step 3: Validate input against input_schema
    const validationResult = validateInput(req.body, connector.input_schema);
    if (!validationResult.valid) {
      await RequestLogService.updateStatus(
        logId,
        'failed',
        null,
        `Validation error: ${validationResult.error}`
      );

      return res.status(400).json({
        success: false,
        error: 'Input validation failed',
        details: validationResult.error,
      });
    }

    // Step 4: Get API key for provider
    const apiKey = process.env[`${connector.provider.toUpperCase()}_API_KEY`];
    if (!apiKey) {
      await RequestLogService.updateStatus(
        logId,
        'failed',
        null,
        `API key not configured for provider: ${connector.provider}`
      );

      return res.status(500).json({
        success: false,
        error: 'Provider not configured',
      });
    }

    // Step 5: Call AI provider
    const provider = getProvider(connector.provider, apiKey);
    const aiResult = await provider.callAPI(
      connector.system_prompt,
      req.body,
      connector.model
    );

    if (!aiResult.success) {
      const responseTime = Date.now() - startTime;
      await RequestLogService.updateStatus(
        logId,
        'failed',
        { error: aiResult.error },
        aiResult.error
      );

      // Update with response time
      await RequestLogService.log({
        connector_id: connector.id,
        status: 'failed',
        error_message: aiResult.error,
        response_time_ms: responseTime,
        provider: connector.provider,
        model: connector.model,
        user_ip: userIp,
      });

      return res.status(500).json({
        success: false,
        error: 'AI provider error',
        details: aiResult.error,
      });
    }

    // Step 6: Validate response against output_schema
    const validationResponse = provider.validateResponse(
      aiResult.data,
      connector.output_schema
    );

    if (!validationResponse.valid) {
      const responseTime = Date.now() - startTime;
      await RequestLogService.updateStatus(
        logId,
        'failed',
        { error: validationResponse.error },
        `Output validation failed: ${validationResponse.error}`
      );

      return res.status(500).json({
        success: false,
        error: 'Response validation failed',
        details: validationResponse.error,
      });
    }

    // Step 7: Extract token usage and estimate cost
    const usage = provider.extractTokenUsage(aiResult.rawResponse);
    const estimatedCost = provider.estimateCost(usage);

    // Step 8: Log successful request
    const responseTime = Date.now() - startTime;
    await RequestLogService.updateStatus(
      logId,
      'success',
      validationResponse.data
    );

    await RequestLogService.log({
      connector_id: connector.id,
      status: 'success',
      request_body: req.body,
      response_body: validationResponse.data,
      response_time_ms: responseTime,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      total_tokens: usage.totalTokens,
      estimated_cost: estimatedCost,
      provider: connector.provider,
      model: connector.model,
      user_ip: userIp,
    });

    // Step 9: Return response
    res.json({
      success: true,
      data: validationResponse.data,
      metadata: {
        connector_id: connector.id,
        connector_name: connector.name,
        provider: connector.provider,
        model: connector.model,
        response_time_ms: responseTime,
        tokens_used: usage.totalTokens,
        estimated_cost: estimatedCost,
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);

    // Log error
    if (logId) {
      await RequestLogService.updateStatus(
        logId,
        'failed',
        null,
        error.message
      );
    } else if (connector) {
      const responseTime = Date.now() - startTime;
      await RequestLogService.log({
        connector_id: connector.id,
        status: 'failed',
        error_message: error.message,
        response_time_ms: responseTime,
        provider: connector.provider,
        model: connector.model,
        user_ip: userIp,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Validate input against schema
 * @param {object} input - Input data
 * @param {array} schema - Input schema definition
 * @returns {object} { valid, error }
 */
function validateInput(input, schema) {
  if (!Array.isArray(schema) || schema.length === 0) {
    return { valid: true };
  }

  for (const field of schema) {
    // Check required fields
    if (field.required && !(field.name in input)) {
      return {
        valid: false,
        error: `Missing required field: ${field.name}`,
      };
    }

    // Validate field type if present
    if (field.name in input && field.type) {
      const value = input[field.name];

      switch (field.type.toLowerCase()) {
        case 'text':
        case 'string':
          if (typeof value !== 'string') {
            return {
              valid: false,
              error: `Field ${field.name} must be a string`,
            };
          }
          break;

        case 'number':
          if (typeof value !== 'number') {
            return {
              valid: false,
              error: `Field ${field.name} must be a number`,
            };
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            return {
              valid: false,
              error: `Field ${field.name} must be a boolean`,
            };
          }
          break;

        case 'image':
        case 'file':
          // Expect base64 data
          if (typeof value !== 'string') {
            return {
              valid: false,
              error: `Field ${field.name} must be a string (base64)`,
            };
          }
          break;

        case 'json':
          if (typeof value !== 'object') {
            return {
              valid: false,
              error: `Field ${field.name} must be a JSON object`,
            };
          }
          break;
      }
    }
  }

  return { valid: true };
}

export default router;
