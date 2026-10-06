/**
 * Seed Data Script
 * Creates sample connectors for demonstration
 * Run: npm run seed
 */

import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const connectors = [
  {
    name: 'Card Scanner',
    description: 'Extracts contact information from a business card image using AI vision',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    system_prompt: `You are a professional business card scanner and data extractor. Your task is to:
1. Analyze the provided business card image
2. Extract all relevant information accurately
3. Return ONLY valid JSON matching the specified schema
4. Do not include any markdown formatting or extra text
5. If a field is not visible or unclear, use null
6. Ensure all extracted data is properly formatted`,
    input_schema: [
      {
        name: 'image_data',
        type: 'image',
        required: true,
        description: 'Business card image (base64 encoded)',
      },
    ],
    output_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Full name of the person',
        },
        title: {
          type: 'string',
          description: 'Job title or position',
        },
        company: {
          type: 'string',
          description: 'Company name',
        },
        email: {
          type: 'string',
          description: 'Email address',
        },
        phone: {
          type: 'string',
          description: 'Phone number',
        },
        website: {
          type: 'string',
          description: 'Company website or personal website',
        },
        address: {
          type: 'string',
          description: 'Physical address',
        },
      },
      required: ['name', 'company', 'email'],
    },
  },

  {
    name: 'Article Writer',
    description: 'Generates well-structured articles based on a topic and parameters',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    system_prompt: `You are a professional content writer and journalist. Your task is to:
1. Write high-quality, engaging articles based on the provided topic
2. Follow the specified parameters (tone, length, target audience)
3. Structure the article with clear sections and headings
4. Return ONLY valid JSON matching the specified schema
5. Ensure content is accurate, well-researched, and coherent
6. Use markdown formatting within the content field`,
    input_schema: [
      {
        name: 'topic',
        type: 'text',
        required: true,
        description: 'The main topic or subject of the article',
      },
      {
        name: 'tone',
        type: 'text',
        required: false,
        description: 'Tone of writing (e.g., professional, casual, technical, formal)',
        default: 'professional',
      },
      {
        name: 'word_count',
        type: 'number',
        required: false,
        description: 'Target word count for the article',
        default: 1000,
      },
      {
        name: 'target_audience',
        type: 'text',
        required: false,
        description: 'Target audience (e.g., beginners, professionals, general public)',
        default: 'general',
      },
      {
        name: 'sections',
        type: 'number',
        required: false,
        description: 'Number of main sections/headings in the article',
        default: 5,
      },
    ],
    output_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Article title',
        },
        introduction: {
          type: 'string',
          description: 'Article introduction/opening paragraph',
        },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              heading: { type: 'string' },
              content: { type: 'string' },
            },
          },
          description: 'Article sections with headings and content',
        },
        conclusion: {
          type: 'string',
          description: 'Article conclusion/closing paragraph',
        },
        word_count: {
          type: 'number',
          description: 'Approximate word count',
        },
        tone_used: {
          type: 'string',
          description: 'Tone actually used in the article',
        },
      },
      required: ['title', 'introduction', 'sections', 'conclusion'],
    },
  },

  {
    name: 'Invoice Parser',
    description: 'Extracts structured data from invoice images using OCR and AI',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    system_prompt: `You are an expert invoice processing system. Your task is to:
1. Analyze the provided invoice image
2. Extract all relevant financial and organizational data
3. Return ONLY valid JSON matching the specified schema
4. Parse line items with descriptions and amounts
5. Calculate or verify totals
6. Handle multiple currencies and formats
7. Flag any missing or unclear information with null values`,
    input_schema: [
      {
        name: 'invoice_image',
        type: 'image',
        required: true,
        description: 'Invoice image (base64 encoded)',
      },
    ],
    output_schema: {
      type: 'object',
      properties: {
        invoice_number: { type: 'string' },
        invoice_date: { type: 'string' },
        due_date: { type: 'string' },
        vendor_name: { type: 'string' },
        vendor_address: { type: 'string' },
        customer_name: { type: 'string' },
        line_items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'number' },
              unit_price: { type: 'number' },
              total: { type: 'number' },
            },
          },
        },
        subtotal: { type: 'number' },
        tax: { type: 'number' },
        total: { type: 'number' },
        currency: { type: 'string' },
      },
      required: ['invoice_number', 'vendor_name', 'line_items', 'total'],
    },
  },

  {
    name: 'Content Rewriter',
    description: 'Rewrites and improves existing content while maintaining the original message',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    system_prompt: `You are a professional editor and content rewriter. Your task is to:
1. Analyze the provided content
2. Rewrite it according to the specified style and requirements
3. Improve clarity, engagement, and readability
4. Maintain the original meaning and key information
5. Return ONLY valid JSON matching the specified schema
6. Provide both original and rewritten versions for comparison`,
    input_schema: [
      {
        name: 'content',
        type: 'text',
        required: true,
        description: 'The content to rewrite',
      },
      {
        name: 'style',
        type: 'text',
        required: false,
        description: 'Target style (concise, elaborate, casual, formal, technical)',
        default: 'professional',
      },
      {
        name: 'target_length',
        type: 'text',
        required: false,
        description: 'Target length (shorter, same, longer)',
        default: 'same',
      },
    ],
    output_schema: {
      type: 'object',
      properties: {
        original_content: { type: 'string' },
        rewritten_content: { type: 'string' },
        improvements: {
          type: 'array',
          items: { type: 'string' },
        },
        character_count_original: { type: 'number' },
        character_count_rewritten: { type: 'number' },
        readability_score: { type: 'number' },
      },
      required: ['original_content', 'rewritten_content'],
    },
  },
];

async function seedData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding demo connectors...\n');

    for (const connectorData of connectors) {
      try {
        const id = uuidv4();
        const endpoint_path = `/api/connectors/${connectorData.name
          .toLowerCase()
          .replace(/\s+/g, '-')}`;

        await client.query(
          `INSERT INTO connectors 
          (id, name, description, provider, model, system_prompt, input_schema, output_schema, endpoint_path, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            id,
            connectorData.name,
            connectorData.description,
            connectorData.provider,
            connectorData.model,
            connectorData.system_prompt,
            JSON.stringify(connectorData.input_schema),
            JSON.stringify(connectorData.output_schema),
            endpoint_path,
            'seed-script',
          ]
        );

        console.log(`✅ Created: ${connectorData.name}`);
        console.log(`   Endpoint: ${endpoint_path}\n`);
      } catch (err) {
        if (err.code === '23505') {
          console.log(`⏭️  Skipped: ${connectorData.name} (already exists)\n`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Seed data completed successfully!');
    console.log('\nYou can now test these connectors:');
    connectors.forEach(c => {
      console.log(`  • ${c.name}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed data error:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedData();
