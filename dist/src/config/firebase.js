"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.verifyFirebaseToken = exports.initializeFirebase = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const logger_1 = require("../utils/logger");
const initializeFirebase = async () => {
    try {
        if (firebase_admin_1.default.apps.length === 0) {
            // Check if Firebase credentials are available
            if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
                logger_1.logger.warn('⚠️ Firebase credentials not found. Firebase features will be disabled.');
                return;
            }
            // Check if we have a valid private key (not placeholder)
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
            if (!privateKey || privateKey.includes('PLACEHOLDER_PRIVATE_KEY')) {
                logger_1.logger.warn('⚠️ Firebase private key not configured. Firebase features will be disabled.');
                return;
            }
            const serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            };
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccount),
                projectId: process.env.FIREBASE_PROJECT_ID,
            });
            logger_1.logger.info('✅ Firebase Admin initialized successfully');
        }
    }
    catch (error) {
        logger_1.logger.error('❌ Firebase initialization failed:', error);
        logger_1.logger.warn('⚠️ Continuing without Firebase. Some features may be disabled.');
        // Don't throw error, just log it and continue
    }
};
exports.initializeFirebase = initializeFirebase;
const verifyFirebaseToken = async (token) => {
    try {
        const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(token);
        return decodedToken;
    }
    catch (error) {
        logger_1.logger.error('Firebase token verification failed:', error);
        throw new Error('Invalid token');
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
//# sourceMappingURL=firebase.js.map