// scripts/stats.js
const fs = require('fs');
const { db } = require('./firebase-admin');

async function getCount(collection) {
  const snap = await db.collection(collection).count().get();
  return snap.data().count;
}

async function getSum(collection, field) {
  const snap = await db.collection(collection).get();
  let sum = 0;
  snap.forEach(doc => {
    sum += doc.data()[field] || 0;
  });
  return sum;
}

async function main() {
  console.log('Generating stats report...');
  
  const stats = {
    generated_at: new Date().toISOString(),
    total_users: await getCount('users'),
    total_dramas: await getCount('dramas'),
    total_episodes: await getCount('episodes'),
    total_transactions: await getCount('coin_transactions'),
    total_withdrawals: await getCount('withdrawals'),
    pending_withdrawals: 0,
    total_coins_in_circulation: await getSum('users', 'coins'),
    total_coins_earned: await getSum('users', 'total_earned'),
    total_coins_withdrawn: await getSum('users', 'total_withdrawn'),
  };
  
  const pendingSnap = await db.collection('withdrawals')
    .where('status', '==', 'pending')
    .get();
  stats.pending_withdrawals = pendingSnap.size;
  
  console.log('\nStats:');
  for (const [key, value] of Object.entries(stats)) {
    console.log(`  ${key}: ${value}`);
  }
  
  fs.mkdirSync('stats', { recursive: true });
  fs.writeFileSync(
    'stats/latest.json',
    JSON.stringify(stats, null, 2)
  );
  
  console.log('\nStats saved to stats/latest.json');
}

main().catch(err => {
  console.error('Stats failed:', err);
  process.exit(1);
});
