"use client";
import Image from "next/image";

// Animation components
import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";

import PublicationSection from "@/components/sections/publication-section";
import OurWorks from "@/components/sections/our-works-section";
import MouseTrail from "@/components/effects/mouse-trail";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen block bg-white dark:bg-black text-black dark:text-white transition-all duration-300  w-full">
      <MouseTrail trailDurationMs={320} />
      <MouseTrail enabled={true} />
      <FadeIn distance={22} duration={0.85} initialOpacity={0.15}>
        <div className="w-full">
          <div className="relative h-[480px] md:h-[640px] overflow-hidden mt-10">
            <Image
              // key={`${src}-${index}`}
              src="/design/design_7.webp"
              alt="Hero"
              fill
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-1000"
            />
            <div className="width-max">
              <SplitText
                html="Selected Works"
                className="flex font-sans text-4xl font-regular mt-32 text-black"
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
        </div>
      </FadeIn>
      <FadeIn distance={18} duration={0.8} initialOpacity={0.18} delay={0.05}>
        <div className="width-max">
          <SplitText
            html="A curated overview of our interior design, architectural, and spatial explorations across residential, commercial, and public environments. Each project reflects our commitment to material integrity, spatial clarity, and thoughtful craftsmanship."
            className="font-display text-2xl font-light py-10 lede-our-work mb-10"
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
      </FadeIn>
      <div className="border-b dark:border-color-[#B3B4B4]"></div>
      <FadeIn distance={14} duration={0.7} initialOpacity={0.2}>
        <p
          className="width-max common-heading mb-10 md:my-12 text-center md:text-center"
          dangerouslySetInnerHTML={{ __html: "Our works" }}
        />
      </FadeIn>
      <FadeIn distance={20} duration={0.85} initialOpacity={0.15}>
        <OurWorks />
      </FadeIn>
      <FadeIn distance={20} duration={0.85} initialOpacity={0.15}>
        <PublicationSection />
      </FadeIn>
    </div>
  );
}
