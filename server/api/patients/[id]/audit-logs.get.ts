import { defineEventHandler, createError, getRouterParam, getQuery } from 'h3'
import { query as dbQuery } from '../../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
    try {
        // Get auth user
        const user = await verifyAuth(event)
        const accountOwnerId = getEffectiveAccountOwnerId(user)

        // Get patient ID from route params
        const patientId = getRouterParam(event, 'id')
        if (!patientId) {
            throw createError({
                statusCode: 400,
                message: 'Patient ID is required'
            })
        }

        console.log('📋 Fetching audit logs for patient:', patientId, 'accountOwner:', accountOwnerId)

        // Get pagination params
        const queryParams = getQuery(event)
        const page = parseInt(queryParams.page as string) || 1
        const limit = parseInt(queryParams.limit as string) || 20
        const offset = (page - 1) * limit

        // Verify patient belongs to user's organization
        const patientRows = await dbQuery(
            `SELECT id FROM patients 
       WHERE id = ? AND userId = ?`,
            [patientId, accountOwnerId]
        )

        if (!Array.isArray(patientRows) || patientRows.length === 0) {
            console.error('❌ Patient not found or access denied')
            throw createError({
                statusCode: 404,
                message: 'Patient not found'
            })
        }

        console.log('✅ Patient access verified')

        // Get total count
        const countRows = await dbQuery(
            'SELECT COUNT(*) as total FROM patient_audit_log WHERE patientId = ?',
            [patientId]
        )
        const total = Array.isArray(countRows) && countRows.length > 0 ? (countRows[0] as any).total : 0

        console.log('📊 Total audit logs:', total)

        // Get paginated logs - Note: LIMIT and OFFSET must be in the SQL string, not parameters
        const logRows = await dbQuery(
            `SELECT id, patientId, tableName, userId, userName, action, fieldName, oldValue, newValue, description, createdAt
       FROM patient_audit_log
       WHERE patientId = ?
       ORDER BY createdAt DESC
       LIMIT ${limit} OFFSET ${offset}`,
            [patientId]
        )

        console.log('📝 Fetched logs:', Array.isArray(logRows) ? logRows.length : 0)

        return {
            logs: logRows,
            total,
            page,
            limit
        }
    } catch (error: any) {
        console.error('❌ Error fetching audit logs:', error)
        console.error('❌ Error stack:', error.stack)
        console.error('❌ Error message:', error.message)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch audit logs'
        })
    }
})
