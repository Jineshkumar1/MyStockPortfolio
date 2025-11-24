import TradingViewWidget from "@/components/TradingViewWidget";
import FullscreenHeatmap from "@/components/FullscreenHeatmap";
import MarketOverviewWithWatchlist from "@/components/MarketOverviewWithWatchlist";
import {
    MARKET_DATA_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG
} from "@/lib/constants";
import { getWatchlistItems } from "@/lib/actions/watchlist.actions";
import { getStockQuotes } from "@/lib/actions/finnhub.actions";

const Home = async () => {
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;
    
    // Fetch user's watchlist for Market Overview widget
    const watchlistItems = await getWatchlistItems();
    const symbols = watchlistItems.map(item => item.symbol);
    
    // Fetch quotes in parallel (optimized)
    const quotes = symbols.length > 0 ? await getStockQuotes(symbols) : {};
    
    // Combine watchlist items with quotes
    // Note: Exchange info would need to be fetched separately from profile endpoint if needed
    const itemsWithPrices: WatchlistItemWithPrice[] = watchlistItems.map(item => ({
        ...item,
        quote: quotes[item.symbol],
    }));

    return (
        <div className="flex min-h-screen home-wrapper">
            <section className="home-section">
                <div className="md:col-span-1 xl:col-span-1">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-full">
                        <MarketOverviewWithWatchlist watchlistItems={itemsWithPrices} />
                    </div>
                </div>
                <div className="md:col-span-1 xl:col-span-2">
                    <FullscreenHeatmap />
                </div>
            </section>
            <section className="home-section">
                <div className="h-full md:col-span-1 xl:col-span-2">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-full">
                        <TradingViewWidget
                            scriptUrl={`${scriptUrl}market-quotes.js`}
                            config={MARKET_DATA_WIDGET_CONFIG}
                            height={600}
                        />
                    </div>
                </div>
                <div className="h-full md:col-span-1 xl:col-span-1">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-full">
                        <TradingViewWidget
                            title="Top Stories"
                            scriptUrl={`${scriptUrl}timeline.js`}
                            config={TOP_STORIES_WIDGET_CONFIG}
                            height={600}
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home;