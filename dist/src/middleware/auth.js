"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const firebase_1 = require("../config/firebase");
const logger_1 = require("../utils/logger");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Access token required' });
            return;
        }
        const token = authHeader.split(' ')[1];
        try {
            // Try JWT first (for our API tokens)
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await database_1.prisma.users.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    firebaseUid: true,
                    isActive: true,
                },
            });
            if (!user || !user.isActive) {
                res.status(401).json({ message: 'Invalid or inactive user' });
                return;
            }
            req.user = user;
            next();
        }
        catch (jwtError) {
            // Try Firebase token as fallback
            try {
                const decodedToken = await (0, firebase_1.verifyFirebaseToken)(token);
                const user = await database_1.prisma.users.findUnique({
                    where: { firebaseUid: decodedToken.uid },
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        firebaseUid: true,
                        isActive: true,
                    },
                });
                if (!user || !user.isActive) {
                    res.status(401).json({ message: 'users not found or inactive' });
                    return;
                }
                req.user = user;
                next();
            }
            catch (firebaseError) {
                logger_1.logger.error('Authentication failed:', firebaseError);
                res.status(401).json({ message: 'Invalid token' });
            }
        }
    }
    catch (error) {
        logger_1.logger.error('Authentication middleware error:', error);
        res.status(500).json({ message: 'Authentication error' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map