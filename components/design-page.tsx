"use client";

// Animation components
import FadeIn from "@/components/animations/FadeIn";

import PublicationSection from "@/components/sections/publication-section";
import OurWorks from "@/components/sections/our-works-section";
import MouseTrail from "@/components/effects/mouse-trail";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen block w-full bg-white text-black transition-all duration-300 dark:bg-black dark:text-white">
      <MouseTrail trailDurationMs={320} />
      <MouseTrail enabled={true} />
      <h1 className="sr-only">Selected Works</h1>
      <section className="pt-24 md:pt-28">
        <FadeIn distance={14} duration={0.7} initialOpacity={0.2}>
          <p
            className="width-max common-heading mb-10 text-center md:mb-12 md:text-center"
            dangerouslySetInnerHTML={{ __html: "Our works" }}
          />
        </FadeIn>
      </section>
      <FadeIn distance={20} duration={0.85} initialOpacity={0.15}>
        <OurWorks />
      </FadeIn>
      <FadeIn distance={20} duration={0.85} initialOpacity={0.15}>
        <PublicationSection />
      </FadeIn>
    </div>
  );
}
