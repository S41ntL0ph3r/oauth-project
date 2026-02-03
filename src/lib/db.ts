import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// WebSocket setup for development environment
if (process.env.NODE_ENV === "development") {
    // @ts-expect-error - ws is required for Neon in development
    global.WebSocket = ws;
}

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
        throw new Error("DATABASE_URL is not defined in environment variables");
    }
    
    const adapter = new PrismaNeon({ connectionString });
    
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;