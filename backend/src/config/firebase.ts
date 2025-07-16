import admin from 'firebase-admin';
import { logger } from '../utils/logger';

export const initializeFirebase = async (): Promise<void> => {
  try {
    if (admin.apps.length === 0) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    
    logger.info('✅ Firebase Admin initialized successfully');
  } catch (error) {
    logger.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

export const verifyFirebaseToken = async (token: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    logger.error('Firebase token verification failed:', error);
    throw new Error('Invalid token');
  }
};

export { admin };
