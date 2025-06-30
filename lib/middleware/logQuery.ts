// lib/middleware/logQuery.ts

/**
 * A Prisma middleware to log the execution time of each query.
 * This helps in monitoring database performance and identifying slow queries.
 */
export const logQueryMiddleware = async (
    params: { model?: string; action: string; args: any },
    next: (params: any) => Promise<any>
) => {
    // Use a unique ID for each query to trace it from start to finish
    const queryId = Math.random().toString(36).substring(2, 9);
    const startTime = Date.now();

    try {
        // Log the start of the query
        console.log(`[DB START] [ID: ${queryId}] -> ${params.model}.${params.action} | Args: ${JSON.stringify(params.args || {})}`);

        // Execute the next middleware or the query itself
        const result = await next(params);

        const duration = Date.now() - startTime;
        // Log the successful completion of the query
        console.log(`[DB SUCCESS] [ID: ${queryId}] -> ${params.model}.${params.action} completed in ${duration}ms`);

        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        // Log any errors that occur during the query execution
        console.error(`[DB ERROR] [ID: ${queryId}] -> ${params.model}.${params.action} failed after ${duration}ms with error:`, error);

        // Re-throw the error so it can be handled by the application
        throw error;
    }
};