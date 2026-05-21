"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  Date?: string;
  ProjectType?: string;
  Sector?: string;
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

const POCKETBASE_BASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "";
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

const buildTabs = (projectTypes: string[]): Tab[] => {
  const values = [ALL_TAB, ...projectTypes];
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

const PROJECT_TYPE_DESCRIPTIONS: Record<string, string> = {
  Interior:
    "Our interior design work spans private residences, commercial environments, hospitality spaces, and large-scale developer-led projects, shaped through material exploration and experiential clarity.",
  Architecture:
    "Architectural projects that respond to context, scale, and program, developed in close dialogue with interior spatial intent.",
  Details:
    "A focused study of materials, joinery, light, and crafted elements drawn from selected projects across the studio’s body of work.",
  Furniture:
    "Bespoke furniture and object-led design developed as an extension of our interior and architectural projects.",
};

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
    "relative aspect-[3/4] w-full overflow-hidden",
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
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
  const [activeSector, setActiveSector] = useState<string>(ALL_TAB);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const searchParams = useSearchParams();
  const projectTypeParam = (
    searchParams.get("projectType") ??
    searchParams.get("scope") ??
    ""
  ).trim();
  const sectorParam = searchParams.get("sector")?.trim() ?? "";

  const projectListUrl = `${normalizedBaseUrl}/api/collections/${POCKETBASE_COLLECTION}/records?${new URLSearchParams(
    {
      filter: "featured=true",
      perPage: String(PROJECTS_PER_PAGE),
      sort: "-created",
    },
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

  const projectTypes = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    projects.forEach((project) => {
      const projectType = project.ProjectType?.trim();
      if (projectType && !seen.has(projectType)) {
        seen.add(projectType);
        ordered.push(projectType);
      }
    });
    return ordered;
  }, [projects]);

  const tabs = useMemo(() => buildTabs(projectTypes), [projectTypes]);

  const sectorsForType = useMemo(() => {
    if (active === ALL_TAB) {
      return [];
    }
    const seen = new Set<string>();
    const ordered: string[] = [];
    projects.forEach((project) => {
      if (project.ProjectType?.trim() !== active) {
        return;
      }
      const sector = project.Sector?.trim();
      if (sector && !seen.has(sector)) {
        seen.add(sector);
        ordered.push(sector);
      }
    });
    return ordered;
  }, [active, projects]);

  const sectorTabs = useMemo(() => buildTabs(sectorsForType), [sectorsForType]);

  useEffect(() => {
    if (!projectTypeParam) {
      return;
    }
    const match =
      projectTypes.find(
        (projectType) =>
          toTabSlug(projectType) === toTabSlug(projectTypeParam) ||
          projectType.toLowerCase() === projectTypeParam.toLowerCase(),
      ) ?? null;
    if (match) {
      setActive((prev) => (prev === match ? prev : match));
    } else {
      setActive((prev) => (prev === ALL_TAB ? prev : ALL_TAB));
    }
  }, [projectTypeParam, projectTypes]);

  useEffect(() => {
    if (active !== ALL_TAB && !projectTypes.includes(active)) {
      setActive(ALL_TAB);
    }
  }, [active, projectTypes]);

  useEffect(() => {
    setActiveSector(ALL_TAB);
  }, [active]);

  useEffect(() => {
    if (!sectorParam) {
      return;
    }
    const match =
      sectorsForType.find(
        (sector) =>
          toTabSlug(sector) === toTabSlug(sectorParam) ||
          sector.toLowerCase() === sectorParam.toLowerCase(),
      ) ?? null;
    if (match) {
      setActiveSector((prev) => (prev === match ? prev : match));
    } else {
      setActiveSector((prev) => (prev === ALL_TAB ? prev : ALL_TAB));
    }
  }, [sectorParam, sectorsForType]);

  useEffect(() => {
    if (activeSector !== ALL_TAB && !sectorsForType.includes(activeSector)) {
      setActiveSector(ALL_TAB);
    }
  }, [activeSector, sectorsForType]);

  const activeTab = tabs.find((tab) => tab.key === active) ?? tabs[0];
  const activeSectorTab =
    sectorTabs.find((tab) => tab.key === activeSector) ?? sectorTabs[0];

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (active !== ALL_TAB) {
      result = result.filter(
        (project) => project.ProjectType?.trim() === active,
      );
    }
    if (activeSector !== ALL_TAB) {
      result = result.filter(
        (project) => project.Sector?.trim() === activeSector,
      );
    }
    result = [...result].sort((a, b) => {
      const aTime = a.Date ? new Date(a.Date).getTime() : null;
      const bTime = b.Date ? new Date(b.Date).getTime() : null;
      const aValid = typeof aTime === "number" && Number.isFinite(aTime);
      const bValid = typeof bTime === "number" && Number.isFinite(bTime);
      if (aValid && bValid) {
        return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
      }
      if (aValid && !bValid) return sortOrder === "desc" ? -1 : 1;
      if (!aValid && bValid) return sortOrder === "desc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [active, activeSector, projects, sortOrder]);

  const activeDescription = PROJECT_TYPE_DESCRIPTIONS[active] ?? "";

  return (
    <section className="width-max">
      <div className="mx-auto">
        <div
          role="tablist"
          aria-label="Project types"
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
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium uppercase text-black/60 transition duration-300 hover:text-black dark:text-white/60 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
            aria-label={`Sort by year ${sortOrder === "desc" ? "descending" : "ascending"}`}
          >
            <span>Sort by Year</span>
            <span aria-hidden="true">{sortOrder === "desc" ? "↓" : "↑"}</span>
          </button>
        </div>

        {active !== ALL_TAB && sectorTabs.length > 1 && (
          <div
            role="tablist"
            aria-label="Sectors"
            className="mt-3 inline-flex w-full flex-wrap items-center justify-center gap-2"
          >
            {sectorTabs.map((tab) => {
              const isActive = tab.key === activeSector;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={activeSectorTab.panelId}
                  id={tab.tabId}
                  onClick={() => setActiveSector(tab.key)}
                  className={[
                    "min-w-28 px-3 py-0.5 text-xs font-medium uppercase transition duration-300",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white",
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "border border-black/40 bg-transparent text-black/70 hover:text-black dark:border-white/40 dark:text-white/70 dark:hover:text-white",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <div className="min-h-24 max-w-3xl text-center text-base leading-relaxed text-black dark:text-white">
            {activeDescription ? <p>{activeDescription}</p> : null}
          </div>
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
                      "relative aspect-3/4 w-full overflow-hidden",
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
                const imageUrl = resolveProjectImageUrl(project) ?? "/1.webp";
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
