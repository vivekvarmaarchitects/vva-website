"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import FadeIn from "@/components/animations/FadeIn";

type ProjectRecord = {
  collectionId?: string;
  collectionName?: string;
  id?: string;
  slug?: string;
  Name?: string;
  seo_image?: string | string[];
  featured?: boolean;
  arc_window?: boolean;
  Location?: string;
  Year?: string;
  Scope?: string;
};

type PBListResponse<T> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

type Tab = {
  key: string;
  label: string;
  tabId: string;
  panelId: string;
};

const ALL_TAB = "All";
const PROJECTS_PER_PAGE = 200;

const POCKETBASE_BASE_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "";
const POCKETBASE_COLLECTION = "project";

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
  if (!record.collectionId || !record.id) {
    return null;
  }
  const encodedName = encodeURIComponent(filename);
  return `${normalizedBaseUrl}/api/files/${record.collectionId}/${record.id}/${encodedName}`;
};

const toTabSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const buildTabs = (scopes: string[]): Tab[] => {
  const values = [ALL_TAB, ...scopes];
  return values.map((value) => {
    const slug = toTabSlug(value);
    return {
      key: value,
      label: value,
      tabId: `tab-${slug || "all"}`,
      panelId: `panel-${slug || "all"}`,
    };
  });
};

const LOADING_CARDS = Array.from({ length: 6 }, (_, index) => ({
  id: `loading-${index}`,
  arcWindow: index % 2 === 0,
}));

const ProjectCard = ({
  project,
  imageUrl,
  priority,
}: {
  project: ProjectRecord;
  imageUrl: string;
  priority: boolean;
}) => {
  const slug = project.slug ?? project.id ?? "";
  const href = `/design/${encodeURIComponent(slug)}`;
  const imageWrapperClasses = [
    "relative h-[460px] w-full overflow-hidden sm:h-[420px] lg:h-[475px]",
    project.arc_window ? "rounded-t-[1000px]" : "rounded-0",
  ].join(" ");

  return (
    <article className="h-full">
      <Link
        href={href}
        className="group flex h-full flex-col gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
        aria-label={project.Name ? `${project.Name} project` : "Project"}
      >
        <div className={imageWrapperClasses}>
          <Image
            src={imageUrl}
            alt={project.Name ?? "Project image"}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            priority={priority}
          />
        </div>
        <div className="space-y-1 text-left">
          <h3 className="text-lg font-medium md:text-xl">
            {project.Name ?? "Untitled project"}
          </h3>
          {project.Location ? (
            <p className="text-sm text-black/70 dark:text-white/70">
              {project.Location}
            </p>
          ) : null}
          {project.Year ? (
            <p className="text-sm text-black/70 dark:text-white/70">
              <time>{project.Year}</time>
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
};

export default function OurWorksSection() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [active, setActive] = useState<string>(ALL_TAB);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectListUrl = `${normalizedBaseUrl}/api/collections/${POCKETBASE_COLLECTION}/records?${new URLSearchParams(
    {
      filter: "featured=true",
      perPage: String(PROJECTS_PER_PAGE),
    }
  ).toString()}`;

  useEffect(() => {
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

  const scopes = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    projects.forEach((project) => {
      const scope = project.Scope?.trim();
      if (scope && !seen.has(scope)) {
        seen.add(scope);
        ordered.push(scope);
      }
    });
    return ordered;
  }, [projects]);

  const tabs = useMemo(() => buildTabs(scopes), [scopes]);

  useEffect(() => {
    if (active !== ALL_TAB && !scopes.includes(active)) {
      setActive(ALL_TAB);
    }
  }, [active, scopes]);

  const activeTab = tabs.find((tab) => tab.key === active) ?? tabs[0];

  const filteredProjects = useMemo(() => {
    if (active === ALL_TAB) {
      return projects;
    }
    return projects.filter((project) => project.Scope?.trim() === active);
  }, [active, projects]);

  return (
    <section className="width-max">
      <div className="mx-auto">
        <div
          role="tablist"
          aria-label="Project scopes"
          className="inline-flex w-full flex-wrap items-center justify-center gap-2"
        >
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={tab.panelId}
                id={tab.tabId}
                onClick={() => setActive(tab.key)}
                className={[
                  "min-w-32 px-4 py-1 text-sm font-medium uppercase transition duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white",
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border border-black bg-transparent text-black hover:text-black dark:border-white dark:text-white dark:hover:text-white",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={activeTab.panelId}
          aria-labelledby={activeTab.tabId}
          className="mt-10"
        >
          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {LOADING_CARDS.map((card) => (
                <div key={card.id} className="animate-pulse">
                  <div
                    className={[
                      "relative h-[460px] w-full overflow-hidden sm:h-[420px] lg:h-[475px]",
                      card.arcWindow ? "rounded-t-[1000px]" : "rounded-0",
                      "bg-neutral-200 dark:bg-neutral-800",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  <div className="mt-4 space-y-2" aria-hidden="true">
                    <div className="h-5 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-4 w-1/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                  </div>
                  <span className="sr-only">Loading featured project</span>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : filteredProjects.length === 0 ? (
            <p className="text-center text-sm text-black/70 dark:text-white/70">
              No featured projects found.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {filteredProjects.map((project, index) => {
                const imageUrl = resolveProjectImageUrl(project) ?? "/1.png";
                return (
                  <FadeIn
                    key={project.id ?? project.slug ?? index}
                    className="h-full"
                    distance={0}
                    delay={index * 0.08}
                  >
                    <ProjectCard
                      project={project}
                      imageUrl={imageUrl}
                      priority={index < 3}
                    />
                  </FadeIn>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
