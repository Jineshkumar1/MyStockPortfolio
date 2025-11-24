/**
 * Gemini Free Tier Rate Limits
 * Based on official documentation: https://ai.google.dev/pricing
 */

export interface ModelRateLimits {
    rpm: number;  // Requests Per Minute
    rpd: number;  // Requests Per Day
    tpm?: number; // Tokens Per Minute (optional, for future use)
}

export const GEMINI_RATE_LIMITS: Record<string, ModelRateLimits> = {
    'gemini-2.5-pro': {
        rpm: 2,
        rpd: 50,
        tpm: 125000,
    },
    'gemini-2.5-flash': {
        rpm: 10,
        rpd: 250,
        tpm: 250000,
    },
    'gemini-2.5-flash-preview': {
        rpm: 10,
        rpd: 250,
        tpm: 250000,
    },
    'gemini-2.5-flash-lite': {
        rpm: 15,
        rpd: 1000,
        tpm: 250000,
    },
    'gemini-2.5-flash-lite-preview': {
        rpm: 15,
        rpd: 1000,
        tpm: 250000,
    },
    'gemini-2.0-flash': {
        rpm: 15,
        rpd: 200,
        tpm: 1000000,
    },
    'gemini-2.0-flash-lite': {
        rpm: 30,
        rpd: 200,
        tpm: 1000000,
    },
    // Fallback for older models
    'gemini-1.5-flash': {
        rpm: 15,
        rpd: 1500,
        tpm: 1000000,
    },
    'gemini-1.5-pro': {
        rpm: 2,
        rpd: 50,
        tpm: 1000000,
    },
    'gemini-pro': {
        rpm: 2,
        rpd: 50,
        tpm: 1000000,
    },
};

/**
 * Get rate limits for a specific model
 */
export function getModelRateLimits(model: string): ModelRateLimits {
    // Try exact match first
    if (GEMINI_RATE_LIMITS[model]) {
        return GEMINI_RATE_LIMITS[model];
    }
    
    // Try to match by prefix (e.g., "gemini-2.5-flash" matches "gemini-2.5-flash-lite")
    const matchingKey = Object.keys(GEMINI_RATE_LIMITS).find(key => 
        model.includes(key) || key.includes(model)
    );
    
    if (matchingKey) {
        return GEMINI_RATE_LIMITS[matchingKey];
    }
    
    // Default to most restrictive limits
    return {
        rpm: 2,
        rpd: 50,
        tpm: 100000,
    };
}

