"use client";

import React, { useState, useEffect, useRef } from "react";
import TradingViewWidget from "./TradingViewWidget";
import { HEATMAP_WIDGET_CONFIG } from "@/lib/constants";
import { Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FullscreenHeatmap() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const [fullscreenHeight, setFullscreenHeight] = useState(600);
    const [widgetKey, setWidgetKey] = useState(0);
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js`;

    // Update height on window resize
    useEffect(() => {
        const updateHeight = () => {
            if (isFullscreen) {
                setFullscreenHeight(window.innerHeight - 120);
            }
        };

        if (isFullscreen) {
            updateHeight();
            window.addEventListener('resize', updateHeight);
            return () => window.removeEventListener('resize', updateHeight);
        }
    }, [isFullscreen]);

    // Handle fullscreen API
    const toggleFullscreen = async () => {
        try {
            if (!isFullscreen) {
                // Set state first so the element is rendered
                setIsFullscreen(true);
                setIsReady(false);
                const newHeight = window.innerHeight - 120;
                setFullscreenHeight(newHeight);
                
                // Wait for DOM to update, then request fullscreen, then load widget
                setTimeout(async () => {
                    if (fullscreenRef.current) {
                        try {
                            // Request fullscreen
                            if (fullscreenRef.current.requestFullscreen) {
                                await fullscreenRef.current.requestFullscreen();
                            } else if ((fullscreenRef.current as any).webkitRequestFullscreen) {
                                await (fullscreenRef.current as any).webkitRequestFullscreen();
                            } else if ((fullscreenRef.current as any).msRequestFullscreen) {
                                await (fullscreenRef.current as any).msRequestFullscreen();
                            }
                            
                            // Wait a bit more for fullscreen to be active, then load widget
                            setTimeout(() => {
                                setWidgetKey(prev => prev + 1); // Force widget remount
                                setIsReady(true);
                            }, 300);
                        } catch (err) {
                            console.error('Fullscreen API error:', err);
                            // Fallback: load widget anyway
                            setWidgetKey(prev => prev + 1);
                            setIsReady(true);
                        }
                    }
                }, 100);
            } else {
                // Exit fullscreen
                setIsReady(false);
                try {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    } else if ((document as any).webkitExitFullscreen) {
                        await (document as any).webkitExitFullscreen();
                    } else if ((document as any).msExitFullscreen) {
                        await (document as any).msExitFullscreen();
                    }
                } catch (err) {
                    console.error('Exit fullscreen error:', err);
                }
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
            setIsFullscreen(!isFullscreen);
            if (!isFullscreen) {
                setFullscreenHeight(window.innerHeight - 120);
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).msFullscreenElement
            );
            setIsFullscreen(isCurrentlyFullscreen);
            if (isCurrentlyFullscreen) {
                setFullscreenHeight(window.innerHeight - 120);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Handle ESC key to exit fullscreen
    useEffect(() => {
        if (!isFullscreen) return;

        const handleEsc = async (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                } else if ((document as any).msExitFullscreen) {
                    await (document as any).msExitFullscreen();
                }
                setIsFullscreen(false);
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isFullscreen]);

    return (
        <>
            {/* Regular Heatmap View */}
            <div className="relative bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="absolute top-4 right-4 z-10">
                    <Button
                        onClick={toggleFullscreen}
                        variant="outline"
                        size="sm"
                        className="bg-gray-700/80 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-all shadow-lg"
                        aria-label="Enter fullscreen"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </Button>
                </div>
                <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-100 mb-2">Stock Heatmap</h2>
                    <TradingViewWidget
                        title=""
                        scriptUrl={scriptUrl}
                        config={HEATMAP_WIDGET_CONFIG}
                        height={600}
                        className="custom-chart"
                    />
                </div>
            </div>

            {/* Fullscreen Overlay */}
            {isFullscreen && (
                <div
                    ref={fullscreenRef}
                    className="fixed inset-0 z-[9999] bg-gray-900 transition-all duration-300"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                    }}
                >
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <Button
                            onClick={toggleFullscreen}
                            variant="outline"
                            size="sm"
                            className="bg-gray-800/90 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
                            aria-label="Exit fullscreen"
                        >
                            <Minimize2 className="w-4 h-4 mr-2" />
                            Exit Fullscreen
                        </Button>
                        <Button
                            onClick={toggleFullscreen}
                            variant="outline"
                            size="sm"
                            className="bg-gray-800/90 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-red-600 hover:text-white transition-all"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="w-full h-full flex flex-col p-6 pt-16">
                        <div className="mb-4 flex-shrink-0">
                            <h1 className="text-2xl font-bold text-gray-100">Stock Market Heatmap</h1>
                            <p className="text-gray-400 text-sm mt-1">
                                S&P 500 stocks categorized by sectors. Size represents market cap, color shows performance. Click on any stock for details.
                            </p>
                        </div>
                        <div 
                            className="w-full flex-1" 
                            style={{ 
                                height: `${fullscreenHeight}px`,
                                minHeight: `${fullscreenHeight}px`,
                                maxHeight: `${fullscreenHeight}px`,
                                position: 'relative',
                                backgroundColor: '#141414'
                            }}
                        >
                            {isReady ? (
                                <div className="absolute inset-0 w-full h-full">
                                    <TradingViewWidget
                                        key={`fullscreen-${widgetKey}`}
                                        title=""
                                        scriptUrl={scriptUrl}
                                        config={{
                                            ...HEATMAP_WIDGET_CONFIG,
                                            height: fullscreenHeight.toString(),
                                            width: '100%',
                                        }}
                                        height={fullscreenHeight}
                                        className="custom-chart w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                                        <p className="text-gray-400">Loading heatmap...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

