"use client";

import React, { useState } from "react";
import { answerStockQuestion } from "@/lib/actions/gemini.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

interface AIChatProps {
    symbol?: string;
    price?: number;
    change?: number;
}

export default function AIChat({ symbol, price, change }: AIChatProps) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        try {
            const result = await answerStockQuestion(
                question,
                symbol,
                { price, change }
            );
            
            if (result.success && result.answer) {
                setAnswer(result.answer);
                setExpanded(true);
                setQuestion('');
            } else {
                toast.error('Failed to get answer', {
                    description: result.error || 'Please try again'
                });
            }
        } catch {
            toast.error('Failed to get answer');
        } finally {
            setLoading(false);
        }
    };

    if (!expanded && !answer) {
        return (
            <Button
                onClick={() => setExpanded(true)}
                variant="outline"
                className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 w-full"
            >
                <Sparkles className="w-4 h-4 mr-2" />
                Ask AI About Stocks
            </Button>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-500" />
                    <h3 className="text-lg font-semibold text-gray-100">AI Stock Assistant</h3>
                </div>
                <Button
                    onClick={() => {
                        setExpanded(false);
                        setAnswer(null);
                        setQuestion('');
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-200"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder={symbol ? `Ask about ${symbol} or stocks in general...` : "Ask any question about stocks..."}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={loading}
                        className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500"
                    />
                    <Button
                        type="submit"
                        disabled={loading || !question.trim()}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </form>

            {loading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                    <span className="ml-2 text-gray-400">Thinking...</span>
                </div>
            )}

            {answer && (
                <div className="bg-gray-700/50 rounded-lg p-4 text-gray-300 leading-relaxed">
                    {answer.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-2 last:mb-0">
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}

            {!answer && !loading && (
                <div className="text-gray-400 text-sm space-y-1">
                    <p>💡 Try asking:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>&ldquo;What is a P/E ratio?&rdquo;</li>
                        <li>&ldquo;How do I read stock charts?&rdquo;</li>
                        <li>&ldquo;What affects stock prices?&rdquo;</li>
                        {symbol && <li>{`What should I know about ${symbol}?`}</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}
