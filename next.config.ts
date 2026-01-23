import type { NextConfig } from "next";

const pocketbaseUrl =
  process.env.NEXT_PUBLIC_POCKETBASE_URL;
let pocketbaseHost = "localhost";
let pocketbaseProtocol: "http" | "https" = "https";

if (pocketbaseUrl) {
  try {
    const parsed = new URL(pocketbaseUrl);
    pocketbaseHost = parsed.hostname;
    pocketbaseProtocol = parsed.protocol.replace(":", "") as "http" | "https";
  } catch {
    pocketbaseHost = "localhost";
  }
}

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
};

export default nextConfig;
