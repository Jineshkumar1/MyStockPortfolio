'use server';

import { getCurrentUserRateLimitStatus } from '@/lib/rate-limit/rate-limit';

export async function getRateLimitStatus(model: string = 'gemini-2.5-flash') {
    return await getCurrentUserRateLimitStatus(model);
}

