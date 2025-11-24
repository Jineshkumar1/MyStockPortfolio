"use client";

import React, { useState, useEffect } from "react";
import { getRateLimitStatus } from "@/lib/actions/rate-limit.actions";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface RateLimitIndicatorProps {
    model?: string;
    className?: string;
}

export default function RateLimitIndicator({ 
    model = 'gemini-2.5-flash',
    className = '' 
}: RateLimitIndicatorProps) {
    const [status, setStatus] = useState<{
        remainingRPM?: number;
        remainingRPD?: number;
        resetAt?: Date;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const result = await getRateLimitStatus(model);
                if (result) {
                    setStatus({
                        remainingRPM: result.remainingRPM,
                        remainingRPD: result.remainingRPD,
                        resetAt: result.resetAt,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch rate limit status:', error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchStatus();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, [model]);

    if (loading || !status) {
        return null;
    }

    const isLowRPM = (status.remainingRPM ?? 0) < 3;
    const isLowRPD = (status.remainingRPD ?? 0) < 50;

    return (
        <div className={`flex items-center gap-4 text-sm ${className}`}>
            <div className="flex items-center gap-2">
                {isLowRPM ? (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                <span className="text-gray-400">
                    <span className="font-medium text-gray-300">{status.remainingRPM ?? 0}</span> requests/min
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                {isLowRPD ? (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                <span className="text-gray-400">
                    <span className="font-medium text-gray-300">{status.remainingRPD ?? 0}</span> requests/day
                </span>
            </div>
            
            {status.resetAt && (
                <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">
                        Resets {status.resetAt.toLocaleTimeString()}
                    </span>
                </div>
            )}
        </div>
    );
}

