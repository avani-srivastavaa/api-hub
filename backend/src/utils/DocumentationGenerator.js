/**
 * Documentation Generator
 * Auto-generates API documentation for connectors
 */

export class DocumentationGenerator {
  /**
   * Generate documentation for a connector
   */
  static generateConnectorDoc(connector, apiBaseUrl = 'http://localhost:5000') {
    const endpoint = connector.endpoint_path;
    const fullUrl = `${apiBaseUrl}${endpoint}`;

    return {
      title: connector.name,
      description: connector.description || 'No description provided',
      
      endpoint: {
        method: 'POST',
        url: fullUrl,
        path: endpoint,
      },

      provider: {
        name: connector.provider,
        model: connector.model,
      },

      instructions: {
        system_prompt: connector.system_prompt,
      },

      inputs: this._generateInputDocs(connector.input_schema),
      outputs: this._generateOutputDocs(connector.output_schema),

      examples: this._generateExamples(connector),

      status: connector.status,
      created_at: connector.created_at,
      updated_at: connector.updated_at,
    };
  }

  /**
   * Generate input documentation
   */
  static _generateInputDocs(input_schema) {
    if (!Array.isArray(input_schema) || input_schema.length === 0) {
      return {
        description: 'No input parameters required',
        parameters: [],
      };
    }

    const parameters = input_schema.map(field => ({
      name: field.name,
      type: field.type,
      required: field.required || false,
      description: field.description || '',
      default: field.default || null,
      validation: field.validation || null,
    }));

    return {
      description: `This endpoint accepts ${parameters.length} input parameter(s)`,
      parameters,
    };
  }

  /**
   * Generate output documentation
   */
  static _generateOutputDocs(output_schema) {
    if (!output_schema || Object.keys(output_schema).length === 0) {
      return {
        description: 'Response format is defined by the provider',
        schema: null,
      };
    }

    return {
      description: 'Response format',
      schema: output_schema,
    };
  }

  /**
   * Generate example requests and responses
   */
  static _generateExamples(connector) {
    const examples = [];

    // Example 1: Request format
    if (connector.input_schema && connector.input_schema.length > 0) {
      const exampleInput = {};

      for (const field of connector.input_schema) {
        switch (field.type.toLowerCase()) {
          case 'text':
          case 'string':
            exampleInput[field.name] = 'example text';
            break;
          case 'number':
            exampleInput[field.name] = 123;
            break;
          case 'boolean':
            exampleInput[field.name] = true;
            break;
          case 'image':
          case 'file':
            exampleInput[field.name] = 'data:image/jpeg;base64,...';
            break;
          case 'json':
            exampleInput[field.name] = { key: 'value' };
            break;
        }
      }

      examples.push({
        title: 'Example Request',
        method: 'POST',
        url: connector.endpoint_path,
        headers: {
          'Content-Type': 'application/json',
        },
        body: exampleInput,
      });
    }

    // Example 2: cURL request
    if (connector.input_schema && connector.input_schema.length > 0) {
      const curlBody = this._generateCurlBody(connector.input_schema);
      examples.push({
        title: 'cURL Request',
        command: `curl -X POST http://localhost:5000${connector.endpoint_path} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(curlBody)}'`,
      });
    }

    // Example 3: Success response
    examples.push({
      title: 'Success Response (200)',
      code: {
        success: true,
        data: '... structured JSON matching output_schema ...',
        metadata: {
          connector_id: 'uuid',
          connector_name: connector.name,
          provider: connector.provider,
          model: connector.model,
          response_time_ms: 2500,
          tokens_used: 450,
          estimated_cost: 0.0045,
        },
      },
    });

    // Example 4: Error response
    examples.push({
      title: 'Error Response (400/500)',
      code: {
        success: false,
        error: 'Error message here',
        details: 'Optional detailed explanation',
      },
    });

    return examples;
  }

  /**
   * Generate example cURL body
   */
  static _generateCurlBody(input_schema) {
    const body = {};

    for (const field of input_schema) {
      switch (field.type.toLowerCase()) {
        case 'text':
        case 'string':
          body[field.name] = 'sample text';
          break;
        case 'number':
          body[field.name] = 100;
          break;
        case 'boolean':
          body[field.name] = true;
          break;
        case 'image':
        case 'file':
          body[field.name] = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
          break;
        case 'json':
          body[field.name] = { example: 'data' };
          break;
      }
    }

    return body;
  }

  /**
   * Generate HTML documentation page
   */
  static generateHTMLDoc(connector, apiBaseUrl = 'http://localhost:5000') {
    const doc = this.generateConnectorDoc(connector, apiBaseUrl);

    const inputsHtml = doc.inputs.parameters.length > 0
      ? `
        <div class="section">
          <h3>Input Parameters</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${doc.inputs.parameters
                .map(
                  p => `
                <tr>
                  <td><code>${p.name}</code></td>
                  <td><code>${p.type}</code></td>
                  <td>${p.required ? 'Yes' : 'No'}</td>
                  <td>${p.description}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${doc.title} - API Documentation</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 1000px;
              margin: 0 auto;
              padding: 20px;
              background: #f9f9f9;
            }
            .header {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            h1 { margin: 0 0 10px; color: #1f2937; }
            .meta {
              display: flex;
              gap: 20px;
              margin: 10px 0;
              font-size: 14px;
            }
            .badge {
              display: inline-block;
              background: #e5e7eb;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            }
            .section {
              background: white;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            code {
              background: #f3f4f6;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Monaco', 'Courier New', monospace;
            }
            pre {
              background: #1f2937;
              color: #e5e7eb;
              padding: 15px;
              border-radius: 6px;
              overflow-x: auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background: #f9fafb;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${doc.title}</h1>
            <p>${doc.description}</p>
            <div class="meta">
              <span><strong>Provider:</strong> <span class="badge">${doc.provider.name}</span></span>
              <span><strong>Model:</strong> <code>${doc.provider.model}</code></span>
              <span><strong>Status:</strong> <span class="badge">${doc.status}</span></span>
            </div>
          </div>

          <div class="section">
            <h3>Endpoint</h3>
            <p><code>${doc.endpoint.method} ${doc.endpoint.url}</code></p>
          </div>

          ${inputsHtml}

          <div class="section">
            <h3>Example Request</h3>
            <pre>${JSON.stringify(doc.examples[0].body, null, 2)}</pre>
          </div>

          <div class="section">
            <h3>cURL Example</h3>
            <pre>${doc.examples[1].command}</pre>
          </div>

          <div class="section">
            <h3>System Instructions</h3>
            <pre>${doc.instructions.system_prompt}</pre>
          </div>
        </body>
      </html>
    `;
  }
}

export default DocumentationGenerator;
