import type { NextConfig } from "next";

const pocketbaseUrl =
  process.env.NEXT_PUBLIC_PB_BASE_URL ?? "https://staging.angle.services";
let pocketbaseHost = "staging.angle.services";
let pocketbaseProtocol: "http" | "https" = "https";

try {
  const parsed = new URL(pocketbaseUrl);
  pocketbaseHost = parsed.hostname;
  pocketbaseProtocol = parsed.protocol.replace(":", "") as "http" | "https";
} catch {
  pocketbaseHost = "staging.angle.services";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: pocketbaseProtocol,
        hostname: pocketbaseHost,
      },
    ],
  },
};

export default nextConfig;
