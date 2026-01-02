import mysql from 'mysql2/promise';

(async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: 'SecurePass2025!',
    database: 'master'
  });

  // Check current users
  const [users] = await conn.execute("SELECT User, Host FROM mysql.user WHERE User='root'");
  console.log('Current root users:', users);
  
  // Set password for root@'%' to match root@'localhost'
  await conn.execute("ALTER USER 'root'@'%' IDENTIFIED BY 'SecurePass2025!'");
  await conn.execute('FLUSH PRIVILEGES');
  
  console.log('✅ SUCCESS: root@% password updated - Cloud SQL Proxy connections will now work');
  await conn.end();
})().catch(e => console.error('❌ ERROR:', e.message));
