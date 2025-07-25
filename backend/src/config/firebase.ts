import admin from 'firebase-admin';
import { logger } from '../utils/logger';

export const initializeFirebase = async (): Promise<void> => {
  try {
    if (admin.apps.length === 0) {
      // Check if Firebase credentials are available
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
        logger.warn('⚠️ Firebase credentials not found. Firebase features will be disabled.');
        return;
      }

      // Check if we have a valid private key (not placeholder)
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      if (!privateKey || privateKey.includes('PLACEHOLDER_PRIVATE_KEY')) {
        logger.warn('⚠️ Firebase private key not configured. Firebase features will be disabled.');
        return;
      }

      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      logger.info('✅ Firebase Admin initialized successfully');
    }
  } catch (error) {
    logger.error('❌ Firebase initialization failed:', error);
    logger.warn('⚠️ Continuing without Firebase. Some features may be disabled.');
    // Don't throw error, just log it and continue
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
