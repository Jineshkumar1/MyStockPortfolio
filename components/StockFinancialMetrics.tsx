"use client";

import React from "react";

interface StockFinancialMetricsProps {
    financials: {
        eps?: number;
        marketCap?: number;
        pe?: number;
        dividendYield?: number;
        earningsDate?: string;
    };
}

function formatMarketCap(value?: number): string {
    if (!value) return "N/A";
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toLocaleString();
}

function formatDate(dateString?: string): string {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    } catch {
        return dateString;
    }
}

export default function StockFinancialMetrics({ financials }: StockFinancialMetricsProps) {
    const metrics = [
        {
            label: "UPCOMING EARNINGS",
            value: formatDate(financials.earningsDate),
        },
        {
            label: "EPS",
            value: financials.eps?.toFixed(2) || "N/A",
        },
        {
            label: "MARKET CAP",
            value: formatMarketCap(financials.marketCap),
        },
        {
            label: "DIV YIELD",
            value: financials.dividendYield ? `${financials.dividendYield.toFixed(2)}%` : "N/A",
        },
        {
            label: "P/E",
            value: financials.pe?.toFixed(2) || "N/A",
        },
    ];

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {metrics.map((metric, index) => (
                    <div key={index} className="flex flex-col">
                        <div className="text-3xl font-semibold text-gray-100 mb-2">
                            {metric.value}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                            {metric.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

