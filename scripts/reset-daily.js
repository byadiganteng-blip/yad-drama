// scripts/reset-daily.js
const { db, admin } = require('./firebase-admin');

async function main() {
  console.log('Resetting daily reward...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Hapus watch_history yang lama (> 1 hari)
  const snapshot = await db.collection('watch_history')
    .where('last_watched_at', '<', admin.firestore.Timestamp.fromDate(today))
    .get();
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
    count++;
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Deleted ${count} old watch_history entries`);
  } else {
    console.log('No old entries to delete');
  }
  
  console.log('Daily reward reset complete');
}

main().catch(err => {
  console.error('Reset failed:', err);
  process.exit(1);
});
