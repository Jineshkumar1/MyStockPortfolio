import TradingViewWidget from "@/components/TradingViewWidget";
import FinancialsWidget from "@/components/FinancialsWidget";
import WatchlistButton from "@/components/WatchlistButton";
import StockAnalysis from "@/components/StockAnalysis";
import AIChat from "@/components/AIChat";
import {
    SYMBOL_INFO_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    BASELINE_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
} from "@/lib/constants";
import { getWatchlistItems } from "@/lib/actions/watchlist.actions";
import { getStockQuotes, searchStocks, fetchJSON } from "@/lib/actions/finnhub.actions";

export default async function StockDetails({ params }: StockDetailsPageProps) {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;
    
    // Check if stock is in watchlist
    const watchlistItems = await getWatchlistItems();
    const isInWatchlist = watchlistItems.some(item => item.symbol === upperSymbol);
    
    // Fetch stock quote, company name, and exchange information
    const [quotes, searchResults] = await Promise.all([
        getStockQuotes([upperSymbol]),
        searchStocks(upperSymbol)
    ]);
    
    const quote = quotes[upperSymbol];
    const stockInfo = searchResults.find(s => s.symbol === upperSymbol);
    const companyName = stockInfo?.name || upperSymbol;
    
    // Always fetch profile FIRST to get accurate exchange information
    // This is critical for NYSE stocks like SNAP, BABA that might show wrong exchange in search
    let exchange: string | undefined = undefined;
    try {
        const FINNHUB_BASE_URL = process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1';
        const token = process.env.FINNHUB_API_KEY;
        if (token) {
            const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(upperSymbol)}&token=${token}`;
            const profile = await fetchJSON<any>(profileUrl, 1800);
            if (profile?.exchange) {
                exchange = profile.exchange;
                console.log(`✓ Fetched exchange for ${upperSymbol} from profile:`, exchange);
            } else {
                console.warn(`⚠ No exchange in profile for ${upperSymbol}, profile:`, profile);
            }
        }
    } catch (e) {
        console.error(`✗ Failed to fetch exchange profile for ${upperSymbol}:`, e);
    }
    
    // Fallback to search results if profile fetch failed
    if (!exchange && stockInfo?.exchange && stockInfo.exchange !== 'US' && stockInfo.exchange !== upperSymbol) {
        exchange = stockInfo.exchange;
        console.log(`Using exchange from search results for ${upperSymbol}:`, exchange);
    }
    
    // Normalize exchange names for TradingView (e.g., "Nasdaq Stock Market" -> "NASDAQ")
    if (exchange) {
        const exchangeUpper = exchange.toUpperCase();
        if (exchangeUpper.includes('NASDAQ') || exchangeUpper === 'XNAS' || exchangeUpper === 'NASDAQ STOCK MARKET') {
            exchange = 'NASDAQ';
        } else if (exchangeUpper.includes('NYSE') || exchangeUpper === 'XNYS' || exchangeUpper === 'NEW YORK STOCK EXCHANGE' || exchangeUpper === 'NEW YORK') {
            exchange = 'NYSE';
        } else if (exchangeUpper.includes('AMEX') || exchangeUpper === 'XASE' || exchangeUpper === 'AMERICAN STOCK EXCHANGE') {
            exchange = 'AMEX';
        } else if (exchangeUpper === upperSymbol || exchangeUpper === 'US') {
            // If exchange is the symbol itself or generic "US", try to determine from known exchanges
            // For common NYSE stocks, check if it's likely NYSE
            // BABA is on NYSE, so we need better detection
            exchange = undefined; // Will be resolved by profile lookup or TradingView
        } else {
            // Keep the exchange as-is if it's a valid TradingView exchange code
            exchange = exchangeUpper;
        }
    }
    
    // If still no valid exchange, don't default to NASDAQ - let resolveTradingViewSymbol handle it
    // This allows TradingView to try to resolve the symbol automatically

    return (
        <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
            <div className="w-full flex flex-col gap-6">
                {/* Top Section: Stock Price and Name */}
                <div className="w-full">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}symbol-info.js`}
                        config={SYMBOL_INFO_WIDGET_CONFIG(symbol, exchange)}
                        height={170}
                    />
                </div>

                {/* Main Content: Two Column Layout */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                    {/* Left Column: Charts (slightly narrower) */}
                    <div className="lg:col-span-7 flex flex-col">
                        <TradingViewWidget
                            scriptUrl={`${scriptUrl}advanced-chart.js`}
                            config={CANDLE_CHART_WIDGET_CONFIG(symbol, exchange)}
                            className="custom-chart"
                            height={600}
                        />
                        <TradingViewWidget
                            scriptUrl={`${scriptUrl}advanced-chart.js`}
                            config={BASELINE_WIDGET_CONFIG(symbol, exchange)}
                            className="custom-chart"
                            height={600}
                        />
                    </div>

                    {/* Right Column: Watchlist, AI Tools, Financials, Technical Analysis, Company Profile (wider) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Watchlist Button */}
                        <div className="flex items-center justify-between">
                            <WatchlistButton 
                                symbol={upperSymbol} 
                                company={companyName} 
                                isInWatchlist={isInWatchlist} 
                            />
                        </div>

                        {/* AI Analysis */}
                        <StockAnalysis 
                            symbol={upperSymbol}
                            companyName={companyName}
                            quote={quote}
                        />

                        {/* AI Chat */}
                        <AIChat
                            symbol={upperSymbol}
                            price={quote?.c}
                            change={quote?.dp}
                        />

                        {/* Financials */}
                        <FinancialsWidget
                            symbol={symbol}
                            exchange={exchange}
                            height={800}
                        />

                        {/* Technical Analysis */}
                        <TradingViewWidget
                            scriptUrl={`${scriptUrl}technical-analysis.js`}
                            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol, exchange)}
                            height={500}
                        />

                        {/* Company Profile */}
                        <TradingViewWidget
                            scriptUrl={`${scriptUrl}company-profile.js`}
                            config={COMPANY_PROFILE_WIDGET_CONFIG(symbol, exchange)}
                            height={440}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}