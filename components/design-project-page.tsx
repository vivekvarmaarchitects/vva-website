"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    if (images.length <= 1) {
      return;
    }
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [images.length]);

  return (
    <div className="relative h-[480px] md:h-[640px] overflow-hidden md:my-16">
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
  );
}

function ImageMarquee({ images, alts, nameLabel }: ImageMarqueeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const contentWidthRef = useRef(0);
  const [cloneCount, setCloneCount] = useState(2);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const offsetRef = useRef(0);

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
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(group);
    if (container) {
      resizeObserver.observe(container);
    }

    let lastTime = performance.now();
    const speed = 40;
    const animate = (time: number) => {
      const width = contentWidthRef.current;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (width > 0) {
        offsetRef.current -= speed * delta;
        if (offsetRef.current <= -width) {
          offsetRef.current += width;
        } else if (offsetRef.current > 0) {
          offsetRef.current -= width;
        }
      }

      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      animationRef.current = requestAnimationFrame(animate);
    };

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
        setActiveImageIndex(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex]);

  if (!images.length) {
    return null;
  }

  const activeImageSrc =
    activeImageIndex !== null ? images[activeImageIndex] : null;
  const activeImageAlt =
    activeImageIndex !== null
      ? (alts[activeImageIndex] ?? nameLabel)
      : nameLabel;

  return (
    <div className="my-16">
      <div ref={containerRef} className="relative overflow-hidden">
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
                  onClick={() => setActiveImageIndex(index)}
                  className="relative aspect-3/4 w-[350px]  lg:w-[540px] flex-none overflow-hidden  bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                >
                  <Image
                    src={src}
                    alt={alts[index] ?? nameLabel}
                    fill
                    sizes="(min-width: 1024px) 240px, (min-width: 640px) 220px, 200px"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-6"
          onClick={() => setActiveImageIndex(null)}
        >
          <div
            className="relative h-[85vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close full screen"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => setActiveImageIndex(null)}
            >
              X
            </button>
            <Image
              src={activeImageSrc}
              alt={activeImageAlt}
              fill
              sizes="100vw"
              className="object-contain"
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
  const scopeValue = project.Scope?.trim();
  const scopeLabel = scopeValue || "Project";
  const nameLabel = project.Name?.trim() || "Project";
  const imageOneKey = imageGroupOne.join("|") || "group-one";
  const imageTwoKey = imageGroupTwo.join("|") || "group-two";
  const navBaseClasses =
    "inline-flex items-center gap-3 border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide transition hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-white dark:hover:bg-white dark:hover:text-black dark:focus-visible:ring-white";
  const navDisabledClasses =
    "inline-flex items-center gap-3 border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide opacity-40 dark:border-white";

  return (
    <div className=" mt-32">
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
            {scopeValue ? (
              <Link
                href={{ pathname: "/design", query: { scope: scopeValue } }}
                className="transition-colors hover:text-black/70 dark:hover:text-white/80"
              >
                {scopeLabel}
              </Link>
            ) : (
              scopeLabel
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
                    {value || "â€”"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Image 1 */}
      <ImageCarousel
        key={`image-group-one-${imageOneKey}`}
        images={imageGroupOne}
        alts={imageOneAlt}
        nameLabel={nameLabel}
      />
      {/* Title 1 */}
      <div className="width-max md:my-16 mt-16">
        <p className="common-heading mb-10 md:my-16 text-center md:text-left">
          {project.Title_1}
        </p>
        <p className="font-display text-xl font-light">{project.field_1}</p>
      </div>
      {/* Image 2 */}
      <ImageMarquee
        key={`image-group-two-${imageTwoKey}`}
        images={imageGroupTwo}
        alts={imageTwoAlt}
        nameLabel={nameLabel}
      />
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
