import type { MetadataRoute } from "next";

const POCKETBASE_BASE_URL =
  process.env.POCKETBASE_URL ?? "";

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

type PBListResponse<T> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

type ProjectRecord = {
  slug?: string;
  updated?: string;
  created?: string;
  featured?: boolean;
};

type BlogRecord = {
  slug?: string;
  updated?: string;
  created?: string;
  published?: boolean;
  featured?: boolean;
};

const getLastModified = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
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
      url: toUrl("/contact"),
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
    projectRecords = await fetchAllRecords<ProjectRecord>(
      "project",
      "featured=true",
    );
  } catch {
    projectRecords = [];
  }

  try {
    blogRecords = await fetchAllRecords<BlogRecord>(
      "blog",
      "published=true && featured=true",
    );
  } catch {
    blogRecords = [];
  }

  const projectRoutes: MetadataRoute.Sitemap = projectRecords.flatMap(
    (project) => {
      const slug = project.slug?.trim();
      if (!slug) return [];
      const lastModified = getLastModified(project.updated ?? project.created);
      return [
        {
          url: toUrl(`/design/${encodeURIComponent(slug)}`),
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        },
      ];
    },
  );

  const blogRoutes: MetadataRoute.Sitemap = blogRecords.flatMap((post) => {
    const slug = post.slug?.trim();
    if (!slug) return [];
    const lastModified = getLastModified(post.updated ?? post.created);
    return [
      {
        url: toUrl(`/blog/${encodeURIComponent(slug)}`),
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
    ];
  });

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
