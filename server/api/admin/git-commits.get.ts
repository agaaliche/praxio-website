/**
 * GET /api/admin/git-commits
 * Get git commit history (siteadmin only)
 */
import { defineEventHandler } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
    // Verify siteadmin access
    const admin = await verifySiteAdmin(event)

    // Rate limiting
    checkRateLimit(event, admin.uid, RateLimits.READ)

    try {
        // Check if git is available and we're in a git repository
        const gitCheckResult = await execAsync('git rev-parse --is-inside-work-tree', {
            cwd: process.cwd()
        }).catch(() => null)

        if (!gitCheckResult) {
            console.warn('⚠️ Not a git repository or git not available')
            return { success: false, commits: [], error: 'Git repository not available' }
        }

        // Get git log with format: hash|author|date|message
        const { stdout } = await execAsync(
            'git log --pretty=format:"%h|%an|%aI|%s" -n 1000',
            { cwd: process.cwd() }
        )

        if (!stdout || !stdout.trim()) {
            return { success: true, commits: [] }
        }

        const commits = stdout
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [hash, author, date, ...messageParts] = line.split('|')
                return {
                    hash: hash || '',
                    author: author || '',
                    date: date || '',
                    message: messageParts.join('|') || '' // Handle messages with | character
                }
            })

        return { success: true, commits }
    } catch (error: any) {
        console.error('❌ Error getting git commits:', error)
        return { success: false, commits: [], error: error.message }
    }
})
