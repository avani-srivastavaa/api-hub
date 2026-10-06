/**
 * Validation Middleware
 * Validates incoming requests against defined schemas
 */

/**
 * Validate connector creation/update request
 */
export function validateConnector(req, res, next) {
  const { name, provider, model, system_prompt } = req.body;

  // Validate required fields
  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Field "name" is required and must be a string',
    });
  }

  if (!provider || typeof provider !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Field "provider" is required and must be a string',
    });
  }

  if (!model || typeof model !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Field "model" is required and must be a string',
    });
  }

  if (!system_prompt || typeof system_prompt !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Field "system_prompt" is required and must be a string',
    });
  }

  // Validate provider value
  const validProviders = ['anthropic', 'openai', 'gemini', 'groq'];
  if (!validProviders.includes(provider.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: `Provider must be one of: ${validProviders.join(', ')}`,
    });
  }

  // Validate name length
  if (name.length < 3 || name.length > 255) {
    return res.status(400).json({
      success: false,
      error: 'Name must be between 3 and 255 characters',
    });
  }

  // Validate system_prompt length
  if (system_prompt.length < 10 || system_prompt.length > 5000) {
    return res.status(400).json({
      success: false,
      error: 'System prompt must be between 10 and 5000 characters',
    });
  }

  // Validate input_schema if present
  if (req.body.input_schema) {
    if (!Array.isArray(req.body.input_schema)) {
      return res.status(400).json({
        success: false,
        error: 'Field "input_schema" must be an array',
      });
    }

    for (const field of req.body.input_schema) {
      if (!field.name || typeof field.name !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Each input field must have a "name" property',
        });
      }

      if (!field.type || typeof field.type !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Each input field must have a "type" property',
        });
      }

      const validTypes = ['text', 'number', 'boolean', 'image', 'file', 'json'];
      if (!validTypes.includes(field.type.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Field type must be one of: ${validTypes.join(', ')}`,
        });
      }
    }
  }

  // Validate output_schema if present
  if (req.body.output_schema) {
    if (typeof req.body.output_schema !== 'object' || Array.isArray(req.body.output_schema)) {
      return res.status(400).json({
        success: false,
        error: 'Field "output_schema" must be an object',
      });
    }
  }

  next();
}

/**
 * Validate pagination params
 */
export function validatePagination(req, res, next) {
  const { limit = 50, offset = 0 } = req.query;

  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be a number between 1 and 1000',
    });
  }

  if (isNaN(offsetNum) || offsetNum < 0) {
    return res.status(400).json({
      success: false,
      error: 'Offset must be a non-negative number',
    });
  }

  req.query.limit = limitNum;
  req.query.offset = offsetNum;
  next();
}

/**
 * Request size validator
 */
export function validateRequestSize(maxSizeMb = 50) {
  return (req, res, next) => {
    const maxBytes = maxSizeMb * 1024 * 1024;

    if (req.headers['content-length'] > maxBytes) {
      return res.status(413).json({
        success: false,
        error: `Request body too large (max ${maxSizeMb}MB)`,
      });
    }

    next();
  };
}

/**
 * JSON format validator
 */
export function validateJSON(req, res, next) {
  if (req.is('application/json')) {
    next();
  } else {
    return res.status(400).json({
      success: false,
      error: 'Content-Type must be application/json',
    });
  }
}

export default {
  validateConnector,
  validatePagination,
  validateRequestSize,
  validateJSON,
};
