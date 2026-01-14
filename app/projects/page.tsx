"use client";
import Image from "next/image";

// Animation components
import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";

import PublicationSection from "@/components/sections/publication-section";
import OurWorks from "@/components/sections/our-works-section";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen block bg-white dark:bg-black text-black dark:text-white transition-all duration-300  w-full">
      <div className="w-full">
        <div className="relative h-[480px] md:h-[640px] overflow-hidden">
          <Image
            // key={`${src}-${index}`}
            src="/1.png"
            alt="Hero"
            fill
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-1000"
          />
          <SplitText
            html="Selected Works"
            className="flex font-sans text-5xl font-regular mt-32 width-max"
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
      </div>
      <div className="width-max">
        <SplitText
          html="                                           A curated overview of our interior design, architectural, and spatial explorations across residential, commercial, and public environments. Each project reflects our commitment to material integrity, spatial clarity, and thoughtful craftsmanship."
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
        className="width-max common-heading mb-10 md:my-12 text-center md:text-center"
        dangerouslySetInnerHTML={{ __html: "Our works" }}
      />
      <OurWorks />
      <PublicationSection />
    </div>
  );
}
