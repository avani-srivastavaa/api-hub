/**
 * Connector Model & Service
 * Handles all database operations for connectors
 */

import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

export class ConnectorService {
  /**
   * Create a new connector
   */
  static async create(data) {
    const {
      name,
      description,
      provider,
      model,
      system_prompt,
      input_schema = [],
      output_schema = {},
    } = data;

    const id = uuidv4();
    const endpoint_path = `/api/connectors/${slugify(name, { lower: true, strict: true })}`;

    try {
      const result = await pool.query(
        `INSERT INTO connectors 
        (id, name, description, provider, model, system_prompt, input_schema, output_schema, endpoint_path, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          id,
          name,
          description,
          provider,
          model,
          system_prompt,
          JSON.stringify(input_schema),
          JSON.stringify(output_schema),
          endpoint_path,
          'admin', // TODO: Use actual user from auth
        ]
      );

      return {
        success: true,
        data: this._formatConnector(result.rows[0]),
        message: `Connector "${name}" created successfully`,
      };
    } catch (error) {
      // Check for duplicate name
      if (error.code === '23505') {
        return {
          success: false,
          error: `Connector with name "${name}" already exists`,
        };
      }
      throw error;
    }
  }

  /**
   * Get connector by ID
   */
  static async getById(id) {
    const result = await pool.query(
      'SELECT * FROM connectors WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Connector not found',
      };
    }

    return {
      success: true,
      data: this._formatConnector(result.rows[0]),
    };
  }

  /**
   * Get connector by endpoint path
   */
  static async getByEndpoint(endpoint_path) {
    const result = await pool.query(
      'SELECT * FROM connectors WHERE endpoint_path = $1 AND status = $2',
      [endpoint_path, 'active']
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Endpoint not found',
      };
    }

    return {
      success: true,
      data: this._formatConnector(result.rows[0]),
    };
  }

  /**
   * List all connectors with optional filtering
   */
  static async list(filters = {}) {
    let query = 'SELECT * FROM connectors WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.provider) {
      query += ` AND provider = $${paramCount}`;
      values.push(filters.provider);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);

    return {
      success: true,
      data: result.rows.map(row => this._formatConnector(row)),
      count: result.rows.length,
    };
  }

  /**
   * Update connector
   */
  static async update(id, data) {
    const {
      name,
      description,
      provider,
      model,
      system_prompt,
      input_schema,
      output_schema,
      status,
    } = data;

    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (provider !== undefined) {
      updates.push(`provider = $${paramCount}`);
      values.push(provider);
      paramCount++;
    }
    if (model !== undefined) {
      updates.push(`model = $${paramCount}`);
      values.push(model);
      paramCount++;
    }
    if (system_prompt !== undefined) {
      updates.push(`system_prompt = $${paramCount}`);
      values.push(system_prompt);
      paramCount++;
    }
    if (input_schema !== undefined) {
      updates.push(`input_schema = $${paramCount}`);
      values.push(JSON.stringify(input_schema));
      paramCount++;
    }
    if (output_schema !== undefined) {
      updates.push(`output_schema = $${paramCount}`);
      values.push(JSON.stringify(output_schema));
      paramCount++;
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (updates.length === 0) {
      return {
        success: false,
        error: 'No fields to update',
      };
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE connectors SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    try {
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Connector not found',
        };
      }

      return {
        success: true,
        data: this._formatConnector(result.rows[0]),
        message: 'Connector updated successfully',
      };
    } catch (error) {
      if (error.code === '23505') {
        return {
          success: false,
          error: 'Connector name already exists',
        };
      }
      throw error;
    }
  }

  /**
   * Delete connector
   */
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM connectors WHERE id = $1 RETURNING id, name',
      [id]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Connector not found',
      };
    }

    return {
      success: true,
      message: `Connector "${result.rows[0].name}" deleted successfully`,
    };
  }

  /**
   * Disable connector (soft delete)
   */
  static async disable(id) {
    const result = await pool.query(
      'UPDATE connectors SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['disabled', id]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Connector not found',
      };
    }

    return {
      success: true,
      data: this._formatConnector(result.rows[0]),
      message: 'Connector disabled',
    };
  }

  /**
   * Enable connector
   */
  static async enable(id) {
    const result = await pool.query(
      'UPDATE connectors SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['active', id]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Connector not found',
      };
    }

    return {
      success: true,
      data: this._formatConnector(result.rows[0]),
      message: 'Connector enabled',
    };
  }

  /**
   * Format connector data (parse JSON fields)
   */
  static _formatConnector(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      provider: row.provider,
      model: row.model,
      system_prompt: row.system_prompt,
      input_schema: typeof row.input_schema === 'string' 
        ? JSON.parse(row.input_schema) 
        : row.input_schema,
      output_schema: typeof row.output_schema === 'string'
        ? JSON.parse(row.output_schema)
        : row.output_schema,
      status: row.status,
      endpoint_path: row.endpoint_path,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export default ConnectorService;
