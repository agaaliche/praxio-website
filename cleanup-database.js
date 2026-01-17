/**
 * Comprehensive database cleanup script
 * 
 * Cleans up orphaned records across all user-related tables:
 * - authorized_users (team members whose account owners no longer exist)
 * - tickets (tickets from deleted users)
 * - admin_messages (messages to deleted users)
 * 
 * Usage: 
 *   node cleanup-database.js              - Shows what would be cleaned
 *   node cleanup-database.js --delete     - Actually deletes orphaned records
 *   node cleanup-database.js --dry-run    - Same as no flags (shows preview)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

let connection = null

async function initFirebase() {
    let app
    const apps = getApps()
    if (apps.length > 0) {
        app = apps[0]
    } else {
        let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
        if (!serviceAccountJson && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
            serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
        }
        if (!serviceAccountJson) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable not set')
        }
        const serviceAccount = JSON.parse(serviceAccountJson)
        app = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id
        })
    }
    return getAuth(app)
}

async function connectDatabase() {
    connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3307,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'master'
    })
    return connection
}

async function checkUserExists(auth, uid) {
    try {
        await auth.getUser(uid)
        return true
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return false
        }
        throw error
    }
}

async function cleanAuthorizedUsers(auth, shouldDelete) {
    console.log('\n📋 Checking authorized_users table...')

    const [rows] = await connection.execute(
        'SELECT id, email, account_owner_id, status, created_at FROM authorized_users'
    )

    const orphaned = []
    for (const row of rows) {
        const exists = await checkUserExists(auth, row.account_owner_id)
        if (!exists) {
            orphaned.push(row)
            console.log(`   ❌ ${row.email} (owner: ${row.account_owner_id}, status: ${row.status})`)
        }
    }

    console.log(`   Total: ${rows.length}, Orphaned: ${orphaned.length}`)

    if (orphaned.length > 0 && shouldDelete) {
        const ids = orphaned.map(r => r.id)
        const [result] = await connection.execute(
            `DELETE FROM authorized_users WHERE id IN (${ids.join(',')})`
        )
        console.log(`   ✅ Deleted ${result.affectedRows} orphaned record(s)`)
    }

    return orphaned.length
}

async function cleanTickets(auth, shouldDelete) {
    console.log('\n🎫 Checking tickets table...')

    const [rows] = await connection.execute(
        'SELECT id, userId, userEmail, title, status, createdAt FROM tickets'
    )

    const orphaned = []
    for (const row of rows) {
        const exists = await checkUserExists(auth, row.userId)
        if (!exists) {
            orphaned.push(row)
            console.log(`   ❌ Ticket #${row.id} from ${row.userEmail} (user: ${row.userId})`)
        }
    }

    console.log(`   Total: ${rows.length}, Orphaned: ${orphaned.length}`)

    if (orphaned.length > 0 && shouldDelete) {
        const ids = orphaned.map(r => r.id)
        const [result] = await connection.execute(
            `DELETE FROM tickets WHERE id IN (${ids.join(',')})`
        )
        console.log(`   ✅ Deleted ${result.affectedRows} orphaned ticket(s)`)
    }

    return orphaned.length
}

async function cleanAdminMessages(auth, shouldDelete) {
    console.log('\n💬 Checking admin_messages table...')

    const [rows] = await connection.execute(
        'SELECT id, target_uid, message, created_at FROM admin_messages WHERE 1=1 LIMIT 1000'
    )

    const orphaned = []
    for (const row of rows) {
        const exists = await checkUserExists(auth, row.target_uid)
        if (!exists) {
            orphaned.push(row)
            console.log(`   ❌ Message to ${row.target_uid} from ${row.created_at}`)
        }
    }

    console.log(`   Total: ${rows.length}, Orphaned: ${orphaned.length}`)

    if (orphaned.length > 0 && shouldDelete) {
        const ids = orphaned.map(r => r.id)
        const [result] = await connection.execute(
            `DELETE FROM admin_messages WHERE id IN (${ids.join(',')})`
        )
        console.log(`   ✅ Deleted ${result.affectedRows} orphaned message(s)`)
    }

    return orphaned.length
}

async function main() {
    const shouldDelete = process.argv.includes('--delete')
    const isDryRun = !shouldDelete

    try {
        console.log('🧹 Database Cleanup Utility')
        console.log('===========================')
        console.log(isDryRun ? '\n🔍 DRY RUN MODE (no changes will be made)' : '\n⚠️  DELETE MODE (will remove orphaned records)')

        const auth = await initFirebase()
        console.log('✓ Firebase Admin initialized')

        await connectDatabase()
        console.log('✓ Database connected')

        let totalOrphaned = 0
        totalOrphaned += await cleanAuthorizedUsers(auth, shouldDelete)
        totalOrphaned += await cleanTickets(auth, shouldDelete)
        totalOrphaned += await cleanAdminMessages(auth, shouldDelete)

        console.log('\n' + '='.repeat(50))
        console.log(`📊 Total orphaned records: ${totalOrphaned}`)

        if (totalOrphaned > 0 && isDryRun) {
            console.log('\n💡 To delete these orphaned records, run:')
            console.log('   node cleanup-database.js --delete')
        } else if (totalOrphaned === 0) {
            console.log('\n✨ Database is clean! No orphaned records found.')
        } else {
            console.log('\n✅ Cleanup completed successfully!')
        }

        await connection.end()
        process.exit(0)
    } catch (error) {
        console.error('\n❌ Error:', error.message)
        console.error(error)
        if (connection) await connection.end()
        process.exit(1)
    }
}

main()
