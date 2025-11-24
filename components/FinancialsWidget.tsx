"use client";

import React from "react";
import TradingViewWidget from "./TradingViewWidget";
import { COMPANY_FINANCIALS_WIDGET_CONFIG, resolveTradingViewSymbol } from "@/lib/constants";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FinancialsWidgetProps {
    symbol: string;
    exchange?: string;
    height?: number;
}

export default function FinancialsWidget({ symbol, exchange, height = 800 }: FinancialsWidgetProps) {
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;
    
    // Generate TradingView financials URL
    // Format: https://www.tradingview.com/symbols/NASDAQ-NVDA/financials-overview/
    const symbolWithExchange = resolveTradingViewSymbol(symbol, exchange);
    // Convert NASDAQ:AAPL to NASDAQ-AAPL format for URL
    const urlSymbol = symbolWithExchange.replace(':', '-');
    const tradingViewFinancialsUrl = `https://www.tradingview.com/symbols/${urlSymbol}/financials-overview/`;

    return (
        <div className="relative bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-xl text-gray-100">Financials</h3>
                <Link
                    href={tradingViewFinancialsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">View on TradingView</span>
                        <span className="sm:hidden">TradingView</span>
                    </Button>
                </Link>
            </div>
            <TradingViewWidget
                scriptUrl={`${scriptUrl}financials.js`}
                config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol, exchange)}
                height={height}
            />
        </div>
    );
}

