"use client";
import React, { useMemo, useState } from "react";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const WatchlistButton = ({
                             symbol,
                             company,
                             isInWatchlist,
                             showTrashIcon = false,
                             type = "button",
                             onWatchlistChange,
                         }: WatchlistButtonProps) => {
    const [added, setAdded] = useState<boolean>(!!isInWatchlist);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const label = useMemo(() => {
        if (type === "icon") return added ? "" : "";
        return added ? "Remove from Watchlist" : "Add to Watchlist";
    }, [added, type]);

    const handleClick = async () => {
        if (loading) return;
        
        setLoading(true);
        const next = !added;
        
        try {
            const result = await toggleWatchlist(symbol, company || symbol, added);
            
            if (result.success) {
                // Only update state if adding (not removing) to prevent icon flash
                if (next) {
                    setAdded(next);
                }
                // Call callback first to update parent state immediately
                onWatchlistChange?.(symbol, next);
                
                if (next) {
                    toast.success('Added to watchlist', {
                        description: `${symbol} has been added to your watchlist.`
                    });
                    // Only refresh if no callback provided (for pages that need full refresh)
                    if (!onWatchlistChange) {
                        router.refresh();
                    }
                } else {
                    toast.success('Removed from watchlist', {
                        description: `${symbol} has been removed from your watchlist.`
                    });
                    // Only refresh if no callback provided (for pages that need full refresh)
                    if (!onWatchlistChange) {
                        router.refresh();
                    }
                }
            } else {
                toast.error('Failed to update watchlist', {
                    description: result.error || 'Please try again.'
                });
            }
        } catch (error) {
            console.error('Watchlist toggle error:', error);
            toast.error('Failed to update watchlist', {
                description: 'An error occurred. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (type === "icon") {
        // Use trash icon if showTrashIcon is true - always show trash, don't check added state
        // This prevents the star icon flash when removing
        if (showTrashIcon) {
            // Use isInWatchlist prop directly to prevent state flash
            const shouldShowTrash = isInWatchlist || added;
            
            if (!shouldShowTrash) return null; // Don't show anything if not in watchlist
            
            return (
                <button
                    title={`Remove ${symbol} from watchlist`}
                    aria-label={`Remove ${symbol} from watchlist`}
                    className="watchlist-icon-btn hover:text-red-400 text-gray-400 transition-colors"
                    onClick={handleClick}
                    disabled={loading}
                >
                    {loading ? (
                        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                        </svg>
                    )}
                </button>
            );
        }
        
        // Default star icon for add to watchlist
        return (
            <button
                title={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
                aria-label={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
                className={`watchlist-icon-btn ${added ? "watchlist-icon-added" : ""}`}
                onClick={handleClick}
                disabled={loading}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={added ? "#FACC15" : "none"}
                    stroke="#FACC15"
                    strokeWidth="1.5"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                    />
                </svg>
            </button>
        );
    }

    return (
        <button 
            className={`watchlist-btn ${added ? "watchlist-remove" : ""}`} 
            onClick={handleClick}
            disabled={loading}
        >
            {showTrashIcon && added ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6" />
                </svg>
            ) : null}
            <span>{label}</span>
        </button>
    );
};

export default WatchlistButton;