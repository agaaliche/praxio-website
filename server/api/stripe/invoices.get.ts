/**
 * GET /api/stripe/invoices
 * Fetch billing history (invoices) from Stripe for the current user
 */
import { defineEventHandler } from 'h3'
import Stripe from 'stripe'
import { queryOne } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any
})

interface Invoice {
  id: string
  number: string | null
  date: number
  amount: number
  currency: string
  status: string
  pdfUrl: string | null
  description: string | null
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)

    // Get user's Stripe customer ID from database
    const userRecord = await queryOne<{ stripeCustomerId: string | null }>(
      'SELECT stripeCustomerId FROM users WHERE userId = ?',
      [user.uid]
    )

    if (!userRecord?.stripeCustomerId) {
      // Return empty array if no Stripe customer exists
      return { invoices: [] }
    }

    // Fetch all invoices from Stripe
    const stripeInvoices = await stripe.invoices.list({
      customer: userRecord.stripeCustomerId,
      limit: 100 // Get all invoices
    })

    console.log(`[Invoices] Found ${stripeInvoices.data.length} invoices for customer ${userRecord.stripeCustomerId}`)

    // Map to simplified invoice format (include all statuses)
    const invoices: Invoice[] = stripeInvoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      date: inv.created,
      amount: inv.amount_paid || inv.amount_due,
      currency: inv.currency,
      status: inv.status || 'unknown',
      pdfUrl: inv.invoice_pdf,
      description: inv.lines.data[0]?.description || null
    }))

    return { invoices }
  } catch (error: any) {
    console.error('Error fetching invoices:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch invoices'
    })
  }
})
