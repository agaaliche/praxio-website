/**
 * GET /api/health
 * Health check endpoint - tests database connectivity
 */
import { defineEventHandler } from 'h3'
import { query } from '../utils/database'

export default defineEventHandler(async (event) => {
  try {
    // Test database connection
    const result = await query<any>('SELECT 1 as ok')
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: result.length > 0 ? 'connected' : 'error'
    }
  } catch (error: any) {
    console.error('Health check failed:', error)
    
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    }
  }
})
