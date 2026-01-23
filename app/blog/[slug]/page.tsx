"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";

import SplitText from "@/components/animations/TextReveal";
import Conversations from "@/components/sections/conversations-section";

type BlogRecord = {
  collectionId: string;
  collectionName: string;
  id: string;
  slug: string;
  title: string;
  summary?: string;
  body?: string;
  category?: string;
  read_time?: string;
  hero_image?: string;
  image_alt?: string;
  author?: string;
  publish_date?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
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

const resolveBlogImageUrl = (
  baseUrl: string,
  post: { collectionId: string; id: string },
  filename?: string,
): string | null => {
  if (!filename) return null;
  return `${baseUrl}/api/files/${post.collectionId}/${post.id}/${filename}`;
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

export default function Page() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [post, setPost] = useState<BlogRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "";

  const heroImageUrl = useMemo(() => {
    if (!post) return null;
    return resolveBlogImageUrl(baseUrl, post, post.hero_image);
  }, [post, baseUrl]);

  const summaryText = post?.summary ?? post?.meta_description ?? "";

  const endpoint = useMemo(() => {
    if (!slug) return null;
    const safeSlug = String(slug).replace(/'/g, "\\'");
    const filter = `(slug='${safeSlug}' && published=true)`;
    return `${baseUrl}/api/collections/blog/records?filter=${encodeURIComponent(
      filter,
    )}&perPage=1`;
  }, [slug]);

  useEffect(() => {
    if (!endpoint) return;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch(endpoint, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data: PBListResponse<BlogRecord> = await res.json();
        const first = data.items?.[0] ?? null;
        setPost(first);
      } catch (e: unknown) {
        if (
          typeof e === "object" &&
          e !== null &&
          "name" in e &&
          (e as { name?: unknown }).name === "AbortError"
        ) {
          return;
        }

        if (e instanceof Error) {
          setErr(e.message);
        } else {
          setErr("Something went wrong");
        }

        setPost(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setHasFetched(true);
        }
      }
    })();

    return () => controller.abort();
  }, [endpoint]);

  if (hasFetched && !loading && !post && !err) {
    notFound();
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 mt-16">
        <div className="h-8 w-64 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="mt-4 h-24 w-full rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-5xl mx-auto p-6 mt-16">
        <p className="text-red-600 dark:text-red-400">Error: {err}</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="mt-32">
      <div className="width-max">
        <div className="font-display text-s">
          <p>
            Home / Blogs / {post.category ?? "Blog"} / {post.title}
          </p>
        </div>

        <div className="mt-8">
          <SplitText
            html={post.title}
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
            alt={post.image_alt || post.title}
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

      <Conversations />
    </div>
  );
}
