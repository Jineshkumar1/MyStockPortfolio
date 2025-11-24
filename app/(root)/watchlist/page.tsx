import { getWatchlistItems } from '@/lib/actions/watchlist.actions';
import { getStockQuotes } from '@/lib/actions/finnhub.actions';
import { getNews } from '@/lib/actions/finnhub.actions';
import { getAlertsForSymbols } from '@/lib/actions/alert.actions';
import EnhancedWatchlistClient from '@/components/EnhancedWatchlistClient';

export default async function WatchlistPage() {
    const watchlistItems = await getWatchlistItems();
    const symbols = watchlistItems.map(item => item.symbol);
    
    // Fetch data in parallel for better performance
    const [quotes, news, alerts] = await Promise.all([
        symbols.length > 0 ? getStockQuotes(symbols) : Promise.resolve({}),
        symbols.length > 0 ? getNews(symbols) : Promise.resolve([]),
        symbols.length > 0 ? getAlertsForSymbols(symbols) : Promise.resolve({}),
    ]);

    // Combine watchlist items with quotes
    const itemsWithPrices: WatchlistItemWithPrice[] = watchlistItems.map(item => ({
        ...item,
        quote: quotes[item.symbol],
    }));

    return <EnhancedWatchlistClient 
        initialItems={itemsWithPrices} 
        initialNews={news}
        initialAlerts={alerts}
    />;
}
