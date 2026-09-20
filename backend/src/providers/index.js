import { AnthropicProvider } from './AnthropicProvider.js';
import { OpenAIProvider } from './OpenAIProvider.js';
import { GeminiProvider } from './GeminiProvider.js';

/**
 * Provider Registry
 * Maps provider names to their implementations
 */
const PROVIDERS = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  gemini: GeminiProvider,
  // groq: GroqProvider, (to be added)
};

/**
 * Get a provider instance by name
 * @param {string} providerName - Name of provider (anthropic, openai, gemini, groq)
 * @param {string} apiKey - API key for the provider
 * @returns {BaseProvider} Provider instance
 * @throws {Error} If provider not found or API key missing
 */
export function getProvider(providerName, apiKey) {
  const name = providerName.toLowerCase();

  if (!PROVIDERS[name]) {
    throw new Error(
      `Unknown provider: ${providerName}. Available: ${Object.keys(PROVIDERS).join(', ')}`
    );
  }

  if (!apiKey) {
    throw new Error(`API key required for provider: ${providerName}`);
  }

  return new PROVIDERS[name](apiKey);
}

/**
 * Get list of available provider names
 */
export function getAvailableProviders() {
  return Object.keys(PROVIDERS);
}

/**
 * Check if a provider is available
 */
export function isProviderAvailable(providerName) {
  return providerName.toLowerCase() in PROVIDERS;
}

/**
 * Export provider classes for direct use
 */
export {
  AnthropicProvider,
  OpenAIProvider,
  GeminiProvider,
};
