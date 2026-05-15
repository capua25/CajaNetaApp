import type { NextConfig } from "next";

// Content Security Policy
// - 'unsafe-inline' in script-src is required by Next.js App Router runtime
//   (inline bootstrap + hydration data) and is always present.
// - 'unsafe-inline' in style-src is required by Tailwind v4 / Next runtime style
//   injection and is always present.
// - 'unsafe-eval' in script-src is appended ONLY when NODE_ENV === 'development'
//   to support React Refresh / HMR under `next dev`. It is omitted in
//   production builds and on Vercel Preview deployments (both run `vercel build`,
//   which sets NODE_ENV=production).
// - Supabase requires wss:// for realtime and https://*.supabase.co for REST/Auth.
// - MercadoPago JS SDK is loaded from https://sdk.mercadopago.com (script + iframe).
// - Vercel Analytics scripts load from https://va.vercel-scripts.com and report
//   to https://vitals.vercel-insights.com.
// - Fonts are self-hosted via next/font, so no third-party font hosts are listed.
const isDev = process.env.NODE_ENV === 'development'

const scriptSrc = [
  "script-src",
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://va.vercel-scripts.com",
  "https://sdk.mercadopago.com",
].join(' ')

const CSP = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
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
