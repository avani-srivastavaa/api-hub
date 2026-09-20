/**
 * Abstract base class for AI providers
 * All providers must implement these methods
 *
 * Example: new AnthropicProvider(apiKey).callAPI(...)
 */
export class BaseProvider {
  constructor(apiKey) {
    if (new.target === BaseProvider) {
      throw new TypeError('Cannot instantiate abstract class BaseProvider directly');
    }
    this.apiKey = apiKey;
    this.name = 'Unknown';
  }

  /**
   * Call the AI provider with instructions and input
   * @param {string} instructions - System prompt/instructions
   * @param {object} input - User input data
   * @param {string} model - Model identifier
   * @returns {Promise<object>} { success, data, error, usage, rawResponse }
   */
  async callAPI(instructions, input, model) {
    throw new Error(`${this.name}.callAPI() not implemented`);
  }

  /**
   * Parse and validate response against expected schema
   * @param {string} rawResponse - Raw text response from API
   * @param {object} expectedSchema - JSON schema for expected output
   * @returns {object} Parsed and validated response
   */
  validateResponse(rawResponse, expectedSchema) {
    throw new Error(`${this.name}.validateResponse() not implemented`);
  }

  /**
   * Extract token usage from response
   * @param {object} response - API response object
   * @returns {object} { inputTokens, outputTokens, totalTokens }
   */
  extractTokenUsage(response) {
    throw new Error(`${this.name}.extractTokenUsage() not implemented`);
  }

  /**
   * Estimate cost based on tokens
   * @param {object} usage - Token usage object
   * @returns {number} Estimated cost in USD
   */
  estimateCost(usage) {
    throw new Error(`${this.name}.estimateCost() not implemented`);
  }

  /**
   * Get available models for this provider
   * @returns {Promise<array>} List of available model identifiers
   */
  async getAvailableModels() {
    throw new Error(`${this.name}.getAvailableModels() not implemented`);
  }

  /**
   * Helper: Build prompt from instructions and input
   * @protected
   */
  _buildPrompt(instructions, input) {
    let prompt = '';
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'object') {
        prompt += `${key}:\n${JSON.stringify(value, null, 2)}\n\n`;
      } else if (typeof value === 'string' && value.startsWith('data:image')) {
        // Skip base64 images in text prompt
        prompt += `${key}: [IMAGE_DATA]\n`;
      } else {
        prompt += `${key}: ${value}\n`;
      }
    }
    return prompt;
  }

  /**
   * Helper: Try to parse JSON from response
   * @protected
   */
  _parseJSON(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      // Try to extract JSON from text if it contains it
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }
}

export default BaseProvider;
