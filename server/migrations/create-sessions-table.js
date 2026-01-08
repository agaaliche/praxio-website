/**
 * Create sessions table for tracking user login sessions
 * Run with: node server/migrations/create-sessions-table.js
 */

import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../.env.local') })

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
}

async function createSessionsTable() {
  let connection

  try {
    console.log('🔌 Connecting to database...')
    connection = await mysql.createConnection(config)
    console.log('✅ Connected to database')

    // Check if table already exists
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sessions'",
      [config.database]
    )

    if (tables.length > 0) {
      console.log('ℹ️ Sessions table already exists')
      return
    }

    console.log('📝 Creating sessions table...')
    
    await connection.query(`
      CREATE TABLE sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sessionId VARCHAR(128) NOT NULL UNIQUE,
        userId VARCHAR(128) NOT NULL,
        userEmail VARCHAR(255) NOT NULL,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        deviceType VARCHAR(50),
        deviceName VARCHAR(100),
        browser VARCHAR(50),
        browserVersion VARCHAR(20),
        os VARCHAR(50),
        osVersion VARCHAR(20),
        isCurrent BOOLEAN DEFAULT FALSE,
        lastActiveTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        expiresAt DATETIME,
        INDEX idx_userId (userId),
        INDEX idx_sessionId (sessionId),
        INDEX idx_lastActiveTime (lastActiveTime),
        INDEX idx_expiresAt (expiresAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('✅ Sessions table created successfully')
    console.log('📊 Table structure:')
    console.log('   - sessionId: Unique session identifier')
    console.log('   - userId: Firebase user ID')
    console.log('   - Device info: IP, user agent, device type, browser, OS')
    console.log('   - isCurrent: Flag for current session')
    console.log('   - Timestamps: lastActiveTime, createdAt, expiresAt')

  } catch (error) {
    console.error('❌ Error creating sessions table:', error)
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log('🔌 Database connection closed')
    }
  }
}

// Run migration
createSessionsTable()
  .then(() => {
    console.log('✅ Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
