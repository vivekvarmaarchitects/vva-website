"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Animation components
import FadeIn from "@/components/animations/FadeIn";

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
  meta_description?: string;
  author?: string;
  published?: boolean;
  homepage?: boolean;
};

type PBListResponse<T> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

const BLOGS_PER_PAGE_FETCH = 30;

const POCKETBASE_BASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "https://staging.angle.services";
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

const truncateSummary = (value: string, limit = 105) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= limit) return trimmed;
  const clipped = trimmed.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(" ");
  if (lastSpace > 0) {
    return `${clipped.slice(0, lastSpace)}....`;
  }
  return `${clipped}....`;
};

export default function PublicationSection() {
  const [posts, setPosts] = useState<BlogRecord[]>([]);

  const blogListUrl = `${normalizedBaseUrl}/api/collections/blog/records?${new URLSearchParams(
    {
      filter: "published=true && homepage=true",
      perPage: String(BLOGS_PER_PAGE_FETCH),
    },
  ).toString()}`;

  useEffect(() => {
    let activeFetch = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(blogListUrl, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const data = (await response.json()) as PBListResponse<BlogRecord>;
        const filteredPosts =
          data.items?.filter((item) => item.published && item.homepage) ?? [];
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
      }
    };

    load();

    return () => {
      activeFetch = false;
      controller.abort();
    };
  }, [blogListUrl]);

  const displayPosts = useMemo(() => posts.slice(0, 3), [posts]);

  return (
    <section className="w-full width-max py-8">
      {/* Heading */}
      <h2 className="text-center text-sm tracking-[0.35em] text-[#666766] dark:text-[#B3B4B4] dark:border-color-[#B3B4B4] uppercase mb-16">
        Our <span className="italic">Publications</span>
      </h2>

      {/* Card Grid */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 ">
        {displayPosts.map((post, index) => {
          const imageUrl = resolveBlogImageUrl(post);
          const summarySource =
            post.summary?.trim() || post.meta_description?.trim() || "";
          const summary = truncateSummary(summarySource);
          const slug = post.slug ?? post.id ?? "";
          const href = slug ? `/blog/${encodeURIComponent(slug)}` : "/blog";
          return (
            <FadeIn
              key={post.id ?? post.slug ?? `post-${index}`}
              distance={0}
              direction="horizontal"
              reverse={false}
              duration={0.5}
              ease="ease.power3.out"
              initialOpacity={0.2}
              animateOpacity
              scale={0.5}
              threshold={0}
              delay={index * 0.06}
              className="h-full"
            >
              <article className="border dark:border-[#B3B4B4] overflow-hidden flex flex-col h-full">
                <Link
                  href={href}
                  className="group flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white z-20 dark:bg-black bg-white"
                  aria-label={post.title ?? "Blog post"}
                >
                  {/* Image Placeholder */}
                  <div className="w-full h-48 bg-neutral-200">
                    {imageUrl ? (
                      <div className="relative h-full w-full overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={post.image_alt ?? post.title ?? "Blog image"}
                          fill
                          sizes="(min-width: 768px) 320px, 100vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col gap-4 ">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-black dark:bg-white dark:text-black text-white text-xs uppercase tracking-wide font-bold">
                        {post.category ?? "Blog"}
                      </span>
                      <span className="text-xs dark:text-white tracking-wide">
                        {formatReadTime(post.read_time)}
                      </span>
                    </div>

                    <h3 className="text-2xl font-medium leading-snug">
                      {post.title ?? "Untitled blog"}
                    </h3>

                    <p className="dark:text-white text-sm leading-relaxed">
                      {summary}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-neutral-200 px-6 py-4 flex justify-between text-sm dark:text-[#B3B4B4]">
                    <span>Written by</span>
                    <span>{post.author ?? "-"}</span>
                  </div>
                </Link>
              </article>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
