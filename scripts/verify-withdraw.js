// scripts/verify-withdraw.js
const { db, admin } = require('./firebase-admin');

const AUTO_APPROVE_THRESHOLD = 50000; // Koin
const AUTO_APPROVE_ENABLED = false; // Set true untuk aktifkan

async function main() {
  console.log('Checking pending withdrawals...');
  
  const snapshot = await db.collection('withdrawals')
    .where('status', '==', 'pending')
    .get();
  
  if (snapshot.empty) {
    console.log('No pending withdrawals');
    return;
  }
  
  console.log(`Found ${snapshot.size} pending withdrawals`);
  
  for (const doc of snapshot.docs) {
    const wd = doc.data();
    console.log(`  - ${wd.amount} koin → ${wd.method} (${wd.account_number})`);
    
    if (AUTO_APPROVE_ENABLED && wd.amount <= AUTO_APPROVE_THRESHOLD) {
      await doc.ref.update({
        status: 'approved',
        processed_at: admin.firestore.FieldValue.serverTimestamp(),
        note: 'Auto-approved (below threshold)'
      });
      console.log(`    OK Auto-approved`);
    } else {
      console.log(`    PENDING Manual review needed`);
    }
  }
}

main().catch(err => {
  console.error('Verify failed:', err);
  process.exit(1);
});
