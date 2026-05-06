"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Animation components
import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";

import ConversationsSection from "@/components/sections/conversations-section";
import ProjectDisplaySection from "@/components/sections/project-display-section";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const vivekSectionRef = useRef<HTMLDivElement>(null);
  const vivekImageRef = useRef<HTMLDivElement>(null);
  const vivekTextRef = useRef<HTMLDivElement>(null);

  const tanaySectionRef = useRef<HTMLDivElement>(null);
  const tanayImageRef = useRef<HTMLDivElement>(null);
  const tanayTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const configs = [
        {
          trigger: vivekSectionRef.current,
          image: vivekImageRef.current,
          text: vivekTextRef.current,
        },
        {
          trigger: tanaySectionRef.current,
          image: tanayImageRef.current,
          text: tanayTextRef.current,
        },
      ];

      const tweens: gsap.core.Tween[] = [];

      configs.forEach(({ trigger, image, text }) => {
        if (!trigger || !image || !text) return;

        gsap.set([image, text], { willChange: "transform" });

        tweens.push(
          gsap.to(image, {
            yPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          }),
        );

        tweens.push(
          gsap.to(text, {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          }),
        );
      });

      return () => {
        tweens.forEach((tween) => tween.kill());
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <main>
      <div className="min-h-screen block bg-white dark:bg-black text-black dark:text-white transition-all duration-300  w-full">
        <FadeIn distance={24} duration={0.9} initialOpacity={0.15}>
          <div className="w-full mt-16">
            {/* <div className="relative h-[calc(100vh-4rem)] min-h-[480px] md:min-h-[640px] overflow-hidden">
              <Image
                src="/about/about_3.webp"
                alt="Hero"
                fill
                sizes="100vw"
                quality={95}
                priority
                className="absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-1000"
              />
            </div> */}
          </div>
        </FadeIn>
        <FadeIn distance={20} duration={0.8} initialOpacity={0.15} delay={0.05}>
          <div className="flex flex-col space-between gap-10 width-max py-15 ">
            <SplitText
              html="Rooted In Design curiosity shaped by decades of craft."
              className="flex font-sans text-6xl font-regular md:w-[60%] "
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
                start: "top 50%",
                end: "bottom 30%",
                scrub: true,
                once: true,
                markers: false,
              }}
            />
            <h2
              className=" font-display font-light md:w-[70%] text-xl"
              dangerouslySetInnerHTML={{
                __html:
                  "Vivek Varma Architects is a multidisciplinary interior design and architecture practice driven by material sensitivity, spatial clarity, and a deep respect for human experience. Guided by founder Vivek Varma, the studio brings together design intelligence, cultural awareness, and thoughtful craftsmanship to shape environments that feel intentional, timeless, and quietly expressive.",
              }}
            />
          </div>
        </FadeIn>
        <div className="border-b dark:border-color-[#B3B4B4]"></div>
        <FadeIn distance={16} duration={0.7} initialOpacity={0.2}>
          <p
            className="width-max common-heading my-10 md:my-12 text-center md:text-left"
            dangerouslySetInnerHTML={{ __html: "The creators" }}
          />
        </FadeIn>

        <div className="mb-30">
          {/* Vivek Verma */}
          <div
            ref={vivekSectionRef}
            className="width-max flex flex-col gap-10 md:flex-row"
          >
            <FadeIn
              className="flex-1 min-w-0"
              distance={24}
              duration={0.85}
              initialOpacity={0.15}
            >
              <div ref={vivekImageRef}>
                <Image
                  src="/about/vivek_verma_portrait.webp"
                  alt="The creators"
                  width={800}
                  height={1200}
                  className="h-auto w-full grayscale"
                />
              </div>
            </FadeIn>
            <FadeIn
              className="block flex-1 min-w-0 my-auto "
              distance={20}
              duration={0.8}
              initialOpacity={0.18}
              delay={0.05}
            >
              <div ref={vivekTextRef}>
                <SplitText
                  html="With more than three decades of practice, Vivek Varma has led the studio to the forefront of integrated spatial design in India. Our work spans residential, commercial, hospitality, cultural, and developer-led environments, consistently blurring the boundaries between interior space and architectural form to create cohesive, experiential narratives."
                  className="font-display text-3xl font-light md:py-10"
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
                  className=" font-display text-xl font-light mt-5"
                  dangerouslySetInnerHTML={{
                    __html:
                      "Vivek Varma Architects is a multidisciplinary interior design and architecture practice driven by material sensitivity, spatial clarity, and a deep respect for human experience. Guided by founder Vivek Varma, the studio brings together design intelligence, cultural awareness, and thoughtful craftsmanship to shape environments that feel intentional, timeless, and quietly expressive.",
                  }}
                />
              </div>
            </FadeIn>
          </div>

          {/* Tanay Verma */}

          <div
            ref={tanaySectionRef}
            className="width-max flex flex-col gap-10 md:flex-row mt-20"
          >
            <FadeIn
              className="block flex-1 min-w-0 order-2 md:order-1 my-auto"
              distance={20}
              duration={0.8}
              initialOpacity={0.18}
              threshold={0.03}
              delay={0.05}
            >
              <div ref={tanayTextRef}>
                <SplitText
                  html="I'm Tanay Verma an architect and MBA graduate from Babson College, with experience spanning real estate, design, and proptech. My work covers a diverse range of project typologies, with a particular affinity for biophilic design — spaces that draw the outside in and feel intrinsically connected to the people who inhabit them."
                  className="font-display text-3xl font-light md:py-10"
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
                    start: "top 90%",
                    end: "bottom 50%",
                    scrub: true,
                    once: false,
                    markers: false,
                  }}
                />
                <h2
                  className=" font-display text-xl font-light mt-5"
                  dangerouslySetInnerHTML={{
                    __html:
                      "I believe meaningful architecture is timeless, shaped less by trend and more by a deep understanding of each client's life, rhythm, and aspirations. Every project, regardless of scale or scope, is approached as a personal narrative — translated into spaces that are considered, enduring, and uniquely their own.",
                  }}
                />
              </div>
            </FadeIn>
            <FadeIn
              className="flex-1 min-w-0 order-1 md:order-2"
              distance={24}
              duration={0.85}
              initialOpacity={0.15}
            >
              <div ref={tanayImageRef}>
                <Image
                  src="/about/tanay_verma_portrait.webp"
                  alt="The creators"
                  width={800}
                  height={1200}
                  className="w-full h-auto grayscale"
                />
              </div>
            </FadeIn>
          </div>
        </div>
        {/* OUR PHILOSOPHY */}
        <FadeIn distance={24} duration={0.9} initialOpacity={0.12}>
          <section className="relative w-full bg-black text-white overflow-hidden py-10">
            <div className="relative width-max py-8 md:py-6">
              {/* small label */}
              <p className="uppercase tracking-[0.35em] text-[11px] text-white ">
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

              <SplitText
                html={`“THOUGHTS – PENCIL SKETCHS – WORKS INTO REALITY”`}
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
                  <p className="font-sams italic font-display text-2xl text-white">
                    01 / Curiosity
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-white">
                    Our flexible approach to designs is modern but not borne by
                    any preconceptions allowing us to create diverse teams with
                    knowledge tailored to the challenge at hand. Our travel
                    exposure gives us the inspiration to think creatively and
                    adapt to the fast-changing world.
                  </p>
                </div>

                <div className="max-w-[360px]">
                  <p className="font-sams italic font-display text-2xl text-white">
                    02 / Bespoke Design
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white">
                    Art exhibitions have always been our favourite place.
                    spending days studying the art and history of architecture
                    and our diverse and experienced range of insights gained
                    across works, we transport our clients into the realm of
                    experiencing and sourcing the right art and furniture for
                    their homes, offices, and public spaces from bare walls down
                    to the last accessory with intricate detailing.
                  </p>
                </div>

                <div className="max-w-[360px]">
                  <p className="font-sams italic font-display text-2xl text-white">
                    03 / The Firm
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white">
                    With over two decades of experience, Vivek Varma Architects
                    is an integrated spatial design practice exploring the
                    relationship between interior space and exterior form. Led
                    by founder and principal designer Vivek Varma, the firm
                    works across commercial, educational, cultural, residential,
                    hospitality, institutional, and public spaces, with a
                    portfolio recognised by numerous design excellence awards.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        <FadeIn distance={20} duration={0.85} initialOpacity={0.15}>
          <ProjectDisplaySection />
        </FadeIn>
        <FadeIn distance={20} duration={0.85} initialOpacity={0.15}>
          <ConversationsSection />
        </FadeIn>
      </div>
    </main>
  );
}
