/**
 * GET /api/admin/migrate
 * Add missing columns for scheduled subscription changes
 */
import { defineEventHandler } from 'h3'
import { execute, query } from '../../utils/database'

export default defineEventHandler(async () => {
  const results: string[] = []
  
  try {
    // Check if scheduledPriceId column exists
    const columns = await query<{ Field: string }>(
      `SHOW COLUMNS FROM users LIKE 'scheduledPriceId'`
    )
    
    if (columns.length === 0) {
      // Add the missing columns
      await execute(`
        ALTER TABLE users 
        ADD COLUMN scheduledPriceId VARCHAR(255) DEFAULT NULL,
        ADD COLUMN scheduledChangeDate DATETIME DEFAULT NULL
      `)
      results.push('Added scheduledPriceId and scheduledChangeDate columns')
    } else {
      results.push('Columns already exist')
    }
    
    return {
      success: true,
      message: 'Migration completed',
      results
    }
  } catch (error: any) {
    console.error('Migration error:', error)
    return {
      success: false,
      message: 'Migration failed',
      error: error.message
    }
  }
})
