# 📖 Universal AI API Hub - Complete API Documentation

**API Version**: 1.0.0  
**Base URL**: `http://localhost:5000` (or your deployed URL)  
**Content-Type**: `application/json`

---

## 🌐 System Endpoints

### 1. Health Check
**Endpoint**: `GET /health`

Returns basic service health information.

**Response**:
```json
{
  "status": "ok",
  "service": "API Hub Backend",
  "version": "1.0.0",
  "timestamp": "2024-09-20T10:30:45.123Z"
}
```

---

### 2. Database Connection Test
**Endpoint**: `GET /api/db-test`

Verifies database connectivity.

**Response**:
```json
{
  "status": "connected",
  "database": {
    "timestamp": "2024-09-20 10:30:45.123456+00",
    "database": "PostgreSQL 14.5 on x86_64-pc-linux-gnu..."
  },
  "environment": "development"
}
```

---

### 3. System Information
**Endpoint**: `GET /api/system`

Returns system and provider information.

**Response**:
```json
{
  "status": "ok",
  "service": {
    "name": "Universal AI API Connector & API Hub",
    "version": "1.0.0",
    "environment": "development"
  },
  "providers": {
    "available": ["anthropic", "openai", "gemini"],
    "count": 3
  },
  "database": {
    "status": "connected",
    "connectors": {
      "total": 4,
      "active": 3
    }
  },
  "timestamp": "2024-09-20T10:30:45.123Z"
}
```

---

### 4. API Overview
**Endpoint**: `GET /api`

Lists all available endpoints and their descriptions.

**Response**:
```json
{
  "success": true,
  "service": "Universal AI API Hub",
  "version": "1.0.0",
  "endpoints": {
    "system": { ... },
    "admin": { ... },
    "testing": { ... },
    "documentation": { ... },
    "dynamic": { ... }
  }
}
```

---

## 🔧 Admin - Connector Management

### 1. List All Connectors
**Endpoint**: `GET /api/admin/connectors`

**Query Parameters**:
- `status` (optional): `active` or `disabled`
- `provider` (optional): `anthropic`, `openai`, `gemini`, `groq`

**Example**:
```bash
curl http://localhost:5000/api/admin/connectors?status=active&provider=anthropic
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Card Scanner",
      "description": "Extracts contact info from business cards",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "status": "active",
      "endpoint_path": "/api/connectors/card-scanner",
      "created_at": "2024-09-20T10:30:45.123Z",
      "updated_at": "2024-09-20T10:30:45.123Z"
    }
  ],
  "count": 1
}
```

---

### 2. Create Connector
**Endpoint**: `POST /api/admin/connectors`

**Required Fields**:
- `name` (string): Connector name (3-255 chars)
- `provider` (string): `anthropic`, `openai`, `gemini`, or `groq`
- `model` (string): Model identifier
- `system_prompt` (string): System instructions (10-5000 chars)

**Optional Fields**:
- `description` (string)
- `input_schema` (array): Input parameter definitions
- `output_schema` (object): Output structure definition

**Request Example**:
```bash
curl -X POST http://localhost:5000/api/admin/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Connector",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "system_prompt": "You are a helpful assistant.",
    "input_schema": [
      {
        "name": "text",
        "type": "text",
        "required": true,
        "description": "Input text"
      }
    ],
    "output_schema": {
      "type": "object",
      "properties": {
        "result": { "type": "string" }
      },
      "required": ["result"]
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Connector",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "endpoint_path": "/api/connectors/my-connector",
    "status": "active",
    "created_at": "2024-09-20T10:30:45.123Z"
  },
  "message": "Connector \"My Connector\" created successfully"
}
```

---

### 3. Get Connector Details
**Endpoint**: `GET /api/admin/connectors/:id`

**Path Parameters**:
- `id` (string): Connector UUID

**Response**: Same as create response

---

### 4. Update Connector
**Endpoint**: `PUT /api/admin/connectors/:id`

Partial update supported. Only include fields to update.

**Request**:
```bash
curl -X PUT http://localhost:5000/api/admin/connectors/uuid \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "model": "claude-3-opus-20240229"
  }'
```

---

### 5. Disable Connector
**Endpoint**: `POST /api/admin/connectors/:id/disable`

Soft delete - connector stays in database but becomes inactive.

**Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Connector disabled"
}
```

---

### 6. Enable Connector
**Endpoint**: `POST /api/admin/connectors/:id/enable`

Re-activates a disabled connector.

---

### 7. Delete Connector
**Endpoint**: `DELETE /api/admin/connectors/:id`

Permanent deletion.

---

## 📊 Statistics & Logging

### 1. Get All Statistics
**Endpoint**: `GET /api/admin/stats`

Returns statistics for all connectors.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Card Scanner",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "successful_requests": 25,
      "failed_requests": 2,
      "total_requests": 27,
      "avg_response_time_ms": 2500,
      "total_tokens_used": 5430,
      "estimated_total_cost": 0.0815,
      "last_used": "2024-09-20T10:30:45.123Z",
      "first_used": "2024-09-19T14:20:30.456Z"
    }
  ]
}
```

---

### 2. Get Connector Statistics
**Endpoint**: `GET /api/admin/connectors/:id/stats`

**Response**: Single connector stats object

---

### 3. Get Connector Logs
**Endpoint**: `GET /api/admin/connectors/:id/logs`

**Query Parameters**:
- `limit` (number, default: 50): Results per page
- `offset` (number, default: 0): Pagination offset

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "log-uuid",
      "connector_id": "connector-uuid",
      "status": "success",
      "request_body": { ... },
      "response_body": { ... },
      "error_message": null,
      "response_time_ms": 2500,
      "input_tokens": 150,
      "output_tokens": 300,
      "total_tokens": 450,
      "estimated_cost": 0.0045,
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "user_ip": "192.168.1.1",
      "created_at": "2024-09-20T10:30:45.123Z"
    }
  ],
  "total": 27,
  "limit": 50,
  "offset": 0
}
```

---

## 🧪 Testing Connectors

### 1. Test Connector (with logging)
**Endpoint**: `POST /api/admin/test/:id`

**Request**:
```bash
curl -X POST http://localhost:5000/api/admin/test/uuid \
  -H "Content-Type: application/json" \
  -d '{
    "test_input": {
      "topic": "Artificial Intelligence"
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "test_status": "passed",
  "data": { ... },
  "metadata": {
    "connector_id": "uuid",
    "connector_name": "Article Writer",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "response_time_ms": 3200,
    "tokens_used": 580,
    "input_tokens": 120,
    "output_tokens": 460,
    "estimated_cost": 0.0069
  }
}
```

---

### 2. Quick Test (without logging)
**Endpoint**: `POST /api/admin/test/quick/:id`

Same as above but doesn't create log entry. Good for rapid iteration.

---

## 📚 Documentation

### 1. List All Documentation
**Endpoint**: `GET /api/docs`

Returns documentation URLs for all active connectors.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Card Scanner",
      "description": "Extracts contact info from business cards",
      "endpoint": "/api/connectors/card-scanner",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "doc_url": "/api/docs/uuid",
      "html_url": "/api/docs/uuid/html"
    }
  ],
  "count": 1
}
```

---

### 2. Get JSON Documentation
**Endpoint**: `GET /api/docs/:id`

Returns detailed JSON documentation for a connector.

---

### 3. Get HTML Documentation
**Endpoint**: `GET /api/docs/:id/html`

Returns formatted HTML documentation page.

---

## 🚀 Dynamic Connector Endpoints

### Call Any Connector
**Endpoint**: `POST /api/connectors/:endpoint`

Dynamically generated based on created connectors.

**Example**: `POST /api/connectors/card-scanner`

**Request**:
```bash
curl -X POST http://localhost:5000/api/connectors/card-scanner \
  -H "Content-Type: application/json" \
  -d '{
    "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "title": "Product Manager",
    "company": "Tech Company",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "website": "https://example.com"
  },
  "metadata": {
    "connector_id": "uuid",
    "connector_name": "Card Scanner",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "response_time_ms": 2500,
    "tokens_used": 450,
    "estimated_cost": 0.0045
  }
}
```

---

## ❌ Error Responses

All errors follow this format:

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details (optional)"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Connector not found"
}
```

**500 Server Error**:
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message (development only)"
}
```

---

## 🔑 Input Types

Supported input field types:

| Type | Description | Example |
|------|-------------|---------|
| `text` | Text string | `"hello world"` |
| `number` | Numeric value | `42` or `3.14` |
| `boolean` | True/False | `true` or `false` |
| `image` | Base64 encoded image | `"data:image/jpeg;base64,..."` |
| `file` | Base64 encoded file | `"data:application/pdf;base64,..."` |
| `json` | JSON object | `{"key": "value"}` |

---

## 💰 Cost Estimation

All responses include `estimated_cost` calculated as:

- **Anthropic Claude**: $0.003 per 1K input tokens, $0.015 per 1K output tokens
- **OpenAI GPT-4**: $0.01 per 1K input tokens, $0.03 per 1K output tokens
- **Google Gemini**: $0.00075 per 1K input tokens, $0.003 per 1K output tokens

---

## 🔗 Common Patterns

### Pagination
```
GET /api/admin/connectors/:id/logs?limit=20&offset=40
```

### Filtering
```
GET /api/admin/connectors?status=active&provider=anthropic
```

### Error Handling
```javascript
if (!response.success) {
  console.error(response.error);
  console.error(response.details);
}
```

---

## 📱 Sample Connectors

### Card Scanner
- **Endpoint**: `/api/connectors/card-scanner`
- **Input**: Business card image
- **Output**: Contact information (name, email, phone, etc.)
- **Provider**: Anthropic Claude (Vision)

### Article Writer
- **Endpoint**: `/api/connectors/article-writer`
- **Input**: Topic, tone, word count, target audience
- **Output**: Article with title, sections, conclusion
- **Provider**: Anthropic Claude (Text)

### Invoice Parser
- **Endpoint**: `/api/connectors/invoice-parser`
- **Input**: Invoice image
- **Output**: Extracted invoice data (vendor, items, total, etc.)
- **Provider**: Anthropic Claude (Vision)

### Content Rewriter
- **Endpoint**: `/api/connectors/content-rewriter`
- **Input**: Text content, target style
- **Output**: Rewritten content with improvements
- **Provider**: Anthropic Claude (Text)

---

## 🧑‍💻 Client Examples

### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:5000/api/connectors/card-scanner', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image_data: '...' })
});
const result = await response.json();
console.log(result.data);
```

### Python
```python
import requests

response = requests.post(
  'http://localhost:5000/api/connectors/card-scanner',
  json={'image_data': '...'}
)
print(response.json()['data'])
```

### cURL
```bash
curl -X POST http://localhost:5000/api/connectors/card-scanner \
  -H "Content-Type: application/json" \
  -d '{"image_data":"..."}'
```

---

## 🚀 Getting Started

1. **Start server**: `npm run dev`
2. **Create connector**: `POST /api/admin/connectors`
3. **Get documentation**: `GET /api/docs/:id`
4. **Test connector**: `POST /api/admin/test/:id`
5. **Call endpoint**: `POST /api/connectors/:endpoint`

---

**API Documentation v1.0.0**  
**Last Updated**: September 20, 2024
