/**
 * PATCH /api/users/preferences
 * Update user preferences (cross-app settings like language)
 */
import { defineEventHandler, createError, readBody } from 'h3'
import { execute, queryOne } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

interface PreferencesUpdate {
  language?: string
  theme?: string
  timezone?: string
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    const body = await readBody<PreferencesUpdate>(event)
    
    // Validate language if provided
    const validLanguages = ['en', 'fr']
    if (body.language && !validLanguages.includes(body.language)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid language. Must be one of: en, fr'
      })
    }
    
    // Get current preferences
    const currentUser = await queryOne<{ preferences: string | null }>(
      'SELECT preferences FROM users WHERE userId = ?',
      [user.uid]
    )
    
    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }
    
    // Parse current preferences
    let preferences: Record<string, any> = {}
    if (currentUser.preferences) {
      try {
        preferences = typeof currentUser.preferences === 'string' 
          ? JSON.parse(currentUser.preferences)
          : currentUser.preferences
      } catch (e) {
        console.error('Failed to parse preferences:', e)
      }
    }
    
    // Merge with updates
    const updatedPreferences = {
      ...preferences,
      ...body
    }
    
    // Save to database
    await execute(
      'UPDATE users SET preferences = ?, updatedAt = NOW() WHERE userId = ?',
      [JSON.stringify(updatedPreferences), user.uid]
    )
    
    return {
      success: true,
      preferences: updatedPreferences
    }
  } catch (error: any) {
    console.error('PATCH /api/users/preferences error:', error)
    throw error
  }
})
