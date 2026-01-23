import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import DesignProjectPage from "@/components/design-project-page";
import SeoJsonLd from "@/components/seo-jsonld";
import { DEFAULT_SITE_METADATA } from "@/lib/seo-pages";
import type { ProjectRecord } from "@/lib/project-types";

/**
 * PocketBase list endpoint returns an object like:
 * { page, perPage, totalItems, totalPages, items: [...] }
 *
 * T makes it reusable for any collection type (projects, blogs, etc.)
 */
type PBListResponse<T> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const POCKETBASE_BASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "";
const PROJECT_COLLECTION = "project";

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");

const normalizeStringArray = (value?: string[] | string | null): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const normalizeSpaces = (value: string) => value.replace(/\s+/g, " ").trim();

const isNonEmptyString = (value?: string | null): value is string =>
  typeof value === "string" && value.trim().length > 0;

const safeTrim = (value?: string | null) =>
  typeof value === "string" ? value.trim() : "";

const toKebabCase = (value?: string | null) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

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

const resolveProjectImageUrl = (
  baseUrl: string,
  project: { collectionId: string; id: string },
  filename?: string,
): string | null => {
  if (!isNonEmptyString(filename)) return null;
  const trimmed = filename.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  if (!baseUrl) return null;
  const encodedName = encodeURIComponent(trimmed);
  return `${baseUrl}/api/files/${project.collectionId}/${project.id}/${encodedName}`;
};

const resolveSeoImageUrl = (
  project: { collectionId: string; id: string },
  filename: string | undefined,
  siteUrl: string,
  baseUrl: string,
) => {
  if (!isNonEmptyString(filename)) return null;
  const trimmed = filename.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return new URL(trimmed, siteUrl).toString();
  }
  return resolveProjectImageUrl(baseUrl, project, trimmed);
};

const trimDescription = (value?: string | null, maxLength = 160) => {
  if (!isNonEmptyString(value)) return "";
  const normalized = normalizeSpaces(value);
  if (normalized.length <= maxLength) return normalized;
  const clipped = normalized.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  if (lastSpace > 80) {
    return clipped.slice(0, lastSpace).trim();
  }
  return clipped.trim();
};

const buildSeoTitle = (
  project: ProjectRecord,
  locationLabel: string,
  brand: string,
) => {
  const name = safeTrim(project.Name);
  const scope = safeTrim(project.Scope);
  let title = name;
  if (scope) {
    title = title ? `${title} - ${scope}` : scope;
  }
  if (locationLabel) {
    title = title ? `${title} in ${locationLabel}` : locationLabel;
  }
  if (brand) {
    title = title ? `${title} | ${brand}` : brand;
  }
  return title;
};

const getLocationTokens = (project: ProjectRecord) => {
  const locality = safeTrim(project.location_json?.location?.locality);
  const city = safeTrim(project.location_json?.location?.city);
  const state = safeTrim(project.location_json?.location?.state);
  const country = safeTrim(project.location_json?.location?.country);
  const fallbackParts = safeTrim(project.Location)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const labelParts = [locality, city].filter(Boolean);
  const label = labelParts.length ? labelParts.join(", ") : fallbackParts.join(", ");
  const keywordParts = [locality, city, state].filter(Boolean);
  const keywords = keywordParts.length ? keywordParts : fallbackParts;
  return { locality, city, state, country, label, keywords };
};

const extractAltArray = (value: unknown, key: string) => {
  if (!value) return [] as string[];
  if (Array.isArray(value)) {
    return value.filter(isNonEmptyString).map((item) => item.trim());
  }
  if (typeof value === "object" && value !== null) {
    const candidate = (value as Record<string, unknown>)[key];
    if (Array.isArray(candidate)) {
      return candidate.filter(isNonEmptyString).map((item) => item.trim());
    }
  }
  return [] as string[];
};

const buildAltList = (
  imageUrls: string[],
  altSource: string[],
  fallbackBase: string,
) => {
  const base = isNonEmptyString(fallbackBase) ? fallbackBase : "Project image";
  return imageUrls.map((_, index) => {
    const alt = altSource[index];
    if (isNonEmptyString(alt)) return alt.trim();
    const suffix = imageUrls.length > 1 ? ` image ${index + 1}` : "";
    return `${base}${suffix}`.trim();
  });
};

const buildKeywords = (project: ProjectRecord, locationKeywords: string[]) => {
  const items = [
    safeTrim(project.Scope),
    safeTrim(project.Sector),
    ...locationKeywords.map((item) => item.trim()),
    safeTrim(project.Year),
  ].filter(Boolean);
  return Array.from(new Set(items));
};

const buildImageAltBase = (project: ProjectRecord, locationLabel: string) => {
  const name = safeTrim(project.Name);
  const sector = safeTrim(project.Sector);
  const parts = [name, sector].filter(Boolean);
  let base = parts.join(" ");
  if (locationLabel) {
    base = base ? `${base} in ${locationLabel}` : locationLabel;
  }
  return base;
};

const fetchProjectBySlug = cache(async (slug: string) => {
  const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);
  if (!normalizedBaseUrl || !slug) {
    return null as ProjectRecord | null;
  }

  const safeSlug = String(slug).replace(/'/g, "\\'");
  const filter = `(slug='${safeSlug}')`;
  const params = new URLSearchParams({
    filter,
    perPage: "1",
  });

  try {
    const response = await fetch(
      `${normalizedBaseUrl}/api/collections/${PROJECT_COLLECTION}/records?${params.toString()}`,
      process.env.NODE_ENV === "development"
        ? { cache: "no-store" }
        : { next: { revalidate: 300 } },
    );
    if (!response.ok) {
      return null as ProjectRecord | null;
    }
    const data = (await response.json()) as PBListResponse<ProjectRecord>;
    return data.items?.[0] ?? null;
  } catch {
    return null as ProjectRecord | null;
  }
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);
  if (!project) {
    return DEFAULT_SITE_METADATA;
  }

  const siteUrl = getSiteUrl();
  const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);
  const locationTokens = getLocationTokens(project);
  const brand =
    typeof DEFAULT_SITE_METADATA.title === "string"
      ? DEFAULT_SITE_METADATA.title
      : "";
  const derivedSlug = toKebabCase(project.Name);
  const canonicalSlug = derivedSlug || safeTrim(project.slug) || slug;
  const canonicalUrl = new URL(
    `/design/${encodeURIComponent(canonicalSlug)}`,
    siteUrl,
  ).toString();

  const seoTitle = isNonEmptyString(project.seo_title)
    ? project.seo_title.trim()
    : buildSeoTitle(project, locationTokens.label, brand);
  const seoDescription = isNonEmptyString(project.seo_description)
    ? project.seo_description.trim()
    : trimDescription(project.Intro);

  const fallbackDescription =
    typeof DEFAULT_SITE_METADATA.description === "string"
      ? DEFAULT_SITE_METADATA.description
      : "";
  const description = seoDescription || fallbackDescription;

  const seoImageUrl = resolveSeoImageUrl(
    project,
    project.seo_image,
    siteUrl,
    normalizedBaseUrl,
  );
  const seoImageAlt = isNonEmptyString(project.seo_image_alt)
    ? project.seo_image_alt.trim()
    : undefined;
  const keywords = buildKeywords(project, locationTokens.keywords);

  return {
    title: seoTitle,
    description,
    alternates: { canonical: canonicalUrl },
    keywords: keywords.length ? keywords : undefined,
    robots: { index: true, follow: true },
    openGraph: {
      title: seoTitle,
      description,
      url: canonicalUrl,
      type: "website",
      images: seoImageUrl
        ? [
            {
              url: seoImageUrl,
              ...(seoImageAlt ? { alt: seoImageAlt } : {}),
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: seoImageUrl ? [seoImageUrl] : undefined,
    },
  };
}

const buildJsonLd = (
  project: ProjectRecord,
  seoDescription: string,
  seoImageUrl: string | null,
  canonicalUrl: string,
  locationTokens: ReturnType<typeof getLocationTokens>,
  keywords: string[],
) => {
  const name = safeTrim(project.Name);
  const scope = safeTrim(project.Scope);
  const sector = safeTrim(project.Sector);
  const about = [scope, sector].filter(Boolean);
  const year = safeTrim(project.Year);
  const dateCreated = /^\d{4}$/.test(year) ? year : "";
  const locationLabel =
    locationTokens.label || safeTrim(project.Location) || "";

  const address: Record<string, string> = {};
  if (locationTokens.city) {
    address.addressLocality = locationTokens.city;
  } else if (locationTokens.locality) {
    address.addressLocality = locationTokens.locality;
  }
  if (
    locationTokens.locality &&
    locationTokens.locality !== locationTokens.city
  ) {
    address.streetAddress = locationTokens.locality;
  }
  if (locationTokens.state) {
    address.addressRegion = locationTokens.state;
  }
  if (locationTokens.country) {
    address.addressCountry = locationTokens.country;
  }

  const contentLocation =
    locationLabel || Object.keys(address).length
      ? {
          "@type": "Place",
          ...(locationLabel ? { name: locationLabel } : {}),
          ...(Object.keys(address).length
            ? {
                address: {
                  "@type": "PostalAddress",
                  ...address,
                },
              }
            : {}),
        }
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    ...(name ? { name } : {}),
    ...(seoDescription ? { description: seoDescription } : {}),
    ...(seoImageUrl ? { image: [seoImageUrl] } : {}),
    ...(canonicalUrl ? { url: canonicalUrl } : {}),
    ...(dateCreated ? { dateCreated } : {}),
    ...(about.length ? { about } : {}),
    ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
    ...(contentLocation ? { contentLocation } : {}),
  } as Record<string, unknown>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);
  const siteUrl = getSiteUrl();
  const locationTokens = getLocationTokens(project);
  const derivedSlug = toKebabCase(project.Name);
  const canonicalSlug = derivedSlug || safeTrim(project.slug) || slug;
  const canonicalUrl = new URL(
    `/design/${encodeURIComponent(canonicalSlug)}`,
    siteUrl,
  ).toString();

  const seoDescription = isNonEmptyString(project.seo_description)
    ? project.seo_description.trim()
    : trimDescription(project.Intro);
  const fallbackDescription =
    typeof DEFAULT_SITE_METADATA.description === "string"
      ? DEFAULT_SITE_METADATA.description
      : "";
  const description = seoDescription || fallbackDescription;

  const seoImageUrl = resolveSeoImageUrl(
    project,
    project.seo_image,
    siteUrl,
    normalizedBaseUrl,
  );

  const imageGroupOne = normalizeStringArray(project.Image_1)
    .map((filename) =>
      resolveProjectImageUrl(normalizedBaseUrl, project, filename),
    )
    .filter((value): value is string => Boolean(value));
  const imageGroupTwo = normalizeStringArray(project.Image_2)
    .map((filename) =>
      resolveProjectImageUrl(normalizedBaseUrl, project, filename),
    )
    .filter((value): value is string => Boolean(value));

  const imageOneAltSource = extractAltArray(project.image_1_alt, "image_1_alt");
  const imageTwoAltSource = extractAltArray(project.image_2_alt, "image_2_alt");
  const altBase = buildImageAltBase(project, locationTokens.label);
  const imageOneAlt = buildAltList(imageGroupOne, imageOneAltSource, altBase);
  const imageTwoAlt = buildAltList(imageGroupTwo, imageTwoAltSource, altBase);

  const keywords = buildKeywords(project, locationTokens.keywords);
  const jsonLd = buildJsonLd(
    project,
    description,
    seoImageUrl,
    canonicalUrl,
    locationTokens,
    keywords,
  );

  return (
    <>
      <SeoJsonLd objects={jsonLd ? [jsonLd] : []} />
      <DesignProjectPage
        project={project}
        imageGroupOne={imageGroupOne}
        imageGroupTwo={imageGroupTwo}
        imageOneAlt={imageOneAlt}
        imageTwoAlt={imageTwoAlt}
      />
    </>
  );
}
