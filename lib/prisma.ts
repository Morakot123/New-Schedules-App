// lib/prisma.ts

import { PrismaClient } from '@prisma/client'
import { logQueryMiddleware } from './middleware/logQuery'

/**
 * Global variable to hold the PrismaClient instance in development.
 * This prevents creating new instances on every hot-reload, which can
 * exhaust database connections.
 */
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

const prisma: PrismaClient =
    global.prisma ??
    new PrismaClient({
        // Log queries, warnings, and errors for debugging in development.
        log:
            process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'], // In production, only log errors to keep logs clean.
    })

// ✅ Attach query logging middleware in development
// This provides performance insights without cluttering production logs.
if (process.env.NODE_ENV === 'development') {
    prisma.$use(logQueryMiddleware)
}

// In development, store the PrismaClient instance on the global object
// for hot-reloading purposes.
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
}

export default prisma