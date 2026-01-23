import type { Metadata } from "next";

type SeoPageRecord = {
  collectionId?: string;
  id?: string;
  route?: string;
  seo_title?: string;
  seo_description?: string;
  seo_robots_index?: boolean;
  seo_robots_follow?: boolean;
  seo_og_title?: string;
  seo_og_description?: string;
  seo_og_image?: string;
  seo_canonical_url?: string;
  schema_jsonld?: Record<string, unknown> | string | null;
};

type PBListResponse<T> = {
  items?: T[];
};

const POCKETBASE_BASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "";
const SEO_COLLECTION = "SEO_pages";

const DEFAULT_SITE_TITLE = "Vivek Verma Architects";
const DEFAULT_SITE_DESCRIPTION = "Portfolio and projects of Vivek Verma Architects.";

const DEFAULT_SITE_METADATA: Metadata = {
  title: DEFAULT_SITE_TITLE,
  description: DEFAULT_SITE_DESCRIPTION,
};

const DEFAULT_OG_IMAGE = "/hero_vva.png";

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");

const normalizeRoute = (route: string) =>
  route.startsWith("/") ? route : `/${route}`;

const getSiteUrl = () => {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_URL;
  if (!fromEnv) return "http://localhost:3000";
  if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) {
    return fromEnv;
  }
  return `https://${fromEnv}`;
};

const isNonEmptyString = (value?: string | null): value is string =>
  typeof value === "string" && value.trim().length > 0;

const coerceBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

const parseJson = <T,>(value: unknown) => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
};

const resolveFileUrl = (
  record: SeoPageRecord,
  filename: string,
  baseUrl: string,
) => {
  if (!record.collectionId || !record.id || !baseUrl) {
    return null;
  }
  const encodedName = encodeURIComponent(filename);
  return `${baseUrl}/api/files/${record.collectionId}/${record.id}/${encodedName}`;
};

const resolveImageUrl = (
  record: SeoPageRecord | null,
  value: string | undefined,
  siteUrl: string,
  baseUrl: string,
) => {
  if (!record || !isNonEmptyString(value)) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return new URL(trimmed, siteUrl).toString();
  }
  return resolveFileUrl(record, trimmed, baseUrl);
};

const resolveCanonicalUrl = (
  route: string,
  siteUrl: string,
  override?: string,
) => {
  if (isNonEmptyString(override)) {
    const trimmed = override.trim();
    if (trimmed.startsWith("/")) {
      return new URL(trimmed, siteUrl).toString();
    }
    return trimmed;
  }
  return new URL(normalizeRoute(route), siteUrl).toString();
};

const fetchSeoRecord = async (route: string) => {
  const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);
  if (!normalizedBaseUrl) {
    return null as SeoPageRecord | null;
  }

  const safeRoute = normalizeRoute(route).replace(/'/g, "\\'");
  const params = new URLSearchParams({
    filter: `(route='${safeRoute}')`,
    perPage: "1",
  });

  try {
    const response = await fetch(
      `${normalizedBaseUrl}/api/collections/${SEO_COLLECTION}/records?${params.toString()}`,
      process.env.NODE_ENV === "development"
        ? { cache: "no-store" }
        : { next: { revalidate: 300 } },
    );
    if (!response.ok) {
      return null as SeoPageRecord | null;
    }
    const data = (await response.json()) as PBListResponse<SeoPageRecord>;
    return data.items?.[0] ?? null;
  } catch {
    return null as SeoPageRecord | null;
  }
};

const extractJsonLdObjects = (schema: unknown) => {
  const parsed = parseJson<Record<string, unknown>>(schema);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return [] as Record<string, unknown>[];
  }
  return Object.values(parsed).filter(
    (value): value is Record<string, unknown> =>
      Boolean(value) && typeof value === "object" && !Array.isArray(value),
  );
};

export const getSeoMetadata = async (route: string): Promise<Metadata> => {
  const record = await fetchSeoRecord(route);
  const siteUrl = getSiteUrl();
  const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);

  const title = record?.seo_title?.trim() || DEFAULT_SITE_TITLE;
  const description = record?.seo_description?.trim() || DEFAULT_SITE_DESCRIPTION;
  const canonical = resolveCanonicalUrl(
    route,
    siteUrl,
    record?.seo_canonical_url,
  );
  const ogTitle = record?.seo_og_title?.trim() || title;
  const ogDescription = record?.seo_og_description?.trim() || description;
  const ogImage =
    resolveImageUrl(record, record?.seo_og_image, siteUrl, normalizedBaseUrl) ??
    new URL(DEFAULT_OG_IMAGE, siteUrl).toString();

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: coerceBoolean(record?.seo_robots_index, true),
      follow: coerceBoolean(record?.seo_robots_follow, true),
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
};

export const getSeoJsonLd = async (route: string) => {
  const record = await fetchSeoRecord(route);
  if (!record?.schema_jsonld) {
    return [] as Record<string, unknown>[];
  }
  return extractJsonLdObjects(record.schema_jsonld);
};

export { DEFAULT_SITE_METADATA };
