"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";

// Animation components
import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";

import Conversations from "@/components/sections/conversations-section";

const normalizeStringArray = (value?: string[] | string | null): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const resolveProjectImageUrl = (
  baseUrl: string,
  project: { collectionId: string; id: string },
  filename?: string
): string | null => {
  if (!filename) return null;
  return `${baseUrl}/api/files/${project.collectionId}/${project.id}/${filename}`;
};

/**
 * This describes ONE PocketBase "project" record (one item inside items[])
 * These names match exactly what your PocketBase returns: Name, Intro, slug, etc.
 */
type ProjectRecord = {
  collectionId: string;
  collectionName: string;
  id: string;
  slug: string;
  Name: string;
  Intro: string;
  seo_title?: string;
  seo_description?: string;
  // you said seo_image is a single filename string in your JSON
  seo_image?: string;
  featured?: boolean;
  arc_window?: boolean;
  Location?: string;
  Sector?: string;
  Year?: string;
  Scope?: string;
  // arrays of filenames
  Image_1?: string[] | string;
  Image_2?: string[];
  Title_1?: string;
  field_1?: string;
  created?: string;
  updated?: string;
};

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

export default function Page() {
  /**
   * Reads the dynamic route param from /projects/[slug]
   * Example URL: /projects/gaudi-bunglow
   * slug becomes: "gaudi-bunglow"
   */
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  /**
   * Local component state:
   * - project: the fetched project record (or null if not found)
   * - loading: whether we are currently fetching
   * - err: error message if something fails
   */
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  // Carousel index for Image_1 slides.
  const [imageOneIndex, setImageOneIndex] = useState(0);

  /**
   * PocketBase base URL
   */
  const baseUrl = "https://staging.angle.services";

  // Resolve Image_1 filenames into full PocketBase URLs.
  const imageGroupOne = useMemo(() => {
    if (!project) {
      return [];
    }
    return normalizeStringArray(project.Image_1)
      .map((filename) => resolveProjectImageUrl(baseUrl, project, filename))
      .filter((value): value is string => Boolean(value));
  }, [project, baseUrl]);

  const imageGroupTwo = useMemo(() => {
    if (!project) {
      return [];
    }
    return normalizeStringArray(project.Image_2)
      .map((filename) => resolveProjectImageUrl(baseUrl, project, filename))
      .filter((value): value is string => Boolean(value));
  }, [project, baseUrl]);

  // Reset + auto-advance Image_1 carousel when its image set changes.
  useEffect(() => {
    setImageOneIndex(0);
    if (imageGroupOne.length <= 1) {
      return;
    }
    const intervalId = window.setInterval(() => {
      setImageOneIndex((prev) => (prev + 1) % imageGroupOne.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [imageGroupOne]);

  /**
   * Build the API endpoint ONLY when slug changes.
   * useMemo prevents re-creating the URL on every re-render.
   */
  const endpoint = useMemo(() => {
    // If slug isn't ready yet, don't build an endpoint
    if (!slug) return null;

    // Escape single quotes in slug to avoid breaking PocketBase filter string
    const safeSlug = String(slug).replace(/'/g, "\\'");

    // PocketBase filter format
    const filter = `(slug='${safeSlug}')`;

    // Encode filter so special characters don't break the URL
    // perPage=1 because we only want one matching record
    return `${baseUrl}/api/collections/project/records?filter=${encodeURIComponent(
      filter
    )}&perPage=1`;
  }, [slug]);

  /**
   * Fetch data whenever endpoint changes.
   * This runs when you open the page and when you navigate to a different slug.
   */
  useEffect(() => {
    // If endpoint is null (slug missing), don't fetch
    if (!endpoint) return;

    // Lets us cancel the request if the component unmounts (navigation)
    const controller = new AbortController();

    (async () => {
      try {
        // Start loading UI and clear old error
        setLoading(true);
        setErr(null);

        // Fetch project record from PocketBase
        const res = await fetch(endpoint, {
          signal: controller.signal, // allows abort
          cache: "no-store", // don't cache while developing
        });

        // If response is 404/500/etc, throw so catch handles it
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        // Convert response JSON into typed PocketBase list response
        const data: PBListResponse<ProjectRecord> = await res.json();

        // PocketBase returns array "items" even if only one matches
        const first = data.items?.[0] ?? null;

        // Save into state (triggers re-render)
        setProject(first);
      } catch (e: unknown) {
        /**
         * If we aborted the request (navigation/unmount),
         * the browser throws an error with name "AbortError".
         * We ignore it.
         */
        if (
          typeof e === "object" &&
          e !== null &&
          "name" in e &&
          (e as { name?: unknown }).name === "AbortError"
        ) {
          return;
        }

        // Normal errors: show message if it's a real Error object
        if (e instanceof Error) {
          setErr(e.message);
        } else {
          setErr("Something went wrong");
        }

        // Reset project in case previous slug had data
        setProject(null);
      } finally {
        if (!controller.signal.aborted) {
          // Stop loading UI no matter what (success or error)
          setLoading(false);
          setHasFetched(true);
        }
      }
    })();

    // Cleanup: abort fetch if user navigates away before it finishes
    return () => controller.abort();
  }, [endpoint]);

  /**
   * If we're done loading, and we have no project and no error,
   * it means the slug didn't match anything => show 404 page.
   */
  if (hasFetched && !loading && !project && !err) {
    notFound();
  }

  // Loading skeleton UI
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 mt-16">
        <div className="h-8 w-64 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="mt-4 h-24 w-full rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    );
  }

  // Error UI
  if (err) {
    return (
      <div className="max-w-5xl mx-auto p-6 mt-16">
        <p className="text-red-600 dark:text-red-400">Error: {err}</p>
      </div>
    );
  }

  // Should rarely happen, but keeps TS happy
  if (!project) return null;

  // Main UI
  return (
    <div className=" mt-32">
      <div className="width-max">
        <div className="font-display">
          <p>
            {/* TODO: make breakcrumb links Clickabele */}
            Home / Design / {project.Scope} / {project.Name}
          </p>
        </div>

        <div className="mt-8">
          <SplitText
            html={project.Name}
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
          {/* Intro */}
          <p className=" mt-8 md:mb-16 w-full md:w-3/5 text-base md:text-lg dark:text-white">
            {project.Intro}
          </p>

          {/* Meta table */}
          <div className="w-full md:w-2/5 md:mt-8">
            <div className="border-t border-neutral-300">
              {[
                ["LOCATION", project.Location],
                ["SECTOR", project.Sector],
                ["YEAR", project.Year],
                ["SCOPE", project.Scope],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[220px_1fr] items-center gap-6 border-b border-neutral-300 py-3"
                >
                  <div className="text-xs font-medium tracking-wider dark:text-white">
                    {label}
                  </div>
                  <div className="text-sm dark:text-white text-left">
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image 1 */}
      <div className="relative h-[480px] md:h-[640px] overflow-hidden  md:my-16">
        {/* Image_1 carousel; only the active slide fades in. */}
        {imageGroupOne.map((src, index) => (
          <Image
            key={`${src}-${index}`}
            src={src}
            alt={`${project.Name} image ${index + 1}`}
            fill
            sizes="100vw"
            priority={index === 0}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === imageOneIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Title 1 */}
      <div className="width-max md:my-16">
        <p className="common-heading mb-10 md:my-16 text-center md:text-left">
          {project.Title_1}
        </p>
        <p className="font-display text-xl font-light">{project.field_1}</p>
      </div>

      {/* Image 2 */}
      <div className="relative h-[480px] md:h-[640px] overflow-hidden md:my-16">
        {/* Image_2 carousel; only the active slide fades in. */}
        {imageGroupTwo.map((src, index) => (
          <Image
            key={`${src}-${index}`}
            src={src}
            alt={`${project.Name} image ${index + 1}`}
            fill
            sizes="100vw"
            priority={index === 0}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === imageOneIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <Conversations />
    </div>
  );
}
