/**
 * PUT /api/patients/:id
 * Update a patient
 */
import { defineEventHandler, createError, getRouterParam, readBody } from 'h3'
import { queryOne, transaction } from '../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId, canEdit } from '../../utils/auth'

interface UpdatePatientBody {
  name?: string           // lastName
  firstName?: string
  gender?: 'M' | 'F'
  birthDate?: string      // YYYY-MM-DD
  healthInsuranceNb?: string
  indication?: string | null
  isActive?: boolean
  targetMin?: number | null
  targetMax?: number | null
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    
    // Check edit permission
    if (!canEdit(user)) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to update patients'
      })
    }
    
    const accountOwnerId = getEffectiveAccountOwnerId(user)
    const patientId = getRouterParam(event, 'id')
    const body = await readBody<UpdatePatientBody>(event)
    
    if (!patientId) {
      throw createError({
        statusCode: 400,
        message: 'Patient ID is required'
      })
    }
    
    // Validate gender if provided
    if (body.gender && !['M', 'F'].includes(body.gender)) {
      throw createError({
        statusCode: 400,
        message: 'Gender must be M or F'
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
    
    // Update patient in transaction
    await transaction(async (conn) => {
      // Build dynamic update query
      const updates: string[] = []
      const params: any[] = []
      
      if (body.name !== undefined) {
        updates.push('name = ?')
        params.push(body.name)
      }
      if (body.firstName !== undefined) {
        updates.push('firstName = ?')
        params.push(body.firstName)
      }
      if (body.gender !== undefined) {
        updates.push('gender = ?')
        params.push(body.gender)
      }
      if (body.birthDate !== undefined) {
        updates.push('birthDate = ?')
        params.push(body.birthDate)
      }
      if (body.healthInsuranceNb !== undefined) {
        updates.push('healthInsuranceNb = ?')
        params.push(body.healthInsuranceNb)
      }
      if (body.indication !== undefined) {
        updates.push('indication = ?')
        params.push(body.indication)
      }
      if (body.isActive !== undefined) {
        updates.push('isActive = ?')
        params.push(body.isActive ? 1 : 0)
      }
      
      if (updates.length > 0) {
        updates.push('updatedAt = CURRENT_TIMESTAMP')
        params.push(patientId, accountOwnerId)
        
        await conn.execute(
          `UPDATE patients SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
          params
        )
      }
      
      // Update target INR if provided
      if (body.targetMin !== undefined || body.targetMax !== undefined) {
        // Check if drugs_by_patients record exists
        const [existingDrug] = await conn.execute(
          'SELECT id FROM drugs_by_patients WHERE patientId = ? AND drugId = 11',
          [patientId]
        ) as any
        
        if (existingDrug.length > 0) {
          // Update existing record
          const drugUpdates: string[] = []
          const drugParams: any[] = []
          
          if (body.targetMin !== undefined) {
            drugUpdates.push('targetMin = ?')
            drugParams.push(body.targetMin)
          }
          if (body.targetMax !== undefined) {
            drugUpdates.push('targetMax = ?')
            drugParams.push(body.targetMax)
          }
          
          if (drugUpdates.length > 0) {
            drugParams.push(patientId)
            await conn.execute(
              `UPDATE drugs_by_patients SET ${drugUpdates.join(', ')} WHERE patientId = ? AND drugId = 11`,
              drugParams
            )
          }
        } else {
          // Insert new record
          await conn.execute(
            'INSERT INTO drugs_by_patients (patientId, drugId, targetMin, targetMax, createdAt) VALUES (?, 11, ?, ?, NOW())',
            [patientId, body.targetMin || null, body.targetMax || null]
          )
        }
      }
    })
    
    return { success: true, id: parseInt(patientId) }
  } catch (error: any) {
    console.error('PUT /api/patients/:id error:', error)
    throw error
  }
})
