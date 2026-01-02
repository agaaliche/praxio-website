/**
 * DELETE /api/patients/:id
 * Hard delete a patient and related records
 */
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { queryOne, execute } from '../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId, canEdit } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    
    // Check edit permission
    if (!canEdit(user)) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to delete patients'
      })
    }
    
    const accountOwnerId = getEffectiveAccountOwnerId(user)
    const patientId = getRouterParam(event, 'id')
    
    if (!patientId) {
      throw createError({
        statusCode: 400,
        message: 'Patient ID is required'
      })
    }
    
    // Check patient exists and belongs to user
    const existing = await queryOne<any>(
      'SELECT id FROM patients WHERE id = ? AND userId = ?',
      [patientId, accountOwnerId]
    )
    
    if (!existing) {
      throw createError({
        statusCode: 404,
        message: 'Patient not found'
      })
    }
    
    // Delete related records first (drugs_by_patients)
    await execute(
      'DELETE FROM drugs_by_patients WHERE patientId = ?',
      [patientId]
    )
    
    // Hard delete the patient
    await execute(
      'DELETE FROM patients WHERE id = ? AND userId = ?',
      [patientId, accountOwnerId]
    )
    
    return { success: true, message: 'Patient deleted' }
  } catch (error: any) {
    console.error('DELETE /api/patients/:id error:', error)
    throw error
  }
})
