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
  const offsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    if (!track || !group) return;

    const updateWidth = () => {
      contentWidthRef.current = group.scrollWidth;
      if (contentWidthRef.current === 0) {
        offsetRef.current = 0;
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(group);

    let lastTime = performance.now();
    const speed = 40;
    const animate = (time: number) => {
      const width = contentWidthRef.current;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!isDraggingRef.current && width > 0) {
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
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      isDraggingRef.current = true;
      dragStartXRef.current = event.clientX;
      dragStartOffsetRef.current = offsetRef.current;
      container.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const width = contentWidthRef.current;
      const delta = event.clientX - dragStartXRef.current;
      let nextOffset = dragStartOffsetRef.current + delta;

      if (width > 0) {
        if (nextOffset <= -width) {
          nextOffset += width;
          dragStartOffsetRef.current += width;
          dragStartXRef.current = event.clientX;
        } else if (nextOffset > 0) {
          nextOffset -= width;
          dragStartOffsetRef.current -= width;
          dragStartXRef.current = event.clientX;
        }
      }

      offsetRef.current = nextOffset;
    };

    const stopDragging = (event: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", stopDragging);
    container.addEventListener("pointercancel", stopDragging);
    container.addEventListener("pointerleave", stopDragging);

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", stopDragging);
      container.removeEventListener("pointercancel", stopDragging);
      container.removeEventListener("pointerleave", stopDragging);
    };
  }, []);

  if (!images.length) {
    return null;
  }

  return (
    <div className="my-16">
      <div
        ref={containerRef}
        className="relative overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
      >
        <div
          ref={trackRef}
          className="flex w-max gap-6 will-change-transform"
          aria-live="off"
        >
          <div ref={groupRef} className="flex w-max gap-6">
            {images.map((src, index) => (
              <div
                key={`marquee-card-${src}-${index}`}
                className="relative aspect-4/3 w-[260px] sm:w-[320px] lg:w-[360px] flex-none overflow-hidden rounded-[10px] bg-neutral-100"
              >
                <Image
                  src={src}
                  alt={alts[index] ?? nameLabel}
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 320px, 260px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="flex w-max gap-6">
            {images.map((src, index) => (
              <div
                key={`marquee-card-clone-${src}-${index}`}
                className="relative aspect-4/3 w-[260px] sm:w-[320px] lg:w-[360px] flex-none overflow-hidden rounded-[10px] bg-neutral-100"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 320px, 260px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignProjectPage({
  project,
  imageGroupOne,
  imageGroupTwo,
  imageOneAlt,
  imageTwoAlt,
}: DesignProjectPageProps) {
  const scopeValue = project.Scope?.trim();
  const scopeLabel = scopeValue || "Project";
  const nameLabel = project.Name?.trim() || "Project";
  const imageOneKey = imageGroupOne.join("|") || "group-one";
  const imageTwoKey = imageGroupTwo.join("|") || "group-two";

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
      <div className="width-max md:my-16">
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
      <Conversations />
    </div>
  );
}
