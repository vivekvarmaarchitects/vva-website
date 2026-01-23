"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProjectRecord = {
  collectionId?: string;
  id?: string;
  slug?: string;
  Name?: string;
  seo_image?: string | string[];
  seo_image_alt?: string;
  featured?: boolean;
};

type PBListResponse<T> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

const POCKETBASE_BASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "";
const POCKETBASE_COLLECTION = "project";
const PROJECTS_PER_PAGE = 200;
const FALLBACK_IMAGE = "/1.png";

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");
const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);

const getFileName = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
};

const resolveProjectImageUrl = (record: ProjectRecord) => {
  const filename = getFileName(record.seo_image);
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
  if (!record.collectionId || !record.id || !normalizedBaseUrl) {
    return null;
  }
  const encodedName = encodeURIComponent(filename);
  return `${normalizedBaseUrl}/api/files/${record.collectionId}/${record.id}/${encodedName}`;
};

const toKebabCase = (value?: string | null) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const buildSlug = (project: ProjectRecord) => {
  const slug = project.slug?.trim();
  if (slug) return slug;
  const fromName = toKebabCase(project.Name);
  if (fromName) return fromName;
  return project.id ?? "";
};

const formatIndex = (index: number) => String(index + 1).padStart(2, "0");

export default function ProjectDisplaySection() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectListUrl = useMemo(() => {
    if (!normalizedBaseUrl) return "";
    return `${normalizedBaseUrl}/api/collections/${POCKETBASE_COLLECTION}/records?${new URLSearchParams(
      {
        filter: "featured=true",
        perPage: String(PROJECTS_PER_PAGE),
      },
    ).toString()}`;
  }, []);

  useEffect(() => {
    if (!projectListUrl) {
      setLoading(false);
      setError("Missing PocketBase URL.");
      return;
    }

    let activeFetch = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(projectListUrl, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const data = (await response.json()) as PBListResponse<ProjectRecord>;
        const featuredProjects =
          data.items?.filter((item) => item.featured) ?? [];
        if (activeFetch) {
          setProjects(featuredProjects);
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
          setError("Unable to load featured projects.");
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
  }, [projectListUrl]);

  useEffect(() => {
    if (activeIndex >= projects.length && projects.length > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, projects.length]);

  const canNavigate = projects.length > 1;
  const activeProject = projects[activeIndex];
  const activeSlug = activeProject ? buildSlug(activeProject) : "";
  const href = activeSlug ? `/design/${encodeURIComponent(activeSlug)}` : "";
  const imageUrl =
    (activeProject ? resolveProjectImageUrl(activeProject) : null) ??
    FALLBACK_IMAGE;
  const imageAlt =
    activeProject?.seo_image_alt?.trim() ||
    activeProject?.Name?.trim() ||
    "Featured project";
  const title = activeProject?.Name?.trim() || "Featured Project";
  const displayIndex = activeProject ? formatIndex(activeIndex) : "01";

  const handlePrev = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const handleNext = () => {
    if (!canNavigate) return;
    setActiveIndex((prev) => (prev + 1) % projects.length);
  };

  useEffect(() => {
    if (!canNavigate || loading || error) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % projects.length);
    }, 4000);
    return () => window.clearInterval(intervalId);
  }, [canNavigate, error, loading, projects.length]);

  useEffect(() => {
    if (!activeProject) return;
    setIsFading(true);
    const timeoutId = window.setTimeout(() => {
      setIsFading(false);
    }, 120);
    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, activeProject?.id]);

  return (
    <section className=" py-10 width-max">
      <div className="flex items-center justify-between py-10 border-t dark:border-color-[#B3B4B4]">
        <div className="text-4xl tracking-wide text-black dark:text-white">
          {displayIndex}
        </div>

        <h2 className="text-4xl font-medium text-black dark:text-white">
          {title}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={handlePrev}
            disabled={!canNavigate}
            className="grid h-9 w-9 place-items-center rounded-full text-black dark:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Next"
            onClick={handleNext}
            disabled={!canNavigate}
            className="grid h-9 w-9 place-items-center rounded-full text-black dark:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="w-full">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>
      ) : error ? (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : activeProject ? (
        <div className="w-full">
          {href ? (
            <Link
              href={href}
              className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              aria-label={title ? `${title} project` : "Project"}
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  sizes="100vw"
                  className={`object-contain transition-opacity duration-700 ease-out ${
                    isFading ? "opacity-0" : "opacity-100"
                  }`}
                />
              </div>
            </Link>
          ) : (
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                sizes="100vw"
                className={`object-contain transition-opacity duration-700 ease-out ${
                  isFading ? "opacity-0" : "opacity-100"
                }`}
              />
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-black/70 dark:text-white/70">
          No featured projects found.
        </p>
      )}
    </section>
  );
}
