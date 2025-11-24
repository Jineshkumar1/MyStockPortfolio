import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
    if (geminiClient) {
        return geminiClient;
    }

    // The new SDK automatically reads GEMINI_API_KEY from environment
    // or GOOGLE_API_KEY, or can be passed in constructor
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    // Initialize with API key if provided, otherwise let it auto-detect
    geminiClient = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});
    return geminiClient;
}

export async function generateText(
    prompt: string,
    model: 'gemini-2.5-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-pro' = 'gemini-2.5-flash'
): Promise<string> {
    try {
        const client = getGeminiClient();
        
        // Try models in order of preference (using official API pattern)
        const modelsToTry = [model, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        let lastError: any = null;
        
        for (const modelName of modelsToTry) {
            try {
                // Use the official API pattern from documentation
                const response = await client.models.generateContent({
                    model: modelName,
                    contents: prompt,
                });
                
                // response.text is a property, not a method
                const text = typeof response.text === 'string' ? response.text : String(response.text || '');
                
                if (modelName !== model) {
                    console.log(`Successfully used model: ${modelName} (requested: ${model})`);
                }
                
                return text;
            } catch (modelError: any) {
                lastError = modelError;
                // If it's not a 404/model not found error, throw immediately
                if (!modelError.message?.includes('404') && !modelError.message?.includes('not found')) {
                    throw modelError;
                }
                // Otherwise, try next model
                console.warn(`Model ${modelName} not available, trying next...`);
            }
        }
        
        // If all models failed
        throw lastError || new Error('No available models found');
    } catch (error: any) {
        console.error('Gemini API error:', error);
        const errorMsg = error.message || 'Unknown error';
        
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            throw new Error(`Gemini model not available. Please verify your API key has access to Gemini models. Error: ${errorMsg}`);
        }
        
        if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('API key')) {
            throw new Error(`Invalid API key or insufficient permissions. Please check your GEMINI_API_KEY or GOOGLE_API_KEY environment variable.`);
        }
        
        throw new Error(`Failed to generate text: ${errorMsg}`);
    }
}

export async function generateTextStream(
    prompt: string,
    model: 'gemini-2.5-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-pro' = 'gemini-2.5-flash',
    onChunk?: (chunk: string) => void
): Promise<string> {
    try {
        const client = getGeminiClient();
        
        // Try models in order
        const modelsToTry = [model, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        let lastError: any = null;
        
        for (const modelName of modelsToTry) {
            try {
                // Use streaming API - returns an async generator
                const stream = await client.models.generateContentStream({
                    model: modelName,
                    contents: prompt,
                });
                
                let fullText = '';
                
                // Handle streaming response (it's an async generator)
                for await (const chunk of stream) {
                    const chunkText = typeof chunk.text === 'string' ? chunk.text : String(chunk.text || '');
                    fullText += chunkText;
                    onChunk?.(chunkText);
                }
                
                return fullText;
            } catch (modelError: any) {
                lastError = modelError;
                if (!modelError.message?.includes('404') && !modelError.message?.includes('not found')) {
                    throw modelError;
                }
                console.warn(`Model ${modelName} not available for streaming, trying next...`);
            }
        }
        
        throw lastError || new Error('No available models found for streaming');
    } catch (error: any) {
        console.error('Gemini API streaming error:', error);
        throw new Error(`Failed to generate text stream: ${error.message || 'Unknown error'}`);
    }
}
