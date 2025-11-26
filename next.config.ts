import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: false,
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.ibb.co',
                port: '',
                pathname: '/**',
            },
        ],
        // Increase timeout for external images (default is 30s)
        minimumCacheTTL: 60,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Performance optimizations
    compress: true,
    poweredByHeader: false,
    // Optimize bundle sizes
    experimental: {
        optimizePackageImports: [
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            'lucide-react',
            'country-data-list',
            'react-select-country-list',
        ],
    },
    // Reduce bundle size by excluding unnecessary modules
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Optimize client-side bundle
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
};

export default nextConfig;
