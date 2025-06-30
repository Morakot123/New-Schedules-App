// lib/prisma.ts

// Import PrismaClient from the Prisma Client library.
import { PrismaClient } from '@prisma/client';
// Import the custom query logging middleware.
import { logQueryMiddleware } from './middleware/logQuery'; // Adjust path if your middleware is located elsewhere.

// This declaration is necessary for Next.js Hot Module Replacement (HMR) in development mode.
// It prevents multiple PrismaClient instances from being created during code refreshes,
// which can lead to connection pool exhaustion errors.
declare global {
    // Declares a global variable named 'prisma' which can hold a PrismaClient instance or be undefined.
    var prisma: PrismaClient | undefined;
}

// Variable to hold the PrismaClient instance.
let prisma: PrismaClient;

// Checks if the application is running in production or development mode.
if (process.env.NODE_ENV === 'production') {
    // In production, a new PrismaClient instance is created.
    // This approach is generally suitable for serverless environments like Vercel,
    // where each function invocation might be a fresh instance.
    prisma = new PrismaClient();
    // Optional: Enable the logQueryMiddleware in production if detailed logging is needed.
    // Be cautious as extensive logging can impact performance.
    // prisma.$use(logQueryMiddleware);
} else {
    // In development, we use a global variable to persist the PrismaClient instance
    // across HMR updates.
    if (!global.prisma) {
        // If the global instance does not exist, create a new one.
        global.prisma = new PrismaClient();
        // Enable the logQueryMiddleware in development to see detailed query logs in your console.
        global.prisma.$use(logQueryMiddleware);
    }
    // Assign the global instance to the local 'prisma' variable.
    prisma = global.prisma;
}

// Exports the PrismaClient instance for use throughout the application.
export default prisma;