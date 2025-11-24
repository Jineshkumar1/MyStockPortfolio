"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";

interface WatchlistSummaryProps {
    items: WatchlistItemWithPrice[];
}

const formatPercent = (value?: number | null) => {
    if (value === undefined || value === null) return "--";
    const fixed = value.toFixed(2);
    return `${value >= 0 ? "+" : ""}${fixed}%`;
};

export default function WatchlistSummary({ items }: WatchlistSummaryProps) {
    const stats = useMemo(() => {
        const withPrices = items.filter(item => typeof item.quote?.dp === "number");

        const avgChangePercent =
            withPrices.length > 0
                ? withPrices.reduce((sum, item) => sum + (item.quote?.dp || 0), 0) / withPrices.length
                : 0;

        const sorted = [...withPrices].sort((a, b) => (b.quote?.dp || 0) - (a.quote?.dp || 0));
        const bestPerformer = sorted[0];
        const worstPerformer = sorted[sorted.length - 1];

        return {
            avgChangePercent,
            bestPerformer,
            worstPerformer,
        };
    }, [items]);

    if (items.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">Today's Performance</span>
                    <Clock className="w-4 h-4 text-gray-500" />
                </div>
                <div
                    className={`text-3xl font-semibold ${
                        stats.avgChangePercent >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                >
                    {formatPercent(stats.avgChangePercent)}
                </div>
                <p className="text-xs text-gray-500 mt-2">Portfolio average change</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">Best Performer</span>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                {stats.bestPerformer ? (
                    <>
                        <Link
                            href={`/stocks/${stats.bestPerformer.symbol}`}
                            className="text-lg font-semibold text-gray-100 hover:text-teal-400 transition-colors"
                        >
                            {stats.bestPerformer.symbol}
                        </Link>
                        <span className="text-2xl font-semibold text-green-400">
                            {formatPercent(stats.bestPerformer.quote?.dp)}
                        </span>
                    </>
                ) : (
                    <p className="text-xs text-gray-500">Waiting for price data</p>
                )}
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">Worst Performer</span>
                    <TrendingDown className="w-4 h-4 text-red-400" />
                </div>
                {stats.worstPerformer ? (
                    <>
                        <Link
                            href={`/stocks/${stats.worstPerformer.symbol}`}
                            className="text-lg font-semibold text-gray-100 hover:text-teal-400 transition-colors"
                        >
                            {stats.worstPerformer.symbol}
                        </Link>
                        <span className="text-2xl font-semibold text-red-400">
                            {formatPercent(stats.worstPerformer.quote?.dp)}
                        </span>
                    </>
                ) : (
                    <p className="text-xs text-gray-500">Waiting for price data</p>
                )}
            </div>
        </div>
    );
}

