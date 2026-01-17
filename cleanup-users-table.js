/**
 * Clean up orphaned users in the users table
 * (Users whose Firebase accounts have been deleted)
 * 
 * Usage: 
 *   node cleanup-users-table.js              - Shows what would be cleaned
 *   node cleanup-users-table.js --delete     - Actually deletes orphaned records
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

async function main() {
    const shouldDelete = process.argv.includes('--delete')

    try {
        console.log('🔍 Checking users table for orphaned records...\n')

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

        // Get all users
        const [users] = await connection.execute(
            'SELECT userId, userEmail, subscriptionStatus, createdAt FROM users ORDER BY createdAt DESC'
        )

        console.log(`📊 Found ${users.length} users in database\n`)

        // Check for duplicates
        console.log('🔍 Checking for duplicate emails...')
        const emailMap = new Map()
        for (const user of users) {
            if (!emailMap.has(user.userEmail)) {
                emailMap.set(user.userEmail, [])
            }
            emailMap.get(user.userEmail).push(user)
        }

        const duplicates = Array.from(emailMap.entries()).filter(([email, list]) => list.length > 1)
        if (duplicates.length > 0) {
            console.log(`\n⚠️  Found ${duplicates.length} duplicate email(s):\n`)
            for (const [email, list] of duplicates) {
                console.log(`   ${email}:`)
                for (const u of list) {
                    console.log(`      - userId: ${u.userId}, status: ${u.subscriptionStatus}, created: ${u.createdAt}`)
                }
            }
        } else {
            console.log('   ✅ No duplicate emails found')
        }

        // Check for orphaned users
        console.log('\n🔍 Checking for orphaned users (Firebase accounts deleted)...\n')
        const orphanedUsers = []

        for (const user of users) {
            try {
                await auth.getUser(user.userId)
                // User exists in Firebase
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    console.log(`   ❌ ${user.userEmail} (userId: ${user.userId})`)
                    console.log(`      Status: ${user.subscriptionStatus}, Created: ${user.createdAt}`)
                    orphanedUsers.push(user)
                }
            }
        }

        console.log(`\n📈 Summary:`)
        console.log(`   Total users: ${users.length}`)
        console.log(`   Duplicate emails: ${duplicates.length}`)
        console.log(`   Orphaned users: ${orphanedUsers.length}`)
        console.log(`   Valid users: ${users.length - orphanedUsers.length}`)

        if (orphanedUsers.length > 0) {
            if (shouldDelete) {
                console.log('\n🗑️  Deleting orphaned users...')
                const userIds = orphanedUsers.map(u => connection.escape(u.userId))
                const [result] = await connection.execute(
                    `DELETE FROM users WHERE userId IN (${userIds.join(',')})`
                )
                console.log(`✅ Deleted ${result.affectedRows} orphaned user(s)`)

                // Also clean up related data
                console.log('\n🧹 Cleaning up related data...')

                // Clean up patients
                const [patientsResult] = await connection.execute(
                    `DELETE FROM patients WHERE userId IN (${userIds.join(',')})`
                )
                console.log(`   Deleted ${patientsResult.affectedRows} patient record(s)`)

            } else {
                console.log('\n💡 To delete these orphaned users, run:')
                console.log('   node cleanup-users-table.js --delete')
                console.log('\n⚠️  WARNING: This will also delete all related data (patients, notes, etc.)')
            }
        } else {
            console.log('\n✨ No orphaned users found!')
        }

        if (duplicates.length > 0) {
            console.log('\n⚠️  MANUAL ACTION NEEDED for duplicate emails:')
            console.log('   Review the duplicate entries above and manually decide which to keep.')
            console.log('   Then delete the unwanted ones using:')
            console.log('   DELETE FROM users WHERE userId = "userId_to_delete";')
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
