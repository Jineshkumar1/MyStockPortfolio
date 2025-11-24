"use client";

import React, { useState, memo } from "react";
import { getMarketInsights } from "@/lib/actions/gemini.actions";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import RateLimitIndicator from "./RateLimitIndicator";

interface AIInsightsProps {
    symbols: string[];
}

const AIInsights = memo(function AIInsights({ symbols }: AIInsightsProps) {
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateInsights = async () => {
        if (symbols.length === 0) {
            toast.error('No stocks selected', {
                description: 'Add stocks to your watchlist to get insights'
            });
            return;
        }

        setLoading(true);
        try {
            const result = await getMarketInsights(symbols);
            if (result.success && result.insights) {
                setInsights(result.insights);
            } else {
                toast.error('Failed to generate insights', {
                    description: result.error || 'Please try again'
                });
            }
        } catch (error) {
            toast.error('Failed to generate insights');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-500" />
                    <h3 className="text-lg font-semibold text-gray-100">AI Market Insights</h3>
                </div>
                <RateLimitIndicator model="gemini-2.5-flash" className="hidden md:flex" />
                <Button
                    onClick={handleGenerateInsights}
                    disabled={loading || symbols.length === 0}
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 w-full sm:w-auto flex-shrink-0"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Generate Insights
                        </>
                    )}
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                    <span className="ml-2 text-gray-400">Analyzing market data...</span>
                </div>
            ) : insights ? (
                <div className="text-gray-300 leading-relaxed">
                    {insights.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-3 last:mb-0">
                            {paragraph}
                        </p>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-sm">
                    Click "Generate Insights" to get AI-powered analysis of your watchlist stocks.
                </p>
            )}
        </div>
    );
});

export default AIInsights;
