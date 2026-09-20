import BaseProvider from './BaseProvider.js';
import axios from 'axios';

export class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.name = 'Google Gemini';
    this.apiKey = apiKey;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.client = axios.create({
      timeout: 60000,
    });
  }

  /**
   * Call Google Gemini API
   */
  async callAPI(instructions, input, model) {
    try {
      const startTime = Date.now();
      
      const prompt = this._buildPrompt(instructions, input);

      // Build request content
      let contents = [];

      // System instruction
      const systemInstruction = {
        parts: [{ text: instructions }],
      };

      // User message
      let userParts = [];

      if (prompt.trim()) {
        userParts.push({ text: prompt });
      }

      // Handle images
      if (input.image_data) {
        // Extract base64 from data:image/... format if needed
        let imageData = input.image_data;
        if (imageData.startsWith('data:')) {
          imageData = imageData.split(',')[1];
        }

        userParts.push({
          inlineData: {
            mimeType: input.image_type || 'image/jpeg',
            data: imageData,
          },
        });
      }

      contents.push({
        role: 'user',
        parts: userParts,
      });

      const response = await this.client.post(
        `${this.baseURL}/${model || 'gemini-pro'}:generateContent?key=${this.apiKey}`,
        {
          systemInstruction,
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }
      );

      const responseTime = Date.now() - startTime;

      // Extract text from Gemini response
      const textContent = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        success: true,
        data: textContent,
        usage: {
          promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
        },
        rawResponse: response.data,
        responseTimeMs: responseTime,
      };
    } catch (error) {
      console.error('Gemini API error:', error.message);
      return {
        success: false,
        error: error.message || 'Gemini API call failed',
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
   * Extract token usage from Gemini response
   */
  extractTokenUsage(response) {
    return {
      inputTokens: response.promptTokens || response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.completionTokens || response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: (response.promptTokens || 0) + (response.completionTokens || 0),
    };
  }

  /**
   * Estimate cost for Gemini
   * Pricing: Free tier available, paid tier varies
   */
  estimateCost(usage) {
    // Gemini pricing (simplified)
    const inputCost = (usage.inputTokens || 0) * (0.00075 / 1000);
    const outputCost = (usage.outputTokens || 0) * (0.003 / 1000);
    return parseFloat((inputCost + outputCost).toFixed(6));
  }

  /**
   * Get available Gemini models
   */
  async getAvailableModels() {
    try {
      const response = await this.client.get(
        `${this.baseURL}?key=${this.apiKey}`
      );
      
      return response.data.models
        .filter(m => m.name.includes('gemini'))
        .map(m => m.name.replace('models/', ''));
    } catch (error) {
      console.error('Failed to fetch Gemini models:', error.message);
      return ['gemini-pro', 'gemini-pro-vision'];
    }
  }
}

export default GeminiProvider;
