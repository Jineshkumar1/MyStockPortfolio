/**
 * Test script to verify Gemini API key and available models
 * Run with: node scripts/test-gemini-api.mjs
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not set in .env file');
    process.exit(1);
}

console.log('🔑 Testing Gemini API Key...');
// Security: Do not log API key, even partially
console.log('API Key: [REDACTED]\n');

// Initialize with API key (or let it auto-detect from env)
const client = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});

// Models to test (using official model names)
const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
];

async function testModel(modelName) {
    try {
        console.log(`Testing model: ${modelName}...`);
        
        // Use the official API pattern
        const response = await client.models.generateContent({
            model: modelName,
            contents: 'Say "Hello" in one word.',
        });
        
        const text = typeof response.text === 'string' ? response.text : String(response.text || '');
        
        console.log(`✅ ${modelName} - SUCCESS!`);
        console.log(`   Response: ${text}\n`);
        return { success: true, model: modelName };
    } catch (error) {
        const errorMsg = error.message || 'Unknown error';
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            console.log(`❌ ${modelName} - NOT FOUND (404)\n`);
        } else if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('API key')) {
            console.log(`❌ ${modelName} - INVALID API KEY or PERMISSION DENIED\n`);
        } else {
            console.log(`❌ ${modelName} - ERROR: ${errorMsg}\n`);
        }
        return { success: false, model: modelName, error: errorMsg };
    }
}

async function main() {
    console.log('🧪 Testing available Gemini models...\n');
    
    const results = [];
    for (const model of modelsToTest) {
        const result = await testModel(model);
        results.push(result);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Summary:');
    console.log('─'.repeat(50));
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length > 0) {
        console.log(`✅ Working models (${successful.length}):`);
        successful.forEach(r => console.log(`   - ${r.model}`));
    }
    
    if (failed.length > 0) {
        console.log(`\n❌ Failed models (${failed.length}):`);
        failed.forEach(r => console.log(`   - ${r.model}`));
    }
    
    if (successful.length === 0) {
        console.log('\n⚠️  No working models found!');
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Verify your API key at: https://makersuite.google.com/app/apikey');
        console.log('   2. Make sure the API key has access to Gemini API');
        console.log('   3. Check if your API key has usage limits or restrictions');
        console.log('   4. Try creating a new API key');
        console.log('   5. Ensure billing is enabled if required for certain models');
    } else {
        console.log(`\n✅ Recommended model to use: ${successful[0].model}`);
    }
}

main().catch(console.error);

