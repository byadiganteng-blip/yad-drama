// scripts/backup.js
const fs = require('fs');
const path = require('path');
const { db } = require('./firebase-admin');

const COLLECTIONS = ['users', 'dramas', 'episodes', 'watch_history', 'coin_transactions', 'withdrawals'];

async function exportCollection(name) {
  const snapshot = await db.collection(name).get();
  const docs = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    // Convert Timestamp ke ISO string
    for (const key in data) {
      if (data[key] && typeof data[key].toDate === 'function') {
        data[key] = data[key].toDate().toISOString();
      }
    }
    docs.push({ id: doc.id, ...data });
  });
  
  return docs;
}

async function main() {
  console.log('Starting backup...');
  
  const backup = {
    timestamp: new Date().toISOString(),
    project_id: process.env.FIREBASE_PROJECT_ID || 'yad-video-editor',
    collections: {}
  };
  
  for (const col of COLLECTIONS) {
    console.log(`  Exporting ${col}...`);
    backup.collections[col] = await exportCollection(col);
    console.log(`    ${backup.collections[col].length} docs`);
  }
  
  const outputDir = process.argv[2] || 'backup';
  fs.mkdirSync(outputDir, { recursive: true });
  
  const filename = `firestore-backup-${Date.now()}.json`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
  
  console.log(`Backup saved: ${filepath}`);
  console.log(`Size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);
}

main().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
