import { NextResponse } from "next/server";
import { Resend } from "resend";

const PURPOSE_OPTIONS = [
  "Residential project",
  "Commercial project",
  "Collaboration",
  "Other inquiry",
] as const;

const PURPOSE_TO_PB: Record<(typeof PURPOSE_OPTIONS)[number], string> = {
  "Residential project": "Residential",
  "Commercial project": "Commercial",
  Collaboration: "Collaboration",
  "Other inquiry": "Other inquiry",
};

const PURPOSE_SET = new Set<string>(PURPOSE_OPTIONS);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_LENGTHS = {
  name: 160,
  purpose: 80,
  email: 254,
  phone_number: 40,
  message: 4000,
  pageUrl: 2000,
  company: 200,
};

const resendApiKey = process.env.RESEND_API_KEY || "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const getBoolean = (value: unknown) =>
  value === true ||
  value === "true" ||
  value === 1 ||
  value === "1";

const isTooLong = (value: string, max: number) => value.length > max;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const getClientIp = (req: Request) => {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    if (first) return first.trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "unknown";
};

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterMs: RATE_LIMIT_WINDOW_MS };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }
  entry.count += 1;
  return { allowed: true, retryAfterMs: entry.resetAt - now };
};

const parseOrigin = (value?: string | null) => {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const getEnvOrigin = (value?: string) => {
  if (!value) return null;
  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return new URL(value).origin;
    }
    return new URL(`https://${value}`).origin;
  } catch {
    return null;
  }
};

const BASE_ALLOWED_ORIGINS = new Set(
  [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_URL,
  ]
    .map(getEnvOrigin)
    .filter(Boolean) as string[],
);
BASE_ALLOWED_ORIGINS.add("http://localhost:3000");
BASE_ALLOWED_ORIGINS.add("http://127.0.0.1:3000");

const getRequestOrigin = (req: Request) => {
  const host = req.headers.get("host");
  if (!host) return null;
  const protoHeader = req.headers.get("x-forwarded-proto");
  const proto = protoHeader
    ? protoHeader.split(",")[0]?.trim() || "https"
    : "https";
  return `${proto}://${host}`;
};

const isAllowedOrigin = (req: Request) => {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  const allowed = new Set(BASE_ALLOWED_ORIGINS);
  const requestOrigin = getRequestOrigin(req);
  if (requestOrigin) {
    allowed.add(requestOrigin);
  }

  const origin = parseOrigin(req.headers.get("origin"));
  if (origin && allowed.has(origin)) {
    return true;
  }

  const referer = parseOrigin(req.headers.get("referer"));
  if (referer && allowed.has(referer)) {
    return true;
  }

  return false;
};

const getPocketbaseBaseUrl = () =>
  (
    process.env.POCKETBASE_URL ||
    process.env.NEXT_PUBLIC_POCKETBASE_URL ||
    ""
  ).trim();

const POCKETBASE_AUTH_COLLECTION = (
  process.env.PB_AUTH_COLLECTION || "api_clients"
).trim();
const PB_SERVER_EMAIL = (process.env.PB_SERVER_EMAIL || "").trim();
const PB_SERVER_PASSWORD = (process.env.PB_SERVER_PASSWORD || "").trim();

let cachedPbToken: { token: string; expMs: number } | null = null;

const decodeJwtExpMs = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return 0;
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const json = Buffer.from(payload, "base64").toString("utf8");
    const parsed = JSON.parse(json) as { exp?: number };
    if (!parsed.exp) return 0;
    return parsed.exp * 1000;
  } catch {
    return 0;
  }
};

const getPocketbaseToken = async (baseUrl: string, forceRefresh = false) => {
  const now = Date.now();
  if (
    !forceRefresh &&
    cachedPbToken &&
    cachedPbToken.expMs - now > 60_000 &&
    cachedPbToken.token
  ) {
    return cachedPbToken.token;
  }

  if (!PB_SERVER_EMAIL || !PB_SERVER_PASSWORD) {
    throw new Error("PB server credentials are not configured.");
  }

  const authUrl = `${baseUrl}/api/collections/${encodeURIComponent(
    POCKETBASE_AUTH_COLLECTION,
  )}/auth-with-password`;

  const authResponse = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: PB_SERVER_EMAIL,
      password: PB_SERVER_PASSWORD,
    }),
    cache: "no-store",
  });

  if (!authResponse.ok) {
    const errorText = await authResponse.text().catch(() => "");
    throw new Error(
      `PocketBase auth failed (${authResponse.status}): ${errorText}`,
    );
  }

  const authData = (await authResponse.json()) as { token?: string };
  const token = (authData.token || "").trim();
  if (!token) {
    throw new Error("PocketBase auth returned no token.");
  }

  const expMs = decodeJwtExpMs(token) || now + 4 * 60_000;
  cachedPbToken = { token, expMs };
  return token;
};

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(req);
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
        },
      },
    );
  }

  let body: Record<string, unknown>;

  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch (error) {
    console.error("Lead API: invalid JSON payload.", error);
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const company = getString(body.company);
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const name = getString(body.name);
  const purpose = getString(body.purpose);
  const email = getString(body.email);
  const phone_number = getString(body.phone_number);
  const message = getString(body.message);
  const pageUrl = getString(body.pageUrl);
  const consent = getBoolean(body.consent);

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (isTooLong(name, MAX_LENGTHS.name)) {
    return NextResponse.json({ error: "Name is too long" }, { status: 400 });
  }
  if (!purpose) {
    return NextResponse.json({ error: "Purpose is required" }, { status: 400 });
  }
  if (!PURPOSE_SET.has(purpose)) {
    return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
  }
  if (isTooLong(purpose, MAX_LENGTHS.purpose)) {
    return NextResponse.json({ error: "Purpose is too long" }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (isTooLong(email, MAX_LENGTHS.email)) {
    return NextResponse.json({ error: "Email is too long" }, { status: 400 });
  }
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!phone_number) {
    return NextResponse.json(
      { error: "Phone number is required" },
      { status: 400 }
    );
  }
  if (isTooLong(phone_number, MAX_LENGTHS.phone_number)) {
    return NextResponse.json(
      { error: "Phone number is too long" },
      { status: 400 }
    );
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (isTooLong(message, MAX_LENGTHS.message)) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json(
      { error: "Consent is required" },
      { status: 400 },
    );
  }
  if (pageUrl && isTooLong(pageUrl, MAX_LENGTHS.pageUrl)) {
    return NextResponse.json({ error: "Page URL is too long" }, { status: 400 });
  }

  const pocketbaseUrl = getPocketbaseBaseUrl();
  if (!pocketbaseUrl) {
    console.error("Lead API: NEXT_PUBLIC_POCKETBASE_URL is not configured.");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const leadsFromEmail = (process.env.LEADS_FROM_EMAIL || "").trim();
  if (!resend || !leadsFromEmail) {
    console.error("Lead API: Resend configuration is missing.");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const normalizedPocketbaseUrl = pocketbaseUrl.replace(/\/+$/, "");
  const pocketbasePurpose = PURPOSE_TO_PB[purpose as (typeof PURPOSE_OPTIONS)[number]] ?? purpose;

  const pbPayload: Record<string, string> = {
    name,
    purpose: pocketbasePurpose,
    email,
    phone_number,
    message,
  };

  if (pageUrl) {
    pbPayload.page_url = pageUrl;
  }

  let pbToken = "";
  try {
    pbToken = await getPocketbaseToken(normalizedPocketbaseUrl);
  } catch (error) {
    console.error("Lead API: PocketBase auth failed.", error);
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  try {
    const createLead = async (token: string) =>
      fetch(`${normalizedPocketbaseUrl}/api/collections/leads/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pbPayload),
        cache: "no-store",
      });

    let pbResponse = await createLead(pbToken);

    // If the cached token expired, refresh once and retry.
    if (pbResponse.status === 401) {
      pbToken = await getPocketbaseToken(normalizedPocketbaseUrl, true);
      pbResponse = await createLead(pbToken);
    }

    if (!pbResponse.ok) {
      const errorText = await pbResponse.text().catch(() => "");
      console.error("PocketBase lead create failed.", {
        status: pbResponse.status,
        body: errorText,
      });
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("PocketBase lead create failed.", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 502 });
  }

  const emailText = [
    `New lead form submission by ${name}`,
    "",
    `Name: ${name}`,
    `Purpose: ${purpose}`,
    `Email: ${email}`,
    `Phone number: ${phone_number}`,
    `Message: ${message}`,
    `Consent: ${consent ? "yes" : "no"}`,
    pageUrl ? `Page URL: ${pageUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { error } = await resend.emails.send({
      from: leadsFromEmail,
      to: "vivekvarmaarchitects.web@gmail.com",
      subject: `New lead form submission by ${name}`,
      text: emailText,
    });

    if (error) {
      console.error("Resend email send failed.", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Resend email send failed.", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
