import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const schema = `
-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE connector_status AS ENUM ('active', 'disabled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('success', 'failed', 'pending');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(255) NOT NULL,
  system_prompt TEXT NOT NULL,
  input_schema JSONB NOT NULL DEFAULT '[]',
  output_schema JSONB NOT NULL DEFAULT '{}',
  status connector_status DEFAULT 'active',
  endpoint_path VARCHAR(255) NOT NULL UNIQUE,
  api_key_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  
  CONSTRAINT valid_provider CHECK (provider IN ('openai', 'anthropic', 'gemini', 'groq'))
);

CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
  status request_status DEFAULT 'pending',
  request_body JSONB,
  response_body JSONB,
  error_message TEXT,
  response_time_ms INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  estimated_cost NUMERIC(10, 6),
  provider VARCHAR(50),
  model VARCHAR(255),
  user_ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_connector FOREIGN KEY (connector_id) REFERENCES connectors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS provider_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL UNIQUE,
  api_key_encrypted VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_provider_key CHECK (provider IN ('openai', 'anthropic', 'gemini', 'groq'))
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_connectors_status ON connectors(status);
CREATE INDEX IF NOT EXISTS idx_connectors_provider ON connectors(provider);
CREATE INDEX IF NOT EXISTS idx_connectors_endpoint ON connectors(endpoint_path);
CREATE INDEX IF NOT EXISTS idx_request_logs_connector ON request_logs(connector_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_created ON request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_status ON request_logs(status);

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW connector_stats AS
SELECT 
  c.id,
  c.name,
  c.provider,
  c.model,
  COUNT(rl.id) FILTER (WHERE rl.status = 'success') as successful_requests,
  COUNT(rl.id) FILTER (WHERE rl.status = 'failed') as failed_requests,
  COUNT(rl.id) as total_requests,
  COALESCE(AVG(rl.response_time_ms), 0) as avg_response_time_ms,
  COALESCE(SUM(rl.total_tokens), 0) as total_tokens_used,
  COALESCE(SUM(rl.estimated_cost), 0) as estimated_total_cost,
  MAX(rl.created_at) as last_used,
  MIN(rl.created_at) as first_used
FROM connectors c
LEFT JOIN request_logs rl ON c.id = rl.connector_id
GROUP BY c.id, c.name, c.provider, c.model;
`;

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Initializing database schema...');
    
    await client.query(schema);
    
    console.log('✅ Database schema initialized successfully');
    console.log('📋 Tables created:');
    console.log('   - connectors');
    console.log('   - request_logs');
    console.log('   - provider_keys');
    console.log('📊 Views created:');
    console.log('   - connector_stats');
    console.log('🔍 Indexes created for performance');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

// Run initialization
initializeDatabase();
