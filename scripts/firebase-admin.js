// scripts/firebase-admin.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const saJson = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT,
    'base64'
  ).toString('utf-8');
  
  const serviceAccount = JSON.parse(saJson);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
