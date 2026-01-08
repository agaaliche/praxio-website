/**
 * Update sessions table to add isRevoked and loginTime columns
 * Run with: node server/migrations/update-sessions-table.js
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

async function updateSessionsTable() {
  let connection

  try {
    console.log('🔌 Connecting to database...')
    connection = await mysql.createConnection(config)
    console.log('✅ Connected to database')

    // Check if isRevoked column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'isRevoked'`,
      [config.database]
    )

    if (columns.length === 0) {
      console.log('📝 Adding isRevoked column...')
      await connection.query(`
        ALTER TABLE sessions 
        ADD COLUMN isRevoked BOOLEAN DEFAULT FALSE AFTER isCurrent
      `)
      console.log('✅ Added isRevoked column')
    } else {
      console.log('ℹ️ isRevoked column already exists')
    }

    // Check if loginTime column exists
    const [loginTimeColumns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sessions' AND COLUMN_NAME = 'loginTime'`,
      [config.database]
    )

    if (loginTimeColumns.length === 0) {
      console.log('📝 Adding loginTime column...')
      await connection.query(`
        ALTER TABLE sessions 
        ADD COLUMN loginTime DATETIME DEFAULT CURRENT_TIMESTAMP AFTER isCurrent
      `)
      console.log('✅ Added loginTime column')
      
      // Copy createdAt values to loginTime for existing records
      console.log('📝 Copying createdAt to loginTime for existing records...')
      await connection.query(`UPDATE sessions SET loginTime = createdAt WHERE loginTime IS NULL`)
      console.log('✅ Updated existing records')
    } else {
      console.log('ℹ️ loginTime column already exists')
    }

    console.log('✅ Sessions table updated successfully')

  } catch (error) {
    console.error('❌ Error updating sessions table:', error)
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log('🔌 Database connection closed')
    }
  }
}

// Run migration
updateSessionsTable()
  .then(() => {
    console.log('✅ Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
