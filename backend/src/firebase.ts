import admin from 'firebase-admin';
import fs from 'node:fs';

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, 'utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
