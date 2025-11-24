'use client';
import { useEffect, useMemo, useRef }     from "react";

const useTradingViewWidget = (scriptUrl: string, config: Record<string, unknown>, height = 600) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const scriptRef = useRef<HTMLScriptElement | null>(null);
    const widgetRef = useRef<HTMLDivElement | null>(null);
    const configString = useMemo(() => JSON.stringify(config), [config]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clean up previous widget
        if (scriptRef.current) {
            scriptRef.current.remove();
            scriptRef.current = null;
        }
        if (widgetRef.current) {
            widgetRef.current.remove();
            widgetRef.current = null;
        }

        const container = containerRef.current;

        // Create widget container
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container__widget';
        widgetDiv.style.width = '100%';
        widgetDiv.style.height = `${height}px`;
        container.appendChild(widgetDiv);
        widgetRef.current = widgetDiv;

        // Create and load script
        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.type = 'text/javascript';
        script.innerHTML = configString;
        scriptRef.current = script;

        container.appendChild(script);

        return () => {
            if (scriptRef.current) {
                scriptRef.current.remove();
                scriptRef.current = null;
            }
            if (widgetRef.current) {
                widgetRef.current.remove();
                widgetRef.current = null;
            }
        }
    }, [scriptUrl, configString, height])

    return containerRef;
}
export default useTradingViewWidget