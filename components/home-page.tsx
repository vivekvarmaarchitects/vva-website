"use client";
import Image from "next/image";
import React from "react";

// Animation components
import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";
import ResultsVisionSection from "@/components/sections/results-vision-section";
import PublicationSection from "@/components/sections/publication-section";
import { ProjectBlock } from "@/components/sections/project-block";

type FaqItem = {
  question: string;
  answer: string;
};

type HomepageRecord = {
  id?: string;
  collectionId?: string;
  heading_1?: string;
  heading_3?: string;
  heading_4?: string;
  hero_carausel?: string[] | string;
  hero_carausel_alt?: string[] | string | null;
  hero_text?: string;
  sub_hero_text?: string;
  intro?: string;
  faq?: FaqItem[] | string | null;
  seo_title?: string;
  seo_description?: string;
  seo_image?: string;
  logo_image?: string;
  logo_alt?: string;
  specialization_1_title?: string;
  specialization_1_description?: string;
  specialization_1_image?: string;
  specialization_1_image_alt?: string;
  specialization_2_title?: string;
  specialization_2_description?: string;
  specialization_2_image?: string;
  specialization_2_image_alt?: string;
  specialization_3_title?: string;
  specialization_3_description?: string;
  specialization_3_image?: string;
  specialization_3_image_alt?: string;
  specialization_4_title?: string;
  specialization_4_description?: string;
  specialization_4_image?: string;
  specialization_4_image_alt?: string;
  specialization_5_title?: string;
  specialization_5_description?: string;
  specialization_5_image?: string;
  specialization_5_image_alt?: string;
};

type PBListResponse<T> = {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: T[];
};

type HomepageProjectRecord = {
  collectionId?: string;
  collectionName?: string;
  id?: string;
  index?: number | string;
  Project_Name?: string;
  Client_name?: string;
  Year?: string | number;
  Image?: string;
  Image_alt?: string;
  Slug?: string | string[] | null;
};

type ProjectSlugRecord = {
  id?: string;
  slug?: string;
};

type ProjectBlockDisplay = {
  title: string;
  client: string;
  year: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
};

const DEFAULT_HOMEPAGE_RECORD: HomepageRecord = {
  heading_1: "Our <em>Raison d'etre</em>",
  heading_3: "FEATURED <em>PROJECTS</em>",
  heading_4: "RESULTS THAT <em>MATCH YOUR VISION</em>",
  hero_carausel: ["/hero_vva.png"],
  hero_carausel_alt: ["Vivek Varma Architects hero image"],
  hero_text: "Crafting spatial narratives grounded in human experience",
  sub_hero_text:
    "We, <u>Vivek Varma Architects</u>, are a practice rooted in interior architecture, shaping environments for those who value design, craft, and context.",
  intro:
    "Our work explores the relationship between light, material, proportion, and movement. We approach every interior as a dialogue between architecture and the people who inhabit it, crafting spaces that feel intentional, quiet, and deeply lived in. With decades of practice across residential, commercial, and developer-led environments, we bring a refined sensibility to every project.",
  specialization_1_title: "Interior Design",
  specialization_1_description:
    "Interior architecture for residential, commercial, and hospitality environments with a focus on material honesty, proportion, and experiential flow.",
  specialization_1_image: "/interior.png",
  specialization_2_title: "Architecture",
  specialization_2_description:
    "Complementary architectural design grounded in contextual clarity.",
  specialization_2_image: "/Architecture.png",
  specialization_3_title: "Space Design",
  specialization_3_description:
    "Spatial compositions that shape circulation, mood, and user experience.",
  specialization_3_image: "/Space.png",
};

const POCKETBASE_BASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "";
const POCKETBASE_COLLECTION = "homepage";
const HOMEPAGE_PROJECTS_COLLECTION = "homepage_projects";
const PROJECT_COLLECTION = "project";
const HOMEPAGE_PROJECTS_PER_PAGE = 200;
const POCKETBASE_RECORD_ID =
  process.env.NEXT_PUBLIC_PB_HOMEPAGE_ID ?? "zreceve3mfdgrh3";
const POCKETBASE_REFRESH_MS = (() => {
  const raw = process.env.NEXT_PUBLIC_PB_REFRESH_MS;
  if (raw === undefined) {
    return 300000;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
})();
const POCKETBASE_CACHE_KEY = `pb:${POCKETBASE_COLLECTION}:${POCKETBASE_RECORD_ID}`;
const POCKETBASE_CACHE_TS_KEY = `${POCKETBASE_CACHE_KEY}:ts`;

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");
const normalizedBaseUrl = normalizeBaseUrl(POCKETBASE_BASE_URL);

const stripOuterTags = (value: string | undefined, tags: string[]) => {
  if (!value) {
    return "";
  }
  let result = value.trim();
  tags.forEach((tag) => {
    const openTag = new RegExp(`^<${tag}\\b[^>]*>`, "i");
    const closeTag = new RegExp(`</${tag}>$`, "i");
    if (openTag.test(result) && closeTag.test(result)) {
      result = result.replace(openTag, "").replace(closeTag, "");
    }
  });
  return result.trim();
};

const stripHtmlTags = (value: string | undefined) => {
  if (!value) {
    return "";
  }
  return value
    .replace(/<br\s*\/?>(?=\s*\n)?/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .trim();
};

const normalizeStringArray = (value?: string | string[] | null) => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

const normalizeTextArray = (value?: string | string[] | null) =>
  normalizeStringArray(value)
    .map((item) => (typeof item === "string" ? item : String(item)))
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeRelationId = (value?: string | string[] | null) => {
  if (!value) {
    return "";
  }
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value;
};

const normalizeIndexValue = (value?: number | string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const resolveImageUrl = (record: HomepageRecord, value?: string) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  if (!record.collectionId || !record.id) {
    return null;
  }
  const encodedName = encodeURIComponent(trimmed);
  return `${normalizedBaseUrl}/api/files/${record.collectionId}/${record.id}/${encodedName}`;
};

const resolveProjectBlockImageUrl = (
  record: HomepageProjectRecord,
  value?: string,
) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  if (!record.collectionId || !record.id) {
    return null;
  }
  const encodedName = encodeURIComponent(trimmed);
  return `${normalizedBaseUrl}/api/files/${record.collectionId}/${record.id}/${encodedName}`;
};

const parseJson = <T,>(value: unknown) => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
};

const normalizeFaqItems = (value?: HomepageRecord["faq"]) => {
  const parsed = parseJson<unknown>(value ?? null);
  if (!parsed) {
    return [] as FaqItem[];
  }
  if (!Array.isArray(parsed)) {
    return [] as FaqItem[];
  }
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const question =
        "question" in item ? String(item.question ?? "").trim() : "";
      const answer = "answer" in item ? String(item.answer ?? "").trim() : "";
      if (!question || !answer) {
        return null;
      }
      return { question, answer };
    })
    .filter((item): item is FaqItem => Boolean(item));
};

export default function HomePage() {
  const [record, setRecord] = React.useState<HomepageRecord>(
    DEFAULT_HOMEPAGE_RECORD,
  );
  const [heroIndex, setHeroIndex] = React.useState(0);
  const [projectBlocks, setProjectBlocks] = React.useState<
    HomepageProjectRecord[]
  >([]);
  const [projectSlugMap, setProjectSlugMap] = React.useState<
    Record<string, string>
  >({});

  const recordUrl = `${normalizedBaseUrl}/api/collections/${POCKETBASE_COLLECTION}/records/${POCKETBASE_RECORD_ID}`;
  const homepageProjectsUrl = `${normalizedBaseUrl}/api/collections/${HOMEPAGE_PROJECTS_COLLECTION}/records?${new URLSearchParams(
    {
      perPage: String(HOMEPAGE_PROJECTS_PER_PAGE),
      sort: "index",
    },
  ).toString()}`;

  const fetchRecord = React.useCallback(async () => {
    const response = await fetch(recordUrl, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as HomepageRecord;
  }, [recordUrl]);

  React.useEffect(() => {
    let active = true;
    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    const readCache = () => {
      try {
        const raw = localStorage.getItem(POCKETBASE_CACHE_KEY);
        if (!raw) {
          return null;
        }
        const parsed = JSON.parse(raw) as HomepageRecord;
        const tsRaw = localStorage.getItem(POCKETBASE_CACHE_TS_KEY);
        const ts = tsRaw ? Number(tsRaw) : 0;
        return { data: parsed, ts };
      } catch {
        return null;
      }
    };

    const writeCache = (data: HomepageRecord) => {
      try {
        localStorage.setItem(POCKETBASE_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(POCKETBASE_CACHE_TS_KEY, String(Date.now()));
      } catch {
        // Ignore storage errors (private mode, quota, etc).
      }
    };

    const load = async () => {
      try {
        const data = await fetchRecord();
        if (active && data) {
          const merged = { ...DEFAULT_HOMEPAGE_RECORD, ...data };
          setRecord(merged);
          writeCache(merged);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Failed to load PocketBase homepage data", error);
        }
      }
    };

    const cached = readCache();
    if (cached?.data) {
      setRecord({ ...DEFAULT_HOMEPAGE_RECORD, ...cached.data });
    }

    if (POCKETBASE_REFRESH_MS > 0) {
      const lastTs = cached?.ts ?? 0;
      const age = lastTs ? Date.now() - lastTs : Number.POSITIVE_INFINITY;
      const shouldFetchNow = !cached?.data || age >= POCKETBASE_REFRESH_MS;
      const remaining = Math.max(POCKETBASE_REFRESH_MS - age, 0);

      if (shouldFetchNow) {
        load();
      }

      timeoutId = window.setTimeout(
        () => {
          load();
          intervalId = window.setInterval(load, POCKETBASE_REFRESH_MS);
        },
        shouldFetchNow ? POCKETBASE_REFRESH_MS : remaining,
      );
    } else {
      load();
    }

    return () => {
      active = false;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [fetchRecord]);

  React.useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadProjectSlugs = async (slugIds: string[]) => {
      if (!slugIds.length) {
        if (active) {
          setProjectSlugMap({});
        }
        return;
      }

      try {
        const results = await Promise.all(
          slugIds.map(async (slugId) => {
            try {
              const response = await fetch(
                `${normalizedBaseUrl}/api/collections/${PROJECT_COLLECTION}/records/${slugId}`,
                { signal: controller.signal, cache: "no-store" },
              );
              if (!response.ok) {
                return null;
              }
              const data = (await response.json()) as ProjectSlugRecord;
              const slug = data.slug?.trim();
              if (!slug) {
                return null;
              }
              return { slugId, slug };
            } catch (error) {
              if (
                typeof error === "object" &&
                error !== null &&
                "name" in error &&
                (error as { name?: string }).name === "AbortError"
              ) {
                return null;
              }
              return null;
            }
          }),
        );

        if (!active) {
          return;
        }
        const nextMap: Record<string, string> = {};
        results.forEach((item) => {
          if (item) {
            nextMap[item.slugId] = item.slug;
          }
        });
        setProjectSlugMap(nextMap);
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          return;
        }
      }
    };

    const load = async () => {
      try {
        const response = await fetch(homepageProjectsUrl, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const data =
          (await response.json()) as PBListResponse<HomepageProjectRecord>;
        const items = data.items ?? [];
        if (!active) {
          return;
        }
        setProjectBlocks(items);
        const slugIds = Array.from(
          new Set(
            items
              .map((item) => normalizeRelationId(item.Slug).trim())
              .filter(Boolean),
          ),
        );
        await loadProjectSlugs(slugIds);
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          return;
        }
      }
    };

    load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [homepageProjectsUrl]);

  const heroImages = React.useMemo(() => {
    const primary = normalizeStringArray(record.hero_carausel)
      .map((value) => resolveImageUrl(record, value))
      .filter((value): value is string => Boolean(value));
    if (primary.length) {
      return primary;
    }
    return normalizeStringArray(DEFAULT_HOMEPAGE_RECORD.hero_carausel)
      .map((value) => resolveImageUrl(DEFAULT_HOMEPAGE_RECORD, value))
      .filter((value): value is string => Boolean(value));
  }, [record]);

  const heroAltText = stripHtmlTags(record.hero_text) || "Hero image";
  const heroAlts = React.useMemo(() => {
    const primary = normalizeTextArray(record.hero_carausel_alt);
    if (primary.length) {
      return primary;
    }
    return normalizeTextArray(DEFAULT_HOMEPAGE_RECORD.hero_carausel_alt);
  }, [record]);

  React.useEffect(() => {
    setHeroIndex(0);
    if (heroImages.length <= 1) {
      return;
    }
    const intervalId = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [heroImages.length]);

  const heroTextHtml = stripOuterTags(record.hero_text, [
    "p",
    "h1",
    "h2",
    "h3",
  ]);
  const subHeroHtml = stripOuterTags(record.sub_hero_text, ["h2", "p"]);
  const introText = stripHtmlTags(record.intro);
  const heading1Html = stripOuterTags(record.heading_1, ["p"]);
  const heading3Html = stripOuterTags(record.heading_3, ["p"]);
  const heading4Html = stripOuterTags(record.heading_4, ["p"]);
  const faqItems = React.useMemo(() => normalizeFaqItems(record.faq), [record]);

  const specializations = React.useMemo(() => {
    const data = [
      {
        title: record.specialization_1_title,
        description: record.specialization_1_description,
        image: record.specialization_1_image,
        imageAlt: record.specialization_1_image_alt,
      },
      {
        title: record.specialization_2_title,
        description: record.specialization_2_description,
        image: record.specialization_2_image,
        imageAlt: record.specialization_2_image_alt,
      },
      {
        title: record.specialization_3_title,
        description: record.specialization_3_description,
        image: record.specialization_3_image,
        imageAlt: record.specialization_3_image_alt,
      },
      {
        title: record.specialization_4_title,
        description: record.specialization_4_description,
        image: record.specialization_4_image,
        imageAlt: record.specialization_4_image_alt,
      },
      {
        title: record.specialization_5_title,
        description: record.specialization_5_description,
        image: record.specialization_5_image,
        imageAlt: record.specialization_5_image_alt,
      },
    ];

    return data
      .map((item, index) => {
        const title = item.title?.trim() ?? "";
        const description = item.description?.trim() ?? "";
        const imageUrl = resolveImageUrl(record, item.image);
        const imageAlt = item.imageAlt?.trim() ?? "";
        const hasContent = Boolean(title || description || imageUrl);
        if (!hasContent) {
          return null;
        }
        return {
          key: `${index}-${title || description || imageUrl || "item"}`,
          title,
          description,
          imageUrl,
          imageAlt,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [record]);

  const projectBlockMap = React.useMemo(() => {
    const map = new Map<number, HomepageProjectRecord>();
    projectBlocks.forEach((item) => {
      const index = normalizeIndexValue(item.index);
      if (index === null) {
        return;
      }
      if (!map.has(index)) {
        map.set(index, item);
      }
    });
    return map;
  }, [projectBlocks]);

  const getProjectBlockDisplay = React.useCallback(
    (index: number, fallback: ProjectBlockDisplay) => {
      const record = projectBlockMap.get(index);
      if (!record) {
        return fallback;
      }
      const title = record.Project_Name?.trim() || fallback.title;
      const client = record.Client_name?.trim() || fallback.client;
      const yearValue =
        record.Year !== undefined && record.Year !== null
          ? String(record.Year).trim()
          : "";
      const year = yearValue || fallback.year;
      const imageSrc =
        resolveProjectBlockImageUrl(record, record.Image) ?? fallback.imageSrc;
      const imageAlt =
        record.Image_alt?.trim() ||
        record.Project_Name?.trim() ||
        fallback.imageAlt ||
        fallback.title;
      const slugId = normalizeRelationId(record.Slug).trim();
      const slug = slugId ? (projectSlugMap[slugId] ?? "") : "";
      const href = slug ? `/design/${encodeURIComponent(slug)}` : undefined;

      return {
        title,
        client,
        year,
        imageSrc,
        imageAlt,
        href,
      };
    },
    [projectBlockMap, projectSlugMap],
  );

  const projectBlock1 = getProjectBlockDisplay(1, {
    title: "Project Name",
    client: "Client Name",
    year: "2024",
    imageSrc: "/2.png",
    imageAlt: "Project Name",
  });
  const projectBlock2 = getProjectBlockDisplay(2, {
    title: "Project Name",
    client: "Client Name",
    year: "2023",
    imageSrc: "/1.png",
    imageAlt: "Project Name",
  });
  const projectBlock3 = getProjectBlockDisplay(3, {
    title: "Project Name",
    client: "Client Name",
    year: "2022",
    imageSrc: "/3.png",
    imageAlt: "Project Name",
  });
  const projectBlock4 = getProjectBlockDisplay(4, {
    title: "Project Name",
    client: "Client Name",
    year: "2021",
    imageSrc: "/4.png",
    imageAlt: "Project Name",
  });
  const projectBlock5 = getProjectBlockDisplay(5, {
    title: "Project Name",
    client: "Client Name",
    year: "2020",
    imageSrc: "/5.png",
    imageAlt: "Project Name",
  });

  return (
    <main>
      <div
        className="min-h-screen block bg-white dark:bg-black text-black dark:text-white transition-all duration-300  w-full
"
      >
        <div className="md:flex horizontal block space-between gap-5  width-max py-5 mt-16">
          <SplitText
            html={heroTextHtml}
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
          <h2
            className="font-display md:w-[50%] sub-hero-text"
            dangerouslySetInnerHTML={{ __html: subHeroHtml }}
          />
        </div>
        <div className="w-full">
          <div className="relative h-[480px] md:h-[640px] overflow-hidden">
            {heroImages.map((src, index) => (
              <Image
                key={`${src}-${index}`}
                src={src}
                alt={heroAlts[index] || heroAltText}
                fill
                sizes="100vw"
                priority={index === 0}
                className={`absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-1000 ${
                  index === heroIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="w-full width-max py-5 text-center border-b dark:border-color-[#B3B4B4] common-heading dark:border-color-[#B3B4B4]">
          <p dangerouslySetInnerHTML={{ __html: heading1Html }} />
        </div>
        <div className="width-max">
          <SplitText
            text={introText}
            className="font-display text-2xl font-light py-10 lede-our-work-indent whitespace-pre-line"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0.2, y: 0 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="left"
            enableScrollTrigger={true}
            scrollTriggerConfig={{
              start: "top 80%",
              end: "bottom 40%",
              scrub: true,
              once: false,
              markers: false,
            }}
          />
        </div>
        <div className="border-b dark:border-color-[#B3B4B4]"></div>
        <h2
          className="width-max common-heading mb-10 md:my-12 text-center md:text-left"
          dangerouslySetInnerHTML={{ __html: heading3Html }}
        />
        <main className="min-h-screen dark:bg-black text-black dark:text-white">
          <section className="width-max pb-20">
            {/* Projects grid */}
            <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-8">
              {/* Top left */}
              <FadeIn
                distance={0}
                direction="horizontal"
                reverse={false}
                duration={0.5}
                ease="ease.power3.out"
                initialOpacity={0.2}
                animateOpacity
                scale={0.5}
                threshold={0}
                delay={0}
                className="h-full lg:col-span-4 lg:mt-35"
              >
                <div className="">
                  {" "}
                  {/* Index 1 */}
                  <ProjectBlock
                    title={projectBlock1.title}
                    client={projectBlock1.client}
                    year={projectBlock1.year}
                    imageSrc={projectBlock1.imageSrc}
                    imageAlt={projectBlock1.imageAlt}
                    href={projectBlock1.href}
                    align="left"
                    className=""
                    metaPosition="bottom"
                    metaPositionLg="top"
                  />
                </div>
              </FadeIn>

              {/* Top right */}
              <FadeIn
                distance={0}
                direction="horizontal"
                reverse={false}
                duration={0.5}
                ease="ease.power3.out"
                initialOpacity={0.2}
                animateOpacity
                scale={0.5}
                threshold={0}
                delay={0.2}
                className="w-full h-full lg:col-span-4 lg:col-start-5"
              >
                <div className="sticky top-50">
                  {" "}
                  {/* Index 2 */}
                  <ProjectBlock
                    title={projectBlock2.title}
                    client={projectBlock2.client}
                    year={projectBlock2.year}
                    imageSrc={projectBlock2.imageSrc}
                    imageAlt={projectBlock2.imageAlt}
                    href={projectBlock2.href}
                    align="right"
                    className="mt-10 lg:mt-0"
                    metaPosition="bottom"
                    metaPositionLg="bottom"
                  />
                </div>
              </FadeIn>

              {/* Center tall */}
              <FadeIn
                distance={0}
                direction="horizontal"
                reverse={false}
                duration={0.5}
                ease="ease.power3.out"
                initialOpacity={0.2}
                animateOpacity
                scale={0.5}
                threshold={0}
                delay={0}
                className="w-full lg:col-span-4 lg:col-start-2"
              >
                <div className="">
                  {" "}
                  {/* Index 3 */}
                  <ProjectBlock
                    title={projectBlock3.title}
                    client={projectBlock3.client}
                    year={projectBlock3.year}
                    imageSrc={projectBlock3.imageSrc}
                    imageAlt={projectBlock3.imageAlt}
                    href={projectBlock3.href}
                    align="left"
                    className="lg:col-span-6 lg:col-start-3 mt-10 lg:mt-20"
                    metaPositionLg="left"
                    metaPosition="bottom"
                  />
                </div>
              </FadeIn>

              {/* Mid-right small */}
              <FadeIn
                distance={0}
                direction="horizontal"
                reverse={false}
                duration={0.5}
                ease="ease.power3.out"
                initialOpacity={0.2}
                animateOpacity
                scale={0.5}
                threshold={0}
                delay={0.2}
                className="w-full lg:col-span-3 "
              >
                <div className="sticky top-100">
                  {" "}
                  {/* Index 4 */}
                  <ProjectBlock
                    title={projectBlock4.title}
                    client={projectBlock4.client}
                    year={projectBlock4.year}
                    imageSrc={projectBlock4.imageSrc}
                    imageAlt={projectBlock4.imageAlt}
                    href={projectBlock4.href}
                    align="right"
                    className="lg:col-span-4 lg:col-start-9 mt-10 lg:mt-45"
                    metaPositionLg="bottom"
                    metaPosition="bottom"
                  />
                </div>
              </FadeIn>

              {/* Bottom left wide */}
              <FadeIn
                distance={0}
                direction="horizontal"
                reverse={false}
                duration={0.5}
                ease="ease.power3.out"
                initialOpacity={0.2}
                animateOpacity
                scale={0.5}
                threshold={0}
                delay={0}
                className="w-full lg:col-span-4"
              >
                <div className="">
                  {" "}
                  {/* Index 5 */}
                  <ProjectBlock
                    title={projectBlock5.title}
                    client={projectBlock5.client}
                    year={projectBlock5.year}
                    imageSrc={projectBlock5.imageSrc}
                    imageAlt={projectBlock5.imageAlt}
                    href={projectBlock5.href}
                    align="left"
                    className="lg:col-span-5 mt-10 lg:mt-20"
                    metaPositionLg="right"
                    metaPosition="bottom"
                  />
                </div>
              </FadeIn>
            </div>
          </section>
        </main>
        <ResultsVisionSection headingHtml={heading4Html} />

        <section className="w-full  py-24">
          <div className="width-max py-8">
            {/* Heading */}
            <h2 className="text-sm tracking-[0.35em] text-[#666766] dark:text-[#B3B4B4] dark:border-color-[#B3B4B4] uppercase mb-16">
              Our Specializations
            </h2>

            <div className="space-y-20">
              {specializations.map((item, index) => {
                const displayIndex = String(index + 1).padStart(2, "0");
                const hasImage = Boolean(item.imageUrl);
                const imageAlt =
                  item.imageAlt || item.title || "Specialization";
                return (
                  <div
                    key={item.key}
                    className={`border-t border-neutral-200 pt-12 sticky top-15 dark:bg-black bg-white ${
                      index === specializations.length - 1
                        ? "border-b pb-20"
                        : ""
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-10 items-center">
                      <div className="md:col-span-1 dark:text-white text-lg font-light">
                        {displayIndex}
                      </div>

                      <div
                        className={hasImage ? "md:col-span-3" : "md:col-span-5"}
                      >
                        {item.title ? (
                          <h3 className="text-xl font-semibold mb-2">
                            {item.title}
                          </h3>
                        ) : null}
                        {item.description ? (
                          <p className="dark:text-white leading-relaxed">
                            {item.description}
                          </p>
                        ) : null}
                      </div>

                      {hasImage ? (
                        <div className="md:col-span-2">
                          <Image
                            src={item.imageUrl as string}
                            alt={imageAlt}
                            width={800}
                            height={600}
                            className="w-full h-auto rounded-md object-cover"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {faqItems.length ? (
          <section className="w-full py-20">
            <div className="width-max">
              <h2 className="text-sm tracking-[0.35em] text-[#666766] dark:text-[#B3B4B4] uppercase mb-10">
                FAQ
              </h2>
              <div className="space-y-8">
                {faqItems.map((item, index) => (
                  <div key={`${item.question}-${index}`}>
                    <h3 className="text-xl font-semibold mb-2">
                      {item.question}
                    </h3>
                    <p className="dark:text-white leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
        <PublicationSection />
      </div>
    </main>
  );
}
