/**
 * GET/POST /api/admin/migrate
 * Run database migrations (development only)
 */
import { execute } from '../../utils/database'

export default defineEventHandler(async (event) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      message: 'Migrations not allowed in production'
    })
  }

  try {
    const results: string[] = []
    
    // Create authorized_users table if not exists
    await execute(`
      CREATE TABLE IF NOT EXISTS authorized_users (
        id INT NOT NULL AUTO_INCREMENT,
        account_owner_id VARCHAR(128) NOT NULL COMMENT 'Firebase UID of account owner',
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) DEFAULT NULL,
        last_name VARCHAR(100) DEFAULT NULL,
        role ENUM('viewer', 'editor') NOT NULL DEFAULT 'viewer',
        status ENUM('pending', 'active', 'expired') NOT NULL DEFAULT 'pending',
        invite_token VARCHAR(500) DEFAULT NULL,
        token_expiry DATETIME DEFAULT NULL,
        generated_password VARCHAR(100) DEFAULT NULL COMMENT 'Temporary password for initial login',
        last_access DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_account_email (account_owner_id, email),
        KEY idx_account_owner (account_owner_id),
        KEY idx_email (email),
        KEY idx_invite_token (invite_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    results.push('authorized_users table ensured')
    
    // Add missing columns if they don't exist
    const alterColumns = [
      { column: 'token_expiry', sql: 'ALTER TABLE authorized_users ADD COLUMN token_expiry DATETIME DEFAULT NULL AFTER invite_token' },
      { column: 'generated_password', sql: 'ALTER TABLE authorized_users ADD COLUMN generated_password VARCHAR(100) DEFAULT NULL AFTER token_expiry' },
      { column: 'last_access', sql: 'ALTER TABLE authorized_users ADD COLUMN last_access DATETIME DEFAULT NULL AFTER generated_password' }
    ]
    
    for (const { column, sql } of alterColumns) {
      try {
        await execute(sql)
        results.push(`Added column: ${column}`)
      } catch (err: any) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          results.push(`Column ${column} already exists`)
        } else {
          throw err
        }
      }
    }

    return { success: true, message: 'Migration completed', results }
  } catch (error: any) {
    console.error('Migration error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Migration failed'
    })
  }
})
