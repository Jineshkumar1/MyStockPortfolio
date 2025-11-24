"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeBulkFromWatchlist } from "@/lib/actions/watchlist.actions";
import WatchlistTable from "./WatchlistTable";
import AIInsights from "./AIInsights";
import NewsSummary from "./NewsSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Filter, X, RefreshCw } from "lucide-react";

interface EnhancedWatchlistClientProps {
    initialItems: WatchlistItemWithPrice[];
    initialNews: MarketNewsArticle[];
    initialAlerts: Record<string, AlertItem[]>;
}

export default function EnhancedWatchlistClient({
    initialItems,
    initialNews,
    initialAlerts,
}: EnhancedWatchlistClientProps) {
    const router = useRouter();
    const [items, setItems] = useState(initialItems);
    const [news] = useState(initialNews);
    const [alerts, setAlerts] = useState(initialAlerts);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('addedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterText, setFilterText] = useState('');
    const [filterGainers, setFilterGainers] = useState<'all' | 'gainers' | 'losers'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const filteredItems = useMemo(() => {
        let filtered = [...items];

        if (filterText) {
            const searchLower = filterText.toLowerCase();
            filtered = filtered.filter(item =>
                item.symbol.toLowerCase().includes(searchLower) ||
                item.company.toLowerCase().includes(searchLower)
            );
        }

        if (filterGainers === 'gainers') {
            filtered = filtered.filter(item => (item.quote?.d || 0) > 0);
        } else if (filterGainers === 'losers') {
            filtered = filtered.filter(item => (item.quote?.d || 0) < 0);
        }

        filtered.sort((a, b) => {
            let aVal: any;
            let bVal: any;

            switch (sortBy) {
                case 'company':
                    aVal = a.company.toLowerCase();
                    bVal = b.company.toLowerCase();
                    break;
                case 'symbol':
                    aVal = a.symbol.toLowerCase();
                    bVal = b.symbol.toLowerCase();
                    break;
                case 'price':
                    aVal = a.quote?.c || 0;
                    bVal = b.quote?.c || 0;
                    break;
                case 'change':
                    aVal = a.quote?.dp || 0;
                    bVal = b.quote?.dp || 0;
                    break;
                case 'addedAt':
                default:
                    aVal = new Date(a.addedAt).getTime();
                    bVal = new Date(b.addedAt).getTime();
                    break;
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [items, filterText, filterGainers, sortBy, sortOrder]);

    const watchlistSymbols = useMemo(
        () => items.map(item => item.symbol),
        [items]
    );

    const handleSort = useCallback((field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    }, [sortBy, sortOrder]);

    const handleSelectItem = useCallback((symbol: string) => {
        setSelectedItems(prev => 
            prev.includes(symbol) 
                ? prev.filter(s => s !== symbol)
                : [...prev, symbol]
        );
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedItems(prev =>
            prev.length === filteredItems.length
                ? []
                : filteredItems.map(item => item.symbol)
        );
    }, [filteredItems]);

    const handleRemoveItem = useCallback((symbol: string) => {
        // Optimistically update UI immediately
        setItems(prev => prev.filter(item => item.symbol !== symbol));
        setSelectedItems(prev => prev.filter(s => s !== symbol));
    }, []);

    const handleAddItem = useCallback((symbol: string, company: string) => {
        // Check if item already exists to prevent duplicates
        setItems(prev => {
            const exists = prev.some(item => item.symbol === symbol);
            if (exists) return prev;
            // Add new item with minimal data - will be refreshed on next page load
            return [...prev, {
                symbol,
                company,
                addedAt: new Date().toISOString(),
                quote: undefined
            } as WatchlistItemWithPrice];
        });
    }, []);

    const handleBulkRemove = async (symbols: string[]) => {
        if (symbols.length === 0) return;
        
        try {
            const result = await removeBulkFromWatchlist(symbols);
            if (result.success) {
                toast.success(`Removed ${result.count || symbols.length} stock(s) from watchlist`);
                setItems(prev => prev.filter(item => !symbols.includes(item.symbol)));
                setSelectedItems([]);
                // State already updated, no need for router.refresh() - UI updates immediately
            } else {
                toast.error('Failed to remove stocks', {
                    description: result.error
                });
            }
        } catch (error) {
            toast.error('Failed to remove stocks');
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Only refresh if we need to fetch new data from server
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleAlertChange = () => {
        // Alerts are managed locally, no need for full page refresh
        // Only refresh if we need to sync with server
        router.refresh();
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="watchlist-title mb-8">My Watchlist</h1>
                <div className="watchlist-empty-container">
                    <div className="watchlist-empty">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="watchlist-star"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                            />
                        </svg>
                        <h2 className="empty-title">Your watchlist is empty</h2>
                        <p className="empty-description">
                            Start building your watchlist by adding stocks you want to track. 
                            Search for stocks and click "Add to Watchlist" to get started.
                        </p>
                        <Link 
                            href="/" 
                            className="watchlist-btn"
                        >
                            Browse Stocks
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="watchlist-title">My Watchlist</h1>
                <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Search by symbol or company..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                    />
                    {filterText && (
                        <button
                            onClick={() => setFilterText('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Select value={filterGainers} onValueChange={(v: 'all' | 'gainers' | 'losers') => setFilterGainers(v)}>
                        <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-gray-100 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <SelectValue placeholder="All Stocks" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="all" className="text-gray-300 hover:bg-gray-700">All Stocks</SelectItem>
                            <SelectItem value="gainers" className="text-gray-300 hover:bg-gray-700">Gainers Only</SelectItem>
                            <SelectItem value="losers" className="text-gray-300 hover:bg-gray-700">Losers Only</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                        Showing {filteredItems.length} of {items.length} stocks
                    </span>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,2.5fr)_minmax(0,1.2fr)]">
                <div>
                    <WatchlistTable
                        items={filteredItems}
                        selectedItems={selectedItems}
                        onSelectItem={handleSelectItem}
                        onSelectAll={handleSelectAll}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        onBulkRemove={handleBulkRemove}
                        onRemoveItem={handleRemoveItem}
                        alerts={alerts}
                        onAlertChange={handleAlertChange}
                    />
                </div>
                <div className="space-y-6">
                    {news.length > 0 && <NewsSummary articles={news} />}
                    <AIInsights symbols={watchlistSymbols} />
                </div>
            </div>

            {news.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 mt-8">
                    <h2 className="text-lg font-semibold text-gray-100 mb-4">Related News</h2>
                    <div className="space-y-4">
                        {news.slice(0, 6).map((article, idx) => (
                            <div
                                key={article.id ?? `${article.symbol}-${idx}`}
                                className="news-item"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="news-tag">{article.symbol || 'Market'}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(article.datetime * 1000).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="news-title">{article.headline}</h3>
                                <p className="news-summary">{article.summary}</p>
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="news-cta"
                                >
                                    Read more →
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

