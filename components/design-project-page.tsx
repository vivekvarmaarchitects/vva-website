"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import SplitText from "@/components/animations/TextReveal";
import Conversations from "@/components/sections/conversations-section";
import type { ProjectRecord } from "@/lib/project-types";

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

export default function DesignProjectPage({
  project,
  imageGroupOne,
  imageGroupTwo,
  imageOneAlt,
  imageTwoAlt,
}: DesignProjectPageProps) {
  const scopeLabel = project.Scope?.trim() || "Project";
  const nameLabel = project.Name?.trim() || "Project";
  const imageOneKey = imageGroupOne.join("|");
  const imageTwoKey = imageGroupTwo.join("|");

  return (
    <div className=" mt-32">
      <div className="width-max">
        <div className="font-display text-s">
          <p>
            {/* TODO: make breakcrumb links Clickabele */}
            Home / Design / {scopeLabel} / {nameLabel}
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
        key={imageOneKey}
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
      <ImageCarousel
        key={imageTwoKey}
        images={imageGroupTwo}
        alts={imageTwoAlt}
        nameLabel={nameLabel}
      />
      <Conversations />
    </div>
  );
}
