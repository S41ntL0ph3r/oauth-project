import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { env } from '@/config/env';

// WebSocket setup for development environment
if (env.isDevelopment) {
    // @ts-expect-error - ws is required for Neon in development
    global.WebSocket = ws;
}

const prismaClientSingleton = () => {
    const connectionString = env.databaseUrl;
    
    if (!connectionString) {
        throw new Error("DATABASE_URL is not defined in environment variables");
    }
    
    const adapter = new PrismaNeon({ connectionString });
    
    return new PrismaClient({
        adapter,
        log: env.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    });
};

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

if (!env.isProduction) globalThis.prismaGlobal = db;