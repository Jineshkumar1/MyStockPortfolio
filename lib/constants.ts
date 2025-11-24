export const NAV_ITEMS = [
    { href: '/', label: 'Dashboard' },
    { href: '/search', label: 'Search' },
    { href: '/watchlist', label: 'Watchlist' },
];

// Sign-up form select options
export const INVESTMENT_GOALS = [
    { value: 'Growth', label: 'Growth' },
    { value: 'Income', label: 'Income' },
    { value: 'Balanced', label: 'Balanced' },
    { value: 'Conservative', label: 'Conservative' },
];

export const RISK_TOLERANCE_OPTIONS = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
];

export const PREFERRED_INDUSTRIES = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Consumer Goods', label: 'Consumer Goods' },
];

export const ALERT_TYPE_OPTIONS = [
    { value: 'upper', label: 'Upper' },
    { value: 'lower', label: 'Lower' },
];

export const CONDITION_OPTIONS = [
    { value: 'greater', label: 'Greater than (>)' },
    { value: 'less', label: 'Less than (<)' },
];

// TradingView Charts
export const MARKET_OVERVIEW_WIDGET_CONFIG = {
    colorTheme: 'dark', // dark mode
    dateRange: '12M', // last 12 months
    locale: 'en', // language
    largeChartUrl: '', // link to a large chart if needed
    isTransparent: true, // makes background transparent
    showFloatingTooltip: true, // show tooltip on hover
    plotLineColorGrowing: '#0FEDBE', // line color when price goes up
    plotLineColorFalling: '#0FEDBE', // line color when price falls
    gridLineColor: 'rgba(240, 243, 250, 0)', // grid line color
    scaleFontColor: '#DBDBDB', // font color for scale
    belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)', // fill under line when growing
    belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)', // fill under line when falling
    belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
    belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
    symbolActiveColor: 'rgba(15, 237, 190, 0.05)', // highlight color for active symbol
    tabs: [
        {
            title: 'Financial',
            symbols: [
                { s: 'NYSE:JPM', d: 'JPMorgan Chase' },
                { s: 'NYSE:WFC', d: 'Wells Fargo Co New' },
                { s: 'NYSE:BAC', d: 'Bank Amer Corp' },
                { s: 'NYSE:HSBC', d: 'Hsbc Hldgs Plc' },
                { s: 'NYSE:C', d: 'Citigroup Inc' },
                { s: 'NYSE:MA', d: 'Mastercard Incorporated' },
            ],
        },
        {
            title: 'Technology',
            symbols: [
                { s: 'NASDAQ:AAPL', d: 'Apple' },
                { s: 'NASDAQ:GOOGL', d: 'Alphabet' },
                { s: 'NASDAQ:MSFT', d: 'Microsoft' },
                { s: 'NASDAQ:META', d: 'Meta Platforms' },
                { s: 'NYSE:ORCL', d: 'Oracle Corp' },
                { s: 'NASDAQ:INTC', d: 'Intel Corp' },
            ],
        },
        {
            title: 'Services',
            symbols: [
                { s: 'NASDAQ:AMZN', d: 'Amazon' },
                { s: 'NYSE:BABA', d: 'Alibaba Group Hldg Ltd' },
                { s: 'NYSE:T', d: 'At&t Inc' },
                { s: 'NYSE:WMT', d: 'Walmart' },
                { s: 'NYSE:V', d: 'Visa' },
            ],
        },
    ],
    support_host: 'https://www.tradingview.com', // TradingView host
    backgroundColor: '#141414', // background color
    width: '100%', // full width
    height: 600, // height in px
    showSymbolLogo: true, // show logo next to symbols
    showChart: true, // display mini chart
};

export const HEATMAP_WIDGET_CONFIG = {
    dataSource: 'SPX500',
    blockSize: 'market_cap_basic',
    blockColor: 'change',
    grouping: 'sector',
    isTransparent: true,
    locale: 'en',
    symbolUrl: '',
    colorTheme: 'dark',
    exchanges: [],
    hasTopBar: false,
    isDataSetEnabled: false,
    isZoomEnabled: true,
    hasSymbolTooltip: true,
    isMonoSize: false,
    width: '100%',
    height: '600',
};

export const TOP_STORIES_WIDGET_CONFIG = {
    displayMode: 'regular',
    feedMode: 'all_symbols', // Shows all top stories from TradingView
    colorTheme: 'dark',
    isTransparent: true,
    locale: 'en',
    width: '100%',
    height: '600',
};

export const MARKET_DATA_WIDGET_CONFIG = {
    title: 'Stocks',
    width: '100%',
    height: 600,
    locale: 'en',
    showSymbolLogo: true,
    colorTheme: 'dark',
    isTransparent: false,
    backgroundColor: '#0F0F0F',
    symbolsGroups: [
        {
            name: 'Financial',
            symbols: [
                { name: 'NYSE:JPM', displayName: 'JPMorgan Chase' },
                { name: 'NYSE:WFC', displayName: 'Wells Fargo Co New' },
                { name: 'NYSE:BAC', displayName: 'Bank Amer Corp' },
                { name: 'NYSE:HSBC', displayName: 'Hsbc Hldgs Plc' },
                { name: 'NYSE:C', displayName: 'Citigroup Inc' },
                { name: 'NYSE:MA', displayName: 'Mastercard Incorporated' },
            ],
        },
        {
            name: 'Technology',
            symbols: [
                { name: 'NASDAQ:AAPL', displayName: 'Apple' },
                { name: 'NASDAQ:GOOGL', displayName: 'Alphabet' },
                { name: 'NASDAQ:MSFT', displayName: 'Microsoft' },
                { name: 'NASDAQ:FB', displayName: 'Meta Platforms' },
                { name: 'NYSE:ORCL', displayName: 'Oracle Corp' },
                { name: 'NASDAQ:INTC', displayName: 'Intel Corp' },
            ],
        },
        {
            name: 'Services',
            symbols: [
                { name: 'NASDAQ:AMZN', displayName: 'Amazon' },
                { name: 'NYSE:BABA', displayName: 'Alibaba Group Hldg Ltd' },
                { name: 'NYSE:T', displayName: 'At&t Inc' },
                { name: 'NYSE:WMT', displayName: 'Walmart' },
                { name: 'NYSE:V', displayName: 'Visa' },
            ],
        },
    ],
};

const DEFAULT_TRADINGVIEW_EXCHANGE = 'NASDAQ';

// Known exchange mappings for common stocks (fallback when exchange detection fails)
const KNOWN_EXCHANGE_MAPPINGS: Record<string, string> = {
    'BABA': 'NYSE', // Alibaba Group
    'SNAP': 'NYSE', // Snap Inc
    'WMT': 'NYSE', // Walmart
    'JPM': 'NYSE', // JPMorgan Chase
    'BAC': 'NYSE', // Bank of America
    'C': 'NYSE', // Citigroup
    'T': 'NYSE', // AT&T
    'V': 'NYSE', // Visa
    'MA': 'NYSE', // Mastercard
    'XOM': 'NYSE', // ExxonMobil
    'CVX': 'NYSE', // Chevron
    'BRK.B': 'NYSE', // Berkshire Hathaway
    'BRK-B': 'NYSE', // Berkshire Hathaway (alternative format)
};

const normalizeExchangeForTradingView = (exchange: string | undefined, symbol: string) => {
    if (!exchange) return undefined;
    const value = exchange.trim().toUpperCase();
    if (!value || value === symbol) return undefined;

    // Handle various NASDAQ formats
    if (value.includes('NASDAQ') || value === 'XNAS' || value === 'NASDAQ STOCK MARKET' || 
        value === 'NMS' || value === 'NCM' || value === 'NGM') return 'NASDAQ';
    
    // Handle various NYSE formats (this is important for SNAP, BABA and other NYSE stocks)
    if (value.includes('NYSE') || value === 'XNYS' || value === 'NEW YORK STOCK EXCHANGE' || 
        value === 'NEW YORK' || value.includes('NEW YORK') || value === 'NYSE MKT' ||
        value === 'NYSE ARCA' || value === 'ARCA') return 'NYSE';
    
    // Handle AMEX formats
    if (value.includes('AMEX') || value === 'XASE' || value === 'AMERICAN STOCK EXCHANGE' ||
        value === 'AMERICAN') return 'AMEX';
    
    // Handle OTC formats
    if (value === 'OTC' || value === 'OTCMKTS' || value === 'OTCM' || value === 'OTCQB' || 
        value === 'OTCQX' || value === 'PINK') return 'OTC';

    // TradingView accepts many exchange prefixes, pass through if it looks valid (letters only and short)
    if (/^[A-Z]{2,6}$/.test(value)) return value;

    return undefined;
};

export const resolveTradingViewSymbol = (symbol: string, exchange?: string) => {
    if (!symbol) return '';
    const trimmedSymbol = symbol.trim().toUpperCase();
    if (trimmedSymbol.includes(':')) return trimmedSymbol;

    let normalizedExchange = normalizeExchangeForTradingView(exchange, trimmedSymbol);
    
    // If normalization failed, try known mappings as fallback
    if (!normalizedExchange && KNOWN_EXCHANGE_MAPPINGS[trimmedSymbol]) {
        normalizedExchange = KNOWN_EXCHANGE_MAPPINGS[trimmedSymbol];
        console.log(`Using known exchange mapping for ${trimmedSymbol}: ${normalizedExchange}`);
    }
    
    const prefix = normalizedExchange ?? DEFAULT_TRADINGVIEW_EXCHANGE;

    return prefix ? `${prefix}:${trimmedSymbol}` : trimmedSymbol;
};

export const SYMBOL_INFO_WIDGET_CONFIG = (symbol: string, exchange?: string) => {
    const symbolWithExchange = resolveTradingViewSymbol(symbol, exchange);
    // Format URL with UTM parameters as TradingView expects
    const encodedSymbol = encodeURIComponent(symbolWithExchange);
    const tradingViewChartUrl = `https://www.tradingview.com/chart/?symbol=${encodedSymbol}&utm_source=localhost&utm_medium=widget&utm_campaign=symbol-info-logo&utm_term=${encodedSymbol}`;
    return {
        symbol: symbolWithExchange,
        colorTheme: 'dark',
        isTransparent: true,
        locale: 'en',
        width: '100%',
        height: 170,
        largeChartUrl: tradingViewChartUrl,
    };
};

export const CANDLE_CHART_WIDGET_CONFIG = (symbol: string, exchange?: string) => ({
    allow_symbol_change: false,
    calendar: false,
    details: true,
    hide_side_toolbar: true,
    hide_top_toolbar: false,
    hide_legend: false,
    hide_volume: false,
    hotlist: false,
    interval: 'D',
    locale: 'en',
    save_image: false,
    style: 1,
    symbol: resolveTradingViewSymbol(symbol, exchange),
    theme: 'dark',
    timezone: 'Etc/UTC',
    backgroundColor: '#141414',
    gridColor: '#141414',
    watchlist: [],
    withdateranges: false,
    compareSymbols: [],
    studies: [],
    width: '100%',
    height: 600,
});

export const BASELINE_WIDGET_CONFIG = (symbol: string, exchange?: string) => ({
    allow_symbol_change: false,
    calendar: false,
    details: false,
    hide_side_toolbar: true,
    hide_top_toolbar: false,
    hide_legend: false,
    hide_volume: false,
    hotlist: false,
    interval: 'D',
    locale: 'en',
    save_image: false,
    style: 10,
    symbol: resolveTradingViewSymbol(symbol, exchange),
    theme: 'dark',
    timezone: 'Etc/UTC',
    backgroundColor: '#141414',
    gridColor: '#141414',
    watchlist: [],
    withdateranges: false,
    compareSymbols: [],
    studies: [],
    width: '100%',
    height: 600,
});

export const TECHNICAL_ANALYSIS_WIDGET_CONFIG = (symbol: string, exchange?: string) => {
    const symbolWithExchange = resolveTradingViewSymbol(symbol, exchange);
    // Format URL with UTM parameters as TradingView expects
    const encodedSymbol = encodeURIComponent(symbolWithExchange);
    const tradingViewChartUrl = `https://www.tradingview.com/chart/?symbol=${encodedSymbol}&utm_source=localhost&utm_medium=widget&utm_campaign=technical-analysis-logo&utm_term=${encodedSymbol}`;
    return {
        symbol: symbolWithExchange,
        colorTheme: 'dark',
        isTransparent: 'true',
        locale: 'en',
        width: '100%',
        height: 400,
        interval: '1h',
        largeChartUrl: tradingViewChartUrl,
    };
};

export const COMPANY_PROFILE_WIDGET_CONFIG = (symbol: string, exchange?: string) => {
    const symbolWithExchange = resolveTradingViewSymbol(symbol, exchange);
    // Format URL with UTM parameters as TradingView expects
    const encodedSymbol = encodeURIComponent(symbolWithExchange);
    const tradingViewChartUrl = `https://www.tradingview.com/chart/?symbol=${encodedSymbol}&utm_source=localhost&utm_medium=widget&utm_campaign=company-profile-logo&utm_term=${encodedSymbol}`;
    return {
        symbol: symbolWithExchange,
        colorTheme: 'dark',
        isTransparent: 'true',
        locale: 'en',
        width: '100%',
        height: 440,
        largeChartUrl: tradingViewChartUrl,
    };
};

export const COMPANY_FINANCIALS_WIDGET_CONFIG = (symbol: string, exchange?: string) => {
    const symbolWithExchange = resolveTradingViewSymbol(symbol, exchange);
    // Format URL with UTM parameters as TradingView expects
    // Example: https://www.tradingview.com/chart/?symbol=NASDAQ%3AMETA&utm_source=localhost&utm_medium=widget&utm_campaign=financials-logo&utm_term=NASDAQ%3AMETA
    const encodedSymbol = encodeURIComponent(symbolWithExchange);
    const tradingViewChartUrl = `https://www.tradingview.com/chart/?symbol=${encodedSymbol}&utm_source=localhost&utm_medium=widget&utm_campaign=financials-logo&utm_term=${encodedSymbol}`;
    return {
        symbol: symbolWithExchange,
        colorTheme: 'dark',
        isTransparent: 'true',
        locale: 'en',
        width: '100%',
        height: 464,
        displayMode: 'regular',
        largeChartUrl: tradingViewChartUrl,
        // Also try chartUrl as some widgets use this property
        chartUrl: tradingViewChartUrl,
    };
};

export const POPULAR_STOCK_SYMBOLS = [
    // Tech Giants (the big technology companies)
    'AAPL',
    'MSFT',
    'GOOGL',
    'AMZN',
    'TSLA',
    'META',
    'NVDA',
    'NFLX',
    'ORCL',
    'CRM',

    // Growing Tech Companies
    'ADBE',
    'INTC',
    'AMD',
    'PYPL',
    'UBER',
    'ZOOM',
    'SPOT',
    'SQ',
    'SHOP',
    'ROKU',

    // Newer Tech Companies
    'SNOW',
    'PLTR',
    'COIN',
    'RBLX',
    'DDOG',
    'CRWD',
    'NET',
    'OKTA',
    'TWLO',
    'ZM',

    // Consumer & Delivery Apps
    'DOCU',
    'PTON',
    'PINS',
    'SNAP',
    'LYFT',
    'DASH',
    'ABNB',
    'RIVN',
    'LCID',
    'NIO',

    // International Companies
    'XPEV',
    'LI',
    'BABA',
    'JD',
    'PDD',
    'TME',
    'BILI',
    'DIDI',
    'GRAB',
    'SE',
];

export const NO_MARKET_NEWS =
    '<p class="mobile-text" style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#4b5563;">No market news available today. Please check back tomorrow.</p>';

export const WATCHLIST_TABLE_HEADER = [
    'Company',
    'Symbol',
    'Price',
    'Change',
    'Market Cap',
    'P/E Ratio',
    'Alert',
    'Action',
];