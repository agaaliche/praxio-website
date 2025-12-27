import { stripeService } from '../../services/stripe'
import { queryOne } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await verifyAuth(event)

    const body = await readBody(event)
    const { returnUrl } = body

    if (!returnUrl) {
      throw createError({ 
        statusCode: 400, 
        message: 'Return URL is required' 
      })
    }

    // Get user's Stripe customer ID from database
    const userRecord = await queryOne<{ stripeCustomerId: string | null }>(
      'SELECT stripeCustomerId FROM users WHERE userId = ?',
      [user.uid]
    )

    if (!userRecord) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }
    
    if (!userRecord.stripeCustomerId) {
      throw createError({ 
        statusCode: 400, 
        message: 'No billing account found. Please subscribe to a plan first.' 
      })
    }

    const session = await stripeService.createBillingPortalSession(
      userRecord.stripeCustomerId,
      returnUrl
    )

    return { 
      success: true, 
      url: session.url
    }
  } catch (error: any) {
    console.error('Error in createBillingPortalSession:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Failed to create billing portal session'
    })
  }
})
