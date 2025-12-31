import mysql from 'mysql2/promise';

(async () => {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: 'SecurePass2025!',
    database: 'master'
  });
  
  const email = 'amine.gaaliche@gmail.com';
  
  console.log(`Resetting user: ${email}`);
  
  const [result] = await conn.query(
    `UPDATE users 
     SET subscriptionStatus = NULL,
         planType = NULL,
         trialStartDate = NULL,
         trialEndDate = NULL,
         subscriptionEndDate = NULL,
         nextBillingDate = NULL,
         subscriptionId = NULL,
         subscriptionPriceId = NULL,
         pendingPriceId = NULL,
         pendingPlanStartDate = NULL,
         scheduledPriceId = NULL,
         scheduledChangeDate = NULL,
         isGrandfathered = 0,
         gracePeriodEndDate = NULL
     WHERE userEmail = ?`,
    [email]
  );
  
  console.log(`✅ User reset complete. Rows affected: ${result.affectedRows}`);
  
  // Show updated user
  const [rows] = await conn.query(
    `SELECT userId, userEmail, userName, userLastName, subscriptionStatus, 
            planType, trialStartDate, trialEndDate, stripeCustomerId, subscriptionId
     FROM users 
     WHERE userEmail = ?`,
    [email]
  );
  
  console.log('\nUpdated user data:');
  console.log(JSON.stringify(rows[0], null, 2));
  
  await conn.end();
})().catch(console.error);
