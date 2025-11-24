"use client";

import React, { useState, memo } from "react";
import { summarizeNews } from "@/lib/actions/gemini.actions";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";

interface NewsSummaryProps {
    articles: MarketNewsArticle[];
}

const NewsSummary = memo(function NewsSummary({ articles }: NewsSummaryProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleSummarize = async () => {
        if (articles.length === 0) {
            toast.error('No articles to summarize');
            return;
        }

        setLoading(true);
        try {
            const result = await summarizeNews(articles);
            if (result.success && result.summary) {
                setSummary(result.summary);
                setExpanded(true);
            } else {
                toast.error('Failed to summarize news', {
                    description: result.error || 'Please try again'
                });
            }
        } catch (error) {
            toast.error('Failed to summarize news');
        } finally {
            setLoading(false);
        }
    };

    if (articles.length === 0) return null;

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-500" />
                    <h3 className="text-lg font-semibold text-gray-100">AI News Summary</h3>
                </div>
                {summary && (
                    <Button
                        onClick={() => setExpanded(!expanded)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-200"
                    >
                        {expanded ? 'Collapse' : 'Expand'}
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                    <span className="ml-2 text-gray-400">Summarizing {articles.length} articles...</span>
                </div>
            ) : summary ? (
                <div className={`text-gray-300 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
                    {summary.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-2 last:mb-0">
                            {paragraph}
                        </p>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                        Get an AI-powered summary of {articles.length} news articles
                    </p>
                    <Button
                        onClick={handleSummarize}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Summarizing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Summarize News
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
});

export default NewsSummary;
