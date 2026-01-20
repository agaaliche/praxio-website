import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env.local') })

async function checkSessions() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  })

  try {
    // Get user
    const [users] = await connection.query(
      'SELECT userId, userEmail FROM users WHERE userEmail = ?',
      ['frida@praxio.net']
    )

    if (users.length === 0) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:', users[0].userEmail)
    console.log('   User ID:', users[0].userId)

    // Get sessions
    const [sessions] = await connection.query(
      `SELECT sessionId, deviceName, deviceType, browser, browserVersion, os, 
              ipAddress, loginTime, lastActiveTime, isRevoked 
       FROM sessions 
       WHERE userId = ? 
       ORDER BY loginTime DESC`,
      [users[0].userId]
    )

    console.log('\n📊 Sessions:', sessions.length)
    
    if (sessions.length === 0) {
      console.log('   No sessions found')
    } else {
      sessions.forEach((s, i) => {
        console.log(`\n${i + 1}. ${s.browser} ${s.browserVersion} on ${s.os}`)
        console.log(`   Device: ${s.deviceName} (${s.deviceType})`)
        console.log(`   IP: ${s.ipAddress}`)
        console.log(`   Login: ${s.loginTime}`)
        console.log(`   Last Active: ${s.lastActiveTime}`)
        console.log(`   Revoked: ${s.isRevoked ? 'Yes' : 'No'}`)
      })
    }
  } finally {
    await connection.end()
  }
}

checkSessions().catch(console.error)
