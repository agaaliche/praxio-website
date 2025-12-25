/**
 * GET /api/patients/:id
 * Get a single patient by ID
 */
import { queryOne } from '../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId } from '../../utils/auth'

interface Patient {
  id: number
  userId: string
  name: string
  firstName: string
  gender: string
  birthDate: string
  healthInsuranceNb: string
  indication: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  targetMin: number | null
  targetMax: number | null
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    const accountOwnerId = getEffectiveAccountOwnerId(user)
    const patientId = getRouterParam(event, 'id')
    
    if (!patientId) {
      throw createError({
        statusCode: 400,
        message: 'Patient ID is required'
      })
    }
    
    const patient = await queryOne<Patient>(
      `SELECT 
        p.id, p.userId, p.name, p.firstName, p.gender, 
        p.birthDate, p.healthInsuranceNb, p.indication, p.isActive,
        p.createdAt, p.updatedAt,
        pd.targetMin, pd.targetMax
      FROM patients p
      LEFT JOIN drugs_by_patients pd ON p.id = pd.patientId AND pd.drugId = 11
      WHERE p.id = ? AND p.userId = ?`,
      [patientId, accountOwnerId]
    )
    
    if (!patient) {
      throw createError({
        statusCode: 404,
        message: 'Patient not found'
      })
    }
    
    return {
      ...patient,
      isActive: Boolean(patient.isActive),
      birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : null
    }
  } catch (error: any) {
    console.error('GET /api/patients/:id error:', error)
    throw error
  }
})
