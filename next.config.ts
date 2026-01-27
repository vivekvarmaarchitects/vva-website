import type { NextConfig } from "next";

const pocketbaseUrl =
  process.env.NEXT_PUBLIC_POCKETBASE_URL;
let pocketbaseHost = "localhost";
let pocketbaseProtocol: "http" | "https" = "https";
let pocketbaseOrigin: string | null = null;

if (pocketbaseUrl) {
  try {
    const parsed = new URL(pocketbaseUrl);
    pocketbaseHost = parsed.hostname;
    pocketbaseProtocol = parsed.protocol.replace(":", "") as "http" | "https";
    pocketbaseOrigin = parsed.origin;
  } catch {
    pocketbaseHost = "localhost";
  }
}

const isProd = process.env.NODE_ENV === "production";
const scriptSrc = [
  "script-src 'self'",
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  ...(isProd ? [] : ["'unsafe-inline'", "'unsafe-eval'"]),
].join(" ");

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  scriptSrc,
  [
    "connect-src 'self'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    pocketbaseOrigin ?? "",
  ]
    .filter(Boolean)
    .join(" "),
  [
    "img-src 'self'",
    "data:",
    "blob:",
    "https:",
    pocketbaseOrigin ?? "",
  ]
    .filter(Boolean)
    .join(" "),
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data: https:",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "media-src 'self' https:",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: csp,
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    NEXT_PUBLIC_POCKETBASE_URL: pocketbaseUrl ?? "",
  },
  images: {
    remotePatterns: pocketbaseUrl
      ? [
          {
            protocol: pocketbaseProtocol,
            hostname: pocketbaseHost,
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
