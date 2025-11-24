'use server';

import { connectToDatabase } from '@/database/mongoose';
import { RateLimit } from '@/database/models/rate-limit.model';
import { getModelRateLimits } from './gemini-limits';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

export interface RateLimitResult {
    allowed: boolean;
    remainingRPM?: number;
    remainingRPD?: number;
    resetAt?: Date;
    error?: string;
}

/**
 * Check if a user can make a request for a specific model
 */
export async function checkRateLimit(
    userId: string,
    model: string
): Promise<RateLimitResult> {
    try {
        await connectToDatabase();
        
        const limits = getModelRateLimits(model);
        const now = new Date();
        
        // Find or create rate limit record
        let rateLimit = await RateLimit.findOne({ userId, model });
        
        if (!rateLimit) {
            // Create new record with daily reset at end of day
            const resetAt = new Date(now);
            resetAt.setHours(23, 59, 59, 999);
            
            rateLimit = new RateLimit({
                userId,
                model,
                requests: [],
                dailyCount: 0,
                dailyResetAt: resetAt,
            });
        }
        
        // Check if daily reset is needed
        if (now > rateLimit.dailyResetAt) {
            rateLimit.dailyCount = 0;
            const resetAt = new Date(now);
            resetAt.setHours(23, 59, 59, 999);
            rateLimit.dailyResetAt = resetAt;
            rateLimit.requests = [];
        }
        
        // Clean up old requests (older than 1 minute)
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        rateLimit.requests = rateLimit.requests.filter(
            req => req.timestamp > oneMinuteAgo
        );
        
        // Check RPM limit
        const requestsInLastMinute = rateLimit.requests.length;
        const remainingRPM = Math.max(0, limits.rpm - requestsInLastMinute);
        
        if (requestsInLastMinute >= limits.rpm) {
            // Find the oldest request to calculate reset time
            const oldestRequest = rateLimit.requests[0]?.timestamp;
            const resetAt = oldestRequest 
                ? new Date(oldestRequest.getTime() + 60 * 1000)
                : new Date(now.getTime() + 60 * 1000);

            await rateLimit.save();
            
            return {
                allowed: false,
                remainingRPM: 0,
                remainingRPD: Math.max(0, limits.rpd - rateLimit.dailyCount),
                resetAt,
                error: `Rate limit exceeded: ${limits.rpm} requests per minute. Try again in ${Math.ceil((resetAt.getTime() - now.getTime()) / 1000)} seconds.`,
            };
        }
        
        // Check RPD limit
        const remainingRPD = Math.max(0, limits.rpd - rateLimit.dailyCount);
        
        if (rateLimit.dailyCount >= limits.rpd) {
            await rateLimit.save();
            return {
                allowed: false,
                remainingRPM,
                remainingRPD: 0,
                resetAt: rateLimit.dailyResetAt,
                error: `Daily rate limit exceeded: ${limits.rpd} requests per day. Resets at ${rateLimit.dailyResetAt.toLocaleString()}.`,
            };
        }
        
        // All checks passed
        await rateLimit.save();

        return {
            allowed: true,
            remainingRPM,
            remainingRPD,
            resetAt: rateLimit.dailyResetAt,
        };
    } catch (error: any) {
        console.error('Rate limit check error:', error);
        // On error, allow the request (fail open) but log the error
        return {
            allowed: true,
            error: 'Rate limit check failed, request allowed',
        };
    }
}

/**
 * Record a request after it's been made
 */
export async function recordRequest(
    userId: string,
    model: string
): Promise<void> {
    try {
        await connectToDatabase();
        
        const now = new Date();
        
        let rateLimit = await RateLimit.findOne({ userId, model });
        
        if (!rateLimit) {
            const resetAt = new Date(now);
            resetAt.setHours(23, 59, 59, 999);
            
            rateLimit = new RateLimit({
                userId,
                model,
                requests: [{ timestamp: now }],
                dailyCount: 1,
                dailyResetAt: resetAt,
            });
        } else {
            // Check if daily reset is needed
            if (now > rateLimit.dailyResetAt) {
                rateLimit.dailyCount = 0;
                const resetAt = new Date(now);
                resetAt.setHours(23, 59, 59, 999);
                rateLimit.dailyResetAt = resetAt;
                rateLimit.requests = [];
            }
            
            // Add new request
            rateLimit.requests.push({ timestamp: now });
            rateLimit.dailyCount += 1;
        }
        
        await rateLimit.save();
    } catch (error: any) {
        console.error('Record request error:', error);
        // Don't throw - this is just for tracking
    }
}

/**
 * Get current user's rate limit status
 */
export async function getCurrentUserRateLimitStatus(
    model: string
): Promise<RateLimitResult | null> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return null;
        }
        
        return await checkRateLimit(session.user.id, model);
    } catch (error) {
        console.error('Get rate limit status error:', error);
        return null;
    }
}

