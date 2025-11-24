'use server';

import { generateText } from '@/lib/gemini/client';
import { getStockQuotes } from './finnhub.actions';
import { getNews } from './finnhub.actions';
import { checkRateLimit, recordRequest } from '@/lib/rate-limit/rate-limit';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

export async function analyzeStock(symbol: string, currentPrice?: number, change?: number): Promise<{ success: boolean; analysis?: string; error?: string }> {
    try {
        // Check rate limit
        const session = await auth.api.getSession({ headers: await headers() });
        if (session?.user?.id) {
            const rateLimitCheck = await checkRateLimit(session.user.id, 'gemini-2.5-flash');
            if (!rateLimitCheck.allowed) {
                return { 
                    success: false, 
                    error: rateLimitCheck.error || 'Rate limit exceeded. Please try again later.' 
                };
            }
        }
        const priceInfo = currentPrice !== undefined 
            ? `Current Price: $${currentPrice.toFixed(2)}${change !== undefined ? ` (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)` : ''}`
            : 'Price data not available';

        const prompt = `You are a financial analyst. Provide a brief, professional analysis of the stock ${symbol}.

${priceInfo}

Provide:
1. A 2-3 sentence overview of the company
2. Key factors affecting the stock (if price data available, mention recent movement)
3. Brief investment considerations

Keep it concise (100-150 words), professional, and avoid financial advice. Focus on facts and general market context.`;

        const analysis = await generateText(prompt, 'gemini-2.5-flash');
        
        // Record the request
        if (session?.user?.id) {
            await recordRequest(session.user.id, 'gemini-2.5-flash');
        }
        
        return { success: true, analysis };
    } catch (error: any) {
        console.error('analyzeStock error:', error);
        return { success: false, error: error.message || 'Failed to analyze stock' };
    }
}

export async function getMarketInsights(symbols: string[]): Promise<{ success: boolean; insights?: string; error?: string }> {
    try {
        // Check rate limit
        const session = await auth.api.getSession({ headers: await headers() });
        if (session?.user?.id) {
            const rateLimitCheck = await checkRateLimit(session.user.id, 'gemini-2.5-flash');
            if (!rateLimitCheck.allowed) {
                return { 
                    success: false, 
                    error: rateLimitCheck.error || 'Rate limit exceeded. Please try again later.' 
                };
            }
        }
        const quotes = await getStockQuotes(symbols);
        const news = await getNews(symbols);

        const priceSummary = Object.entries(quotes)
            .map(([symbol, quote]) => 
                `${symbol}: $${quote.c.toFixed(2)} (${quote.dp >= 0 ? '+' : ''}${quote.dp.toFixed(2)}%)`
            )
            .join(', ');

        const newsHeadlines = news.slice(0, 5)
            .map(article => `- ${article.headline}`)
            .join('\n');

        const prompt = `You are a market analyst. Provide brief market insights based on the following data:

Stock Prices:
${priceSummary || 'Price data not available'}

Recent News Headlines:
${newsHeadlines || 'No recent news available'}

Provide:
1. Overall market sentiment (2-3 sentences)
2. Key trends or patterns you notice
3. Notable news impact (if any)

Keep it concise (150-200 words), professional, and fact-based. Avoid specific investment advice.`;

        const insights = await generateText(prompt, 'gemini-2.5-flash');
        
        // Record the request
        if (session?.user?.id) {
            await recordRequest(session.user.id, 'gemini-2.5-flash');
        }
        
        return { success: true, insights };
    } catch (error: any) {
        console.error('getMarketInsights error:', error);
        return { success: false, error: error.message || 'Failed to generate insights' };
    }
}

export async function summarizeNews(articles: MarketNewsArticle[]): Promise<{ success: boolean; summary?: string; error?: string }> {
    try {
        if (articles.length === 0) {
            return { success: false, error: 'No articles to summarize' };
        }
        
        // Check rate limit
        const session = await auth.api.getSession({ headers: await headers() });
        if (session?.user?.id) {
            const rateLimitCheck = await checkRateLimit(session.user.id, 'gemini-2.5-flash');
            if (!rateLimitCheck.allowed) {
                return { 
                    success: false, 
                    error: rateLimitCheck.error || 'Rate limit exceeded. Please try again later.' 
                };
            }
        }

        const articlesText = articles
            .slice(0, 10)
            .map((article, idx) => 
                `${idx + 1}. ${article.headline}\n   ${article.summary || 'No summary available'}`
            )
            .join('\n\n');

        const prompt = `Summarize the following market news articles. Provide a concise summary (150-200 words) that:

1. Highlights the most important stories
2. Identifies common themes or trends
3. Mentions key companies or sectors affected
4. Provides context for investors

News Articles:
${articlesText}

Format as a clear, readable summary suitable for investors.`;

        const summary = await generateText(prompt, 'gemini-2.5-flash');
        
        // Record the request
        if (session?.user?.id) {
            await recordRequest(session.user.id, 'gemini-2.5-flash');
        }
        
        return { success: true, summary };
    } catch (error: any) {
        console.error('summarizeNews error:', error);
        return { success: false, error: error.message || 'Failed to summarize news' };
    }
}

export async function answerStockQuestion(question: string, symbol?: string, context?: { price?: number; change?: number }): Promise<{ success: boolean; answer?: string; error?: string }> {
    try {
        // Check rate limit
        const session = await auth.api.getSession({ headers: await headers() });
        if (session?.user?.id) {
            const rateLimitCheck = await checkRateLimit(session.user.id, 'gemini-2.5-flash');
            if (!rateLimitCheck.allowed) {
                return { 
                    success: false, 
                    error: rateLimitCheck.error || 'Rate limit exceeded. Please try again later.' 
                };
            }
        }
        let contextInfo = '';
        if (symbol && context?.price !== undefined) {
            contextInfo = `\n\nContext about ${symbol}:
- Current Price: $${context.price.toFixed(2)}
${context.change !== undefined ? `- Change: ${context.change >= 0 ? '+' : ''}${context.change.toFixed(2)}%` : ''}`;
        }

        const prompt = `You are a helpful financial assistant. Answer the following question about stocks and investing.

Question: ${question}${contextInfo}

Guidelines:
- Provide clear, concise answers (100-200 words)
- Use simple language that's easy to understand
- Focus on facts and general information
- Avoid specific investment advice or recommendations
- If asked about a specific stock, provide general information only
- Be helpful and educational`;

        const answer = await generateText(prompt, 'gemini-2.5-flash');
        
        // Record the request
        if (session?.user?.id) {
            await recordRequest(session.user.id, 'gemini-2.5-flash');
        }
        
        return { success: true, answer };
    } catch (error: any) {
        console.error('answerStockQuestion error:', error);
        return { success: false, error: error.message || 'Failed to answer question' };
    }
}

export async function getStockRecommendation(userProfile: {
    investmentGoals: string;
    riskTolerance: string;
    preferredIndustry: string;
}): Promise<{ success: boolean; recommendation?: string; error?: string }> {
    try {
        // Check rate limit
        const session = await auth.api.getSession({ headers: await headers() });
        if (session?.user?.id) {
            const rateLimitCheck = await checkRateLimit(session.user.id, 'gemini-2.5-flash');
            if (!rateLimitCheck.allowed) {
                return { 
                    success: false, 
                    error: rateLimitCheck.error || 'Rate limit exceeded. Please try again later.' 
                };
            }
        }
        const prompt = `You are a financial advisor. Based on the following user profile, provide general guidance on stock selection:

Investment Goals: ${userProfile.investmentGoals}
Risk Tolerance: ${userProfile.riskTolerance}
Preferred Industry: ${userProfile.preferredIndustry}

Provide:
1. General characteristics of stocks that might align with their profile (2-3 sentences)
2. Types of companies or sectors to consider (1-2 sentences)
3. Important factors to research (1-2 sentences)

Keep it educational and general. Do NOT recommend specific stocks. Focus on helping them understand what to look for. Total: 150-200 words.`;

        const recommendation = await generateText(prompt, 'gemini-2.5-flash');
        
        // Record the request
        if (session?.user?.id) {
            await recordRequest(session.user.id, 'gemini-2.5-flash');
        }
        
        return { success: true, recommendation };
    } catch (error: any) {
        console.error('getStockRecommendation error:', error);
        return { success: false, error: error.message || 'Failed to generate recommendation' };
    }
}
