/**
 * PUT /api/users/organization
 * Update organization settings (account owner only)
 */
import { execute } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

interface OrganizationUpdateBody {
  organizationName?: string
  organizationType?: string
  telephone?: string
  fax?: string
  address?: string
  postalCode?: string
  city?: string
  country?: string
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    
    // Only account owners can update organization
    if (user.role) {
      throw createError({
        statusCode: 403,
        message: 'Only account owners can modify organization settings'
      })
    }
    
    const body = await readBody<OrganizationUpdateBody>(event)
    
    await execute(
      `UPDATE users 
       SET organizationName = ?, organizationType = ?, telephone = ?, fax = ?,
           address = ?, postalCode = ?, city = ?, country = ?, updatedAt = NOW()
       WHERE userId = ?`,
      [
        body.organizationName || null,
        body.organizationType || null,
        body.telephone || null,
        body.fax || null,
        body.address || null,
        body.postalCode || null,
        body.city || null,
        body.country || null,
        user.uid
      ]
    )
    
    return { success: true, message: 'Organization updated successfully' }
  } catch (error: any) {
    console.error('❌ Organization update error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update organization'
    })
  }
})
