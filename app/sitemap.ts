// todo: sitemap to include project and blog records from pocketbase regardless of featured status

import type { MetadataRoute } from "next";

const POCKETBASE_BASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "";

const MAX_PER_PAGE = 200;

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

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");

const toKebabCase = (value?: string | null) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const RECENT_DAYS = 90;
const RECENT_WINDOW_MS = RECENT_DAYS * 24 * 60 * 60 * 1000;

type PBListResponse<T> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

type ProjectRecord = {
  slug?: string;
  Name?: string;
  updated?: string;
  created?: string;
  featured?: boolean;
};

type BlogRecord = {
  slug?: string;
  updated?: string;
  created?: string;
  publish_date?: string;
  published?: boolean;
  featured?: boolean;
};

const getLastModified = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

const isRecent = (value?: Date) => {
  if (!value) return false;
  return Date.now() - value.getTime() <= RECENT_WINDOW_MS;
};

const fetchAllRecords = async <T>(
  collection: string,
  filter?: string,
): Promise<T[]> => {
  const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);
  const items: T[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      perPage: String(MAX_PER_PAGE),
      page: String(page),
    });
    if (filter) {
      params.set("filter", filter);
    }

    const response = await fetch(
      `${normalizedBaseUrl}/api/collections/${collection}/records?${params.toString()}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      throw new Error(`Failed to load ${collection} records`);
    }

    const data = (await response.json()) as PBListResponse<T>;
    items.push(...(data.items ?? []));

    if (page >= data.totalPages) {
      break;
    }

    page += 1;
  }

  return items;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const toUrl = (path: string) => new URL(path, siteUrl).toString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: toUrl("/contact-us"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: toUrl("/design"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: toUrl("/blog"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  let projectRecords: ProjectRecord[] = [];
  let blogRecords: BlogRecord[] = [];

  try {
    projectRecords = await fetchAllRecords<ProjectRecord>("project");
  } catch {
    projectRecords = [];
  }

  try {
    blogRecords = await fetchAllRecords<BlogRecord>("blog", "published=true");
  } catch {
    blogRecords = [];
  }

  const projectRoutes: MetadataRoute.Sitemap = projectRecords.flatMap(
    (project) => {
      const derivedSlug = toKebabCase(project.Name?.trim());
      const slug = derivedSlug || project.slug?.trim();
      if (!slug) return [];
      const lastModified = getLastModified(project.updated ?? project.created);
      const recent = isRecent(lastModified);
      const priority = project.featured ? 0.8 : 0.6;
      const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] =
        recent ? "weekly" : "monthly";
      return [
        {
          url: toUrl(`/design/${encodeURIComponent(slug)}`),
          lastModified,
          changeFrequency,
          priority,
        },
      ];
    },
  );

  const blogRoutes: MetadataRoute.Sitemap = blogRecords.flatMap((post) => {
    const slug = post.slug?.trim();
    if (!slug) return [];
    const lastModified = getLastModified(
      post.updated ?? post.publish_date ?? post.created,
    );
    const priority = post.featured ? 0.8 : 0.6;
    const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] =
      post.featured ? "weekly" : "monthly";
    return [
      {
        url: toUrl(`/blog/${encodeURIComponent(slug)}`),
        lastModified,
        changeFrequency,
        priority,
      },
    ];
  });

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
