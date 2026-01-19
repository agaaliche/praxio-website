/**
 * POST /api/patients
 * Create a new patient
 */
import { defineEventHandler, createError, readBody, setResponseStatus } from 'h3'
import { transaction } from '../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId, canEdit } from '../../utils/auth'
import { logAudit } from '../../utils/auditLog'

interface CreatePatientBody {
  name: string           // lastName
  firstName: string
  gender: 'M' | 'F'
  birthDate: string      // YYYY-MM-DD
  healthInsuranceNb: string
  indication?: string
  isActive?: boolean
  targetMin?: number
  targetMax?: number
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)

    // Check edit permission
    if (!canEdit(user)) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to create patients'
      })
    }

    const accountOwnerId = getEffectiveAccountOwnerId(user)
    const body = await readBody<CreatePatientBody>(event)

    // Validate required fields
    if (!body.name || !body.firstName || !body.gender || !body.birthDate || !body.healthInsuranceNb) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: name, firstName, gender, birthDate, healthInsuranceNb'
      })
    }

    // Validate gender
    if (!['M', 'F'].includes(body.gender)) {
      throw createError({
        statusCode: 400,
        message: 'Gender must be M or F'
      })
    }

    // Create patient with target INR in a transaction
    const result = await transaction(async (conn) => {
      // Insert the patient
      const [patientResult] = await conn.execute(
        `INSERT INTO patients (userId, name, firstName, gender, birthDate, healthInsuranceNb, indication, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          accountOwnerId,
          body.name,
          body.firstName,
          body.gender,
          body.birthDate,
          body.healthInsuranceNb,
          body.indication || null,
          body.isActive !== false ? 1 : 0
        ]
      ) as any

      const patientId = patientResult.insertId

      // Insert target INR if provided (drugId 11 = warfarin)
      if (body.targetMin !== undefined || body.targetMax !== undefined) {
        await conn.execute(
          `INSERT INTO drugs_by_patients (patientId, drugId, targetMin, targetMax) 
           VALUES (?, 11, ?, ?)`,
          [patientId, body.targetMin || null, body.targetMax || null]
        )
      }

      return {
        id: patientId,
        userId: accountOwnerId,
        name: body.name,
        firstName: body.firstName,
        gender: body.gender,
        birthDate: body.birthDate,
        healthInsuranceNb: body.healthInsuranceNb,
        indication: body.indication || null,
        isActive: body.isActive !== false,
        targetMin: body.targetMin || null,
        targetMax: body.targetMax || null
      }
    })

    // Log audit trail
    await logAudit({
      patientId: result.id,
      tableName: 'patients',
      userId: user.uid,
      userName: user.email || user.uid,
      action: 'CREATE',
      description: `Created patient ${result.firstName} ${result.name}`
    })

    setResponseStatus(event, 201)
    return result
  } catch (error: any) {
    console.error('POST /api/patients error:', error)
    throw error
  }
})
