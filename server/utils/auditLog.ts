import { execute } from './database'

interface AuditLogParams {
    patientId: number
    tableName: string
    userId: string
    userName: string
    action: 'CREATE' | 'UPDATE' | 'DELETE'
    fieldName?: string
    oldValue?: string | null
    newValue?: string | null
    description?: string
}

/**
 * Log an audit entry to patient_audit_log table
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
    try {
        await execute(
            `INSERT INTO patient_audit_log 
       (patientId, tableName, userId, userName, action, fieldName, oldValue, newValue, description, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                params.patientId,
                params.tableName,
                params.userId,
                params.userName,
                params.action,
                params.fieldName || null,
                params.oldValue || null,
                params.newValue || null,
                params.description || null
            ]
        )
        console.log(`📝 Audit log: ${params.action} ${params.tableName} for patient ${params.patientId}`)
    } catch (error) {
        // Don't throw - audit logging should never break the main functionality
        console.error('❌ Audit logging failed:', error)
    }
}

/**
 * Log multiple field changes for a patient update
 */
export async function logPatientUpdate(
    patientId: number,
    userId: string,
    userName: string,
    oldValues: any,
    newValues: any
): Promise<void> {
    const fields = ['name', 'firstName', 'gender', 'birthDate', 'healthInsuranceNb', 'indication', 'isActive']

    for (const field of fields) {
        if (newValues[field] !== undefined && oldValues[field] !== newValues[field]) {
            await logAudit({
                patientId,
                tableName: 'patients',
                userId,
                userName,
                action: 'UPDATE',
                fieldName: field,
                oldValue: oldValues[field]?.toString(),
                newValue: newValues[field]?.toString(),
                description: `Updated ${field}`
            })
        }
    }
}
