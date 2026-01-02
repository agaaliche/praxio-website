/**
 * GET /api/patients
 * Get all patients for the account with their target INR values
 */
import { defineEventHandler, getQuery, createError } from 'h3'
import { query } from '../../utils/database'
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
    
    // Get query params for filtering
    const queryParams = getQuery(event)
    const includeInactive = queryParams.includeInactive === 'true'
    
    // Get patients with their target INR values from drugs_by_patients table
    let sql = `
      SELECT 
        p.id, p.userId, p.name, p.firstName, p.gender, 
        p.birthDate, p.healthInsuranceNb, p.indication, p.isActive,
        p.createdAt, p.updatedAt,
        pd.targetMin, pd.targetMax
      FROM patients p
      LEFT JOIN drugs_by_patients pd ON p.id = pd.patientId AND pd.drugId = 11
      WHERE p.userId = ?
    `
    const params: any[] = [accountOwnerId]
    
    if (!includeInactive) {
      sql += ' AND p.isActive = 1'
    }
    
    sql += ' ORDER BY p.name, p.firstName'
    
    const patients = await query<Patient>(sql, params)
    
    return patients.map(p => ({
      ...p,
      isActive: Boolean(p.isActive),
      birthDate: p.birthDate ? new Date(p.birthDate).toISOString().split('T')[0] : null
    }))
  } catch (error: any) {
    console.error('GET /api/patients error:', error)
    throw error
  }
})
