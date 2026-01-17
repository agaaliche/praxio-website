/**
 * Script to set siteadmin custom claim for a Firebase user
 * 
 * Usage: node set-siteadmin.js <email>
 * Example: node set-siteadmin.js amine.gaaliche@gmail.com
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

async function setSiteAdmin(email) {
    try {
        console.log(`🔍 Looking up user: ${email}`)

        // Initialize Firebase Admin
        let app
        const apps = getApps()
        if (apps.length > 0) {
            app = apps[0]
        } else {
            // Try to get service account from env
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
            console.log('✓ Firebase Admin initialized')
        }

        const auth = getAuth(app)

        // Get the user by email
        const user = await auth.getUserByEmail(email)
        console.log(`✅ Found user: ${user.uid}`)
        console.log(`📋 Current custom claims:`, user.customClaims || {})

        // Get existing claims and add siteadmin
        const existingClaims = user.customClaims || {}
        const newClaims = {
            ...existingClaims,
            siteadmin: true
        }

        // Set the custom claims
        await auth.setCustomUserClaims(user.uid, newClaims)
        console.log(`✅ Set siteadmin claim for user: ${email}`)
        console.log(`📋 New custom claims:`, newClaims)

        // Verify the claims were set
        const updatedUser = await auth.getUser(user.uid)
        console.log(`✅ Verified claims:`, updatedUser.customClaims)

        console.log('\n🎉 Done! User needs to refresh their session to get the new claims.')
        console.log('   They can sign out and sign back in, or the token will refresh automatically.')

        process.exit(0)
    } catch (error) {
        console.error(`❌ Error setting siteadmin:`, error.message)
        console.error(error)
        process.exit(1)
    }
}

// Get email from command line
const email = process.argv[2]
if (!email) {
    console.log('Usage: node set-siteadmin.js <email>')
    console.log('Example: node set-siteadmin.js amine.gaaliche@gmail.com')
    process.exit(1)
}

setSiteAdmin(email)
