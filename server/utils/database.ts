import mysql from 'mysql2/promise'
import type { Pool, PoolConnection } from 'mysql2/promise'

let pool: Pool | null = null

export interface DatabaseConfig {
  host: string
  user: string
  password: string
  database: string
  port: number
  socketPath?: string
}

function getConfig(): DatabaseConfig {
  const config = useRuntimeConfig()
  
  return {
    host: config.dbHost || 'localhost',
    user: config.dbUser || 'root',
    password: config.dbPassword || '',
    database: config.dbName || 'master',
    port: parseInt(config.dbPort || '3306'),
    socketPath: config.dbSocketPath || undefined
  }
}

export function getPool(): Pool {
  if (!pool) {
    const config = getConfig()
    
    const poolConfig: any = {
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }
    
    // Check if using Unix socket (Cloud SQL Proxy)
    if (config.socketPath) {
      poolConfig.socketPath = config.socketPath
    } else {
      poolConfig.host = config.host
      poolConfig.port = config.port
    }
    
    pool = mysql.createPool(poolConfig)
    console.log('📦 Database pool created:', {
      host: config.socketPath || config.host,
      database: config.database
    })
  }
  
  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const pool = getPool()
  const [rows] = await pool.execute(sql, params)
  return rows as T[]
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows.length > 0 ? rows[0] : null
}

export async function execute(sql: string, params?: any[]): Promise<{ affectedRows: number; insertId: number }> {
  const pool = getPool()
  const [result] = await pool.execute(sql, params) as any
  return {
    affectedRows: result.affectedRows,
    insertId: result.insertId
  }
}

export async function getConnection(): Promise<PoolConnection> {
  const pool = getPool()
  return await pool.getConnection()
}

export async function transaction<T>(callback: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await getConnection()
  try {
    await conn.beginTransaction()
    const result = await callback(conn)
    await conn.commit()
    return result
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}
