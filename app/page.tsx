"use client";
import Image from "next/image";
import React from "react";

// Import animation components
import SplitText from "@/components/animations/TextReveal";
import FadeIn from "@/components/animations/FadeIn";
import ResultsVisionSection from "@/components/hompage/results-vision-section";

type ProjectBlockProps = {
  title: string;
  client: string;
  year: string;
  imageSrc: string;
  align?: "left" | "right";
  metaPosition?: "top" | "bottom" | "left" | "right";
  metaPositionLg?: "top" | "bottom" | "left" | "right"; // NEW
  className?: string;
};

const ProjectBlock = ({
  title,
  client,
  year,
  imageSrc,
  align = "left",
  metaPosition = "top",
  metaPositionLg,
  className = "",
}: ProjectBlockProps) => {
  // Determine final meta position based on mobile vs desktop
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
      <p>{title}</p>
      <p>{client}</p>
      <p>{year}</p>
    </div>
  );

  const isVertical = finalPosition === "top" || finalPosition === "bottom";
  const isLeft = finalPosition === "left";
  const isRight = finalPosition === "right";

  return (
    <div
      className={`flex ${
        isVertical ? "flex-col" : "flex-row"
      } gap-4 ${className}`}
    >
      {isLeft && metaBlock}

      {finalPosition === "top" && (
        <div className="order-first">{metaBlock}</div>
      )}

      <div className="w-full overflow-hidden rounded-md bg-neutral-900 max-h-150">
        <Image
          src={imageSrc}
          alt={title}
          width={1200}
          height={900}
          className="h-auto w-full object-cover"
        />
      </div>

      {finalPosition === "bottom" && (
        <div className="order-last">{metaBlock}</div>
      )}

      {isRight && metaBlock}
    </div>
  );
};

export default function HomePage() {
  return (
    <main>
      <div
        className="min-h-screen block bg-white dark:bg-black text-black dark:text-white transition-all duration-300  w-full
"
      >
        <div className="md:flex horizontal block space-between gap-5  width-max py-5 mt-16">
          <SplitText
            text="Crafting spatial narratives grounded in human experience"
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
          <h2 className=" font-display md:w-[50%]">
            We, <u>Vivek Varma Architects</u>, are a practice rooted in interior
            architecture, shaping environments for those who value design,
            craft, and context.
          </h2>
        </div>
        <div className="w-full">
          <div className="relative h-[480px] md:h-[640px] overflow-hidden">
            <Image
              src="/hero_vva.png"
              alt="Hero"
              width={1440}
              height={600}
              className="w-full h-full object-cover object-bottom"
            />
          </div>
        </div>
        <div className="w-full width-max py-5 text-center border-b dark:border-color-[#B3B4B4] common-heading dark:border-color-[#B3B4B4]">
          <p>
            Our <span className="italic">Raison d'être</span>
          </p>
        </div>
        <div className="width-max">
          <SplitText

          text={
    <>
      Our{"\u00A0"}work explores the relationship between light, material, proportion,
        and movement. We approach every interior as a dialogue between
        architecture and the people who inhabit it, crafting spaces that feel
        intentional, quiet, and deeply lived in. With decades of practice across
        residential, commercial, and developer-led environments, we bring a
        refined sensibility to every project.
    </>
  }
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
        <p className="width-max common-heading mb-10 md:my-12 text-center md:text-left">
          FEATURED <span className="italic">PROJECTS</span>
        </p>
        <main className="min-h-screen dark:bg-black text-black dark:text-white">
          <section className="width-max pb-20">
            {/* Projects grid */}
            <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-8">
              {/* Top left */}
              <FadeIn
                distance={0}
                direction="horizontal"
                reverse={false}
                duration={0.5}
                ease="ease.power3.out"
                initialOpacity={0.2}
                animateOpacity
                scale={0.5}
                threshold={0}
                delay={0}
                className="h-full lg:col-span-4 lg:mt-35"
              >
                <div className="">
                  {" "}
                  <ProjectBlock
                    title="Project Name"
                    client="Client Name"
                    year="2024"
                    imageSrc="/2.png"
                    align="left"
                    className=""
                    metaPosition="bottom"
                    metaPositionLg="top"
                  />
                </div>
              </FadeIn>

              {/* Top right */}
              <FadeIn
                distance={0}
                direction="horizontal"
                reverse={false}
                duration={0.5}
                ease="ease.power3.out"
                initialOpacity={0.2}
                animateOpacity
                scale={0.5}
                threshold={0}
                delay={0.2}
                className="w-full h-full lg:col-span-4 lg:col-start-5"
              >
                <div className="sticky top-50">
                  {" "}
                  <ProjectBlock
                    title="Project Name"
                    client="Client Name"
                    year="2023"
                    imageSrc="/1.png"
                    align="right"
                    className="mt-10 lg:mt-0"
                    metaPosition="bottom"
                    metaPositionLg="bottom"
                  />
                </div>
              </FadeIn>

              {/* Center tall */}
              <FadeIn
                distance={0}
                direction="horizontal"
                reverse={false}
                duration={0.5}
                ease="ease.power3.out"
                initialOpacity={0.2}
                animateOpacity
                scale={0.5}
                threshold={0}
                delay={0}
                className="w-full lg:col-span-4 lg:col-start-2"
              >
                <div className="">
                  {" "}
                  <ProjectBlock
                    title="Project Name"
                    client="Client Name"
                    year="2022"
                    imageSrc="/3.png"
                    align="left"
                    className="lg:col-span-6 lg:col-start-3 mt-10 lg:mt-20"
                    metaPositionLg="left"
                    metaPosition="bottom"
                  />
                </div>
              </FadeIn>

              {/* Mid-right small */}
              <FadeIn
                distance={0}
                direction="horizontal"
                reverse={false}
                duration={0.5}
                ease="ease.power3.out"
                initialOpacity={0.2}
                animateOpacity
                scale={0.5}
                threshold={0}
                delay={0.2}
                className="w-full lg:col-span-3 "
              >
                <div className="sticky top-100">
                  {" "}
                  <ProjectBlock
                    title="Project Name"
                    client="Client Name"
                    year="2021"
                    imageSrc="/4.png"
                    align="right"
                    className="lg:col-span-4 lg:col-start-9 mt-10 lg:mt-45"
                    metaPositionLg="bottom"
                    metaPosition="bottom"
                  />
                </div>
              </FadeIn>

              {/* Bottom left wide */}
              <FadeIn
                distance={0}
                direction="horizontal"
                reverse={false}
                duration={0.5}
                ease="ease.power3.out"
                initialOpacity={0.2}
                animateOpacity
                scale={0.5}
                threshold={0}
                delay={0}
                className="w-full lg:col-span-4"
              >
                <div className="">
                  {" "}
                  <ProjectBlock
                    title="Project Name"
                    client="Client Name"
                    year="2020"
                    imageSrc="/5.png"
                    align="left"
                    className="lg:col-span-5 mt-10 lg:mt-20"
                    metaPositionLg="right"
                    metaPosition="bottom"
                  />
                </div>
              </FadeIn>
            </div>
          </section>
        </main>
        <ResultsVisionSection />

        <section className="w-full  py-24">
          <div className="width-max py-8">
            {/* Heading */}
            <h2 className="text-sm tracking-[0.35em] text-[#666766] dark:text-[#B3B4B4] dark:border-color-[#B3B4B4] uppercase mb-16">
              Our Specializations
            </h2>

            <div className="space-y-20">
              {/* Row 1 */}
              <div className="border-t border-neutral-200 pt-12 sticky top-15 dark:bg-black bg-white">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-30 items-center">
                  {/* Number */}
                  <div className="md:col-span-1 dark:text-white text-lg font-light">
                    01
                  </div>

                  {/* Title + Description */}
                  <div className="md:col-span-3">
                    <h3 className="text-xl font-semibold mb-2">
                      Interior Design
                    </h3>
                    <p className="dark:text-white leading-relaxed">
                      Interior architecture for residential, commercial, and
                      hospitality environments with a focus on material honesty,
                      proportion, and experiential flow.
                    </p>
                  </div>

                  {/* Image */}
                  <div className="md:col-span-2">
                    <img
                      src="/interior.png"
                      alt="Interior Design"
                      className="w-full h-auto rounded-md object-cover  w-[50%] justify-left"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="border-t border-neutral-200 pt-12 sticky top-15 dark:bg-black bg-white">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-30 items-center">
                  <div className="md:col-span-1 dark:text-white text-lg font-light">
                    02
                  </div>

                  <div className="md:col-span-3">
                    <h3 className="text-xl font-semibold mb-2">Architecture</h3>
                    <p className="dark:text-white leading-relaxed">
                      Complementary architectural design grounded in contextual
                      clarity.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <img
                      src="/Architecture.png"
                      alt="Architecture"
                      className="w-full h-auto rounded-md object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="border-t border-neutral-200 pt-12 border-b pb-20 sticky dark:bg-black bg-white">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-30 items-center">
                  <div className="md:col-span-1 dark:text-white text-lg font-light">
                    03
                  </div>

                  <div className="md:col-span-3">
                    <h3 className="text-xl font-semibold mb-2">Space Design</h3>
                    <p className="dark:text-white leading-relaxed">
                      Spatial compositions that shape circulation, mood, and
                      user experience.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <img
                      src="/Space.png"
                      alt="Space Design"
                      className="w-full h-auto rounded-md object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full width-max py-8">
          {/* Heading */}
          <h2 className="text-center text-sm tracking-[0.35em] text-[#666766] dark:text-[#B3B4B4] dark:border-color-[#B3B4B4] uppercase mb-16">
            Our <span className="italic">Publications</span>
          </h2>

          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            {/* CARD 1 */}
            <div className="border dark:border-[#B3B4B4] overflow-hidden flex flex-col">
              {/* Image Placeholder */}
              <div className="w-full h-48 p-10 bg-neutral-200"></div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-black dark:bg-white dark:text-black text-white text-xs uppercase tracking-wide font-bold">
                    Architecture
                  </span>
                  <span className="text-xs dark:text-white tracking-wide">
                    05 minute read
                  </span>
                </div>

                <h3 className="text-2xl font-medium leading-snug">
                  Lorem Ipsum is simply dummy text of the printing and
                </h3>

                <p className="dark:text-white text-sm leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industr….
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200 px-6 py-4 flex justify-between text-sm dark:text-[#B3B4B4]">
                <span>Written by</span>
                <span>Kaisuke Rajput</span>
              </div>
            </div>

            {/* CARD 2 */}
               <div className="border dark:border-[#B3B4B4] overflow-hidden flex flex-col">
              {/* Image Placeholder */}
              <div className="w-full h-48 p-10 bg-neutral-200"></div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-black dark:bg-white dark:text-black text-white text-xs uppercase tracking-wide font-bold">
                    Architecture
                  </span>
                  <span className="text-xs dark:text-white tracking-wide">
                    05 minute read
                  </span>
                </div>

                <h3 className="text-2xl font-medium leading-snug">
                  Lorem Ipsum is simply dummy text of the printing and
                </h3>

                <p className="dark:text-white text-sm leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industr….
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200 px-6 py-4 flex justify-between text-sm dark:text-[#B3B4B4]">
                <span>Written by</span>
                <span>Kaisuke Rajput</span>
              </div>
            </div>


            {/* CARD 3 */}
            <div className="border dark:border-[#B3B4B4] overflow-hidden flex flex-col">
              {/* Image Placeholder */}
              <div className="w-full h-48 p-10 bg-neutral-200"></div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-black dark:bg-white dark:text-black text-white text-xs uppercase tracking-wide font-bold">
                    Architecture
                  </span>
                  <span className="text-xs dark:text-white tracking-wide">
                    05 minute read
                  </span>
                </div>

                <h3 className="text-2xl font-medium leading-snug">
                  Lorem Ipsum is simply dummy text of the printing and
                </h3>

                <p className="dark:text-white text-sm leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industr….
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200 px-6 py-4 flex justify-between text-sm dark:text-[#B3B4B4]">
                <span>Written by</span>
                <span>Kaisuke Rajput</span>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
