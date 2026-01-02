/**
 * GET /api/admin/schema
 * Check database schema (development only)
 */
import { defineEventHandler, createError } from 'h3'
import { query } from '../../utils/database'

export default defineEventHandler(async (event) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      message: 'Not allowed in production'
    })
  }

  try {
    const columns = await query('SHOW COLUMNS FROM authorized_users')
    return { columns }
  } catch (error: any) {
    return { error: error.message }
  }
})
