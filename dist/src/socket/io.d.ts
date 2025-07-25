import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
export declare const initializeSocketIO: (httpServer: HTTPServer) => SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const getIO: () => SocketIOServer;
declare const _default: {
    initialize: (httpServer: HTTPServer) => SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
    getIO: () => SocketIOServer;
};
export default _default;
//# sourceMappingURL=io.d.ts.map