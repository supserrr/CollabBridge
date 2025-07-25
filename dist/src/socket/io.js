"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initializeSocketIO = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
let io;
const initializeSocketIO = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        logger_1.logger.info(`Socket connected: ${socket.id}`);
        socket.on('disconnect', () => {
            logger_1.logger.info(`Socket disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initializeSocketIO = initializeSocketIO;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO has not been initialized');
    }
    return io;
};
exports.getIO = getIO;
exports.default = {
    initialize: exports.initializeSocketIO,
    getIO: exports.getIO
};
//# sourceMappingURL=io.js.map