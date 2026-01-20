/**
 * Script to clean up orphaned user references in the database
 * 
 * This script:
 * 1. Lists all authorized_users with expired status or invalid account_owner_ids
 * 2. Provides option to delete them
 * 
 * Usage: node cleanup-orphaned-users.js [--delete]
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

async function main() {
    const shouldDelete = process.argv.includes('--delete')

    try {
        console.log('🔍 Checking for orphaned user references...\n')

        // Initialize Firebase Admin
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
        const auth = getAuth(app)
        console.log('✓ Firebase Admin initialized\n')

        // Connect to database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3307,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'master'
        })
        console.log('✓ Database connected\n')

        // Get all authorized_users
        const [authorizedUsers] = await connection.execute(
            'SELECT id, email, account_owner_id, status, created_at FROM authorized_users ORDER BY created_at DESC'
        )

        console.log(`📊 Found ${authorizedUsers.length} authorized user entries\n`)

        const orphanedUsers = []

        // Check each account_owner_id against Firebase
        for (const user of authorizedUsers) {
            try {
                await auth.getUser(user.account_owner_id)
                // User exists in Firebase, it's valid
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    console.log(`❌ Orphaned: ${user.email} (account_owner_id: ${user.account_owner_id})`)
                    console.log(`   Status: ${user.status}, Created: ${user.created_at}`)
                    orphanedUsers.push(user)
                }
            }
        }

        console.log(`\n📈 Summary:`)
        console.log(`   Total authorized users: ${authorizedUsers.length}`)
        console.log(`   Orphaned users: ${orphanedUsers.length}`)
        console.log(`   Valid users: ${authorizedUsers.length - orphanedUsers.length}`)

        if (orphanedUsers.length > 0) {
            if (shouldDelete) {
                console.log('\n🗑️  Deleting orphaned users...')
                const ids = orphanedUsers.map(u => u.id)
                const [result] = await connection.execute(
                    `DELETE FROM authorized_users WHERE id IN (${ids.join(',')})`
                )
                console.log(`✅ Deleted ${result.affectedRows} orphaned user(s)`)
            } else {
                console.log('\n💡 To delete these orphaned users, run:')
                console.log('   node cleanup-orphaned-users.js --delete')
            }
        } else {
            console.log('\n✨ No orphaned users found! Database is clean.')
        }

        await connection.end()
        process.exit(0)
    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error(error)
        process.exit(1)
    }
}

main()
