import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";

import BlogTitle from "@/components/blog/blog-title";
import Conversations from "@/components/sections/conversations-section";
import SeoJsonLd from "@/components/seo-jsonld";
import { DEFAULT_SITE_METADATA } from "@/lib/seo-pages";

type BlogFaqItem = {
  question?: string;
  answer?: string;
};

type BlogFaqBlock = {
  faq?: BlogFaqItem[];
};

type BlogRecord = {
  collectionId?: string;
  collectionName?: string;
  id?: string;
  slug?: string;
  title?: string;
  summary?: string;
  body?: string;
  category?: string;
  read_time?: string;
  hero_image?: string;
  hero_image_alt?: string;
  author?: string;
  publish_date?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  created?: string;
  updated?: string;
  primary_keyword?: string;
  secondary_keyword?: string;
  search_intent?: string;
  featured?: boolean;
  published?: boolean;
  faq?: BlogFaqBlock;
};

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

const POCKETBASE_BASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "";
const BLOG_COLLECTION = "blog";

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");

const normalizeSpaces = (value: string) => value.replace(/\s+/g, " ").trim();

const isNonEmptyString = (value?: string | null): value is string =>
  typeof value === "string" && value.trim().length > 0;

const safeTrim = (value?: string | null) =>
  typeof value === "string" ? value.trim() : "";

const uniqueStrings = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(trimmed);
  });
  return result;
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&rsquo;|&lsquo;|&#8217;|&#8216;/gi, "'")
    .replace(/&rdquo;|&ldquo;|&#8221;|&#8220;/gi, '"');

const stripHtml = (value: string) => {
  const withLineBreaks = value.replace(/<br\s*\/?>/gi, " ");
  const withoutTags = withLineBreaks.replace(/<[^>]*>/g, " ");
  return normalizeSpaces(decodeHtmlEntities(withoutTags));
};

const trimDescription = (value?: string | null, maxLength = 160) => {
  if (!isNonEmptyString(value)) return "";
  const normalized = normalizeSpaces(decodeHtmlEntities(value));
  if (normalized.length <= maxLength) return normalized;
  const clipped = normalized.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  if (lastSpace > 80) {
    return clipped.slice(0, lastSpace).trim();
  }
  return clipped.trim();
};

const extractFirstParagraphText = (body?: string | null) => {
  if (!isNonEmptyString(body)) return "";
  const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  for (const match of body.matchAll(paragraphRegex)) {
    const text = stripHtml(match[1] ?? "");
    if (text) return text;
  }
  return "";
};

const extractFirstImageSrc = (body?: string | null) => {
  if (!isNonEmptyString(body)) return "";
  const match = body.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? "";
};

const getWordCount = (body?: string | null) => {
  if (!isNonEmptyString(body)) return 0;
  const text = stripHtml(body);
  if (!text) return 0;
  return text.split(" ").filter(Boolean).length;
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

const resolveAbsoluteUrl = (value: string, siteUrl: string) => {
  if (!isNonEmptyString(value)) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("data:")) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  try {
    if (trimmed.startsWith("/")) {
      return new URL(trimmed, siteUrl).toString();
    }
    return new URL(trimmed, siteUrl).toString();
  } catch {
    return null;
  }
};

const resolveBlogImageUrl = (
  siteUrl: string,
  baseUrl: string,
  post: { collectionId?: string; id?: string },
  filename?: string,
) => {
  if (!isNonEmptyString(filename)) return null;
  const trimmed = filename.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith("/")) {
    return new URL(trimmed, siteUrl).toString();
  }
  if (!baseUrl || !post.collectionId || !post.id) {
    return null;
  }
  const encodedName = encodeURIComponent(trimmed);
  return `${baseUrl}/api/files/${post.collectionId}/${post.id}/${encodedName}`;
};

const normalizeFaqItems = (faq?: BlogFaqBlock) => {
  if (!faq?.faq?.length) return [] as Required<BlogFaqItem>[];
  return faq.faq
    .map((item) => ({
      question: safeTrim(item.question),
      answer: safeTrim(item.answer),
    }))
    .filter((item) => item.question && item.answer) as Required<BlogFaqItem>[];
};

const formatReadTime = (value?: string): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/minute/i.test(trimmed)) return trimmed;
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric)) {
    const padded = numeric < 10 ? `0${numeric}` : `${numeric}`;
    return `${padded} minute read`;
  }
  return trimmed;
};

const formatPublishDate = (value?: string): string | null => {
  if (!value) return null;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const toIsoString = (value?: string | null) => {
  if (!value) return "";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
};

const buildSeoFields = (
  post: BlogRecord,
  slug: string,
  siteUrl: string,
  baseUrl: string,
) => {
  const title = safeTrim(post.title) || "Blog";
  const primaryKeyword = safeTrim(post.primary_keyword);
  const seoTitle =
    safeTrim(post.meta_title) ||
    (primaryKeyword ? `${title} | ${primaryKeyword}` : `${title} | Blog`);

  const metaDescription = safeTrim(post.meta_description);
  const summaryDescription = trimDescription(post.summary);
  const bodyDescription = trimDescription(extractFirstParagraphText(post.body));
  const seoDescription =
    metaDescription || summaryDescription || bodyDescription;

  const seoKeywords = uniqueStrings(
    [
      safeTrim(post.primary_keyword),
      safeTrim(post.secondary_keyword),
      ...(post.tags ?? []),
      safeTrim(post.category),
    ].filter(Boolean),
  );

  const internalTags = uniqueStrings(
    [
      safeTrim(post.category),
      ...(post.tags ?? []),
      safeTrim(post.search_intent),
      safeTrim(post.primary_keyword),
      safeTrim(post.secondary_keyword),
    ].filter(Boolean),
  );

  const canonicalUrl = new URL(
    `/blog/${encodeURIComponent(slug)}`,
    siteUrl,
  ).toString();

  const heroImageUrl = resolveBlogImageUrl(
    siteUrl,
    baseUrl,
    post,
    post.hero_image,
  );
  const bodyImage = resolveAbsoluteUrl(
    extractFirstImageSrc(post.body),
    siteUrl,
  );
  const seoImage =
    heroImageUrl || bodyImage || new URL("/og-default.jpg", siteUrl).toString();

  const seoImageAlt =
    safeTrim(post.hero_image_alt) ||
    (primaryKeyword ? `${primaryKeyword} - ${title}` : title);

  const index = post.published === true;
  const follow = true;
  const category = safeTrim(post.category) || "Insights";
  const authorName =
    safeTrim(post.author) ||
    (typeof DEFAULT_SITE_METADATA.title === "string"
      ? DEFAULT_SITE_METADATA.title
      : "");

  return {
    title,
    seoTitle,
    seoDescription,
    seoKeywords,
    internalTags,
    canonicalUrl,
    seoImage,
    seoImageAlt,
    index,
    follow,
    category,
    authorName,
  };
};

const fetchBlogBySlug = cache(async (slug: string) => {
  const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);
  if (!normalizedBaseUrl || !slug) {
    return null as BlogRecord | null;
  }

  const safeSlug = String(slug).replace(/'/g, "\\'");
  const filter = `(slug='${safeSlug}')`;
  const params = new URLSearchParams({
    filter,
    perPage: "1",
  });

  try {
    const response = await fetch(
      `${normalizedBaseUrl}/api/collections/${BLOG_COLLECTION}/records?${params.toString()}`,
      process.env.NODE_ENV === "development"
        ? { cache: "no-store" }
        : { next: { revalidate: 300 } },
    );
    if (!response.ok) {
      return null as BlogRecord | null;
    }
    const data = (await response.json()) as PBListResponse<BlogRecord>;
    return data.items?.[0] ?? null;
  } catch {
    return null as BlogRecord | null;
  }
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);
  if (!post) {
    return DEFAULT_SITE_METADATA;
  }

  const siteUrl = getSiteUrl();
  const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);
  const seo = buildSeoFields(post, slug, siteUrl, normalizedBaseUrl);

  return {
    title: seo.seoTitle,
    description: seo.seoDescription,
    alternates: { canonical: seo.canonicalUrl },
    keywords: seo.seoKeywords.length ? seo.seoKeywords : undefined,
    robots: { index: seo.index, follow: seo.follow },
    other: seo.internalTags.length
      ? { internal_tags: seo.internalTags.join(", ") }
      : undefined,
    openGraph: {
      title: seo.seoTitle,
      description: seo.seoDescription,
      url: seo.canonicalUrl,
      type: "article",
      images: seo.seoImage
        ? [
            {
              url: seo.seoImage,
              alt: seo.seoImageAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.seoTitle,
      description: seo.seoDescription,
      images: seo.seoImage ? [seo.seoImage] : undefined,
    },
  };
}

const buildBlogJsonLd = (
  post: BlogRecord,
  seo: ReturnType<typeof buildSeoFields>,
  wordCount: number,
) => {
  const datePublished = toIsoString(post.publish_date || post.created);
  const dateModified = toIsoString(post.updated || post.publish_date);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: seo.seoTitle,
    description: seo.seoDescription,
    image: seo.seoImage,
    author: {
      "@type": "Person",
      name: seo.authorName,
    },
    datePublished,
    dateModified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": seo.canonicalUrl,
    },
    keywords: seo.seoKeywords.join(", "),
    articleSection: safeTrim(post.category),
    wordCount,
  } as Record<string, unknown>;
};

const buildFaqJsonLd = (faqItems: Required<BlogFaqItem>[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);
  if (!post) {
    notFound();
  }

  const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);
  const siteUrl = getSiteUrl();
  const seo = buildSeoFields(post, slug, siteUrl, normalizedBaseUrl);
  const heroImageUrl = resolveBlogImageUrl(
    siteUrl,
    normalizedBaseUrl,
    post,
    post.hero_image,
  );
  const summaryText = post.summary ?? post.meta_description ?? "";
  const faqItems = normalizeFaqItems(post.faq);
  const wordCount = getWordCount(post.body);
  const blogJsonLd = buildBlogJsonLd(post, seo, wordCount);
  const showFaqSchema = faqItems.length >= 2;

  return (
    <div className="mt-32">
      <SeoJsonLd
        objects={[
          blogJsonLd,
          ...(showFaqSchema ? [buildFaqJsonLd(faqItems)] : []),
        ]}
      />
      <div className="width-max">
        <div className="font-display text-s">
          <p>
            Home / Blog / {seo.category} / {post.title ?? seo.title}
          </p>
        </div>

        <div className="mt-8">
          <BlogTitle title={post.title ?? ""} />
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:gap-16 font-display font-light">
          <p className="mt-8 md:mb-16 w-full md:w-3/5 text-base md:text-lg dark:text-white whitespace-pre-line">
            {summaryText}
          </p>

          <div className="w-full md:w-2/5 md:mt-8">
            <div className="border-t border-neutral-300">
              {[
                ["CATEGORY", post.category],
                ["READ TIME", formatReadTime(post.read_time)],
                ["PUBLISHED", formatPublishDate(post.publish_date)],
                ["AUTHOR", post.author],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[220px_1fr] items-center gap-6 border-b border-neutral-300 py-3"
                >
                  <div className="text-xs font-medium tracking-wider dark:text-white">
                    {label}
                  </div>
                  <div className="text-sm dark:text-white text-left">
                    {value || "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {post.tags?.length ? (
          <div className="flex flex-wrap items-center gap-2 pb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] bg-black text-white dark:bg-white dark:text-black"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {heroImageUrl ? (
        <div className="relative h-[480px] md:h-[640px] overflow-hidden md:my-16">
          <Image
            src={heroImageUrl}
            alt={seo.seoImageAlt || post.title || "Blog image"}
            fill
            sizes="100vw"
            priority
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="width-max md:my-16">
        <div
          className="font-display text-base md:text-lg font-light leading-relaxed text-[#1E1E1E] dark:text-white space-y-6 [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-light [&_h2]:tracking-wide [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:text-base [&_p]:md:text-lg [&_p]:leading-relaxed [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-3 [&_li]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.body ?? "" }}
        />
      </div>

      {faqItems.length ? (
        <section className="width-max md:my-16">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide">
            Frequently Asked Questions
          </h2>
          <ol className="mt-6 space-y-6 list-decimal pl-6">
            {faqItems.map((item, index) => (
              <li
                key={`${item.question}-${index}`}
                className="text-lg md:text-xl font-medium"
              >
                <h3 className="text-lg md:text-xl font-medium">
                  {item.question}
                </h3>
                <p className="mt-2 text-base md:text-lg leading-relaxed">
                  {item.answer}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <Conversations />
    </div>
  );
}
