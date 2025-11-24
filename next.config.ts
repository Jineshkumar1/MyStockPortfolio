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
    }
};

export default nextConfig;
