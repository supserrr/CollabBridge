import { PrismaClient } from '@prisma/client';
declare global {
    var __prisma: PrismaClient | undefined;
}
declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const connectDatabase: () => Promise<boolean>;
export declare const disconnectDatabase: () => Promise<void>;
export { prisma };
//# sourceMappingURL=database.d.ts.map