import mysql from 'mysql2/promise';

(async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: 'SecurePass2025!',
    database: 'master'
  });
  
  const [columns] = await conn.query('DESCRIBE users');
  console.log('Users table columns:');
  console.log(columns.map(col => col.Field).join(', '));
  
  await conn.end();
})().catch(console.error);
