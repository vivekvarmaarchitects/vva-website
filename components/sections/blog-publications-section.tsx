"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import SplitText from "@/components/animations/TextReveal";

type BlogRecord = {
  collectionId?: string;
  collectionName?: string;
  id?: string;
  slug?: string;
  title?: string;
  category?: string;
  read_time?: string;
  hero_image?: string | string[];
  image_alt?: string;
  summary?: string;
  published?: boolean;
  featured?: boolean;
  publish_date?: string;
  created?: string;
  updated?: string;
};

type PBListResponse<T> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

const ALL_FILTER = "All";
const CATEGORY_ORDER = [
  "Interior Design",
  "Architecture",
  "Details",
  "Furniture",
];

const PAGE_SIZE_OPTIONS = [
  { label: "1-10", value: 10 },
  { label: "11-20", value: 20 },
  { label: "21-30", value: 30 },
];

const BLOGS_PER_PAGE_FETCH = 200;

const POCKETBASE_BASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? process.env.POCKETBASE_URL ?? "";
const normalizedBaseUrl = POCKETBASE_BASE_URL.replace(/\/$/, "");

const getFileName = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
};

const resolveBlogImageUrl = (record: BlogRecord) => {
  const filename = getFileName(record.hero_image);
  if (!filename) {
    return null;
  }
  if (
    filename.startsWith("http://") ||
    filename.startsWith("https://") ||
    filename.startsWith("/")
  ) {
    return filename;
  }
  if (!record.collectionId || !record.id) {
    return null;
  }
  const encodedName = encodeURIComponent(filename);
  return `${normalizedBaseUrl}/api/files/${record.collectionId}/${record.id}/${encodedName}`;
};

const formatReadTime = (value?: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/minute/i.test(trimmed)) return trimmed;
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric)) {
    const padded = numeric < 10 ? `0${numeric}` : `${numeric}`;
    return `${padded} minute read`;
  }
  return trimmed;
};

export default function BlogPublicationsSection() {
  const [posts, setPosts] = useState<BlogRecord[]>([]);
  const [active, setActive] = useState<string>(ALL_FILTER);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0].value);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const blogListUrl = `${normalizedBaseUrl}/api/collections/blog/records?${new URLSearchParams(
    {
      filter: "published=true && featured=true",
      perPage: String(BLOGS_PER_PAGE_FETCH),
    },
  ).toString()}`;

  useEffect(() => {
    let activeFetch = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(blogListUrl, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const data = (await response.json()) as PBListResponse<BlogRecord>;
        const filteredPosts =
          data.items?.filter((item) => item.published && item.featured) ?? [];
        if (activeFetch) {
          setPosts(filteredPosts);
        }
      } catch (err) {
        if (
          typeof err === "object" &&
          err !== null &&
          "name" in err &&
          (err as { name?: string }).name === "AbortError"
        ) {
          return;
        }
        if (activeFetch) {
          setError("Unable to load publications.");
        }
      } finally {
        if (activeFetch) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      activeFetch = false;
      controller.abort();
    };
  }, [blogListUrl]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    posts.forEach((post) => {
      const value = post.category?.trim();
      if (value) {
        seen.add(value);
      }
    });
    const ordered = CATEGORY_ORDER.slice();
    const extras = Array.from(seen).filter(
      (category) =>
        !CATEGORY_ORDER.includes(category) && category !== ALL_FILTER,
    );
    return [ALL_FILTER, ...ordered, ...extras];
  }, [posts]);

  useEffect(() => {
    if (!categories.includes(active)) {
      setActive(ALL_FILTER);
    }
  }, [active, categories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [active, pageSize]);

  const filteredPosts = useMemo(() => {
    if (active === ALL_FILTER) {
      return posts;
    }
    return posts.filter((post) => post.category?.trim() === active);
  }, [active, posts]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }, [safePage, currentPage]);

  const startIndex = (safePage - 1) * pageSize;
  const pagePosts = filteredPosts.slice(startIndex, startIndex + pageSize);
  const featuredPost = pagePosts[0];
  const gridPosts = pagePosts.slice(1);
  const featuredImageUrl = featuredPost
    ? resolveBlogImageUrl(featuredPost)
    : null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <section className="width-max py-16">
      <p className="font-display text-s">Home / Blogs</p>
      <div className="mt-8">
        <SplitText
          html={"Our Publications"}
          className="flex font-sans text-5xl font-regular"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0.2, y: 0 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="left"
          enableScrollTrigger={true}
          tag="h1"
          scrollTriggerConfig={{
            start: "top",
            end: "bottom 10%",
            scrub: true,
            once: true,
            markers: false,
          }}
        />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[160px_1fr] lg:grid-cols-[200px_1fr]">
        <aside className="space-y-5 md:block md:z-0 sticky top-16 backdrop-blur-xs bg-white/75 dark:bg-black/75 z-50 py-3">
          <p className="text-xs uppercase tracking-[0.25em] text-[#666766] dark:text-[#B3B4B4]">
            Filters
          </p>
          <div className="flex flex-col items-start gap-2">
            {categories.map((label) => {
              const isActive = label === active;
              return (
                <button
                  key={label}
                  type="button"
                  className={`w-full px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "border border-black bg-transparent text-black hover:text-black dark:border-white dark:text-white dark:hover:text-white"
                  }`}
                  onClick={() => setActive(label)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#666766] dark:text-[#B3B4B4]">
              <button
                type="button"
                className="hover:text-black dark:hover:text-white"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage <= 1}
              >
                Previous
              </button>
              {pages.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 py-1 border text-[11px] ${
                    page === safePage
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "border-transparent"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="hover:text-black dark:hover:text-white"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={safePage >= totalPages}
              >
                Next
              </button>
            </div>

            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="border border-[#C9C9C9] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#666766] dark:text-[#B3B4B4] dark:border-[#4B4C4C] dark:bg-black"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="space-y-10">
              <div className="aspect-[16/9] w-full rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={`loading-${index}`}
                    className="space-y-4 animate-pulse"
                  >
                    <div className="aspect-[4/3] w-full rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-6 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center text-sm text-black/70 dark:text-white/70">
              No publications found.
            </p>
          ) : (
            <>
              {featuredPost ? (
                <article className="space-y-4">
                  <Link
                    href={`/blog/${encodeURIComponent(
                      featuredPost.slug ?? featuredPost.id ?? "",
                    )}`}
                    className="group block space-y-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
                  >
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-neutral-200">
                      {featuredImageUrl ? (
                        <Image
                          src={featuredImageUrl}
                          alt={
                            featuredPost.image_alt ?? featuredPost.title ?? ""
                          }
                          fill
                          sizes="(min-width: 1024px) 900px, 100vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2 py-1 bg-black text-white text-[10px] uppercase tracking-[0.2em]">
                        {featuredPost.category ?? "Blog"}
                      </span>
                      <span className="text-[#666766] dark:text-[#B3B4B4]">
                        {formatReadTime(featuredPost.read_time)}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light leading-snug">
                      {featuredPost.title ?? "Untitled blog"}
                    </h2>
                  </Link>
                </article>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {gridPosts.map((post, index) => {
                  const imageUrl = resolveBlogImageUrl(post);
                  return (
                    <article
                      key={post.id ?? post.slug ?? `post-${index}`}
                      className="space-y-4"
                    >
                      <Link
                        href={`/blog/${encodeURIComponent(
                          post.slug ?? post.id ?? "",
                        )}`}
                        className="group block space-y-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
                      >
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-200">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={post.image_alt ?? post.title ?? ""}
                              fill
                              sizes="(min-width: 768px) 420px, 100vw"
                              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="px-2 py-1 bg-black text-white text-[10px] uppercase tracking-[0.2em]">
                            {post.category ?? "Blog"}
                          </span>
                          <span className="text-[#666766] dark:text-[#B3B4B4]">
                            {formatReadTime(post.read_time)}
                          </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-light leading-snug">
                          {post.title ?? "Untitled blog"}
                        </h3>
                      </Link>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
