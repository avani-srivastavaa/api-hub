import BaseProvider from './BaseProvider.js';
import axios from 'axios';

export class OpenAIProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.name = 'OpenAI';
    this.baseURL = 'https://api.openai.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  /**
   * Call OpenAI GPT API
   */
  async callAPI(instructions, input, model) {
    try {
      const startTime = Date.now();
      
      const prompt = this._buildPrompt(instructions, input);

      // Build message content with image support
      let userContent = [];

      // Add text
      if (prompt.trim()) {
        userContent.push({
          type: 'text',
          text: prompt,
        });
      }

      // Handle image inputs (GPT-4 Vision)
      if (input.image_data) {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: input.image_data, // Should be data:image/... or https://...
            detail: 'high',
          },
        });
      }

      const response = await this.client.post('/chat/completions', {
        model: model || 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: instructions,
          },
          {
            role: 'user',
            content: userContent.length > 0 ? userContent : prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: response.data.choices[0].message.content,
        usage: response.data.usage,
        rawResponse: response.data,
        responseTimeMs: responseTime,
      };
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      return {
        success: false,
        error: error.message || 'OpenAI API call failed',
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

      // Check required fields
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
   * Extract token usage from OpenAI response
   */
  extractTokenUsage(response) {
    return {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    };
  }

  /**
   * Estimate cost for GPT-4 Turbo
   * Pricing: Input $0.01/1K, Output $0.03/1K
   */
  estimateCost(usage) {
    const inputCost = (usage.inputTokens || 0) * (0.01 / 1000);
    const outputCost = (usage.outputTokens || 0) * (0.03 / 1000);
    return parseFloat((inputCost + outputCost).toFixed(6));
  }

  /**
   * Get available OpenAI models
   */
  async getAvailableModels() {
    try {
      const response = await this.client.get('/models');
      return response.data.data
        .filter(m => m.id.includes('gpt'))
        .map(m => m.id)
        .sort();
    } catch (error) {
      console.error('Failed to fetch OpenAI models:', error.message);
      // Return fallback models
      return [
        'gpt-4-turbo',
        'gpt-4-vision-preview',
        'gpt-3.5-turbo',
      ];
    }
  }
}

export default OpenAIProvider;
