/**
 * Request Log Service
 * Handles logging and statistics for all connector API requests
 */

import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const normalizeNumericStat = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStats = (stats) => {
  if (!stats) {
    return stats;
  }

  if (Array.isArray(stats)) {
    return stats.map((stat) => ({
      ...stat,
      successful_requests: normalizeNumericStat(stat.successful_requests),
      failed_requests: normalizeNumericStat(stat.failed_requests),
      total_requests: normalizeNumericStat(stat.total_requests),
      avg_response_time_ms: normalizeNumericStat(stat.avg_response_time_ms),
      total_tokens_used: normalizeNumericStat(stat.total_tokens_used),
      estimated_total_cost: normalizeNumericStat(stat.estimated_total_cost),
    }));
  }

  return {
    ...stats,
    successful_requests: normalizeNumericStat(stats.successful_requests),
    failed_requests: normalizeNumericStat(stats.failed_requests),
    total_requests: normalizeNumericStat(stats.total_requests),
    avg_response_time_ms: normalizeNumericStat(stats.avg_response_time_ms),
    min_response_time_ms: normalizeNumericStat(stats.min_response_time_ms),
    max_response_time_ms: normalizeNumericStat(stats.max_response_time_ms),
    total_tokens_used: normalizeNumericStat(stats.total_tokens_used),
    estimated_total_cost: normalizeNumericStat(stats.estimated_total_cost),
  };
};

export class RequestLogService {
  /**
   * Log a request
   */
  static async log(data) {
    const {
      connector_id,
      status = 'pending',
      request_body,
      response_body,
      error_message,
      response_time_ms,
      input_tokens,
      output_tokens,
      total_tokens,
      estimated_cost,
      provider,
      model,
      user_ip,
    } = data;

    const id = uuidv4();

    try {
      await pool.query(
        `INSERT INTO request_logs 
        (id, connector_id, status, request_body, response_body, error_message, 
         response_time_ms, input_tokens, output_tokens, total_tokens, estimated_cost, 
         provider, model, user_ip)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          id,
          connector_id,
          status,
          JSON.stringify(request_body),
          JSON.stringify(response_body),
          error_message,
          response_time_ms,
          input_tokens,
          output_tokens,
          total_tokens,
          estimated_cost,
          provider,
          model,
          user_ip,
        ]
      );

      return { success: true, id };
    } catch (error) {
      console.error('Error logging request:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update log status after response
   */
  static async updateStatus(logId, status, response_body, error_message = null) {
    try {
      await pool.query(
        'UPDATE request_logs SET status = $1, response_body = $2, error_message = $3 WHERE id = $4',
        [status, JSON.stringify(response_body), error_message, logId]
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating log:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get logs for a specific connector
   */
  static async getConnectorLogs(connector_id, limit = 50, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT * FROM request_logs 
         WHERE connector_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [connector_id, limit, offset]
      );

      const countResult = await pool.query(
        'SELECT COUNT(*) as total FROM request_logs WHERE connector_id = $1',
        [connector_id]
      );

      return {
        success: true,
        data: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
      };
    } catch (error) {
      console.error('Error fetching logs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get statistics for a specific connector
   */
  static async getConnectorStats(connector_id) {
    try {
      const result = await pool.query(
        `SELECT 
          COUNT(*) as total_requests,
          COUNT(*) FILTER (WHERE status = 'success') as successful_requests,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_requests,
          AVG(response_time_ms) as avg_response_time_ms,
          MIN(response_time_ms) as min_response_time_ms,
          MAX(response_time_ms) as max_response_time_ms,
          SUM(total_tokens) as total_tokens_used,
          SUM(estimated_cost) as estimated_total_cost,
          MAX(created_at) as last_used,
          MIN(created_at) as first_used
        FROM request_logs 
        WHERE connector_id = $1`,
        [connector_id]
      );

      return {
        success: true,
        data: normalizeStats(result.rows[0]),
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all statistics (from view)
   */
  static async getAllStats() {
    try {
      const result = await pool.query('SELECT * FROM connector_stats ORDER BY total_requests DESC');

      return {
        success: true,
        data: normalizeStats(result.rows),
      };
    } catch (error) {
      console.error('Error fetching all stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear old logs (for cleanup)
   */
  static async clearOldLogs(days = 30) {
    try {
      const result = await pool.query(
        'DELETE FROM request_logs WHERE created_at < NOW() - INTERVAL \'$1 days\' RETURNING id',
        [days]
      );

      return {
        success: true,
        deleted_count: result.rows.length,
      };
    } catch (error) {
      console.error('Error clearing logs:', error);
      return { success: false, error: error.message };
    }
  }
}

export default RequestLogService;
