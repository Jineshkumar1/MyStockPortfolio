"use client";

import React, { useMemo, memo } from "react";
import TradingViewWidget from "./TradingViewWidget";
import { resolveTradingViewSymbol } from "@/lib/constants";

interface MarketOverviewWithWatchlistProps {
    watchlistItems: WatchlistItemWithPrice[];
}

const MarketOverviewWithWatchlist = memo(function MarketOverviewWithWatchlist({ watchlistItems }: MarketOverviewWithWatchlistProps) {
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    const marketOverviewConfig = useMemo(() => {
        // Base tabs configuration
        const baseTabs = [
            {
                title: 'Financial',
                symbols: [
                    { s: 'NYSE:JPM', d: 'JPMorgan Chase' },
                    { s: 'NYSE:WFC', d: 'Wells Fargo Co New' },
                    { s: 'NYSE:BAC', d: 'Bank Amer Corp' },
                    { s: 'NYSE:HSBC', d: 'Hsbc Hldgs Plc' },
                    { s: 'NYSE:C', d: 'Citigroup Inc' },
                    { s: 'NYSE:MA', d: 'Mastercard Incorporated' },
                ],
            },
            {
                title: 'Technology',
                symbols: [
                    { s: 'NASDAQ:AAPL', d: 'Apple' },
                    { s: 'NASDAQ:GOOGL', d: 'Alphabet' },
                    { s: 'NASDAQ:MSFT', d: 'Microsoft' },
                    { s: 'NASDAQ:META', d: 'Meta Platforms' },
                    { s: 'NYSE:ORCL', d: 'Oracle Corp' },
                    { s: 'NASDAQ:INTC', d: 'Intel Corp' },
                ],
            },
            {
                title: 'Services',
                symbols: [
                    { s: 'NASDAQ:AMZN', d: 'Amazon' },
                    { s: 'NYSE:BABA', d: 'Alibaba Group Hldg Ltd' },
                    { s: 'NYSE:T', d: 'At&t Inc' },
                    { s: 'NYSE:WMT', d: 'Walmart' },
                    { s: 'NYSE:V', d: 'Visa' },
                ],
            },
        ];

        // Add Watchlist tab if user has watchlist items
        if (watchlistItems && watchlistItems.length > 0) {
            const watchlistSymbols = watchlistItems
                .slice(0, 10) // Limit to 10 stocks for the widget
                .map(item => {
                    // Resolve TradingView symbol format (e.g., NASDAQ:AAPL)
                    // Use exchange from item if available for better symbol resolution
                    const tradingViewSymbol = resolveTradingViewSymbol(item.symbol, item.exchange);
                    return {
                        s: tradingViewSymbol,
                        d: item.company || item.symbol,
                    };
                })
                .filter(symbol => symbol.s); // Filter out any invalid symbols

            if (watchlistSymbols.length > 0) {
                baseTabs.push({
                    title: 'Watchlist',
                    symbols: watchlistSymbols,
                });
            }
        }

        return {
            colorTheme: 'dark',
            dateRange: '12M',
            locale: 'en',
            largeChartUrl: '',
            isTransparent: true,
            showFloatingTooltip: true,
            plotLineColorGrowing: '#0FEDBE',
            plotLineColorFalling: '#0FEDBE',
            gridLineColor: 'rgba(240, 243, 250, 0)',
            scaleFontColor: '#DBDBDB',
            belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
            belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
            belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
            belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
            symbolActiveColor: 'rgba(15, 237, 190, 0.05)',
            tabs: baseTabs,
            support_host: 'https://www.tradingview.com',
            backgroundColor: '#141414',
            width: '100%',
            height: 600,
            showSymbolLogo: true,
            showChart: true,
        };
    }, [watchlistItems]);

    return (
        <TradingViewWidget
            title="Market Overview"
            scriptUrl={`${scriptUrl}market-overview.js`}
            config={marketOverviewConfig}
            className="custom-chart"
            height={600}
        />
    );
});

export default MarketOverviewWithWatchlist;
