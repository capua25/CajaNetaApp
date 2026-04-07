import type { NextConfig } from "next";

// Content Security Policy
// - unsafe-inline required for Next.js App Router hydration scripts and Tailwind inline styles
// - unsafe-eval required for Next.js dev mode (removed automatically in production builds
//   via the separate prod CSP below if needed)
// - Supabase requires wss:// for realtime and https://*.supabase.co for REST/Auth
// - MercadoPago JS SDK is loaded from sdk.mercadopago.com
// - Vercel Analytics loads from va.vercel-scripts.com
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://sdk.mercadopago.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://vitals.vercel-insights.com",
  "frame-src https://sdk.mercadopago.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
