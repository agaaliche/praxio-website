import { H3Event, createError } from 'h3'

interface RateLimitEntry {
    count: number
    resetAt: number
}

// In-memory store for rate limits
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key)
        }
    }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
    maxRequests: number
    windowMs: number
    message?: string
}

/**
 * Rate limiting middleware for API endpoints
 * @param event H3Event
 * @param userId User identifier (uid)
 * @param config Rate limit configuration
 */
export function checkRateLimit(
    event: H3Event,
    userId: string,
    config: RateLimitConfig
): void {
    const endpoint = event.path
    const key = `${userId}:${endpoint}`
    const now = Date.now()

    let entry = rateLimitStore.get(key)

    // Create or reset entry if window expired
    if (!entry || entry.resetAt < now) {
        entry = {
            count: 0,
            resetAt: now + config.windowMs
        }
        rateLimitStore.set(key, entry)
    }

    // Increment request count
    entry.count++

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
        const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000)
        throw createError({
            statusCode: 429,
            statusMessage: 'Too Many Requests',
            message: config.message || `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`
        })
    }
}

// Preset rate limit configs
export const RateLimits = {
    // Read operations (list, view)
    READ: {
        maxRequests: 100,
        windowMs: 60 * 1000, // 1 minute
        message: 'Too many read requests. Please wait a moment.'
    },

    // Write operations (create, update)
    WRITE: {
        maxRequests: 20,
        windowMs: 60 * 1000,
        message: 'Too many write requests. Please wait a moment.'
    },

    // Dangerous operations (delete, impersonate, mass operations)
    DANGEROUS: {
        maxRequests: 5,
        windowMs: 60 * 1000,
        message: 'Too many sensitive operations. Please wait before trying again.'
    },

    // Message sending (email, SMS, broadcasts)
    MESSAGING: {
        maxRequests: 10,
        windowMs: 60 * 1000,
        message: 'Too many messages sent. Please wait before sending more.'
    }
}
