'use client';

import React, { memo } from 'react';
import useTradingViewWidget from "@/hooks/useTradingViewWidget";
import {cn} from "@/lib/utils";

interface TradingViewWidgetProps {
    title?: string;
    scriptUrl: string;
    config: Record<string, unknown>;
    height?: number;
    className?: string;
}

const TradingViewWidget = ({ title, scriptUrl, config, height = 600, className }: TradingViewWidgetProps) => {
    const containerRef = useTradingViewWidget(scriptUrl, config, height);

    return (
        <div className="w-full h-full">
            {title && <h3 className="font-semibold text-xl text-gray-100 mb-3">{title}</h3>}
            <div 
                className={cn('tradingview-widget-container w-full h-full', className)} 
                ref={containerRef}
                style={{ height: `${height}px`, width: "100%", minHeight: `${height}px` }}
            >
                <div className="tradingview-widget-container__widget" style={{ height: `${height}px`, width: "100%" }} />
            </div>
        </div>
    );
}

export default memo(TradingViewWidget);