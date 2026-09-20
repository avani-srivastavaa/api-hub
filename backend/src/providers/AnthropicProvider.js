import BaseProvider from './BaseProvider.js';
import axios from 'axios';

export class AnthropicProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.name = 'Anthropic';
    this.baseURL = 'https://api.anthropic.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      timeout: 60000, // 60 second timeout
    });
  }

  /**
   * Call Anthropic Claude API
   */
  async callAPI(instructions, input, model) {
    try {
      const startTime = Date.now();
      
      // Build prompt from input
      const prompt = this._buildPrompt(instructions, input);

      // Handle image inputs if present
      let content = [];
      let hasImage = false;

      // Add text content
      if (prompt.trim()) {
        content.push({
          type: 'text',
          text: prompt,
        });
      }

      // Handle image inputs
      if (input.image_data) {
        hasImage = true;
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: input.image_type || 'image/jpeg',
            data: input.image_data,
          },
        });
      }

      const response = await this.client.post('/messages', {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: instructions,
        messages: [
          {
            role: 'user',
            content: content.length > 0 ? content : prompt,
          },
        ],
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: response.data.content[0].text,
        usage: response.data.usage,
        rawResponse: response.data,
        responseTimeMs: responseTime,
      };
    } catch (error) {
      console.error('Anthropic API error:', error.message);
      return {
        success: false,
        error: error.message || 'Anthropic API call failed',
        data: null,
        responseTimeMs: Date.now(),
      };
    }
  }

  /**
   * Validate response against schema
   */
  validateResponse(rawResponse, expectedSchema) {
    try {
      const parsed = this._parseJSON(rawResponse);
      
      if (!parsed) {
        return {
          valid: false,
          data: rawResponse,
          error: 'Could not parse JSON from response',
        };
      }

      // Basic schema validation - check if all required fields exist
      if (expectedSchema && expectedSchema.required) {
        for (const field of expectedSchema.required) {
          if (!(field in parsed)) {
            return {
              valid: false,
              data: parsed,
              error: `Missing required field: ${field}`,
            };
          }
        }
      }

      return {
        valid: true,
        data: parsed,
        error: null,
      };
    } catch (error) {
      return {
        valid: false,
        data: null,
        error: error.message,
      };
    }
  }

  /**
   * Extract token usage from Anthropic response
   */
  extractTokenUsage(response) {
    return {
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
    };
  }

  /**
   * Estimate cost for Anthropic Claude 3.5 Sonnet
   * Pricing: Input $0.003/1K, Output $0.015/1K
   */
  estimateCost(usage) {
    const inputCost = (usage.inputTokens || 0) * (0.003 / 1000);
    const outputCost = (usage.outputTokens || 0) * (0.015 / 1000);
    return parseFloat((inputCost + outputCost).toFixed(6));
  }

  /**
   * Get available Claude models
   */
  async getAvailableModels() {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
    ];
  }
}

export default AnthropicProvider;
