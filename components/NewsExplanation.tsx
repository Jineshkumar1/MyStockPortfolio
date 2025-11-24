"use client";

import React, { useState } from "react";
import { explainMarketNews } from "@/lib/actions/gemini.actions";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface NewsExplanationProps {
    article: MarketNewsArticle;
}

export default function NewsExplanation({ article }: NewsExplanationProps) {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleExplain = async () => {
        if (explanation) {
            setIsExpanded(!isExpanded);
            return;
        }

        setLoading(true);
        
        try {
            const result = await explainMarketNews(article);
            
            if (result.success && result.explanation) {
                setExplanation(result.explanation);
                setIsExpanded(true);
                toast.success("News explained");
            } else {
                toast.error(result.error || "Failed to explain news");
            }
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-t border-gray-700 pt-3 mt-3">
            <Button
                onClick={handleExplain}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-700"
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>{loading ? "Explaining..." : explanation ? "AI Explanation" : "Explain with AI"}</span>
                </div>
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : explanation ? (
                    isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                ) : null}
            </Button>
            
            {explanation && isExpanded && (
                <div className="mt-3 p-3 bg-gray-900/50 border border-gray-600 rounded-lg">
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{explanation}</p>
                </div>
            )}
        </div>
    );
}

