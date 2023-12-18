import * as admin from 'firebase-admin';
import 'dotenv/config';

export const firebaseInit = () => {
  const isExistedAdmin = admin.app.length;
  !isExistedAdmin && initFirebaseApp();
};

const initFirebaseApp = () => {
  admin.initializeApp({
    // credential: admin.credential.cert(require("../../../config/serviceAccountKey.json")),
    credential: admin.credential.cert({
      clientEmail: process.env.client_email,
      privateKey: process.env.private_key.replace(/\\n/g, '\n'),
      projectId: process.env.project_id,
    }),
    databaseURL: 'https://test-e08dd.firebaseio.com/',
  });

  console.log(admin.SDK_VERSION, '>>> app');
};
