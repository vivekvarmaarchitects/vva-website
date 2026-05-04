"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";

import SplitText from "@/components/animations/TextReveal";
import Conversations from "@/components/sections/conversations-section";
import type { ProjectRecord } from "@/lib/project-types";
import MouseTrail from "@/components/effects/mouse-trail";

type DesignProjectPageProps = {
  project: ProjectRecord;
  imageGroupOne: string[];
  imageGroupTwo: string[];
  imageOneAlt: string[];
  imageTwoAlt: string[];
  previousProject: {
    href: string;
    label: string;
    isAvailable: boolean;
  };
  nextProject: {
    href: string;
    label: string;
    isAvailable: boolean;
  };
};

type ImageCarouselProps = {
  images: string[];
  alts: string[];
  nameLabel: string;
};

type ImageMarqueeProps = {
  images: string[];
  alts: string[];
  nameLabel: string;
};

function ImageCarousel({ images, alts, nameLabel }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);

  const isMobileViewport = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  useEffect(() => {
    if (images.length <= 1) {
      return;
    }
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [images.length]);

  const goToIndex = (index: number) => {
    setActiveIndex((index + images.length) % images.length);
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!isMobileViewport() || images.length <= 1) return;
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!isMobileViewport() || touchStartXRef.current === null) return;
    const currentX = event.touches[0]?.clientX ?? touchStartXRef.current;
    touchDeltaXRef.current = currentX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (!isMobileViewport() || touchStartXRef.current === null) return;

    const swipeThreshold = 40;
    if (touchDeltaXRef.current <= -swipeThreshold) {
      setActiveIndex((prev) => (prev + 1) % images.length);
    } else if (touchDeltaXRef.current >= swipeThreshold) {
      setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    }

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  return (
    <div className="mt-10 md:my-16">
      <div
        className="relative h-[480px] md:h-[640px] overflow-hidden touch-pan-y md:touch-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((src, index) => (
          <Image
            key={`${src}-${index}`}
            src={src}
            alt={alts[index] ?? nameLabel}
            fill
            sizes="100vw"
            priority={index === 0}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {images.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`carousel-dot-${index}`}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                aria-pressed={isActive}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-4 bg-black dark:bg-white"
                    : "w-1.5 bg-black/25 dark:bg-white/30"
                }`}
                onClick={() => goToIndex(index)}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ImageMarquee({ images, alts, nameLabel }: ImageMarqueeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const contentWidthRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const suppressClickRef = useRef(false);
  const [cloneCount, setCloneCount] = useState(2);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [activeImageDimensions, setActiveImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const offsetRef = useRef(0);

  const isMobileViewport = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  const normalizeOffset = () => {
    const width = contentWidthRef.current;
    if (width <= 0) return;

    while (offsetRef.current <= -width) {
      offsetRef.current += width;
    }
    while (offsetRef.current > 0) {
      offsetRef.current -= width;
    }
  };

  const applyOffset = () => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
  };

  const closeActiveImage = () => {
    setActiveImageDimensions(null);
    setActiveImageIndex(null);
  };

  const handleImageActivate = (index: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setActiveImageDimensions(null);
    setActiveImageIndex(index);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isMobileViewport()) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    isDraggingRef.current = true;
    pointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    suppressClickRef.current = false;
    containerRef.current?.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isMobileViewport()) return;
    if (!isDraggingRef.current || pointerIdRef.current !== event.pointerId) return;

    const deltaX = event.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 6) {
      suppressClickRef.current = true;
    }

    offsetRef.current = dragStartOffsetRef.current + deltaX;
    normalizeOffset();
    applyOffset();
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isMobileViewport()) return;
    if (pointerIdRef.current !== event.pointerId) return;

    isDraggingRef.current = false;
    pointerIdRef.current = null;
    lastFrameTimeRef.current = performance.now();
    containerRef.current?.releasePointerCapture?.(event.pointerId);
  };

  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    const container = containerRef.current;
    if (!track || !group) return;

    const updateWidth = () => {
      contentWidthRef.current = group.scrollWidth;
      const containerWidth = container?.clientWidth ?? 0;
      if (contentWidthRef.current > 0 && containerWidth > 0) {
        const neededCopies =
          Math.ceil(containerWidth / contentWidthRef.current) + 1;
        setCloneCount(Math.max(2, neededCopies));
      }
      if (contentWidthRef.current === 0) {
        offsetRef.current = 0;
      }
      normalizeOffset();
      applyOffset();
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(group);
    if (container) {
      resizeObserver.observe(container);
    }

    const speed = 40;
    const animate = (time: number) => {
      const previousTime = lastFrameTimeRef.current ?? time;
      const delta = (time - previousTime) / 1000;
      lastFrameTimeRef.current = time;

      if (isDraggingRef.current) {
        applyOffset();
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const width = contentWidthRef.current;

      if (width > 0) {
        offsetRef.current -= speed * delta;
        normalizeOffset();
      }

      applyOffset();
      animationRef.current = requestAnimationFrame(animate);
    };

    lastFrameTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [images.length]);

  useEffect(() => {
    if (activeImageIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeActiveImage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex]);

  const activeImageSrc =
    activeImageIndex !== null ? images[activeImageIndex] : null;
  const activeImageAlt =
    activeImageIndex !== null
      ? (alts[activeImageIndex] ?? nameLabel)
      : nameLabel;
  const activeImageWidth = activeImageDimensions?.width ?? 1600;
  const activeImageHeight = activeImageDimensions?.height ?? 1200;

  useEffect(() => {
    if (!activeImageSrc) {
      return;
    }

    let isCancelled = false;
    const probeImage = new window.Image();

    probeImage.onload = () => {
      if (isCancelled) return;
      setActiveImageDimensions({
        width: probeImage.naturalWidth,
        height: probeImage.naturalHeight,
      });
    };

    probeImage.src = activeImageSrc;

    return () => {
      isCancelled = true;
    };
  }, [activeImageSrc]);

  if (!images.length) {
    return null;
  }

  return (
    <div className="my-16">
      <div
        ref={containerRef}
        className="relative overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing md:touch-auto md:select-auto md:cursor-auto md:active:cursor-auto"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-2.5 will-change-transform"
          aria-live="off"
        >
          {Array.from({ length: cloneCount }).map((_, groupIndex) => (
            <div
              key={`marquee-group-${groupIndex}`}
              ref={groupIndex === 0 ? groupRef : null}
              className="flex w-max gap-2.5"
            >
              {images.map((src, index) => (
                <button
                  key={`marquee-card-${groupIndex}-${src}-${index}`}
                  type="button"
                  onClick={() => handleImageActivate(index)}
                  className="relative aspect-3/4 w-[82vw] md:w-[350px] lg:w-[540px] flex-none overflow-hidden bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                >
                  <Image
                    src={src}
                    alt={alts[index] ?? nameLabel}
                    fill
                    sizes="(min-width: 1024px) 540px, (min-width: 768px) 350px, 82vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {activeImageSrc ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:p-6"
          onClick={closeActiveImage}
        >
          <div
            className="relative inline-block max-h-[85vh] max-w-full"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close full screen"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-4 md:top-4"
              onClick={closeActiveImage}
            >
              X
            </button>
            <Image
              src={activeImageSrc}
              alt={activeImageAlt}
              width={activeImageWidth}
              height={activeImageHeight}
              sizes="100vw"
              className="block h-auto max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function DesignProjectPage({
  project,
  imageGroupOne,
  imageGroupTwo,
  imageOneAlt,
  imageTwoAlt,
  previousProject,
  nextProject,
}: DesignProjectPageProps) {
  const projectTypeValue = project.ProjectType?.trim();
  const projectTypeLabel = projectTypeValue || "Project";
  const nameLabel = project.Name?.trim() || "Project";
  const introText = project.Intro?.trim();
  const titleOne = project.Title_1?.trim();
  const fieldOne = project.field_1?.trim();
  const metaItems = [
    ["LOCATION", project.Location?.trim()],
    ["SECTOR", project.Sector?.trim()],
    ["YEAR", project.Year?.trim()],
    ["PROJECT TYPE", project.ProjectType?.trim()],
  ].filter((item): item is [string, string] => Boolean(item[1]));
  const hasIntro = Boolean(introText);
  const hasMeta = metaItems.length > 0;
  const hasTitleSection = Boolean(titleOne || fieldOne);
  const hasImageGroupOne = imageGroupOne.length > 0;
  const hasImageGroupTwo = imageGroupTwo.length > 0;
  const imageOneKey = imageGroupOne.join("|") || "group-one";
  const imageTwoKey = imageGroupTwo.join("|") || "group-two";
  const navBaseClasses =
    "inline-flex items-center gap-3 border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide transition hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-white dark:hover:bg-white dark:hover:text-black dark:focus-visible:ring-white";
  const navDisabledClasses =
    "inline-flex items-center gap-3 border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide opacity-40 dark:border-white";

  return (
    <div className="mt-16">
      <MouseTrail trailDurationMs={320} />
      <MouseTrail enabled={true} />;
      <div className="width-max">
        <div className="font-display text-s">
          <p>
            <Link
              href="/"
              className="transition-colors hover:text-black/70 dark:hover:text-white/80"
            >
              Home
            </Link>{" "}
            /{" "}
            <Link
              href="/design"
              className="transition-colors hover:text-black/70 dark:hover:text-white/80"
            >
              Design
            </Link>{" "}
            /{" "}
            {projectTypeValue ? (
              <Link
                href={{
                  pathname: "/design",
                  query: { projectType: projectTypeValue },
                }}
                className="transition-colors hover:text-black/70 dark:hover:text-white/80"
              >
                {projectTypeLabel}
              </Link>
            ) : (
              projectTypeLabel
            )}{" "}
            / <span aria-current="page">{nameLabel}</span>
          </p>
        </div>

        <div className="mt-8">
          <SplitText
            html={nameLabel}
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
        {hasIntro || hasMeta ? (
          <div className="flex flex-col gap-10 md:flex-row md:gap-16 font-display font-light">
            {/* Intro */}
            {hasIntro ? (
              <p
                className={`mt-8 md:mb-16 w-full text-base md:text-lg dark:text-white ${
                  hasMeta ? "md:w-3/5" : ""
                }`}
              >
                {introText}
              </p>
            ) : null}

            {/* Meta table */}
            {hasMeta ? (
              <div className={`w-full md:mt-8 ${hasIntro ? "md:w-2/5" : ""}`}>
                <div className="border-t border-neutral-300">
                  {metaItems.map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[220px_1fr] items-center gap-6 border-b border-neutral-300 py-3"
                    >
                      <div className="text-xs font-medium tracking-wider dark:text-white">
                        {label}
                      </div>
                      <div className="text-sm dark:text-white text-left">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {/* Image 1 */}
      {hasImageGroupOne ? (
        <ImageCarousel
          key={`image-group-one-${imageOneKey}`}
          images={imageGroupOne}
          alts={imageOneAlt}
          nameLabel={nameLabel}
        />
      ) : null}
      {/* Title 1 */}
      {hasTitleSection ? (
        <div className="width-max md:my-16 mt-16">
          {titleOne ? (
            <p className="common-heading mb-10 md:my-16 text-center md:text-left">
              {titleOne}
            </p>
          ) : null}
          {fieldOne ? (
            <p className="font-display text-xl font-light">{fieldOne}</p>
          ) : null}
        </div>
      ) : null}
      {/* Image 2 */}
      {hasImageGroupTwo ? (
        <ImageMarquee
          key={`image-group-two-${imageTwoKey}`}
          images={imageGroupTwo}
          alts={imageTwoAlt}
          nameLabel={nameLabel}
        />
      ) : null}
      <div className="width-max mt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {previousProject.isAvailable ? (
            <Link
              href={previousProject.href}
              className={navBaseClasses}
              aria-label={`Previous Project: ${previousProject.label}`}
              title={previousProject.label}
            >
              ← Previous Project
            </Link>
          ) : (
            <span className={navDisabledClasses} aria-disabled="true">
              ← Previous Project
            </span>
          )}
          {nextProject.isAvailable ? (
            <Link
              href={nextProject.href}
              className={navBaseClasses}
              aria-label={`Next Project: ${nextProject.label}`}
              title={nextProject.label}
            >
              Next Project →
            </Link>
          ) : (
            <span className={navDisabledClasses} aria-disabled="true">
              Next Project →
            </span>
          )}
        </div>
        <div className="border-b dark:border-color-[#B3B4B4] mt-8"></div>
      </div>
      <Conversations />
    </div>
  );
}
