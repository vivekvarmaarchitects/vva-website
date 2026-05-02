"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export type ProjectBlockProps = {
  title: string;
  client: string;
  year: string;
  imageSrc: string;
  imageAlt?: string;
  href?: string;
  imageAspectClassName?: string;
  align?: "left" | "right";
  metaPosition?: "top" | "bottom" | "left" | "right";
  metaPositionLg?: "top" | "bottom" | "left" | "right";
  className?: string;
};

export const ProjectBlock = ({
  title,
  client,
  year,
  imageSrc,
  imageAlt,
  href,
  imageAspectClassName = "aspect-video",
  metaPosition = "top",
  metaPositionLg,
  className = "",
}: ProjectBlockProps) => {
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
      <h3>{title}</h3>
      {client ? <p>{client}</p> : null}
      {year ? <p>{year}</p> : null}
    </div>
  );

  const isVertical = finalPosition === "top" || finalPosition === "bottom";
  const isLeft = finalPosition === "left";
  const isRight = finalPosition === "right";

  const content = (
    <div
      className={`group flex ${
        isVertical ? "flex-col" : "flex-row"
      } gap-4 ${className}`}
    >
      {isLeft && metaBlock}

      {finalPosition === "top" && (
        <div className="order-first">{metaBlock}</div>
      )}

      <div
        className={`relative w-full overflow-hidden rounded-md bg-neutral-900 ${imageAspectClassName}`}
      >
        <Image
          src={imageSrc}
          alt={imageAlt || title}
          fill
          quality={95}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {finalPosition === "bottom" && (
        <div className="order-last">{metaBlock}</div>
      )}

      {isRight && metaBlock}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
      aria-label={title ? `${title} project` : "Project"}
    >
      {content}
    </Link>
  );
};
