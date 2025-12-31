import mysql from 'mysql2/promise';

(async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: 'SecurePass2025!',
    database: 'master'
  });
  
  const [rows] = await conn.query(
    `SELECT userId, userEmail, userName, userLastName, subscriptionStatus, 
            planType, trialStartDate, trialEndDate, 
            subscriptionEndDate, nextBillingDate, stripeCustomerId, subscriptionId, createdAt
     FROM users 
     WHERE userEmail LIKE ? OR CONCAT(userName, ' ', userLastName) LIKE ?`,
    ['%amine.gaaliche%', '%amine%gaaliche%']
  );
  
  console.log(JSON.stringify(rows, null, 2));
  await conn.end();
})().catch(console.error);
