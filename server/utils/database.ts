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
  // Read directly from process.env at runtime (not from runtimeConfig which is set at build time)
  const socketPath = process.env.DB_SOCKET_PATH || ''
  
  console.log('🔧 Database config:', {
    DB_SOCKET_PATH: process.env.DB_SOCKET_PATH,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    hasPassword: !!process.env.DB_PASSWORD
  })
  
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'master',
    port: parseInt(process.env.DB_PORT || '3306'),
    socketPath: socketPath || undefined
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
