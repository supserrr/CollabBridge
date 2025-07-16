import admin from 'firebase-admin';
import { logger } from '../utils/logger';

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = async (): Promise<void> => {
  try {
    if (firebaseApp) {
      logger.info('🔥 Firebase already initialized');
      return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase configuration');
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    logger.info('🔥 Firebase initialized successfully');
  } catch (error) {
    logger.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

export const getFirebaseApp = (): admin.app.App => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }
  return firebaseApp;
};

export const verifyIdToken = async (token: string): Promise<admin.auth.DecodedIdToken> => {
  try {
    const app = getFirebaseApp();
    return await app.auth().verifyIdToken(token);
  } catch (error) {
    logger.error('❌ Token verification failed:', error);
    throw error;
  }
};
