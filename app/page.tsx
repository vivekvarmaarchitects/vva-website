"use client";
import Image from "next/image";
import React from "react";

// Animation components
import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";
import ResultsVisionSection from "@/components/sections/results-vision-section";
import PublicationSection from "@/components/sections/publication-section";

type HomepageRecord = {
  id?: string;
  collectionId?: string;
  heading_1?: string;
  heading_3?: string;
  heading_4?: string;
  hero_carausel?: string[] | string;
  hero_text?: string;
  sub_hero_text?: string;
  intro?: string;
  specialization_1_title?: string;
  specialization_1_description?: string;
  specialization_1_image?: string;
  specialization_2_title?: string;
  specialization_2_description?: string;
  specialization_2_image?: string;
  specialization_3_title?: string;
  specialization_3_description?: string;
  specialization_3_image?: string;
  specialization_4_title?: string;
  specialization_4_description?: string;
  specialization_4_image?: string;
  specialization_5_title?: string;
  specialization_5_description?: string;
  specialization_5_image?: string;
};

const DEFAULT_HOMEPAGE_RECORD: HomepageRecord = {
  heading_1: "Our <em>Raison d'etre</em>",
  heading_3: "FEATURED <em>PROJECTS</em>",
  heading_4: "RESULTS THAT <em>MATCH YOUR VISION</em>",
  hero_carausel: ["/hero_vva.png"],
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

const POCKETBASE_BASE_URL =
  process.env.NEXT_PUBLIC_PB_BASE_URL ?? "https://staging.angle.services";
const POCKETBASE_COLLECTION = "homepage";
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

const normalizeStringArray = (value?: string | string[]) => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
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

type ProjectBlockProps = {
  title: string;
  client: string;
  year: string;
  imageSrc: string;
  align?: "left" | "right";
  metaPosition?: "top" | "bottom" | "left" | "right";
  metaPositionLg?: "top" | "bottom" | "left" | "right"; // NEW
  className?: string;
};

const ProjectBlock = ({
  title,
  client,
  year,
  imageSrc,
  align = "left",
  metaPosition = "top",
  metaPositionLg,
  className = "",
}: ProjectBlockProps) => {
  // Determine final meta position based on mobile vs desktop
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);

    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const finalPosition =
    isDesktop && metaPositionLg ? metaPositionLg : metaPosition;

  const metaBlock = (
    <div className="text-base md:text-xs uppercase tracking-wide md:tracking-[0.2em] dark:text-neutral-200 space-y-1">
      <p>{title}</p>
      <p>{client}</p>
      <p>{year}</p>
    </div>
  );

  const isVertical = finalPosition === "top" || finalPosition === "bottom";
  const isLeft = finalPosition === "left";
  const isRight = finalPosition === "right";

  return (
    <div
      className={`flex ${
        isVertical ? "flex-col" : "flex-row"
      } gap-4 ${className}`}
    >
      {isLeft && metaBlock}

      {finalPosition === "top" && (
        <div className="order-first">{metaBlock}</div>
      )}

      <div className="w-full overflow-hidden rounded-md bg-neutral-900 max-h-150">
        <Image
          src={imageSrc}
          alt={title}
          width={1200}
          height={900}
          className="h-auto w-full object-cover"
        />
      </div>

      {finalPosition === "bottom" && (
        <div className="order-last">{metaBlock}</div>
      )}

      {isRight && metaBlock}
    </div>
  );
};

export default function HomePage() {
  const [record, setRecord] = React.useState<HomepageRecord>(
    DEFAULT_HOMEPAGE_RECORD
  );
  const [heroIndex, setHeroIndex] = React.useState(0);

  const recordUrl = `${normalizedBaseUrl}/api/collections/${POCKETBASE_COLLECTION}/records/${POCKETBASE_RECORD_ID}`;

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
        shouldFetchNow ? POCKETBASE_REFRESH_MS : remaining
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
  const introHtml = stripOuterTags(record.intro, ["p"]);
  const heading1Html = stripOuterTags(record.heading_1, ["p"]);
  const heading3Html = stripOuterTags(record.heading_3, ["p"]);
  const heading4Html = stripOuterTags(record.heading_4, ["p"]);

  const specializations = React.useMemo(() => {
    const data = [
      {
        title: record.specialization_1_title,
        description: record.specialization_1_description,
        image: record.specialization_1_image,
      },
      {
        title: record.specialization_2_title,
        description: record.specialization_2_description,
        image: record.specialization_2_image,
      },
      {
        title: record.specialization_3_title,
        description: record.specialization_3_description,
        image: record.specialization_3_image,
      },
      {
        title: record.specialization_4_title,
        description: record.specialization_4_description,
        image: record.specialization_4_image,
      },
      {
        title: record.specialization_5_title,
        description: record.specialization_5_description,
        image: record.specialization_5_image,
      },
    ];

    return data
      .map((item, index) => {
        const title = item.title?.trim() ?? "";
        const description = item.description?.trim() ?? "";
        const imageUrl = resolveImageUrl(record, item.image);
        const hasContent = Boolean(title || description || imageUrl);
        if (!hasContent) {
          return null;
        }
        return {
          key: `${index}-${title || description || imageUrl || "item"}`,
          title,
          description,
          imageUrl,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [record]);

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
            className=" font-display md:w-[50%]"
            dangerouslySetInnerHTML={{ __html: subHeroHtml }}
          />
        </div>
        <div className="w-full">
          <div className="relative h-[480px] md:h-[640px] overflow-hidden">
            {heroImages.map((src, index) => (
              <Image
                key={`${src}-${index}`}
                src={src}
                alt="Hero"
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
            html={introHtml}
            className="font-display text-2xl font-light py-10 lede-our-work"
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
        <p
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
                  <ProjectBlock
                    title="Project Name"
                    client="Client Name"
                    year="2024"
                    imageSrc="/2.png"
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
                  <ProjectBlock
                    title="Project Name"
                    client="Client Name"
                    year="2023"
                    imageSrc="/1.png"
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
                  <ProjectBlock
                    title="Project Name"
                    client="Client Name"
                    year="2022"
                    imageSrc="/3.png"
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
                  <ProjectBlock
                    title="Project Name"
                    client="Client Name"
                    year="2021"
                    imageSrc="/4.png"
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
                  <ProjectBlock
                    title="Project Name"
                    client="Client Name"
                    year="2020"
                    imageSrc="/5.png"
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
                return (
                  <div
                    key={item.key}
                    className={`border-t border-neutral-200 pt-12 sticky top-15 dark:bg-black bg-white ${
                      index === specializations.length - 1
                        ? "border-b pb-20"
                        : ""
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-30 items-center">
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
                            alt={item.title || "Specialization"}
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
        <PublicationSection />
      </div>
    </main>
  );
}
