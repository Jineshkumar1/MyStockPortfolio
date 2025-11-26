'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';
import { cache } from 'react';

const FINNHUB_BASE_URL = process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

// Parse the base URL to extract the allowed hostname and origin
const BASE_URL_PARSED = (() => {
    try {
        return new URL(FINNHUB_BASE_URL);
    } catch {
        // Fallback to default if parsing fails
        return new URL('https://finnhub.io/api/v1');
    }
})();

const ALLOWED_HOSTNAME = BASE_URL_PARSED.hostname;
const ALLOWED_ORIGIN = BASE_URL_PARSED.origin;

// Whitelist of allowed API paths to prevent path traversal attacks
const ALLOWED_PATHS = new Set([
    '/quote',
    '/company-news',
    '/news',
    '/stock/profile2',
    '/stock/metric',
    '/calendar/earnings',
    '/search',
]);

/**
 * Safely constructs a URL for Finnhub API requests.
 * This prevents SSRF attacks by:
 * 1. Using a whitelist of allowed paths
 * 2. Only allowing user input in query parameters (never in path or hostname)
 * 3. Validating the final URL points to the allowed domain
 */
function buildFinnhubUrl(
    path: string,
    params: Record<string, string | number | undefined>
): string {
    // Validate path is in whitelist to prevent path traversal
    if (!ALLOWED_PATHS.has(path)) {
        throw new Error(`Path "${path}" is not in the allowed paths whitelist`);
    }
    
    // Construct URL using URL API to safely handle query parameters
    const url = new URL(path, BASE_URL_PARSED);
    
    // Add query parameters using URLSearchParams (safely encodes values)
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });
    
    // Final validation: ensure the constructed URL is safe
    if (url.hostname !== ALLOWED_HOSTNAME) {
        throw new Error(`Invalid hostname: ${url.hostname}. Only requests to ${ALLOWED_HOSTNAME} are allowed.`);
    }
    
    if (url.protocol !== 'https:') {
        throw new Error(`Invalid protocol: ${url.protocol}. Only HTTPS requests are allowed.`);
    }
    
    return url.toString();
}

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
    // Additional validation as a safety net
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname !== ALLOWED_HOSTNAME || parsedUrl.protocol !== 'https:') {
            throw new Error(`Invalid URL: ${url}`);
        }
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(`Invalid URL format: ${url}`);
        }
        throw error;
    }
    
    const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
        ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
        : { cache: 'no-store' };

    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Fetch failed ${res.status}: ${text}`);
    }
    return (await res.json()) as T;
}

export { fetchJSON };

export interface StockQuote {
    c: number;  // Current price
    d: number;  // Change
    dp: number; // Percent change
    h: number;  // High price of the day
    l: number;  // Low price of the day
    o: number;  // Open price of the day
    pc: number; // Previous close price
    t: number;  // Timestamp
}

export async function getStockQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return {};
        }

        const cleanSymbols = symbols
            .map((s) => s?.trim().toUpperCase())
            .filter((s): s is string => Boolean(s));

        if (cleanSymbols.length === 0) return {};

        // Fetch quotes in parallel (batch requests)
        const quotePromises = cleanSymbols.map(async (symbol) => {
            try {
                const url = buildFinnhubUrl('/quote', { symbol, token });
                const quote = await fetchJSON<StockQuote>(url, 30); // Cache for 30 seconds
                return { symbol, quote };
            } catch (e) {
                console.error(`Error fetching quote for ${symbol}:`, e);
                return { symbol, quote: null };
            }
        });

        const results = await Promise.all(quotePromises);
        const quotes: Record<string, StockQuote> = {};

        results.forEach(({ symbol, quote }) => {
            if (quote && quote.c !== undefined) {
                quotes[symbol] = quote;
            }
        });

        return quotes;
    } catch (err) {
        console.error('getStockQuotes error:', err);
        return {};
    }
}

export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
    try {
        const range = getDateRange(5);
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            throw new Error('FINNHUB API key is not configured');
        }
        const cleanSymbols = (symbols || [])
            .map((s) => s?.trim().toUpperCase())
            .filter((s): s is string => Boolean(s));

        const maxArticles = 6;

        // If we have symbols, try to fetch company news per symbol and round-robin select
        if (cleanSymbols.length > 0) {
            const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

            await Promise.all(
                cleanSymbols.map(async (sym) => {
                    try {
                        const url = buildFinnhubUrl('/company-news', {
                            symbol: sym,
                            from: range.from,
                            to: range.to,
                            token,
                        });
                        const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
                        perSymbolArticles[sym] = (articles || []).filter(validateArticle);
                    } catch (e) {
                        console.error('Error fetching company news for', sym, e);
                        perSymbolArticles[sym] = [];
                    }
                })
            );

            const collected: MarketNewsArticle[] = [];
            // Round-robin up to 6 picks
            for (let round = 0; round < maxArticles; round++) {
                for (let i = 0; i < cleanSymbols.length; i++) {
                    const sym = cleanSymbols[i];
                    const list = perSymbolArticles[sym] || [];
                    if (list.length === 0) continue;
                    const article = list.shift();
                    if (!article || !validateArticle(article)) continue;
                    collected.push(formatArticle(article, true, sym, round));
                    if (collected.length >= maxArticles) break;
                }
                if (collected.length >= maxArticles) break;
            }

            if (collected.length > 0) {
                // Sort by datetime desc
                collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
                return collected.slice(0, maxArticles);
            }
            // If none collected, fall through to general news
        }

        // General market news fallback or when no symbols provided
        const generalUrl = buildFinnhubUrl('/news', { category: 'general', token });
        const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

        const seen = new Set<string>();
        const unique: RawNewsArticle[] = [];
        for (const art of general || []) {
            if (!validateArticle(art)) continue;
            const key = `${art.id}-${art.url}-${art.headline}`;
            if (seen.has(key)) continue;
            seen.add(key);
            unique.push(art);
            if (unique.length >= 20) break; // cap early before final slicing
        }

        const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx));
        return formatted;
    } catch (err) {
        console.error('getNews error:', err);
        throw new Error('Failed to fetch news');
    }
}

export interface CompanyFinancials {
    eps?: number;
    marketCap?: number;
    pe?: number;
    dividendYield?: number;
    earningsDate?: string;
}

export async function getCompanyFinancials(symbol: string): Promise<CompanyFinancials> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return {};
        }

        const upperSymbol = symbol.toUpperCase();
        const financials: CompanyFinancials = {};

        // Fetch company profile for market cap
        try {
            const profileUrl = buildFinnhubUrl('/stock/profile2', { symbol: upperSymbol, token });
            const profile = await fetchJSON<any>(profileUrl, 3600);
            if (profile?.marketCapitalization) {
                financials.marketCap = profile.marketCapitalization;
            }
        } catch (e) {
            console.error(`Error fetching profile for ${upperSymbol}:`, e);
        }

        // Fetch stock metrics for P/E, EPS
        try {
            const metricsUrl = buildFinnhubUrl('/stock/metric', { symbol: upperSymbol, metric: 'all', token });
            const metrics = await fetchJSON<any>(metricsUrl, 3600);
            if (metrics?.metric) {
                const metric = metrics.metric;
                if (metric.peBasicTTM) financials.pe = metric.peBasicTTM;
                if (metric.epsTTM) financials.eps = metric.epsTTM;
                if (metric.dividendYieldIndicatedAnnual) financials.dividendYield = metric.dividendYieldIndicatedAnnual * 100; // Convert to percentage
            }
        } catch (e) {
            console.error(`Error fetching metrics for ${upperSymbol}:`, e);
        }

        // Fetch earnings calendar
        try {
            const today = new Date();
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const fromDate = today.toISOString().split('T')[0];
            const toDate = nextMonth.toISOString().split('T')[0];
            
            const earningsUrl = buildFinnhubUrl('/calendar/earnings', {
                from: fromDate,
                to: toDate,
                symbol: upperSymbol,
                token,
            });
            const earnings = await fetchJSON<any>(earningsUrl, 3600);
            if (earnings?.earningsCalendar && earnings.earningsCalendar.length > 0) {
                const nextEarnings = earnings.earningsCalendar[0];
                if (nextEarnings.date) {
                    financials.earningsDate = nextEarnings.date;
                }
            }
        } catch (e) {
            console.error(`Error fetching earnings for ${upperSymbol}:`, e);
        }

        return financials;
    } catch (err) {
        console.error('getCompanyFinancials error:', err);
        return {};
    }
}

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            // If no token, log and return empty to avoid throwing per requirements
            console.error('Error in stock search:', new Error('FINNHUB API key is not configured'));
            return [];
        }

        const trimmed = typeof query === 'string' ? query.trim() : '';

        let results: FinnhubSearchResult[] = [];

        if (!trimmed) {
            // Fetch top 10 popular symbols' profiles
            const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
            const profiles = await Promise.all(
                top.map(async (sym) => {
                    try {
                        const url = buildFinnhubUrl('/stock/profile2', { symbol: sym, token });
                        // Revalidate every hour
                        const profile = await fetchJSON<any>(url, 3600);
                        return { sym, profile } as { sym: string; profile: any };
                    } catch (e) {
                        console.error('Error fetching profile2 for', sym, e);
                        return { sym, profile: null } as { sym: string; profile: any };
                    }
                })
            );

            results = profiles
                .map(({ sym, profile }) => {
                    const symbol = sym.toUpperCase();
                    const name: string | undefined = profile?.name || profile?.ticker || undefined;
                    const exchange: string | undefined = profile?.exchange || undefined;
                    if (!name) return undefined;
                    const r: FinnhubSearchResult = {
                        symbol,
                        description: name,
                        displaySymbol: symbol,
                        type: 'Common Stock',
                    };
                    // We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
                    // To keep pipeline simple, attach exchange via closure map stage
                    // We'll reconstruct exchange when mapping to final type
                    (r as any).__exchange = exchange; // internal only
                    return r;
                })
                .filter((x): x is FinnhubSearchResult => Boolean(x));
        } else {
            const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
            const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
            results = Array.isArray(data?.result) ? data.result : [];
            
            // If search query looks like a stock symbol (short, uppercase-like), try direct symbol lookup as fallback
            const upperQuery = trimmed.toUpperCase();
            if (upperQuery.length <= 5 && /^[A-Z]+$/.test(upperQuery) && results.length === 0) {
                try {
                    // Try fetching profile directly for exact symbol match
                    const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(upperQuery)}&token=${token}`;
                    const profile = await fetchJSON<any>(profileUrl, 1800);
                    if (profile && profile.ticker) {
                        const result: FinnhubSearchResult = {
                            symbol: profile.ticker.toUpperCase(),
                            description: profile.name || profile.ticker,
                            displaySymbol: profile.ticker,
                            type: 'Common Stock',
                        };
                        // Attach exchange information from profile
                        (result as any).__exchange = profile.exchange;
                        results = [result];
                    }
                } catch (e) {
                    // Fallback failed, continue with empty results
                    console.error('Direct symbol lookup failed for', upperQuery, e);
                }
            }
            
            // If we have results but they don't have exchange info, try to enrich with profile data
            if (results.length > 0 && trimmed.length <= 5) {
                const resultsWithoutExchange = results.filter(r => {
                    const exchange = (r as any).__exchange;
                    return !exchange || exchange === 'US' || exchange === upperQuery;
                });
                
                if (resultsWithoutExchange.length > 0) {
                    await Promise.all(
                        resultsWithoutExchange.map(async (r) => {
                            try {
                                const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(r.symbol)}&token=${token}`;
                                const profile = await fetchJSON<any>(profileUrl, 1800);
                                if (profile && profile.exchange) {
                                    (r as any).__exchange = profile.exchange;
                                }
                            } catch {
                                // Silently fail - keep existing exchange or default
                            }
                        })
                    );
                }
            }
        }

        const queryUpper = trimmed.toUpperCase();
        const mapped: StockWithWatchlistStatus[] = results
            .map((r) => {
                const upper = (r.symbol || '').toUpperCase();
                const name = r.description || upper;
                const exchangeFromProfile = (r as any).__exchange as string | undefined;
                // Don't use displaySymbol as exchange - it's often just the symbol itself
                // Only use exchange from profile data
                let exchange = exchangeFromProfile;
                
                // If exchange is missing, invalid, or equals the symbol, mark it for later lookup
                if (!exchange || exchange === 'US' || exchange.toUpperCase() === upper) {
                    exchange = undefined; // Will be fetched on stock details page
                }
                
                const type = r.type || 'Stock';
                const item: StockWithWatchlistStatus = {
                    symbol: upper,
                    name,
                    exchange: exchange || 'US', // Use 'US' as placeholder, will be resolved on details page
                    type,
                    isInWatchlist: false,
                };
                return item;
            })
            // Sort: exact symbol matches first, then by type (Common Stock preferred), then alphabetically
            .sort((a, b) => {
                const aExact = a.symbol === queryUpper;
                const bExact = b.symbol === queryUpper;
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                if (a.type === 'Common Stock' && b.type !== 'Common Stock') return -1;
                if (a.type !== 'Common Stock' && b.type === 'Common Stock') return 1;
                return a.symbol.localeCompare(b.symbol);
            })
            .slice(0, 20); // Increased from 15 to 20 to show more results

        return mapped;
    } catch (err) {
        console.error('Error in stock search:', err);
        return [];
    }
});
