"use client";

import React, { useState } from "react";
import { analyzeStock } from "@/lib/actions/gemini.actions";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface StockAnalysisProps {
    symbol: string;
    currentPrice?: number;
    change?: number;
    companyName?: string;
    quote?: StockQuote;
}

export default function StockAnalysis({ symbol, currentPrice, change, quote }: StockAnalysisProps) {
    // Use quote data if provided, otherwise use direct price/change props
    const price = currentPrice ?? quote?.c;
    const priceChange = change ?? quote?.dp;
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const result = await analyzeStock(symbol, price, priceChange);
            if (result.success && result.analysis) {
                setAnalysis(result.analysis);
                setExpanded(true);
            } else {
                toast.error('Failed to analyze stock', {
                    description: result.error || 'Please try again'
                });
            }
        } catch {
            toast.error('Failed to analyze stock');
        } finally {
            setLoading(false);
        }
    };

    if (!expanded && !analysis) {
        return (
            <Button
                onClick={handleAnalyze}
                disabled={loading}
                variant="outline"
                className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 w-full"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Analysis
                    </>
                )}
            </Button>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-500" />
                    <h3 className="text-lg font-semibold text-gray-100">AI Analysis</h3>
                </div>
                <Button
                    onClick={() => setExpanded(!expanded)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-200"
                >
                    {expanded ? 'Collapse' : 'Expand'}
                </Button>
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                    <span className="ml-2 text-gray-400">Analyzing {symbol}...</span>
                </div>
            ) : analysis ? (
                <div className={`text-gray-300 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
                    {analysis.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-3 last:mb-0">
                            {paragraph}
                        </p>
                    ))}
                </div>
            ) : (
                <Button
                    onClick={handleAnalyze}
                    disabled={loading}
                    variant="outline"
                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Analysis
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
