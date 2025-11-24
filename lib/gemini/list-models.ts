'use server';

import { getGeminiClient } from './client';

export async function listAvailableModels(): Promise<{ success: boolean; models?: string[]; error?: string }> {
    try {
        const client = getGeminiClient();
        // Try to list models - this might not be available in all SDK versions
        // For now, return common model names
        return {
            success: true,
            models: [
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-pro',
                'gemini-1.5-flash-lite',
            ]
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to list models'
        };
    }
}

