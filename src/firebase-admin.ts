import * as admin from 'firebase-admin';
import * as path from 'path';

// Full path to your service account JSON file
const serviceAccountPath = path.join(__dirname, 'doctor-50dc9-firebase-adminsdk-fbsvc-f0a1e1ab8b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

export default admin;