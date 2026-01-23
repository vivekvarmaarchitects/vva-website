"use client";
import Image from "next/image";

// Animation components
import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";

import ConversationsSection from "@/components/sections/conversations-section";
import ProjectDisplaySection from "@/components/sections/project-display-section";

export default function AboutPage() {
  return (
    <main>
      <div className="min-h-screen block bg-white dark:bg-black text-black dark:text-white transition-all duration-300  w-full">
        <div className="w-full mt-16">
          <div className="relative h-[480px] md:h-[640px] overflow-hidden">
            <Image
              // key={`${src}-${index}`}
              src="/1.png"
              alt="Hero"
              fill
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-1000"
            />
          </div>
        </div>
        <div className="block space-between gap-5 width-max py-5 mt-16">
          <SplitText
            html="Rooted In Design curiosity shaped by decades of craft."
            className="flex font-sans text-5xl font-regular md:w-[50%] "
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
            dangerouslySetInnerHTML={{
              __html:
                "Vivek Varma Architects is a multidisciplinary interior design and architecture practice driven by material sensitivity, spatial clarity, and a deep respect for human experience. Guided by founder Vivek Varma, the studio brings together design intelligence, cultural awareness, and thoughtful craftsmanship to shape environments that feel intentional, timeless, and quietly expressive.",
            }}
          />
        </div>
        <div className="border-b dark:border-color-[#B3B4B4]"></div>
        <p
          className="width-max common-heading my-10 md:my-12 text-center md:text-left"
          dangerouslySetInnerHTML={{ __html: "The creators" }}
        />

        <div className="mb-10">
          {/* Vivek Verma */}
          <div className="width-max flex flex-col gap-10 md:flex-row">
            <div className="flex-1 min-w-0">
              <Image
                src="/2.png"
                alt="The creators"
                width={800}
                height={1200}
                className="w-full h-auto"
              />
            </div>
            <div className="block flex-1 min-w-0">
              <SplitText
                html="With more than three decades of practice, Vivek Varma has led the studio to the forefront of integrated spatial design in India. Our work spans residential, commercial, hospitality, cultural, and developer-led environments, consistently blurring the boundaries between interior space and architectural form to create cohesive, experiential narratives."
                className="font-display text-2xl font-light md:py-10"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0.2, y: 0 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
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
              <h2
                className=" font-display md:w-[50%] mt-5"
                dangerouslySetInnerHTML={{
                  __html:
                    "Vivek Varma Architects is a multidisciplinary interior design and architecture practice driven by material sensitivity, spatial clarity, and a deep respect for human experience. Guided by founder Vivek Varma, the studio brings together design intelligence, cultural awareness, and thoughtful craftsmanship to shape environments that feel intentional, timeless, and quietly expressive.",
                }}
              />
            </div>
          </div>

          {/* Tanay Verma */}

          <div className="width-max flex flex-col gap-10 md:flex-row mt-20">
            <div className="block flex-1 min-w-0 order-2 md:order-1">
              <SplitText
                html="With more than three decades of practice, Vivek Varma has led the studio to the forefront of integrated spatial design in India. Our work spans residential, commercial, hospitality, cultural, and developer-led environments, consistently blurring the boundaries between interior space and architectural form to create cohesive, experiential narratives."
                className="font-display text-2xl font-light md:py-10"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0.2, y: 0 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
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
              <h2
                className=" font-display md:w-[50%] mt-5"
                dangerouslySetInnerHTML={{
                  __html:
                    "Vivek Varma Architects is a multidisciplinary interior design and architecture practice driven by material sensitivity, spatial clarity, and a deep respect for human experience. Guided by founder Vivek Varma, the studio brings together design intelligence, cultural awareness, and thoughtful craftsmanship to shape environments that feel intentional, timeless, and quietly expressive.",
                }}
              />
            </div>
            <div className="flex-1 min-w-0 order-1 md:order-2">
              <Image
                src="/2.png"
                alt="The creators"
                width={800}
                height={1200}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
        {/* OUR PHILOSOPHY */}
        <section className="relative w-full bg-black text-white overflow-hidden py-10">
          {/* soft vignette like screenshot */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(900px_360px_at_50%_35%,rgba(255,255,255,0.10),transparent_65%)] dark:bg-[radial-gradient(900px_360px_at_50%_35%,rgba(255,255,255,0.10),transparent_65%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(600px_320px_at_15%_60%,rgba(255,255,255,0.06),transparent_70%)] dark:bg-[radial-gradient(600px_320px_at_15%_60%,rgba(255,255,255,0.06),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(600px_320px_at_85%_60%,rgba(255,255,255,0.06),transparent_70%)] dark:bg-[radial-gradient(600px_320px_at_85%_60%,rgba(255,255,255,0.06),transparent_70%)]" />
          </div>

          <div className="relative width-max py-8 md:py-16">
            {/* small label */}
            <p className="uppercase tracking-[0.35em] text-[11px] text-white">
              Our Philosophy
            </p>

            {/* big statement (SplitText like your style) */}
            <SplitText
              html={`Across our body of work, detail becomes a language. <span style="opacity:0.6">Material junctions, light transitions, bespoke furniture, curated art, and crafted volumes come together to define spatial character.</span>`}
              className="font-display text-2xl font-light py-10"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0.2, y: 0 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              textAlign="left"
              enableScrollTrigger={true}
              scrollTriggerConfig={{
                start: "top 85%",
                end: "bottom 50%",
                scrub: true,
                once: false,
                markers: false,
              }}
            />

            {/* 3 columns */}
            <div className="mt-6 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
              <div className="max-w-[360px]">
                <p className="font-display italic font-medium text-white">
                  01 / Curiosity
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white">
                  Interior architecture for residential, commercial, and
                  hospitality environments with a focus on material honesty,
                  proportion, and experiential flow.
                </p>
              </div>

              <div className="max-w-[360px]">
                <p className="font-display italic font-medium text-white">
                  02 / Craft
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white">
                  Interior architecture for residential, commercial, and
                  hospitality environments with a focus on material honesty,
                  proportion, and experiential flow.
                </p>
              </div>

              <div className="max-w-[360px]">
                <p className="font-display italic font-medium text-white">
                  03 / Perspective
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white">
                  Interior architecture for residential, commercial, and
                  hospitality environments with a focus on material honesty,
                  proportion, and experiential flow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <ProjectDisplaySection />
        <ConversationsSection />
      </div>
    </main>
  );
}
